import { describe, it, expect } from 'vitest';

// We'll simulate the getMessageText logic here for testing since it's a pure function inside the component.
// Ideally, this function should be exported from a separate utility file.
// For now, I'll copy the logic into a testable format or export it in the next step.

function getMessageText(m: any): string {
  let text = '';
  if (Array.isArray(m.parts)) {
    text = m.parts
      .map((p: any) => {
        if (p.type === 'text') return p.text;
        if (p.type === 'reasoning' || p.type === 'thought') {
          const content = p.reasoning || p.thought || p.text || '';
          return content.includes('<think>') ? content : `<think>${content}</think>`;
        }
        return '';
      })
      .join('');
  } else if (typeof m.content === 'string') {
    text = m.content;
  }
  return text;
}

describe('getMessageText', () => {
  it('should extract plain text from content string', () => {
    const msg = { content: 'hello world' };
    expect(getMessageText(msg)).toBe('hello world');
  });

  it('should join text parts from AI SDK v6 format', () => {
    const msg = { 
      parts: [
        { type: 'text', text: 'hello ' },
        { type: 'text', text: 'world' }
      ] 
    };
    expect(getMessageText(msg)).toBe('hello world');
  });

  it('should wrap reasoning parts in think tags', () => {
    const msg = { 
      parts: [
        { type: 'reasoning', reasoning: 'internal thought' },
        { type: 'text', text: 'visible answer' }
      ] 
    };
    expect(getMessageText(msg)).toBe('<think>internal thought</think>visible answer');
  });

  it('should not double wrap reasoning if tags already exist', () => {
    const msg = { 
      parts: [
        { type: 'reasoning', reasoning: '<think>already tagged</think>' }
      ] 
    };
    expect(getMessageText(msg)).toBe('<think>already tagged</think>');
  });
});
