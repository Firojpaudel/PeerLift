"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useChat } from '@ai-sdk/react';
// @ts-ignore - Transport types in AI SDK 6 might vary locally
import { TextStreamChatTransport } from 'ai';
import { ChevronLeft, Send, Phone, Search, Users, Bot, Mic, Settings2, PlayCircle, X, Maximize, Minimize, Plus, Paperclip, Brain, Volume2, Square, Video, Calendar, Zap, Lightbulb } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { getPusherClient } from '@/lib/pusher';
import { getMessageText } from '@/lib/chat-utils';
import { ChatSidebar } from '@/components/features/chat/ChatSidebar';
import { MessageList } from '@/components/features/chat/MessageList';
import { ScheduleMeetModal } from '@/components/features/chat/ScheduleMeetModal';
import { ChatTour } from '@/components/features/tutorial/ChatTour';

// --- Mermaid Chart Component ---
const MermaidChart = ({ chart }: { chart: string }) => {
  const [svg, setSvg] = useState('');
  const [isError, setIsError] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sanitizeMermaid = (code: string) => {
    return (code || '')
      .trim()
      .replace(/[→⎯→⇒⇨\u2192\u2190\u2194\u21D0\u21D2]/g, '-->')
      .replace(/(-{1,})*>*\s*\|([^|]+)\|>+/g, '-->|$2|')
      .replace(/(-{2,})\s*\|([^|]+)\|/g, '-->|$2|')
      .replace(/->\s*\|([^|]+)\|/g, '-->|$1|')
      .replace(/(\[[^\]]+\])\s*(-{2,})\s*\|([^|]+)\|/g, '$1-->|$3|')
      .replace(/graph\s+(TD|LR|BT|RL)\s+/g, 'graph $1\n')
      .replace(/subgraph\s+([^\n{]+)\s*\n/g, 'subgraph "$1"\n'); // Ensure subgraphs have quoted names
  };

  useEffect(() => {
    const renderChart = async () => {
      try {
        const { default: mermaid } = await import('mermaid');
        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          themeVariables: {
            primaryColor: '#F59E0B',
            primaryTextColor: '#fff',
            primaryBorderColor: '#F59E0B',
            lineColor: '#FB1',
            secondaryColor: '#0061ff',
            tertiaryColor: '#fff',
            mainBkg: '#121212',
            nodeBorder: '#333',
            clusterBkg: '#1a1a1a',
            clusterBorder: '#444',
            defaultLinkColor: '#888',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
          securityLevel: 'loose',
          flowchart: {
            useMaxWidth: false, // For zoom/pan
            htmlLabels: true,
            curve: 'cardinal',
            rankSpacing: 50,
            nodeSpacing: 50,
            padding: 15
          }
        });

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const sanitized = sanitizeMermaid(chart);
        const { svg: svgCode } = await mermaid.render(id, sanitized);
        
        // Clear any pending error timeouts if rendering succeeds
        if (errorTimeoutRef.current) {
          clearTimeout(errorTimeoutRef.current);
          errorTimeoutRef.current = null;
        }

        setSvg(svgCode);
        setIsError(false);
      } catch (err) {
        // If compilation fails while text is actively streaming, do NOT show the error card instantly.
        // Instead, debounce the error state by 1.5 seconds. If a new chunk comes in, this timer is reset.
        if (errorTimeoutRef.current) {
          clearTimeout(errorTimeoutRef.current);
        }
        
        errorTimeoutRef.current = setTimeout(() => {
          setIsError(true);
        }, 1500);
      }
    };
    renderChart();

    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [chart]);

  if (isError) {
    return (
      <div className="my-6 overflow-hidden rounded-2xl border border-red-500/20 shadow-2xl relative bg-[#0B0B0B] min-h-[300px] flex flex-col justify-center transition-all duration-300">
        <div className="p-6 bg-red-500/5 max-w-md mx-auto rounded-xl border border-red-500/10 text-center animate-in fade-in-50 duration-300">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Synthesis Error</span>
          </div>
          <p className="text-xs text-red-400/90 leading-relaxed mb-4">
            Diagram synthesis failed. The AI might have used complex branching or invalid syntax.
          </p>
          <button 
            onClick={() => setShowRaw(!showRaw)} 
            className="text-[11px] font-bold bg-red-500/20 hover:bg-red-500/30 px-3.5 py-1.5 rounded-lg text-red-300 hover:text-red-200 transition-all outline-none"
          >
            {showRaw ? 'Show Explanation' : 'Inspect Raw Code'}
          </button>
          
          {showRaw && (
            <pre className="text-[10px] text-red-400/80 overflow-auto max-h-40 p-3 bg-black/40 rounded-lg text-left mt-4 font-mono leading-relaxed border border-red-500/10 transition-all">
              {chart}
            </pre>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-white/5 shadow-2xl relative group bg-[#0B0B0B]">
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-2">
        <button onClick={() => setShowRaw(!showRaw)} className="p-2 bg-black/60 backdrop-blur-md rounded-xl text-white/70 hover:text-white transition-all hover:scale-105 active:scale-95" title="View Source">
          {showRaw ? <Brain size={16} /> : <PlayCircle size={16} />}
        </button>
      </div>

      {showRaw ? (
        <div className="p-5 bg-[#121212] font-mono text-[11px] text-amber-500/80 leading-relaxed overflow-auto max-h-[400px]">
          <pre>{chart}</pre>
        </div>
      ) : (
        <div className="relative min-h-[300px]">
          {!svg ? (
            <div className="absolute inset-0 flex flex-col justify-center items-center gap-3 bg-black/10 backdrop-blur-[1px] min-h-[300px]">
              <span className="w-8 h-8 rounded-full border-2 border-primary-500/30 border-t-primary-500 animate-spin block"></span>
              <span className="text-[11px] font-bold text-primary-500/70 uppercase tracking-widest animate-pulse">Generating learning graph...</span>
            </div>
          ) : (
            <div
              ref={containerRef}
              className="p-8 flex justify-center items-center overflow-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent active:cursor-grabbing transition-all animate-in fade-in duration-300"
              dangerouslySetInnerHTML={{ __html: svg }}
              style={{ minHeight: '300px' }}
            />
          )}
          <div className="absolute bottom-3 left-3 text-[10px] text-white/20 font-medium pointer-events-none">
            SCROLL TO ZOOM / PAN • BRANCHED LOGIC
          </div>
        </div>
      )}
    </div>
  );
};

// --- Thinking / Reasoning Component ---
const ThoughtBlock = ({ content }: { content: string }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-4 overflow-hidden border border-amber-500/20 rounded-2xl bg-gradient-to-br from-amber-500/5 to-transparent">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3.5 hover:bg-amber-500/10 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500">
            <Brain size={16} className={isExpanded ? 'animate-pulse' : ''} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-500 leading-none mb-1">Reasoning Mode</h4>
            <p className="text-[10px] text-amber-500/60 uppercase tracking-widest font-extrabold">Active Analysis</p>
          </div>
        </div>
        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
          <ChevronLeft size={16} className="-rotate-90 text-amber-500/50" />
        </div>
      </button>
      {isExpanded && (
        <div className="p-4 pt-0 text-[13px] leading-relaxed text-text-secondary/80 font-medium italic animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="prose prose-sm prose-p:my-1 opacity-70 border-l-2 border-amber-500/20 pl-4 ml-1">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Speech Waveform Visualizer ---
const WaveformVisualizer = ({ state }: { state: 'listening' | 'thinking' | 'speaking' | 'idle' }) => {
  const barCount = 19;
  const getAnimationClass = () => {
    switch (state) {
      case 'speaking': return 'animate-wave-speaking';
      case 'listening': return 'animate-wave-listening';
      case 'thinking': return 'animate-wave-thinking';
      default: return 'animate-wave-idle';
    }
  };

  const getBarColor = () => {
    switch (state) {
      case 'speaking': return 'bg-gradient-to-t from-amber-500 to-primary-500';
      case 'listening': return 'bg-gradient-to-t from-emerald-500 to-teal-400';
      case 'thinking': return 'bg-gradient-to-t from-blue-500 to-indigo-500';
      default: return 'bg-white/10';
    }
  };

  return (
    <div className="flex items-end justify-center gap-1 h-20 px-8 py-3 my-6 rounded-2xl bg-black/35 backdrop-blur-md border border-white/5 shadow-inner min-w-[280px]">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes wave-speaking {
          0%, 100% { transform: scaleY(0.2); }
          50% { transform: scaleY(1.9); }
        }
        @keyframes wave-listening {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(0.8); }
        }
        @keyframes wave-thinking {
          0%, 100% { transform: scaleY(0.4); opacity: 0.4; }
          50% { transform: scaleY(1.3); opacity: 1; }
        }
        @keyframes wave-idle {
          0%, 100% { transform: scaleY(0.15); }
          50% { transform: scaleY(0.35); }
        }
        .animate-wave-speaking {
          animation: wave-speaking 0.75s ease-in-out infinite;
        }
        .animate-wave-listening {
          animation: wave-listening 1.3s ease-in-out infinite;
        }
        .animate-wave-thinking {
          animation: wave-thinking 1.6s ease-in-out infinite;
        }
        .animate-wave-idle {
          animation: wave-idle 2.2s ease-in-out infinite;
        }
      `}} />
      {Array.from({ length: barCount }).map((_, i) => {
        const delay = (Math.abs(i - 9) * 0.08).toFixed(2);
        const baseHeight = 10 + Math.sin(i * 0.4) * 5;
        return (
          <div
            key={i}
            className={`w-[6px] rounded-full origin-bottom transition-all duration-500 ${getAnimationClass()} ${getBarColor()}`}
            style={{
              height: `${baseHeight}px`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
};


// Custom Markdown Renderer Components
const markdownComponents = {
  // Override the default <pre> wrapper so Tailwind's typography plugin doesn't add its own box-in-a-box styling
  pre: ({ children }: any) => <div className="not-prose">{children}</div>,
  code({ node, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || '');
    const lang = match ? match[1] : '';
    const content = String(children).replace(/\n$/, '');
    const mermaidKeywords = ['graph ', 'graph\n', 'sequenceDiagram', 'pie', 'gantt', 'classDiagram', 'stateDiagram', 'erDiagram', 'journey'];
    const isMermaid = lang === 'mermaid' || mermaidKeywords.some(k => content.startsWith(k));

    if (isMermaid) {
      return <MermaidChart chart={content} />;
    }

    if (match && !props.inline) {
      return (
        <div className="my-5 rounded-xl overflow-hidden shadow-2xl relative group bg-[#1e1e1e] border border-white/10 transition-all duration-300 ease-out animate-in fade-in-50">
          <div className="bg-[#2d2d2d] border-b border-white/5 px-4 py-2 text-xs text-neutral-400 flex items-center justify-between uppercase tracking-wider" style={{ fontFamily: '"Iosevka", "Iosevka Term", monospace' }}>
            {lang}
          </div>
          <div className="relative min-h-[4rem] transition-all duration-300">
            <SyntaxHighlighter
              style={vscDarkPlus as any}
              language={lang}
              PreTag="div"
              customStyle={{ margin: 0, padding: '1.25rem', backgroundColor: '#1e1e1e', fontSize: '14px', fontFamily: '"Iosevka", "Iosevka Term", monospace', lineHeight: '1.6' }}
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          </div>
        </div>
      );
    }

    return (
      <code className="bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded-md text-primary-600 dark:text-primary-400 text-[13px]" style={{ fontFamily: '"Iosevka", "Iosevka Term", monospace' }} {...props}>
        {children}
      </code>
    );
  }
};


function ChatSessionInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const peerId = searchParams.get('peerId') || '';
  const isAI = searchParams.get('ai') !== 'false' && (searchParams.get('ai') === 'true' || !peerId);
  const urlSessionId = searchParams.get('sessionId') || '';
  const isNewSession = searchParams.get('new') === 'true';
  const [activeSessionId, setActiveSessionId] = useState(urlSessionId);
  const initialPeerName = searchParams.get('peerName') || '';

  // Synchronize local activeSessionId state instantly on URL query updates
  useEffect(() => {
    if (isNewSession) {
      setActiveSessionId('');
      setIsConfigured(false);
      setLearningGoal('');
      setTutorName('Lumina');
      setTutorGender('female');
      setLearningDetail('Intermediate');
      setIsReasoningMode(false);
      // Clear previous session's messages so config card shows cleanly
      setMessages([]);
    } else {
      setActiveSessionId(urlSessionId);
      if (urlSessionId) {
        setIsConfigured(true);
      }
    }
  }, [urlSessionId, isNewSession]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasFetchedHistory = useRef<string | null>(null);
  const lastSpokenMsgId = useRef<string>('');
  const isAILoadingRef = useRef(false);
  const isSpeakingVoiceRef = useRef(false);

  // Local Session State
  const [sessionUserId, setSessionUserId] = useState<string>('');
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // DM State
  const [dmMessages, setDmMessages] = useState<any[]>([]);
  const [dmInput, setDmInput] = useState('');
  const [isLoadingDM, setIsLoadingDM] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(initialPeerName ? { name: initialPeerName, id: peerId } : null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // UI States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  // Voice UI States
  const [isListening, setIsListening] = useState(false);
  const [showVoiceMode, setShowVoiceMode] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isSpeakingVoice, setIsSpeakingVoice] = useState(false);

  // AI Config & Sessions
  const [aiSessions, setAiSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [learningGoal, setLearningGoal] = useState('');
  const [learningDetail, setLearningDetail] = useState('Intermediate');
  const [tutorName, setTutorName] = useState('Lumina');
  const [tutorGender, setTutorGender] = useState<'male' | 'female'>('female');
  const [isConfigured, setIsConfigured] = useState(true);
  const [isReasoningMode, setIsReasoningMode] = useState(false);

  // Speech & Voice
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Document Parsing
  const [parsedDoc, setParsedDoc] = useState<{ text: string, name: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const voiceModeRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const sendAIMessageRef = useRef<(options: { text: string }) => void>(() => {});

  // --- AI Hook (Decoupled New Vercel AI SDK Integration) ---
  const [aiInput, setAiInput] = useState('');
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAiInput(e.target.value);
  };

  const {
    messages: aiMessages,
    sendMessage,
    setMessages,
    status: aiStatus,
  } = (useChat as any)({
    api: '/api/chat',
    body: {
      contextData: {
        learningGoal,
        learningDetail,
        tutorName,
        isReasoning: isReasoningMode,
        documentText: parsedDoc?.text,
        sessionId: activeSessionId,
      },
    },
  });

  const isAILoading = aiStatus === 'submitted' || aiStatus === 'streaming';

  useEffect(() => {
    isAILoadingRef.current = isAILoading;
  }, [isAILoading]);

  useEffect(() => {
    isSpeakingVoiceRef.current = isSpeakingVoice;
  }, [isSpeakingVoice]);

  // Voice Interaction Handlers
  const startVoiceMode = async () => {
    // Explicitly request native browser microphone permission to prompt user authorization
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Immediately release the track so the SpeechRecognition API can utilize the microphone
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (err) {
      console.warn("Microphone access permission was denied or blocked:", err);
    }

    // Treat all existing assistant messages as already spoken to avoid reading old history
    if (aiMessages.length > 0) {
      const lastMessage = aiMessages[aiMessages.length - 1];
      if (lastMessage.role === 'assistant') {
        lastSpokenMsgId.current = lastMessage.id;
      }
    }
    setShowVoiceMode(true);
  };

  const stopVoiceMode = () => {
    setShowVoiceMode(false);
    window.speechSynthesis.cancel();
    setIsSpeakingVoice(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        console.error("Failed to stop recognition:", e);
      }
      recognitionRef.current = null;
    }
    voiceModeRef.current = false;
  };

  const handleInterrupt = () => {
    window.speechSynthesis.cancel();
    setIsSpeakingVoice(false);
  };

  // Helper for direct AI message sending with session auto-initialization fallback
  const sendAIMessage = async (options: { text: string }) => {
    const textToSend = (options.text || '').trim();
    if (!textToSend || isAILoading) return;

    try {
      let sessionIdToUse = activeSessionId;
      if (!sessionIdToUse) {
        const newSessionId = await handleCreateSession(textToSend);
        if (!newSessionId) return;
        sessionIdToUse = newSessionId;
      }

      await sendMessage(
        { text: textToSend },
        {
          body: {
            contextData: {
              learningGoal: learningGoal || textToSend,
              learningDetail,
              tutorName,
              isReasoning: isReasoningMode,
              documentText: parsedDoc?.text,
              sessionId: sessionIdToUse,
            },
          },
        }
      );
    } catch (err) {
      console.error("Failed to send AI message:", err);
    }
  };

  // Keep the ref always pointing to the latest sendAIMessage so the recognition
  // effect can call it without depending on its identity (which changes every render).
  useEffect(() => {
    sendAIMessageRef.current = sendAIMessage;
  });

  // Fetch all user AI sessions
  useEffect(() => {
    if (!isAI || !sessionUserId) return;

    const fetchAISessions = async () => {
      setIsLoadingSessions(true);
      try {
        const res = await fetch('/api/chat/sessions');
        const data = await res.json();
        if (Array.isArray(data)) {
          setAiSessions(data);
          // Auto select most recent session if not specified, only if not explicitly creating a new one
          if (!activeSessionId && data.length > 0 && !isNewSession) {
            const mostRecent = data[0];
            setActiveSessionId(mostRecent.id);
            router.replace(`/sessions/chat?ai=true&sessionId=${mostRecent.id}`);
          }
        }
      } catch (err) {
        console.error("Failed to load AI sessions:", err);
      } finally {
        setIsLoadingSessions(false);
      }
    };

    fetchAISessions();
  }, [isAI, sessionUserId, activeSessionId]);

  // Load configuration from selected session
  useEffect(() => {
    if (!isAI || !activeSessionId || aiSessions.length === 0) return;
    const currentSession = aiSessions.find(s => s.id === activeSessionId);
    if (currentSession) {
      setLearningGoal(currentSession.learningGoal || '');
      setLearningDetail(currentSession.skillLevel || 'Intermediate');
      setTutorName(currentSession.tutorName || 'Lumina');
      setTutorGender((currentSession.tutorGender as 'male' | 'female') || 'female');
      setIsReasoningMode(currentSession.isReasoning || false);
      setIsConfigured(true);
    }
  }, [isAI, activeSessionId, aiSessions]);

  // Handle deletion of an AI session (called from modal confirm)
  const handleDeleteAISession = async (idToDel: string) => {
    // Open modal instead of browser confirm
    setDeleteModalId(idToDel);
  };

  const confirmDeleteSession = async () => {
    if (!deleteModalId) return;
    try {
      const res = await fetch(`/api/chat/sessions/${deleteModalId}`, { method: 'DELETE' });
      if (res.ok) {
        setAiSessions(prev => prev.filter(s => s.id !== deleteModalId));
        if (activeSessionId === deleteModalId) {
          // If we deleted the active session, switch to the next available one
          const remaining = aiSessions.filter(s => s.id !== deleteModalId);
          if (remaining.length > 0) {
            router.replace(`/sessions/chat?ai=true&sessionId=${remaining[0].id}`);
          } else {
            setActiveSessionId('');
            router.replace('/sessions/chat?ai=true');
            setMessages([]);
            setIsConfigured(false);
            setLearningGoal('');
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteModalId(null);
    }
  };

  // Create a new AI tutor session in Postgres database
  const handleCreateSession = async (presetGoal?: string): Promise<string | null> => {
    const goalToUse = presetGoal || learningGoal;
    if (!(goalToUse || '').trim()) return null;

    try {
      const res = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learningGoal: goalToUse,
          skillLevel: learningDetail,
          tutorName: tutorName,
          tutorGender: tutorGender,
          isReasoning: isReasoningMode
        })
      });
      const newSession = await res.json();
      if (newSession && newSession.id) {
        setAiSessions(prev => [newSession, ...prev]);
        setIsConfigured(true);
        
        // Update local state instantly!
        setActiveSessionId(newSession.id);
        
        // Clean URL to replace the "new=true" parameter with the actual active sessionId
        router.replace(`/sessions/chat?ai=true&sessionId=${newSession.id}`);
        return newSession.id;
      }
    } catch (e) {
      console.error("Failed to create AI session:", e);
    }
    return null;
  };

  // Auto-unlock UI if we already have a conversation
  useEffect(() => {
    if (aiMessages.length > 0) {
      setIsConfigured(true);
    }
  }, [aiMessages.length]);

  // Track call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showVoiceMode) {
      interval = setInterval(() => setCallDuration(d => d + 1), 1000);
      voiceModeRef.current = true;
    } else {
      setCallDuration(0);
      voiceModeRef.current = false;
    }
    return () => clearInterval(interval);
  }, [showVoiceMode]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/chat/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.text) {
        setParsedDoc({ text: data.text, name: file.name });
        // Initial AI message about the document
        sendAIMessage({ text: `I've uploaded a document named "${file.name}". Can you summarize it for me?` });
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  // Syncing logic
  useEffect(() => {
    let ignore = false;
    const initPusher = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const session = await res.json();
        if (ignore) return;

        let userIdToUse = '';
        let currentUserToUse = null;

        if (session?.user?.id) {
          userIdToUse = session.user.id;
          currentUserToUse = session.user;
        } else {
          // Fetch fallback user info so it works in local sandboxes without active cookies!
          try {
            const fallbackRes = await fetch('/api/chat/user');
            const fallbackUser = await fallbackRes.json();
            if (fallbackUser && fallbackUser.id) {
              userIdToUse = fallbackUser.id;
              currentUserToUse = fallbackUser;
            }
          } catch (err) {
            console.error("Failed to load fallback user:", err);
          }
        }

        if (userIdToUse) {
          setSessionUserId(userIdToUse);
          setCurrentUser(currentUserToUse);
          
          const pusherClient = getPusherClient();
          if (pusherClient) {
            const channel = pusherClient.subscribe('presence-online');

            channel.bind('pusher:subscription_succeeded', (members: any) => {
              const online = new Set<string>();
              Object.keys(members.members).forEach(id => online.add(id));
              setOnlineUsers(online);
            });

            channel.bind('pusher:member_added', (member: any) => {
              setOnlineUsers(prev => new Set(prev).add(member.id));
            });

            channel.bind('pusher:member_removed', (member: any) => {
              setOnlineUsers(prev => {
                const next = new Set(prev);
                next.delete(member.id);
                return next;
              });
            });

            // Private DM binding
            if (peerId && !isAI) {
              const ids = [userIdToUse, peerId].sort();
              const dmChannelName = `private-chat-${ids[0]}-${ids[1]}`;
              const dmChannel = pusherClient.subscribe(dmChannelName);

              // Unbind first to prevent duplicate listeners on the same channel instance
              dmChannel.unbind('new-message');
              dmChannel.unbind('peer-typing');

              dmChannel.bind('new-message', (data: any) => {
                if (data.userId !== userIdToUse) {
                  setDmMessages(prev => [...prev, data]);
                }
              });

              dmChannel.bind('peer-typing', (data: any) => {
                if (data.userId === peerId) {
                  setIsPeerTyping(data.isTyping);
                  if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                  if (data.isTyping) {
                    typingTimeoutRef.current = setTimeout(() => setIsPeerTyping(false), 3500);
                  }
                }
              });
            }
          }
        }
      } catch (err) {
        console.error("Pusher err:", err);
      }
    };
    initPusher();

    return () => {
      ignore = true;
      const pusherClient = getPusherClient();
      if (pusherClient) {
        pusherClient.unsubscribe('presence-online');
        if (peerId && !isAI) {
          const ids = [sessionUserId, peerId].sort();
          if (ids[0] && ids[1]) {
            const dmChannelName = `private-chat-${ids[0]}-${ids[1]}`;
            pusherClient.unsubscribe(dmChannelName);
          }
        }
      }
    };
  }, [sessionUserId, peerId, isAI]);

  // Load selected peer details & historical messages
  useEffect(() => {
    if (!sessionUserId) return;
    if (!isAI && !peerId) return;
    if (isAI && !activeSessionId) return; // Wait until we have a session ID

    const currentSessionKey = isAI ? activeSessionId : peerId;
    if (hasFetchedHistory.current === currentSessionKey) return;

    const query = isAI ? `isAi=true&sessionId=${activeSessionId}` : `peerId=${peerId}`;
    fetch(`/api/chat/messages?${query}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error && Array.isArray(data)) {
          if (isAI) {
            // Only set AI messages if we are not actively loading a response
            if (!isAILoading) {
              setMessages(data);
              hasFetchedHistory.current = currentSessionKey;
            }
          } else {
            setDmMessages(data.map((m: any) => ({ ...m, status: 'READ' })));
            hasFetchedHistory.current = currentSessionKey;
          }
        }
      });

    if (!isAI && peerId) {
      fetch(`/api/chat/contacts`)
        .then(res => res.json())
        .then(data => {
          if (!data.error && Array.isArray(data)) {
            const u = data.find((c: any) => c.id === peerId);
            if (u) setSelectedUser(u);
          }
        });
    }
  }, [peerId, isAI, activeSessionId, sessionUserId, setMessages, isAILoading]);


  // Voices Proactive
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) setAvailableVoices(voices);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  // Helper: pick a TTS voice matching the tutor's configured gender
  const getGenderedVoice = useCallback(() => {
    if (availableVoices.length === 0) return null;
    const enVoices = availableVoices.filter(v => v.lang.startsWith('en'));
    
    if (tutorGender === 'male') {
      // Prefer recognizable male voices
      return enVoices.find(v => /\bmale\b/i.test(v.name) && !/female/i.test(v.name))
        || enVoices.find(v => /David|Daniel|James|Mark|Guy/i.test(v.name))
        || enVoices.find(v => v.name === 'Google UK English Male')
        || enVoices.find(v => v.name === 'Google US English')
        || availableVoices[0];
    } else {
      // Prefer recognizable female voices
      return enVoices.find(v => /female/i.test(v.name))
        || enVoices.find(v => /Zira|Samantha|Karen|Fiona|Victoria|Susan/i.test(v.name))
        || enVoices.find(v => v.name === 'Google UK English Female')
        || enVoices.find(v => v.lang === 'en-US' && v.name.includes('Premium'))
        || enVoices.find(v => v.name === 'Google US English')
        || availableVoices[0];
    }
  }, [availableVoices, tutorGender]);

  // Typing Indicator Trigger
  useEffect(() => {
    if (!peerId || isAI || !sessionUserId) return;

    const notifyTyping = async (typing: boolean) => {
      try {
        await fetch('/api/chat/typing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ peerId, isTyping: typing })
        });
      } catch (err) { }
    };

    if ((dmInput || '').trim().length > 0) {
      notifyTyping(true);
      const timeout = setTimeout(() => notifyTyping(false), 3000);
      return () => clearTimeout(timeout);
    } else {
      notifyTyping(false);
    }
  }, [dmInput, peerId, isAI, sessionUserId]);

  const handleToggleSpeech = useCallback((id: string, text: string) => {
    if (currentlySpeakingId === id) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();

    const spokenText = (text || '')
      .replace(/<think>[\s\S]*?<\/think>/g, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\[\d+\]/g, '')
      .replace(/[#*`_\[\]()~|>]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!spokenText) return;

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.voice = getGenderedVoice();
    utterance.rate = 1.05;
    utterance.pitch = tutorGender === 'male' ? 0.9 : 1.05;

    utterance.onend = () => setCurrentlySpeakingId(null);
    utterance.onerror = () => setCurrentlySpeakingId(null);

    setCurrentlySpeakingId(id);
    window.speechSynthesis.speak(utterance);
  }, [availableVoices, currentlySpeakingId]);


  // Voice recognition effect — maintains a persistent, crash-free ASR stream during call
  useEffect(() => {
    if (!showVoiceMode) return;
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn("Speech Recognition not supported.");
      return;
    }

    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionCtor();
    recognitionRef.current = recognition;

    recognition.lang = navigator.language || 'en-US';
    recognition.interimResults = true; // Use interim to reset our custom timer
    recognition.maxAlternatives = 1;
    recognition.continuous = true; // Keep listening until explicit stop

    let silenceTimer: NodeJS.Timeout;
    let accumulatedTranscript = '';

    recognition.onstart = () => setIsListening(true);
    recognition.onerror = (_e: any) => {
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
      // Restart if still in voice mode (ignores local speaking states to maintain persistent stream)
      if (voiceModeRef.current) {
        setTimeout(() => {
          if (voiceModeRef.current && recognitionRef.current === recognition) {
            try { recognition.start(); } catch (_e) { }
          }
        }, 1000);
      }
    };

    recognition.onresult = (event: any) => {
      // If AI is actively speaking or thinking, ignore transcription results to block feedback loops
      if (isAILoadingRef.current || isSpeakingVoiceRef.current) {
        accumulatedTranscript = '';
        return;
      }

      let currentInterim = '';
      let finalChunk = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalChunk += event.results[i][0].transcript + ' ';
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }

      if (finalChunk) accumulatedTranscript += finalChunk;

      const totalSpeech = (accumulatedTranscript + currentInterim).trim();

      if (totalSpeech) {
        clearTimeout(silenceTimer);
        // Build a 1.5-second buffer so it doesn't cut the user off while they speak
        silenceTimer = setTimeout(() => {
          const finalSpokenPrompt = (accumulatedTranscript + currentInterim).trim();
          if (finalSpokenPrompt) {
            // Guard again inside timeout to handle rapid transitions
            if (isAILoadingRef.current || isSpeakingVoiceRef.current) {
              accumulatedTranscript = '';
              return;
            }

            setIsListening(false);
            window.speechSynthesis.cancel();
            // Use the ref so this effect doesn't depend on sendAIMessage identity
            sendAIMessageRef.current({ text: finalSpokenPrompt });
            accumulatedTranscript = '';
          }
        }, 1500);
      }
    };

    try { recognition.start(); } catch (_e) { }

    return () => {
      if (recognitionRef.current === recognition) {
        try { recognition.abort(); } catch (_e) { }
        recognitionRef.current = null;
      }
    };
    // IMPORTANT: Only depend on showVoiceMode. The sendAIMessage function is
    // accessed via sendAIMessageRef so the recognition instance stays stable
    // and doesn't restart (losing accumulated transcript) on every state change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showVoiceMode]);

  // Voice TTS effect
  useEffect(() => {
    if (!showVoiceMode || isAILoading || aiMessages.length === 0) return;

    const lastMessage = aiMessages[aiMessages.length - 1];
    if (lastMessage.role !== 'assistant') return;
    if (lastMessage.id === lastSpokenMsgId.current) return;
    lastSpokenMsgId.current = lastMessage.id;

    const textToSpeak = getMessageText(lastMessage)
      .replace(/<think>[\s\S]*?<\/think>/g, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/[#*`_\[\]()~|>]/g, '')
      .replace(/={2,}/g, '')
      .replace(/-{2,}/g, '');

    if (!textToSpeak.trim()) return;

    window.speechSynthesis.cancel();
    setIsSpeakingVoice(true);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.voice = getGenderedVoice();
    utterance.rate = 1.05;
    utterance.pitch = tutorGender === 'male' ? 0.9 : 1.05;

    utterance.onend = () => {
      setIsSpeakingVoice(false);
    };

    utterance.onerror = () => {
      setIsSpeakingVoice(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [isAILoading, aiMessages, showVoiceMode, availableVoices]);

  // Handle DM dispatch routing
  const handleSendDM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAI) {
      if (!(aiInput || '').trim() || isAILoading) return;
      const textToSend = aiInput;
      
      // Clear input state immediately!
      setAiInput('');

      if (!activeSessionId) {
        // Create session behind the scenes
        const newSessionId = await handleCreateSession(textToSend);
        if (newSessionId) {
          try {
            await sendMessage(
              { text: textToSend },
              {
                body: {
                  contextData: {
                    learningGoal: textToSend,
                    learningDetail,
                    tutorName,
                    isReasoning: isReasoningMode,
                    documentText: parsedDoc?.text,
                    sessionId: newSessionId,
                  },
                },
              }
            );
          } catch (err) {
            console.error("Failed to send first AI message:", err);
          }
        }
      } else {
        // Send native Vercel AI SDK submit request!
        try {
          await sendMessage(
            { text: textToSend },
            {
              body: {
                contextData: {
                  learningGoal,
                  learningDetail,
                  tutorName,
                  isReasoning: isReasoningMode,
                  documentText: parsedDoc?.text,
                  sessionId: activeSessionId,
                },
              },
            }
          );
        } catch (err) {
          console.error("Failed to send AI message:", err);
        }
      }
      return;
    }

    if (!(dmInput || '').trim() || !peerId || isLoadingDM) return;

    const msgPayload = {
      id: crypto.randomUUID(),
      content: dmInput,
      userId: sessionUserId,
      createdAt: new Date().toISOString(),
      status: 'SENT'
    };

    setDmInput('');
    setIsLoadingDM(true);

    // Optimistically update list
    setDmMessages(prev => [...prev, msgPayload]);

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: msgPayload.content, receiverId: peerId })
      });
      const data = await res.json();

      // Update optimistic message with real ID and Delivered status
      setDmMessages(prev => prev.map(m => m.id === msgPayload.id ? { ...m, id: data.id, status: 'DELIVERED' } : m));
    } catch (error) {
      setDmMessages(prev => prev.map(m => m.id === msgPayload.id ? { ...m, status: 'FAILED' } : m));
    } finally {
      setIsLoadingDM(false);
    }
  };

  const activeMessages = isAI ? aiMessages : dmMessages;

  return (
    <div className={`p-0 md:p-8 flex items-center justify-center bg-bg-primary transition-all duration-300 w-full ${isFullscreen ? 'fixed inset-0 z-[100] h-screen p-0 m-0 bg-bg-secondary' : 'h-[calc(100vh-4rem)]'}`}>
      <div className={`flex w-full h-full bg-bg-secondary border border-border shadow-2xl overflow-hidden transition-all duration-300 ${isFullscreen ? 'rounded-none max-w-none border-none' : 'max-w-[1400px] rounded-2xl'}`}>

        {/* Chat Sidebar */}
        <ChatSidebar
          currentPeerId={peerId || (isAI ? 'test-peer-id' : '')}
          onlineUsers={onlineUsers}
          userId={sessionUserId}
          isAIMode={isAI}
          aiSessions={aiSessions}
          selectedSessionId={activeSessionId}
          onDeleteSession={handleDeleteAISession}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full relative">

          {/* Top Header */}
          <div className="h-[72px] border-b border-border bg-bg-elevated px-6 flex items-center justify-between shrink-0 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="md:hidden text-text-muted hover:text-text-primary p-2 bg-bg-secondary rounded-full">
                <ChevronLeft size={20} />
              </Link>

              <div className="flex items-center gap-3">
                <div className="relative group">
                  <div className={`w-[42px] h-[42px] rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm overflow-hidden ${isAI ? 'bg-gradient-to-br from-primary-400 to-amber-600' : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    }`}>
                    {isAI ? <Bot size={22} className="text-white" /> : (
                      selectedUser?.avatarUrl ? <img src={selectedUser.avatarUrl} alt="" className="w-full h-full object-cover" /> : <Users size={20} />
                    )}
                  </div>
                  {isAI || (onlineUsers.has(peerId)) ? (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                  ) : (
                    peerId && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-gray-400 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-display font-extrabold text-lg leading-tight flex items-center gap-2">
                    {isAI ? tutorName : (selectedUser?.name || 'Peer Connection')}
                    {isAI && <span className="bg-primary-100 text-primary-700 text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded leading-none dark:bg-primary-900/40 dark:text-primary-300">AI</span>}
                  </h2>
                  <p className="text-xs text-text-muted font-medium flex items-center gap-1.5">
                    {isAI ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Always Online
                      </span>
                    ) : (
                      onlineUsers.has(peerId) ? (
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                          Online Now
                        </span>
                      ) : (
                        <span>Offline</span>
                      )
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isAI && peerId && (
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="p-2.5 text-text-muted hover:bg-bg-secondary rounded-full hover:text-primary-500 transition-all active:scale-95"
                  title="Schedule a Session"
                >
                  <Calendar size={20} />
                </button>
              )}
              {isAI && (
                <div className="flex items-center gap-1.5 bg-bg-secondary p-1 rounded-full border border-border/50">
                  <button
                    id="chat-voice-mode-button"
                    onClick={() => setShowVoiceMode(true)}
                    className={`p-2 rounded-full transition-all ${showVoiceMode ? 'bg-primary-500 text-white shadow-primary-500/20 animate-pulse' : 'hover:bg-primary-500/10 text-primary-500 transition-all hover:scale-105 active:scale-95'}`}
                    title="Enter Voice Mode"
                  >
                    <Phone size={18} />
                  </button>
                  <button
                    id="chat-tutor-settings-button"
                    onClick={() => setShowConfig(!showConfig)}
                    className={`p-2 rounded-full transition-all ${showConfig ? 'bg-primary-500 text-white' : 'text-text-muted hover:text-primary-500 hover:bg-primary-500/10'}`}
                    title="Tutor Settings"
                  >
                    <Settings2 size={18} />
                  </button>
                </div>
              )}
              <button
                id="chat-tutorial-trigger-button"
                onClick={() => {
                  if ((window as any).restartChatTour) {
                    (window as any).restartChatTour();
                  }
                }}
                className="p-2.5 text-text-muted hover:bg-bg-secondary rounded-full hover:text-primary-500 transition-all active:scale-95"
                title="Start Chat Tutorial"
              >
                <Lightbulb size={20} className="text-amber-500/80" />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className={`p-2.5 rounded-full transition-all active:scale-95 ${isFullscreen ? 'bg-primary-500 text-white' : 'text-text-muted hover:bg-bg-secondary hover:text-text-primary'}`}
              >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden relative">





            {/* Chat Messages or AI Setup Onboarding Card */}
            {isAI && !activeSessionId ? (
              <div className="flex-1 flex items-start justify-center bg-bg-secondary overflow-y-auto py-6">
                <div id="chat-onboarding-card" className="w-full max-w-md bg-bg-elevated border border-border rounded-2xl shadow-2xl relative overflow-hidden mx-4 my-auto">
                  {/* Decorative glows */}
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl"></div>

                  <div className="relative z-10 p-5">
                    {/* Header */}
                    <div className="text-center mb-4">
                      <div className="inline-flex p-2.5 bg-gradient-to-br from-primary-400 to-amber-600 rounded-xl text-white shadow-lg mb-2">
                        <Bot size={22} />
                      </div>
                      <h2 className="text-lg font-display font-extrabold text-text-primary tracking-tight">Configure AI Tutor</h2>
                      <p className="text-[11px] text-text-secondary mt-0.5">Setup your learning companion</p>
                    </div>

                    <div className="space-y-3">
                      {/* Step 1: Tutor Name */}
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">Tutor Name</label>
                        <input
                          type="text"
                          value={tutorName}
                          onChange={(e) => setTutorName(e.target.value)}
                          placeholder="e.g. Lumina, Socrates"
                          className="w-full h-9 px-3 rounded-lg border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                        />
                      </div>

                      {/* Voice Gender */}
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">Voice Gender</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {(['female', 'male'] as const).map(g => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => setTutorGender(g)}
                              className={`h-8 rounded-lg border font-bold text-[11px] transition-all capitalize ${
                                tutorGender === g
                                  ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                                  : 'bg-bg-primary text-text-secondary border-border hover:bg-bg-secondary'
                              }`}
                            >
                              {g === 'female' ? '♀ Female' : '♂ Male'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Step 2: Learning Goal */}
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">What to learn?</label>
                        <textarea
                          value={learningGoal}
                          onChange={(e) => setLearningGoal(e.target.value)}
                          placeholder="e.g. Master React Hooks, Quantum Physics..."
                          rows={2}
                          className="w-full p-3 rounded-lg border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm resize-none"
                        />
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {['React Hooks', 'Quantum Physics', 'Financial Literacy', 'Python for DS'].map(suggest => (
                            <button
                              key={suggest}
                              type="button"
                              onClick={() => {
                                setLearningGoal(suggest);
                                if (suggest === 'React Hooks') { setTutorName('Lumina'); setTutorGender('female'); }
                                else if (suggest === 'Quantum Physics') { setTutorName('Socrates'); setTutorGender('male'); }
                                else if (suggest === 'Financial Literacy') { setTutorName('Kuber'); setTutorGender('male'); }
                                else if (suggest === 'Python for DS') { setTutorName('PyTutor'); setTutorGender('female'); }
                              }}
                              className="text-[9px] font-bold px-2 py-0.5 bg-bg-secondary text-text-secondary border border-border rounded-full hover:border-primary-500 hover:text-primary-500 transition-all"
                            >
                              {suggest}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Step 3: Difficulty Level */}
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">Skill Level</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                            <button
                              key={level}
                              type="button"
                              onClick={() => setLearningDetail(level)}
                              className={`h-8 rounded-lg border font-bold text-[11px] transition-all ${
                                learningDetail === level
                                  ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                                  : 'bg-bg-primary text-text-secondary border-border hover:bg-bg-secondary'
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Step 4: Reasoning Mode */}
                      <label className="flex items-center gap-2 cursor-pointer group bg-bg-secondary p-2.5 rounded-lg border border-border hover:border-primary-500/30 transition-all">
                        <input
                          type="checkbox"
                          checked={isReasoningMode}
                          onChange={(e) => setIsReasoningMode(e.target.checked)}
                          className="rounded border-border text-primary-500 focus:ring-primary-500 w-3.5 h-3.5"
                        />
                        <div>
                          <span className="text-[11px] font-bold text-text-primary group-hover:text-primary-500 transition-colors block leading-tight">Thinking Mode</span>
                          <span className="text-[9px] text-text-muted block leading-tight">Step-by-step reasoning for complex logic</span>
                        </div>
                      </label>
                    </div>

                    {/* Submit */}
                    <button
                      onClick={() => handleCreateSession()}
                      disabled={!(learningGoal || '').trim()}
                      className="w-full h-9 mt-4 bg-gradient-to-r from-primary-500 to-amber-600 text-white font-bold text-xs rounded-lg hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5"
                    >
                      <Zap size={14} />
                      Initialize Tutor
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <MessageList
                messages={activeMessages}
                isAI={isAI}
                sessionUserId={sessionUserId}
                tutorName={tutorName}
                learningGoal={learningGoal}
                learningDetail={learningDetail}
                currentlySpeakingId={currentlySpeakingId}
                onToggleSpeech={handleToggleSpeech}
                markdownComponents={markdownComponents}
                getMessageText={getMessageText}
                isConfigured={isConfigured}
                peerImage={selectedUser?.avatarUrl}
                userImage={currentUser?.avatarUrl}
                isPeerTyping={isPeerTyping}
                peerName={selectedUser?.name}
              />
            )}

            {/* Config Sidebar (for AI mode) */}
            {isAI && showConfig && (
              <div className="w-[320px] bg-bg-elevated border-l border-border flex flex-col shrink-0 animate-in slide-in-from-right h-full z-30 absolute right-0 sm:relative shadow-2xl sm:shadow-none">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-bold">Tutor Settings</h3>
                  <button onClick={() => setShowConfig(false)} className="p-1 rounded bg-bg-secondary hover:text-text-primary transition-colors"><X size={16} /></button>
                </div>
                <div className="p-4 space-y-4 overflow-y-auto flex-1">
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Learning Goal</label>
                    <input type="text" className="w-full bg-bg-secondary border border-border rounded-lg p-2.5 text-sm outline-none focus:ring-2 ring-primary-500/20" value={learningGoal} onChange={(e) => setLearningGoal(e.target.value)} placeholder="e.g. Master React Hooks" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Skill Level</label>
                    <select className="w-full bg-bg-secondary border border-border rounded-lg p-2.5 text-sm outline-none focus:ring-2 ring-primary-500/20" value={learningDetail} onChange={(e) => setLearningDetail(e.target.value)}>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <button
                    onClick={() => { setIsConfigured(true); setShowConfig(false); }}
                    className="w-full py-2.5 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-colors shadow-sm"
                  >
                    Start Session
                  </button>
                  {isAI && (
                    <div className="pt-4 mt-4 border-t border-border">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={isReasoningMode} onChange={(e) => setIsReasoningMode(e.target.checked)} className="rounded border-border text-primary-500 focus:ring-primary-500" />
                        <span className="text-sm font-medium text-text-primary group-hover:text-primary-500 transition-colors">Thinking Mode (Reasoning)</span>
                      </label>
                      <p className="text-[10px] text-text-muted mt-2">Enables step-by-step logical reasoning before responding.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Input Area */}
          <div className="p-4 bg-bg-elevated border-t border-border sticky bottom-0 z-10">
            <form onSubmit={handleSendDM} className="max-w-4xl mx-auto w-full">
              <div id="chat-input-bar" className="bg-bg-secondary border border-border rounded-2xl shadow-sm p-1.5 flex items-center gap-1 focus-within:ring-2 ring-primary-500/20 transition-all">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                />
                <button id="chat-upload-document-button" type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 md:p-3 text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded-xl transition-colors shrink-0 outline-none" title="Attach document">
                  {isUploading ? <span className="w-4 h-4 rounded-full border-2 border-text-muted border-t-text-primary animate-spin block"></span> : <Paperclip size={20} />}
                </button>

                {isAI && (
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={startVoiceMode}
                      className="p-2.5 text-text-muted hover:text-primary-500 hover:bg-bg-elevated rounded-xl transition-colors shrink-0 outline-none"
                      title="Voice Message (ASR)"
                    >
                      <Mic size={20} />
                    </button>
                    <button
                      id="chat-reasoning-mode-button"
                      type="button"
                      onClick={() => setIsReasoningMode(!isReasoningMode)}
                      className={`p-2.5 transition-colors rounded-xl ${isReasoningMode ? 'text-amber-500' : 'text-text-muted hover:text-amber-600'}`}
                      title="Thinking Mode"
                    >
                      <Brain size={18} />
                    </button>
                  </div>
                )}

                <input
                  autoFocus
                  className="flex-1 bg-transparent border-none py-3 px-2 text-[15px] outline-none text-text-primary min-w-0"
                  placeholder={isAI ? "Ask Lumina anything..." : "Message your peer..."}
                  value={isAI ? aiInput : dmInput}
                  onChange={isAI ? handleInputChange : (e) => setDmInput(e.target.value)}
                  disabled={isAI && !isConfigured}
                />
                <button
                  type="submit"
                  disabled={!(isAI ? (aiInput || '').trim() : (dmInput || '').trim()) || isAILoading || isLoadingDM || (isAI && !isConfigured)}
                  className={`p-2.5 md:p-3 rounded-xl transition-all shrink-0 ml-1 outline-none ${((isAI ? (aiInput || '').trim() : (dmInput || '').trim()) || isAILoading) ? 'bg-primary-500 text-white shadow-md' : 'bg-transparent text-text-muted'}`}
                >
                  {isAILoading ? (
                    <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin block"></span>
                  ) : (
                    <Send size={20} className={(isAI ? (aiInput || '').trim() : (dmInput || '').trim()) ? 'translate-x-0.5' : ''} />
                  )}
                </button>
              </div>
            </form>
          </div>

            {/* Voice 2 Voice Full Modal Overlay (Bounded strictly inside Chat Window Area) */}
            {isAI && showVoiceMode && (
              <div className="absolute inset-0 bg-[#0A0A0A]/95 backdrop-blur-2xl z-40 flex flex-col items-center justify-between py-16 px-6 animate-in fade-in duration-300 pointer-events-auto">
                {/* Top Section */}
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10B981]"></span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/80">{tutorName} Voice Active</span>
                </div>

                {/* Center Section: Pulsing Waveform Visualizer & Elegant Status */}
                <div className="flex flex-col items-center justify-center my-auto w-full max-w-md">
                  <WaveformVisualizer state={isSpeakingVoice ? 'speaking' : isListening ? 'listening' : isAILoading ? 'thinking' : 'idle'} />
                  
                  <p className="text-sm font-medium tracking-wide text-white/50 text-center animate-pulse mt-4 transition-all duration-300">
                    {isSpeakingVoice 
                      ? `${tutorName} is speaking` 
                      : isListening 
                        ? 'Listening... Speak naturally' 
                        : isAILoading 
                          ? 'Formulating response...' 
                          : 'Waiting'}
                  </p>
                </div>

                {/* Bottom Section: Call Controls with Instant Interrupt Button */}
                <div className="flex items-center gap-6 z-10">
                  {isSpeakingVoice && (
                    <button
                      onClick={handleInterrupt}
                      className="flex items-center gap-2 px-6 py-3.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 hover:text-amber-400 rounded-full border border-amber-500/25 text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.15)] pointer-events-auto cursor-pointer outline-none"
                      title="Interrupt and speak now"
                    >
                      <Mic size={14} />
                      Interrupt
                    </button>
                  )}
                  <button
                    onClick={stopVoiceMode}
                    className="w-14 h-14 rounded-full bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-500 hover:text-white flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-90 group pointer-events-auto cursor-pointer outline-none"
                    title="End Call"
                  >
                    <Phone size={20} className="rotate-[135deg] group-hover:animate-shake" />
                  </button>
                </div>
              </div>
            )}

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-bg-elevated border border-border rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="inline-flex p-3 bg-red-500/10 rounded-xl mb-3">
                <X size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-display font-bold text-text-primary mb-1">Delete Session?</h3>
              <p className="text-sm text-text-secondary">This will permanently remove this learning session and all its messages.</p>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setDeleteModalId(null)}
                className="flex-1 h-10 rounded-xl border border-border bg-bg-secondary text-text-primary font-semibold text-sm hover:bg-bg-primary transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteSession}
                className="flex-1 h-10 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-all active:scale-[0.98] shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Form Modal */}
      <ScheduleMeetModal
        open={showScheduleModal}
        onOpenChange={setShowScheduleModal}
        receiverId={peerId}
        onScheduleSuccess={(message) => {
          setDmMessages(prev => [...prev, message]);
        }}
      />
      <ChatTour isAI={isAI} activeSessionId={activeSessionId} />
    </div>
  );
}

export default function ChatSessionPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-bg-primary"><span className="w-8 h-8 rounded-full border-4 border-border border-t-primary-500 animate-spin"></span></div>}>
      <ChatSessionInner />
    </Suspense>
  );
}
