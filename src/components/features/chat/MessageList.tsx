"use client";

import React, { useEffect, useRef } from 'react';
import { Bot, Users, Volume2, Square } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { MeetingCard } from './MeetingCard';

interface MessageListProps {
  messages: any[];
  isAI: boolean;
  sessionUserId: string;
  tutorName: string;
  learningGoal: string;
  learningDetail: string;
  currentlySpeakingId: string | null;
  onToggleSpeech: (id: string, text: string) => void;
  markdownComponents: any;
  getMessageText: (m: any) => string;
  isConfigured?: boolean;
  peerImage?: string | null;
  userImage?: string | null;
  isPeerTyping?: boolean;
  peerName?: string;
}

export function MessageList({
  messages,
  isAI,
  sessionUserId,
  tutorName,
  learningGoal,
  learningDetail,
  currentlySpeakingId,
  onToggleSpeech,
  markdownComponents,
  getMessageText,
  isConfigured,
  peerImage,
  userImage,
  isPeerTyping,
  peerName
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPeerTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-bg-secondary w-full">
      <div className="flex flex-col items-center my-6">
        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider bg-bg-elevated border border-border px-3 py-1 rounded-full shadow-sm">
          Today
        </span>
      </div>

      {!isAI && messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-3">
          <Users size={40} className="text-text-muted" />
          <p className="text-sm font-medium text-text-muted">No messages yet. Say hi!</p>
        </div>
      )}

      {isAI && messages.length === 0 && (
        <div className="flex items-start gap-3 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-amber-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
            <Bot size={16} />
          </div>
          <div className="bg-bg-elevated border border-border text-text-primary p-4 rounded-2xl rounded-tl-sm shadow-sm text-[14px] leading-relaxed max-w-full">
            <p className="font-bold text-text-primary mb-1">Welcome!</p>
            <p className="text-text-secondary">
              I am {tutorName || "Lumina"}, your AI learning companion. What topic or concept would you like to master today?
            </p>
          </div>
        </div>
      )}

        {messages.map((m) => {
          // Determine if the message belongs to the current user
          // For AI chat: matches 'user' role
          // For DM chat: matches the session user's ID
          const isOwn = isAI ? m.role === 'user' : m.userId === sessionUserId;
        const isSystem = m.isSystem || m.role === 'system';
        const isMeeting = isSystem && (m.content.includes("https://meet.google.com") || m.content.includes("Meeting Scheduled"));

        return (
          <div key={m.id} className={`flex items-start gap-3 max-w-[85%] ${isOwn ? 'ml-auto flex-row-reverse' : ''}`}>
            {/* Avatar */}
            {isOwn ? (
              userImage && (
                <div className="w-8 h-8 rounded-full border border-border shadow-sm overflow-hidden shrink-0 mt-1 self-end">
                   <img src={userImage} alt="" className="w-full h-full object-cover" />
                </div>
              )
            ) : (
              isAI ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-amber-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                  <Bot size={16} />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center shrink-0 mt-1 shadow-sm border border-border overflow-hidden">
                  {peerImage ? <img src={peerImage} alt="" className="w-full h-full object-cover" /> : <Users size={16} />}
                </div>
              )
            )}

            {/* Bubble */}
            <div className={`flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
              {isMeeting ? (
                <MeetingCard content={m.content} isOwn={isOwn} />
              ) : (
                <div className={`p-3.5 rounded-2xl shadow-sm text-[14px] leading-relaxed max-w-full transition-all ${isOwn
                    ? 'bg-primary-500 text-white rounded-tr-sm'
                    : 'bg-bg-elevated border border-border text-text-primary rounded-tl-sm'
                  }`}>
                  {isAI || isSystem ? (
                    <div className={`prose prose-sm max-w-full dark:prose-invert ${isOwn ? 'prose-p:text-white prose-strong:text-white prose-headings:text-white' : 'prose-p:text-text-primary prose-strong:text-text-primary prose-headings:text-text-primary'}`}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={markdownComponents}
                      >
                        {(isAI ? getMessageText(m) : m.content) || ""}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    m.text || m.content || <div className="text-text-muted italic text-[11px]">Empty payload</div>
                  )}

                  {isAI && m.role === 'assistant' && (
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() => onToggleSpeech(m.id, getMessageText(m))}
                        className={`text-text-muted hover:text-primary-500 transition-all duration-300 bg-bg-secondary/40 backdrop-blur-sm p-1.5 rounded-full shadow-sm hover:shadow-md ${currentlySpeakingId === m.id ? 'ring-2 ring-primary-500 text-primary-500 bg-primary-500/10 animate-pulse' : ''}`}
                        title={currentlySpeakingId === m.id ? "Stop Reading" : "Read Aloud"}
                      >
                        {currentlySpeakingId === m.id ? <Square size={14} fill="currentColor" /> : <Volume2 size={14} />}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Meta info */}
              <div className="flex items-center gap-1 opacity-60">
                <span className="text-[10px] text-text-muted">
                  {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                </span>
                {isOwn && !isAI && (
                  <span className="text-[10px] ml-1">
                    {m.status === 'SENT' ? '✓' :
                      m.status === 'DELIVERED' || m.status === 'READ' ? '✓✓' :
                        m.status === 'FAILED' ? '!' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {isPeerTyping && !isAI && (
        <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0 mt-1 shadow-sm border border-border overflow-hidden">
             {peerImage ? <img src={peerImage} alt="" className="w-full h-full object-cover" /> : <Users size={16} className="text-primary-600" />}
          </div>
          <div className="flex flex-col gap-1">
            <div className="bg-bg-elevated p-3 px-4 rounded-2xl shadow-sm border border-border/50 flex items-center gap-1.5">
               <div className="flex gap-1 items-center">
                 <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                 <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                 <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce"></div>
               </div>
               <span className="text-[12px] text-text-secondary ml-1 font-medium">{peerName || 'Peer'} is typing...</span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}