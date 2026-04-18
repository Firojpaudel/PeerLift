"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useChat } from '@ai-sdk/react';
// @ts-ignore - Transport types in AI SDK 6 might vary locally
import { TextStreamChatTransport } from 'ai';
import { ChevronLeft, Send, Phone, Search, Users, Bot, Mic, Settings2, PlayCircle, X, Maximize, Minimize, Plus, Paperclip, Brain, Volume2, Square } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MermaidChart = ({ chart }: { chart: string }) => {
  const [svg, setSvg] = useState('');
  const [isError, setIsError] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const sanitizeMermaid = (code: string) => {
    return code
      .trim()
      // Fix unicode arrows often hallucinated by models like DeepSeek (→, ⎯→, ⇒, etc.)
      .replace(/[→⎯→⇒⇨\u2192\u2190\u2194\u21D0\u21D2]/g, '-->')
      // Fix LLM hallucinating label-based arrows like "--> |label|>" or "---|label|>"
      // We use a more permissive match for the arrowhead
      .replace(/(-{1,})*>*\s*\|([^|]+)\|>+/g, '-->|$2|')
      // Fix cases where it uses --|Label| or ---|Label| instead of -->|Label|
      .replace(/(-{2,})\s*\|([^|]+)\|/g, '-->|$2|')
      // Fix standalone "-> |label|" or "->|label|"
      .replace(/->\s*\|([^|]+)\|/g, '-->|$1|')
      // Fix single dash arrows or simple -> which are invalid in many mermaid versions
      .replace(/(\w+)\s*->\s*(\w+)/g, '$1 --> $2')
      // Ensure specific characters in labels are sanitized if not quoted
      .replace(/\[([^\]\[]+)\]/g, (match, content) => {
        if (content.startsWith('"') && content.endsWith('"')) return match;
        return `["${content.replace(/"/g, "'")}"]`;
      });
  };
  
  useEffect(() => {
    setShowRaw(false);
    let timeout: NodeJS.Timeout;

    const sanitizedCode = sanitizeMermaid(chart);

    import('mermaid').then((mermaid) => {
      const isDark = document.documentElement.classList.contains('dark') || window.matchMedia('(prefers-color-scheme: dark)').matches;
      mermaid.default.initialize({ 
        startOnLoad: false, 
        theme: isDark ? 'dark' : 'default',
        suppressErrorRendering: true,
        securityLevel: 'loose'
      });

      mermaid.default.render(`mermaid-${Math.random().toString(36).substr(2, 9)}`, sanitizedCode).then((result) => {
        if (result.svg.includes('Syntax error')) {
          setIsError(true);
          timeout = setTimeout(() => setShowRaw(true), 2500);
        } else {
          setSvg(result.svg);
          setIsError(false);
        }
      }).catch(_e => {
        setIsError(true);
        timeout = setTimeout(() => setShowRaw(true), 2500);
      });
    });

    return () => clearTimeout(timeout);
  }, [chart]);

  if (showRaw) {
    return (
      <div className="my-5 rounded-xl overflow-hidden shadow-2xl border border-red-500/20 bg-[#1e1e1e]">
         <div className="bg-red-500/10 border-b border-red-500/10 px-4 py-2 text-xs text-red-400 flex items-center uppercase tracking-wider" style={{ fontFamily: '"Iosevka", "Iosevka Term", monospace' }}>
           UNPARSEABLE GRAPH DATA
         </div>
         <pre className="p-4 text-red-300 text-[13px] overflow-x-auto m-0" style={{ fontFamily: '"Iosevka", "Iosevka Term", monospace' }}>
           {chart}
         </pre>
      </div>
    );
  }

  if (isError && !svg) {
    return <div className="text-primary-500 animate-pulse text-sm my-4 flex items-center justify-center p-4 bg-white/5 rounded-xl border border-border">Drawing chart...</div>;
  }

  return (
    <div className={`mermaid-chart flex justify-center w-full overflow-x-auto my-4 bg-bg-elevated p-4 rounded-xl border border-border transition-opacity duration-300 ${isError ? 'opacity-50' : 'opacity-100'}`} 
         dangerouslySetInnerHTML={{ __html: svg }} 
    />
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

function getMessageText(m: any): string {
  let text = '';
  // v6 SDK uses .parts array with { type: 'text', text: '...' } objects
  if (Array.isArray(m.parts)) {
    text = m.parts
      .map((p: any) => {
        if (p.type === 'text') return p.text;
        if (p.type === 'reasoning' || p.type === 'thought') {
          // Wrap structured reasoning in think tags if they aren't already there
          const content = p.reasoning || p.thought || p.text || '';
          return content.includes('<think>') ? content : `<think>${content}</think>`;
        }
        return '';
      })
      .join('');
  } else if (typeof m.content === 'string') {
    text = m.content;
  }
  
  // Intercept and style <think> tags natively using expandable HTML!
  // We use a more robust regex to handle partial streaming tags and the user's naming preference.
  if (text.includes('<think>') || text.includes('Thinking Mode: active')) {
    text = text.replace(/<think>\n?/g, '<details open class="mb-4 bg-bg-secondary/50 border border-primary-500/10 rounded-xl overflow-hidden shadow-sm"><summary class="px-4 py-3 bg-bg-elevated border-b border-border cursor-pointer font-bold text-primary-500 text-[13px] hover:bg-white/5 transition-colors select-none">🧠 Thinking...</summary><div class="p-4 text-[13px] text-text-secondary italic opacity-90 leading-relaxed overflow-x-auto whitespace-pre-wrap font-mono">');
    text = text.replace(/<\/think>\n?/g, '</div></details>\n\n');
    
    // Safety close for streaming content so it doesn't break the rest of the page layout
    const openTagCount = (text.match(/<details/g) || []).length;
    const closeTagCount = (text.match(/<\/details>/g) || []).length;
    if (openTagCount > closeTagCount) {
      text += '</div></details>';
    }
  }

  // Intercept Tool Calls from AI SDK and visualize them
  if (Array.isArray(m.parts)) {
    const toolCalls = m.parts.filter((p: any) => p.type === 'tool-invocation');
    if (toolCalls.length > 0) {
      toolCalls.forEach((tc: any) => {
        if (tc.toolInvocation.state === 'call') {
          text += `\n\n> 🌐 **Searching Web:** *${tc.toolInvocation.args.query}...*`;
        } else if (tc.toolInvocation.state === 'result') {
          text += `\n\n> ✅ **Web Search Complete.**`;
        }
      });
    }
  }

  return text;
}

function ChatSessionInner() {
  const searchParams = useSearchParams();
  const isAI = searchParams.get('ai') === 'true';
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Setup form for AI tutoring
  const [dmInput, setDmInput] = useState("");
  const [showConfig, setShowConfig] = useState(isAI);
  const [learningGoal, setLearningGoal] = useState('');
  const [learningDetail, setLearningDetail] = useState('Intermediate');
  const [tutorName, setTutorName] = useState('Lumina');
  const [isConfigured, setIsConfigured] = useState(!isAI);
  const [isListening, setIsListening] = useState(false);
  const [showVoiceMode, setShowVoiceMode] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Advanced AI states
  const [isReasoningMode, setIsReasoningMode] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [parsedDoc, setParsedDoc] = useState<{ text: string, name: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/parse-doc', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.text) {
        setParsedDoc({ text: data.text, name: data.filename });
      } else {
        alert(data.error || 'Failed to parse document');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading document');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Ref to track if voice mode is active (avoids stale closures)
  const voiceModeRef = useRef(false);
  const recognitionRef = useRef<any>(null);

  // Keep voiceModeRef in sync
  useEffect(() => {
    voiceModeRef.current = showVoiceMode;
  }, [showVoiceMode]);

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showVoiceMode) {
      setCallDuration(0);
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showVoiceMode]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ─── AI Chat Hook (v6 SDK) ───────────────────────────────────────
  // Use TextStreamChatTransport because our API route returns toTextStreamResponse()
  const chatTransport = React.useMemo(
    () =>
      new (TextStreamChatTransport as any)({
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
      }),
    [learningGoal, learningDetail, tutorName, isReasoningMode, parsedDoc?.text]
  );

  const { messages, sendMessage, status, stop, setMessages } = useChat({
    transport: chatTransport,
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const [input, setInput] = useState('');

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;
      sendMessage({ text: input });
      setInput('');
    },
    [input, isLoading, sendMessage]
  );

  // ─── Voice Mode (V2V) ────────────────────────────────────────────
  // Cleanup: stop everything when voice mode is turned off
  const stopVoiceMode = useCallback(() => {
    setShowVoiceMode(false);
    setIsListening(false);

    // Stop any active recognition
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_e) { /* noop */ }
      recognitionRef.current = null;
    }

    // Cancel any ongoing TTS
    window.speechSynthesis.cancel();
    setCurrentlySpeakingId(null);
  }, []);

  // Proactive Voice Loading
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const handleToggleSpeech = useCallback((id: string, text: string) => {
    // If already speaking this message, stop it
    if (currentlySpeakingId === id) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
      return;
    }

    // Stop anything else first
    window.speechSynthesis.cancel();
    
    // Deep clean the text for a pure spoken experience
    const spokenText = text
      .replace(/<think>[\s\S]*?<\/think>/g, '') // Strip reasoning
      .replace(/```[\s\S]*?```/g, '')            // Strip code blocks
      .replace(/\[\d+\]/g, '')                  // Strip citations
      .replace(/[#*`_\[\]()~|>]/g, '')          // Strip markdown syntax
      .replace(/\s+/g, ' ')                     // Normalize whitespace
      .trim();

    if (!spokenText) return;

    const utterance = new SpeechSynthesisUtterance(spokenText);
    
    // 🧠 ADVANCED NATURAL VOICE HEURISTIC
    // Priority: Neural/Natural > Google/Microsoft Online > English-US
    const bestVoice = availableVoices.find(v => 
      (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Enhanced')) && 
      v.lang.startsWith('en')
    ) || availableVoices.find(v => 
      (v.name.includes('Google') || v.name.includes('Online')) && 
      v.lang.startsWith('en')
    ) || availableVoices.find(v => v.lang.startsWith('en-US')) 
      || availableVoices.find(v => v.lang.startsWith('en'));

    if (bestVoice) utterance.voice = bestVoice;
    utterance.lang = 'en-US';
    
    // Fine-tuning for a softer, more "Tutor" feel
    utterance.rate = 0.95;  // Slightly slower for clarity
    utterance.pitch = 1.05; // Slightly higher for a friendly tone

    utterance.onend = () => setCurrentlySpeakingId(null);
    utterance.onerror = () => setCurrentlySpeakingId(null);

    setCurrentlySpeakingId(id);
    window.speechSynthesis.speak(utterance);
  }, [currentlySpeakingId]);

  // Voice recognition effect — only runs when voice mode is on and not loading
  useEffect(() => {
    if (!showVoiceMode || isLoading) return;
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
            try { recognition.start(); } catch (_e) { /* noop */ }
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
            stop();
            sendMessage({ text: (accumulatedTranscript + currentInterim).trim() });
            accumulatedTranscript = '';
            try { recognition.stop(); } catch(e) {}
          }
        }, 2000); 
      }
    };

    try { recognition.start(); } catch (_e) { /* noop */ }

    return () => {
      if (recognitionRef.current === recognition) {
        try { recognition.abort(); } catch (_e) { /* noop */ }
        recognitionRef.current = null;
      }
    };
  }, [showVoiceMode, isLoading, sendMessage]);

  // Pre-load speech synthesis voices (they load async in most browsers)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  // Text-to-Speech for assistant responses (voice mode only)
  const lastSpokenMsgId = useRef<string>('');
  useEffect(() => {
    if (!showVoiceMode || isLoading || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'assistant') return;
    // Avoid speaking the same message twice
    if (lastMessage.id === lastSpokenMsgId.current) return;
    lastSpokenMsgId.current = lastMessage.id;

    // Remove code blocks and markdown symbols before speaking to prevent TTS freezing
    const textToSpeak = getMessageText(lastMessage)
      .replace(/```[\s\S]*?```/g, '') // Remove all code/mermaid blocks
      .replace(/[#*`_\[\]()~|>]/g, '') // Remove markdown symbols
      .replace(/={2,}/g, '') // Remove equals headers (e.g. ===)
      .replace(/-{2,}/g, ''); // Remove dash combos (e.g. ---)
      
    if (!textToSpeak.trim()) return;

    // Cancel any previous speech before starting new one
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const voices = voicesRef.current;
    
    // Choose the best quality voices available locally, ensuring it MUST be English
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));
    const preferredVoice = englishVoices.find(v =>
      v.name.includes('Online') || // Edge's Natural online voices
      v.name.includes('Neural') || // Windows Neural voices
      v.name.includes('Google US English') ||
      v.name.includes('Samantha') ||
      v.name.includes('Female')
    ) || englishVoices[0]; // Fallback to first English voice

    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // When TTS finishes speaking, restart voice recognition
    utterance.onend = () => {
      if (voiceModeRef.current && recognitionRef.current) {
        setTimeout(() => {
          if (voiceModeRef.current) {
            try { recognitionRef.current?.start(); } catch (_e) { /* noop */ }
          }
        }, 500);
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [isLoading, messages, showVoiceMode]);

  // Auto-scroll to bottom
  useEffect(() => {
    // We use 'auto' instead of 'smooth' here to prevent jittering. 
    // Smooth scrolling fires repeatedly during streaming chunks, resetting the animation and causing a glitching visual effect!
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  // Stores custom DM messages sent by the user during this session
  const [dmMessages, setDmMessages] = useState<{id: string, text: string, time: string}[]>([]);

  const handleStartTutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!learningGoal.trim()) return;
    setShowConfig(false);
    setIsConfigured(true);
    // Programmatically trigger the first message so the user doesn't have to wait!
    sendMessage({ text: `Please provide a tutorial on ${learningGoal} at a ${learningDetail} level. Your name is ${tutorName}.` });
  };

  const handleStartNewSession = () => {
    (setMessages as any)([]);
    setLearningGoal('');
    setIsConfigured(false);
    setShowConfig(true);
  };

  // Single ASR button click (non-voice-mode)
  const handleASR = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionCtor();

    recognition.lang = navigator.language || 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      if (transcript.trim()) {
        sendMessage({ text: (input ? input + " " : "") + transcript });
        setInput('');
      }
    };

    recognition.start();
  };

  return (
    <div className={`flex bg-bg-elevated overflow-hidden shadow-2xl transition-all duration-500 ease-in-out ${
      isFullscreen 
        ? 'fixed inset-0 z-50 w-full h-[100dvh] rounded-none mt-0 border-0' 
        : 'flex-1 max-w-[1400px] w-[95%] mx-auto h-[calc(100vh-60px)] rounded-[2.5rem] border border-border shadow-2xl mt-8 mb-8 relative'
    }`}>
      
      {/* Sidebar / Discussions */}
      <div className="w-80 border-r border-border bg-bg-secondary flex flex-col flex-shrink-0 hidden md:flex">
        <div className="p-4 border-b border-border">
          <h2 className="font-display font-bold text-xl text-text-primary mb-4 flex items-center gap-2">
            <Users size={20} className="text-primary-500" />
            Messages
          </h2>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-bg-elevated border border-border rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary-500 transition-all text-text-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* AI Interactive Tutor */}
          <div className="px-3 pt-4 pb-2">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider pl-2">Learning Assistants</span>
          </div>
          <Link href="/sessions/chat?ai=true" className={`flex items-center gap-3 p-3 mx-2 rounded-xl transition-colors group ${isAI ? 'bg-primary-100 dark:bg-neutral-800 border-primary-500 border dark:border-primary-600' : 'hover:bg-bg-elevated border border-transparent'}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-amber-600 flex items-center justify-center text-white shrink-0 shadow-sm relative">
              <Bot size={20} />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className={`font-bold transition-colors text-sm ${isAI ? 'text-primary-900 dark:text-primary-400' : 'text-text-primary group-hover:text-primary-600'}`}>Lumina</h3>
              </div>
              <p className={`text-xs truncate ${isAI ? 'text-primary-700 dark:text-primary-300' : 'text-text-secondary'}`}>Web-search & FastRTC enabled...</p>
            </div>
          </Link>

          {/* DMs */}
          <div className="px-3 pt-6 pb-2">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider pl-2">Direct Messages</span>
          </div>
          
          <Link href="/sessions/chat" className={`flex items-center gap-3 p-3 mx-2 rounded-xl cursor-pointer transition-colors ${!isAI ? 'bg-bg-elevated shadow-sm border border-border' : 'hover:bg-bg-elevated border border-transparent'}`}>
            <div className="relative">
              <img src="https://i.pravatar.cc/150?u=4920" alt="Alexis" className="w-10 h-10 rounded-full shrink-0 border border-border object-cover" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-text-primary text-sm">Alexis</h3>
                <span className="text-[10px] text-text-muted">12:30 PM</span>
              </div>
              <p className="text-xs text-text-secondary truncate font-medium">Hey! I saw your profile...</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col relative w-full">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-bg-elevated/80 backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <Link href="/requests" className="md:hidden text-text-muted hover:text-primary-500 transition-colors mr-2">
              <ChevronLeft size={24} />
            </Link>
            
            {isAI ? (
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-amber-600 flex items-center justify-center text-white shrink-0 shadow-sm relative">
                 <Bot size={20} />
                 <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
               </div>
            ) : (
              <div className="relative group">
                <img src="https://i.pravatar.cc/150?u=4920" alt="Alexis" className="w-10 h-10 rounded-full shrink-0 border-2 border-white shadow-sm object-cover" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
            )}

            <div>
              <h2 className="font-bold text-[17px] text-text-primary leading-tight">{isAI ? tutorName : "Alexis"}</h2>
              <p className="text-[12px] text-primary-600 font-medium">Online</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isAI && (
              <button 
                className="p-2.5 text-text-muted hover:bg-bg-secondary rounded-full transition-colors hidden md:flex items-center gap-1.5"
                onClick={handleStartNewSession}
                title="Start New Session"
              >
                <Plus size={18} />
              </button>
            )}
            <button 
              className="p-2.5 text-text-muted hover:bg-bg-secondary rounded-full transition-colors"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
            <button 
              className="p-2.5 text-white bg-primary-500 hover:bg-primary-600 rounded-full transition-colors shadow-sm ml-1" 
              title={isAI ? "Start Voice 2 Voice Mode" : "Voice Call"}
              onClick={() => isAI && setShowVoiceMode(true)}
            >
              <Phone size={16} />
            </button>
          </div>
        </div>

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
            
            <h2 className="text-4xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-amber-400 tracking-tight mb-3">{tutorName} Voice</h2>
            <div className="text-2xl font-mono text-primary-500 font-bold mb-6">{formatDuration(callDuration)}</div>
            
            <div className="px-5 py-2.5 bg-bg-secondary/80 backdrop-blur-md rounded-full border border-border shadow-sm flex items-center gap-3">
               <span className="relative flex h-3 w-3">
                 <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isListening ? 'bg-red-400 animate-ping' : 'bg-primary-400'}`}></span>
                 <span className={`relative inline-flex rounded-full h-3 w-3 ${isListening ? 'bg-red-500' : 'bg-primary-500'}`}></span>
               </span>
               <p className="text-text-secondary font-medium">
                 {isListening ? 'Listening... Just speak to barge in!' : isLoading ? `${tutorName} is thinking...` : 'Waiting...'}
               </p>
            </div>
            
            <div className="absolute bottom-16 w-full flex justify-center gap-6">
               <button 
                 className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95" 
                 onClick={stopVoiceMode}
                 title="End Call"
               >
                 <Phone size={24} className="rotate-[135deg]" />
               </button>
            </div>
            
            <div className="absolute bottom-8 text-xs text-text-muted text-center max-w-sm">
               Voice mode continuously performs full-duplex conversations. Speak naturally and you can interrupt {tutorName} at any time.
            </div>
          </div>
        )}

        {/* AI Tutor Setup Modal / Overlay */}
        {isAI && showConfig && (
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[2px] z-[60] flex items-center justify-center p-6">
            <form onSubmit={handleStartTutor} className="bg-bg-elevated border border-border shadow-2xl rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200 relative">
              {messages.length > 0 && (
                <button 
                  type="button" 
                  onClick={() => setShowConfig(false)}
                  className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
                >
                  <X size={20} />
                </button>
              )}
              <h3 className="text-xl font-display font-bold mb-2">Configure Tutor</h3>
              <p className="text-sm text-text-secondary mb-6">Let me know what you want to learn, and how deep we should go. I&apos;ll configure my context constraints for the optimal tutoring session!</p>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-text-primary mb-1">Tutor Name</label>
                  <input 
                    type="text" 
                    required
                    value={tutorName}
                    onChange={(e) => setTutorName(e.target.value)}
                    placeholder="e.g. Lumina, Einstein" 
                    className="w-full bg-bg-secondary border border-border rounded-xl p-3 text-[14px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-text-primary mb-1">Learning Topic</label>
                  <input 
                    type="text" 
                    required
                    value={learningGoal}
                    onChange={(e) => setLearningGoal(e.target.value)}
                    placeholder="e.g. React Server Components, Next.js Middleware" 
                    className="w-full bg-bg-secondary border border-border rounded-xl p-3 text-[14px]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-text-primary mb-1">Detail Level</label>
                  <select 
                    value={learningDetail}
                    onChange={(e) => setLearningDetail(e.target.value)}
                    className="w-full bg-bg-secondary border border-border rounded-xl p-3 text-[14px]"
                  >
                    <option value="Beginner (ELI5)">Beginner (ELI5)</option>
                    <option value="Intermediate">Intermediate Guidance</option>
                    <option value="Advanced (Deep Dive code)">Advanced (Deep Dive)</option>
                  </select>
                </div>
              </div>
              
              <button 
                type="button"
                onClick={handleStartTutor}
                className="w-full bg-primary-500 text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-primary-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!learningGoal}
              >
                <PlayCircle size={18} />
                Start AI Session
              </button>
            </form>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-bg-secondary w-full">
          <div className="flex flex-col items-center my-6">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider bg-bg-elevated border border-border px-3 py-1 rounded-full shadow-sm">
              Today
            </span>
          </div>

          {!isAI ? (
            <>
               <div className="flex items-start gap-3 max-w-[85%]">
                <img src="https://i.pravatar.cc/150?u=4920" alt="Alexis" className="w-8 h-8 rounded-full shrink-0 object-cover border border-border shadow-sm mt-1" />
                <div className="flex flex-col gap-1 items-start">
                  <div className="bg-bg-elevated border border-border text-text-primary p-3.5 rounded-2xl rounded-tl-sm shadow-sm text-[14px] leading-relaxed">
                    &quot;Hey! I saw your profile and was wondering if you&apos;re open to a different trade? I can offer some help with Marketing if you can teach me React.&quot;
                  </div>
                  <span className="text-[10px] text-text-muted ml-1">12:30 PM</span>
                </div>
              </div>
              
              {dmMessages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3 max-w-[85%] ml-auto flex-row-reverse">
                   <div className="w-8 h-8 rounded-full bg-bg-secondary flex items-center justify-center shrink-0 mt-1 shadow-sm border border-border">
                      <Users size={16} className="text-text-muted" />
                   </div>
                   <div className="flex flex-col gap-1 items-end">
                     <div className="p-3.5 rounded-2xl shadow-sm text-[14px] leading-relaxed max-w-full bg-primary-500 text-white rounded-tr-sm">
                        {msg.text}
                     </div>
                     <span className="text-[10px] text-text-muted mr-1">{msg.time}</span>
                   </div>
                </div>
              ))}
            </>
          ) : (
            isConfigured && messages.length === 0 && (
              <div className="flex items-start gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-amber-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                  <Bot size={16} />
                </div>
                <div className="bg-bg-elevated border border-border text-text-primary p-3.5 rounded-2xl rounded-tl-sm shadow-sm text-[14px] leading-relaxed prose prose-sm max-w-full dark:prose-invert prose-p:text-text-primary prose-strong:text-text-primary prose-headings:text-text-primary prose-a:text-primary-500">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={markdownComponents}
                  >
                    {`Namaste! 🙏 I am **${tutorName}**. I am ready to guide you on **${learningGoal || "your chosen topic"}** at a *${learningDetail}* level. Send me a message whenever you are ready to begin our session!`}
                  </ReactMarkdown>
                </div>
              </div>
            )
          )}

          {isAI && messages.map(m => (
            <div key={m.id} className={`flex items-start gap-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
               {m.role === 'assistant' ? (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-amber-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                    <Bot size={16} />
                  </div>
               ) : (
                 <div className="w-8 h-8 rounded-full bg-bg-secondary flex items-center justify-center shrink-0 mt-1 shadow-sm border border-border">
                    <Users size={16} className="text-text-muted" />
                 </div>
               )}
               <div className={`py-2.5 px-3.5 rounded-2xl shadow-sm text-[14px] leading-relaxed prose prose-sm max-w-full dark:prose-invert prose-p:text-text-primary prose-strong:text-text-primary prose-headings:text-text-primary prose-a:text-primary-500 ${m.role === 'user' ? 'bg-primary-500 text-white rounded-tr-sm prose-p:text-white prose-strong:text-white' : 'bg-bg-elevated border border-border text-text-primary rounded-tl-sm'}`}>
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={markdownComponents}
                  >
                    {getMessageText(m)}
                  </ReactMarkdown>

                  {m.role === 'assistant' && (
                     <div className="mt-2 flex justify-end">
                       <button 
                         onClick={() => handleToggleSpeech(m.id, getMessageText(m))}
                         className={`text-text-muted hover:text-primary-500 transition-all duration-300 bg-bg-secondary p-1.5 rounded-full shadow-sm hover:shadow-md ${currentlySpeakingId === m.id ? 'ring-2 ring-primary-500 text-primary-500 bg-primary-500/10 animate-pulse' : ''}`} 
                         title={currentlySpeakingId === m.id ? "Stop Reading" : "Read Aloud"}
                       >
                         {currentlySpeakingId === m.id ? <Square size={14} fill="currentColor" /> : <Volume2 size={14} />}
                       </button>
                     </div>
                  )}
               </div>
            </div>
          ))}
          {/* Invisible element to auto-scroll to */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area (Fixed Placement) */}
        <div className="p-4 bg-bg-elevated border-t border-border mt-auto relative">
          
          {parsedDoc && (
            <div className="absolute -top-10 left-4 bg-green-500/10 border border-green-500/20 text-green-600 text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-2 max-w-[80%] shadow-sm">
               <Paperclip size={12} />
               <span className="truncate">{parsedDoc.name} (Ready)</span>
               <button onClick={() => setParsedDoc(null)} className="hover:text-red-500 ml-1 bg-white/20 rounded-full p-0.5"><X size={10} /></button>
            </div>
          )}

          {isLoading && !parsedDoc && (
            <div className="absolute -top-7 left-6 text-xs text-text-muted flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse block"></span>
              Lumina is typing...
            </div>
          )}

          <form onSubmit={isAI ? handleSubmit : (e) => e.preventDefault()} className="flex items-center p-1.5 bg-bg-secondary border border-border rounded-[1.5rem] focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 transition-all shadow-sm">
            <button 
              type="button" 
              disabled={!isAI}
              onClick={() => setShowConfig(true)}
              className="p-3 text-text-muted hover:text-primary-600 transition-colors rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
              title="Configure AI Options"
            >
              <Settings2 size={20} />
            </button>
            
            {isAI && (
              <>
                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.txt,.md,.json,.csv,.doc,.docx,image/*" onChange={handleFileUpload} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className={`p-2.5 mx-1 transition-colors rounded-full ${parsedDoc ? 'bg-green-500/10 text-green-500' : 'text-text-muted hover:text-primary-600'}`} title="Attach PDF, Word, Data, or Image Context">
                   <Paperclip size={18} className={isUploading ? "animate-spin opacity-50" : ""} />
                </button>
                <button type="button" onClick={() => setIsReasoningMode(!isReasoningMode)} className={`p-2.5 mr-2 transition-colors rounded-full ${isReasoningMode ? 'bg-amber-500/20 text-amber-500 shadow-sm' : 'text-text-muted hover:text-amber-600'}`} title="Toggle Thinking Mode">
                   <Brain size={18} />
                </button>
              </>
            )}

            <input 
              type="text"
              name="chat-input"
              value={isAI ? (input || "") : dmInput}
              onChange={isAI ? handleInputChange : (e) => setDmInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (isAI) {
                    if (!learningGoal.trim()) {
                      setShowConfig(true);
                      return;
                    }
                    if (input && input.trim() && !isLoading) {
                      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                    }
                  } else if (!isAI && dmInput && dmInput.trim()) {
                    setDmMessages(prev => [...prev, { id: Date.now().toString(), text: dmInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
                    setDmInput("");
                  }
                }
              }}
              placeholder={!learningGoal && isAI ? "First, set a topic..." : "Message or Start Voice Mode..."} 
              className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-[14px] min-w-0 placeholder:text-text-muted px-2"
            />
            {isAI && !showConfig && (
              <button 
                type="button" 
                onClick={handleASR}
                className={`p-2.5 mr-1 transition-colors rounded-full ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-primary-100 text-primary-600 hover:bg-primary-200'}`}
                title="Start Voice to Text"
              >
                <Mic size={18} />
              </button>
            )}
            <button 
              type="submit" 
              disabled={(isAI && (!input || showConfig || isLoading)) || (!isAI && !dmInput)}
              onClick={(e) => { 
                if (!isAI) { 
                  e.preventDefault(); 
                  if (dmInput.trim()) {
                    setDmMessages(prev => [...prev, { id: Date.now().toString(), text: dmInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
                    setDmInput(""); 
                  }
                } 
              }}
              className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors shrink-0 shadow-sm ml-1 disabled:opacity-50 disabled:bg-bg-secondary disabled:text-text-muted"
            >
              <Send size={16} className="translate-x-[1px]" />
            </button>
          </form>
          <div className="text-center mt-2">
            <p className="text-[10px] text-text-muted">
              {isAI ? "Lumina supports Markdown & Real-time streaming. Press Enter to send." : "Press Enter to send. For AI Tutor, choose the assistant in the sidebar."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatSession() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center h-screen">
        <div className="animate-pulse text-text-muted">Loading chat...</div>
      </div>
    }>
      <ChatSessionInner />
    </Suspense>
  );
}
