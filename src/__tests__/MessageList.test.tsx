import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MessageList } from '@/components/features/chat/MessageList';

// Mock dependencies
vi.mock('react-markdown', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('remark-gfm', () => ({ default: {} }));
vi.mock('rehype-raw', () => ({ default: {} }));

describe('MessageList', () => {
  const mockMessages = [
    { id: '1', role: 'user', content: 'hello', userId: 'user-1' },
    { id: '2', role: 'assistant', content: 'hi there', role: 'assistant' },
  ];

  const defaultProps = {
    messages: mockMessages,
    isAI: true,
    sessionUserId: 'user-1',
    tutorName: 'Lumina',
    learningGoal: 'React',
    learningDetail: 'Advanced',
    currentlySpeakingId: null,
    onToggleSpeech: vi.fn(),
    markdownComponents: {},
    getMessageText: (m: any) => m.content || '',
    isConfigured: true,
  };

  it('renders messages correctly', () => {
    render(<MessageList {...defaultProps} />);
    expect(screen.getByText('hello')).toBeDefined();
    expect(screen.getByText('hi there')).toBeDefined();
  });

  it('shows welcome message when AI is configured and no messages', () => {
    render(<MessageList {...defaultProps} messages={[]} />);
    expect(screen.getByText(/I am/)).toBeDefined();
    expect(screen.getByText(/Lumina/)).toBeDefined();
  });
});
