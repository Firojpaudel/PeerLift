/**
 * Extracts and formats text from various message structures (AI SDK v6 parts or plain strings).
 * Specifically handles <think> tags for reasoning-enabled models.
 */
export function getMessageText(m: any): string {
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
  
  if (m.reasoning && typeof m.reasoning === 'string' && !text.includes('<think>')) {
    text = `<think>${m.reasoning}</think>\n\n` + text;
  }
  
  // Intercept and style <think> tags natively using expandable HTML!
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
