"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useChat } from '@ai-sdk/react';
// @ts-ignore - Transport types in AI SDK 6 might vary locally
import { TextStreamChatTransport } from 'ai';
import { ChevronLeft, Send, Phone, Search, Users, Bot, Mic, Settings2, PlayCircle, X, Maximize, Minimize, Plus, Paperclip, Brain, Volume2, Square, Video, Calendar } from 'lucide-react';
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

// --- Mermaid Chart Component ---
const MermaidChart = ({ chart }: { chart: string }) => {
  const [svg, setSvg] = useState('');
  const [isError, setIsError] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const sanitizeMermaid = (code: string) => {
    return code
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
            curve: 'basis',
            rankSpacing: 50,
            nodeSpacing: 50,
            padding: 15
          }
        });

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const sanitized = sanitizeMermaid(chart);
        const { svg: svgCode } = await mermaid.render(id, sanitized);
        setSvg(svgCode);
        setIsError(false);
      } catch (err) {
        console.error('Mermaid render error:', err);
        setIsError(true);
      }
    };
    renderChart();
  }, [chart]);

  if (isError) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Chart Error</span>
          <button onClick={() => setShowRaw(!showRaw)} className="text-[10px] bg-red-500/20 px-2 py-0.5 rounded text-red-400 hover:bg-red-500/30">
            {showRaw ? 'Back to Error' : 'View Code'}
          </button>
        </div>
        {showRaw ? (
          <pre className="text-[10px] text-red-400/80 overflow-auto max-h-40 p-2 bg-black/20 rounded-lg">{chart}</pre>
        ) : (
          <p className="text-xs text-red-400">Diagram synthesis failed. The AI might have used complex branching or invalid syntax.</p>
        )}
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
           <div
            ref={containerRef}
            className="p-8 flex justify-center items-center overflow-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent active:cursor-grabbing transition-all"
            dangerouslySetInnerHTML={{ __html: svg }}
            style={{ minHeight: '300px' }}
          />
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

