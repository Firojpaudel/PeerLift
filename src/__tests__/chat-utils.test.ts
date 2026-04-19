import { describe, it, expect } from 'vitest';
import { getMessageText } from '@/lib/chat-utils';

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

  it('should wrap reasoning parts in think tags and style them as an accordion', () => {
    const msg = { 
      parts: [
        { type: 'reasoning', reasoning: 'internal thought' },
        { type: 'text', text: 'visible answer' }
      ] 
    };
    const result = getMessageText(msg);
    expect(result).toContain('<details open');
    expect(result).toContain('🧠 Thinking...');
    expect(result).toContain('internal thought');
    expect(result).toContain('visible answer');
  });

  it('should not double wrap reasoning if tags already exist but still style them', () => {
    const msg = { 
      parts: [
        { type: 'reasoning', reasoning: '<think>already tagged</think>' }
      ] 
    };
    const result = getMessageText(msg);
    expect(result).toContain('<details open');
    expect(result).toContain('already tagged');
    // Ensure we don't have nested details
    const openCount = (result.match(/<details/g) || []).length;
    expect(openCount).toBe(1);
  });
});
