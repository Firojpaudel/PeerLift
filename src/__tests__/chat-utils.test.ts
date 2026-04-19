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