// Custom Markdown Renderer Components
const markdownComponents = {
  // Override the default <pre> wrapper so Tailwind's typography plugin doesn't add its own box-in-a-box styling
  pre: ({ children }: any) => <div className="not-prose">{children}</div>,
  code({node, className, children, ...props}: any) {
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
        <div className="my-5 rounded-xl overflow-hidden shadow-2xl relative group bg-[#1e1e1e] border border-white/10">
          <div className="bg-[#2d2d2d] border-b border-white/5 px-4 py-2 text-xs text-neutral-400 flex items-center justify-between uppercase tracking-wider" style={{ fontFamily: '"Iosevka", "Iosevka Term", monospace' }}>
            {lang}
          </div>
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
  const isAI = searchParams.get('ai') === 'true';
  const peerId = searchParams.get('peerId') || '';

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Local Session State
  const [sessionUserId, setSessionUserId] = useState<string>('');
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // DM State
  const [dmMessages, setDmMessages] = useState<any[]>([]);
  const [dmInput, setDmInput] = useState('');
  const [isLoadingDM, setIsLoadingDM] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // UI States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showConfig, setShowConfig] = useState(isAI);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  // Voice UI States
  const [isListening, setIsListening] = useState(false);
  const [showVoiceMode, setShowVoiceMode] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // AI Config
  const [learningGoal, setLearningGoal] = useState('');
  const [learningDetail, setLearningDetail] = useState('Intermediate');
  const [tutorName, setTutorName] = useState('Lumina');
  const [isConfigured, setIsConfigured] = useState(!isAI);
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

  // --- AI Hook (Stable Standard) ---
  const { 
    messages: aiMessages, 
    input: aiInput, 
    handleInputChange, 
    handleSubmit: sendAI, 
    append, 
    isLoading: isAILoading, 
    setMessages,
    reload
  } = useChat({
    api: '/api/chat',
    body: {
      contextData: { 
        learningGoal, 
        learningDetail, 
        tutorName, 
        isReasoning: isReasoningMode, 
        documentText: parsedDoc?.text 
      },
    },
  });

  // Voice Interaction Handlers
  const startVoiceMode = () => {
    setShowVoiceMode(true);
  };

  const stopVoiceMode = () => {
    setShowVoiceMode(false);
    window.speechSynthesis.cancel();
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

  // Helper for direct AI message sending
  const sendAIMessage = async (options: { text: string }) => {
    // Robust check for append function
    const appendFn = append;
    if (typeof appendFn !== 'function') {
      console.warn("AI SDK 'append' is not available as a function. Trying fallback sendAI...");
      
      // Fallback 1: Try handleSubmit if it exists as sendAI
      if (typeof sendAI === 'function') {
        try {
           // We can't easily pass the text to handleSubmit as it expects a form event, 
           // but we can try to set the input and call it if possible. 
           // However, append is much more reliable for programmatic calls.
           console.log("Fallback to handleSubmit is complex, just returning.");
        } catch (e) {}
      }
      return;
    }

    try {
      await appendFn({ role: 'user', content: options.text });
    } catch (err) {
      console.error("Failed to send AI message:", err);
    }
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

        if (session?.user?.id) {
          setSessionUserId(session.user.id);
          setCurrentUser(session.user);
          const pusherClient = getPusherClient();
          if (!pusherClient) return;
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
            const ids = [session.user.id, peerId].sort();
            const dmChannelName = `private-chat-${ids[0]}-${ids[1]}`;
            const dmChannel = pusherClient.subscribe(dmChannelName);

            // Unbind first to prevent duplicate listeners on the same channel instance
            dmChannel.unbind('new-message');
            dmChannel.unbind('peer-typing');

            dmChannel.bind('new-message', (data: any) => {
              if (data.userId !== session.user.id) {
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

    const query = isAI ? 'isAi=true' : `peerId=${peerId}`;
    fetch(`/api/chat/messages?${query}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error && Array.isArray(data)) {
          if (isAI) {
            setMessages(data);
          } else {
            setDmMessages(data.map((m: any) => ({ ...m, status: 'READ' })));
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
  }, [peerId, isAI, sessionUserId, setMessages]);


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

    if (dmInput.trim().length > 0) {
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
    const googleUS = availableVoices.find(v => v.name === 'Google US English');
    const premiumEn = availableVoices.find(v => v.lang === 'en-US' && v.name.includes('Premium'));
    utterance.voice = premiumEn || googleUS || availableVoices[0] || null;
    utterance.rate = 1.05;
    utterance.pitch = 1.02;

    utterance.onend = () => setCurrentlySpeakingId(null);
    utterance.onerror = () => setCurrentlySpeakingId(null);

    setCurrentlySpeakingId(id);
    window.speechSynthesis.speak(utterance);
  }, [availableVoices, currentlySpeakingId]);


  // Voice recognition effect — only runs when voice mode is on and not loading
  useEffect(() => {
    if (!showVoiceMode || isAILoading) return;
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
      // Restart if still in voice mode
      if (voiceModeRef.current && !window.speechSynthesis.speaking) {
        setTimeout(() => {
          if (voiceModeRef.current && recognitionRef.current === recognition) {
            try { recognition.start(); } catch (_e) { }
          }
        }, 1000);
      }
    };

    recognition.onresult = (event: any) => {
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
        // Build a 2-second leniency buffer so it doesn't cut the user off while they think
        silenceTimer = setTimeout(() => {
          if ((accumulatedTranscript + currentInterim).trim()) {
            setIsListening(false);
            window.speechSynthesis.cancel();
            sendAIMessage({ text: (accumulatedTranscript + currentInterim).trim() });
            accumulatedTranscript = '';
            try { recognition.stop(); } catch (e) { }
          }
        }, 2000);
      }
    };

    try { recognition.start(); } catch (_e) { }

    return () => {
      if (recognitionRef.current === recognition) {
        try { recognition.abort(); } catch (_e) { }
        recognitionRef.current = null;
      }
    };
  }, [showVoiceMode, isAILoading, sendAIMessage]);

  // Voice TTS effect
  const lastSpokenMsgId = useRef<string>('');
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

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const googleUS = availableVoices.find(v => v.name === 'Google US English');
    const premiumEn = availableVoices.find(v => v.lang === 'en-US' && v.name.includes('Premium'));
    utterance.voice = premiumEn || googleUS || availableVoices[0] || null;
    utterance.rate = 1.05;
    utterance.pitch = 1.02;

    utterance.onend = () => {
      if (voiceModeRef.current && recognitionRef.current) {
        setTimeout(() => {
          if (voiceModeRef.current) {
            try { recognitionRef.current?.start(); } catch (_e) { }
          }
        }, 500);
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [isAILoading, aiMessages, showVoiceMode, availableVoices]);

  // Handle DM dispatch routing
  const handleSendDM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAI) {
      if (!dmInput.trim() || isAILoading) return;
      const textToSend = dmInput;
      setDmInput('');
      sendAIMessage({ text: textToSend });
      return;
    }

    if (!dmInput.trim() || !peerId || isLoadingDM) return;

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
                <button
                  onClick={() => setShowVoiceMode(true)}
                  className={`p-2.5 rounded-full transition-all shadow-sm ${showVoiceMode ? 'bg-primary-500 text-white shadow-primary-500/20 animate-pulse' : 'bg-primary-500 hover:bg-primary-600 text-white shadow-primary-500/20 hover:scale-105 active:scale-95'}`}
                  title="Enter Voice Mode"
                >
                  <Phone size={20} />
                </button>
              )}
              <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2.5 text-text-muted hover:bg-bg-secondary rounded-full hover:text-text-primary hidden md:block transition-all active:scale-95">
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden relative">

            {/* Voice 2 Voice Full Modal Overlay */}
            {isAI && showVoiceMode && (
              <div className="absolute inset-0 bg-bg-elevated/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="relative mb-12 flex items-center justify-center">
                  {/* Outer pulsing rings when listening */}
                  {isListening && (
                    <>
                      <div className="absolute w-48 h-48 rounded-full bg-primary-500/10 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                      <div className="absolute w-40 h-40 rounded-full bg-primary-500/20 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                    </>
                  )}
                  {/* Central Orb */}
                  <div className={`w-32 h-32 rounded-full shadow-2xl shadow-primary-500/30 flex items-center justify-center relative z-10 transition-all duration-500 ${isListening ? 'bg-gradient-to-br from-primary-400 to-amber-600 scale-105' : 'bg-bg-secondary border-2 border-primary-500/50'}`}>
                    {isListening ? (
                      <Mic size={50} className="text-white animate-pulse" />
                    ) : (
                      <Bot size={50} className="text-primary-500" />
                    )}
                  </div>
                </div>

                <div className="flex bg-primary-500/10 rounded-full px-4 py-1.5 border border-primary-500/20 mb-6 animate-pulse">
                  <div className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">Voice Interaction Enabled</div>
                </div>

                <h2 className="text-4xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-amber-400 tracking-tight mb-3">{tutorName} Voice</h2>
                <div className="text-2xl font-mono text-primary-500 font-bold mb-6">{formatDuration(callDuration)}</div>

                <div className="px-5 py-2.5 bg-bg-secondary/80 backdrop-blur-md rounded-full border border-border shadow-sm flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isListening ? 'bg-red-400 animate-ping' : 'bg-primary-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${isListening ? 'bg-red-500' : 'bg-primary-500'}`}></span>
                  </span>
                  <p className="text-text-secondary font-medium">
                    {isListening ? 'Listening... Just speak to barge in!' : isAILoading ? `${tutorName} is thinking...` : 'Waiting...'}
                  </p>
                </div>

                {/* Call Controls */}
                <div className="mt-12 flex items-center gap-8">
                  <button
                    className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/20 hover:bg-red-500 text-red-500 hover:text-white flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-90 group"
                    onClick={stopVoiceMode}
                    title="End Call"
                  >
                    <Phone size={24} className="rotate-[135deg] group-hover:animate-shake" />
                  </button>
                </div>

                <div className="absolute bottom-10 text-xs text-text-muted text-center max-w-sm px-6">
                  Voice mode continuously performs full-duplex conversations. Speak naturally and you can interrupt {tutorName} at any time.
                </div>
              </div>
            )}

            {/* Start Screen Overlay */}
            {isAI && !isConfigured && aiMessages.length === 0 && (
              <div className="absolute inset-0 bg-bg-secondary/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8 text-center border-l border-white/5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-amber-600 flex items-center justify-center text-white shadow-2xl mb-6 shadow-primary-500/20">
                  <Brain size={40} />
                </div>
                <h2 className="text-3xl font-display font-extrabold mb-3 text-text-primary">Configure Your AI Tutor</h2>
                <p className="text-text-secondary max-w-md mb-8 text-sm">Before we begin, tell Lumina what you want to learn so it can adapt to your skill level and goals.</p>
                <button onClick={() => setShowConfig(true)} className="px-8 py-3.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 active:scale-95 transition-all w-full max-w-sm">
                  Set Learning Goal
                </button>
              </div>
            )}

            {/* Chat Messages */}
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
              <div className="bg-bg-secondary border border-border rounded-2xl shadow-sm p-1.5 flex items-center gap-1 focus-within:ring-2 ring-primary-500/20 transition-all">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 md:p-3 text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded-xl transition-colors shrink-0 outline-none" title="Attach document">
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
                  value={dmInput}
                  onChange={(e) => setDmInput(e.target.value)}
                  disabled={isAI && !isConfigured}
                />
                <button
                  type="submit"
                  disabled={!dmInput.trim() || isAILoading || isLoadingDM || (isAI && !isConfigured)}
                  className={`p-2.5 md:p-3 rounded-xl transition-all shrink-0 ml-1 outline-none ${(dmInput.trim() || isAILoading) ? 'bg-primary-500 text-white shadow-md' : 'bg-transparent text-text-muted'}`}
                >
                  {isAILoading ? (
                    <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin block"></span>
                  ) : (
                    <Send size={20} className={dmInput.trim() ? 'translate-x-0.5' : ''} />
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

      {/* Schedule Form Modal */}
      <ScheduleMeetModal
        open={showScheduleModal}
        onOpenChange={setShowScheduleModal}
        receiverId={peerId}
        onScheduleSuccess={(message) => {
          setDmMessages(prev => [...prev, message]);
        }}
      />
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
