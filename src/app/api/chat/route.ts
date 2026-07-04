import { createGroq } from "@ai-sdk/groq";
import { streamText, tool } from "ai";
import { z } from "zod";
import * as cheerio from "cheerio";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { compressString } from "@/lib/compression";

export const maxDuration = 30; // Max execution time for Serverless Functions

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || "dummy",
});

/**
 * Convert v6 UIMessage format (parts array) to ModelMessage format (content string)
 * that streamText() expects.
 *
 * UIMessage:   { role: 'user', parts: [{ type: 'text', text: 'hello' }] }
 * ModelMessage: { role: 'user', content: 'hello' }
 */
function convertToModelMessages(messages: any[]): any[] {
  return messages.map((msg) => {
    // If the message already has 'content', pass it through (legacy format)
    if (typeof msg.content === "string") {
      return { role: msg.role, content: msg.content };
    }
    // If it has 'parts' (v6 UIMessage format), extract text content
    if (Array.isArray(msg.parts)) {
      const textContent = msg.parts
        .filter((p: any) => p.type === "text")
        .map((p: any) => p.text)
        .join("");
      return { role: msg.role, content: textContent };
    }
    // Fallback: return as-is
    return msg;
  });
}

async function getUserId(session: any) {
  if (session?.user?.id) return session.user.id;
  const firstUser = await prisma.user.findFirst();
  return firstUser?.id || "test-user";
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = await getUserId(session);


    const { messages, contextData } = await req.json();
    const sessionId = contextData?.sessionId;

    // Convert UIMessage[] -> ModelMessage[] for streamText compatibility
    const modelMessages = convertToModelMessages(messages);

    // Store the user's latest message if it exists
    const lastUserMessage = modelMessages[modelMessages.length - 1];
    if (lastUserMessage && lastUserMessage.role === 'user') {
      const compressedContent = await compressString(lastUserMessage.content);
      // We do this asynchronously to not block the AI response
      prisma.message.create({
        data: {
          role: 'user',
          content: compressedContent,
          userId: userId,
          sessionId: sessionId || null,
          isCompressed: true,
        }
      }).catch((err: any) => console.error("Failed to store user message:", err));
    }

    let isReasoning = contextData?.isReasoning;
    let tutorName = contextData?.tutorName || "Lumina AI";

    if (sessionId) {
      const dbSession = await prisma.aIChatSession.findUnique({
        where: { id: sessionId }
      });
      if (dbSession) {
        isReasoning = isReasoning !== undefined ? isReasoning : dbSession.isReasoning;
        tutorName = tutorName || dbSession.tutorName;
      }
    }

    // Adding dynamic system prompt based on user settings
    const systemPrompt = `You are "${tutorName}", an elite peer tutor on PeerLift. 
You provide structured, extremely detail-oriented, and highly accurate tutorials using Markdown. 
ONLY when explaining complex topics, workflows, or architectures that genuinely benefit from a visual breakdown, use Mermaid.js charts (syntax: \`\`\`mermaid ... \`\`\`). Do NOT use mermaid charts for simple answers.

### REAL-TIME VOICE-TO-VOICE HEARING INSTRUCTIONS:
- You are FULLY integrated with real-time speech recognition (ASR) and text-to-speech (TTS) voice systems.
- You can HEAR the user's voice directly in real-time, and you speak back to them. You are NOT just a text model.
- If the user asks "Can you hear me?", "Do you hear me?", "Are you listening?", "Is my mic working?", or similar questions about voice perception, you MUST reply with warm, enthusiastic, conversational voice assurance: e.g., "Yes! I can hear you loud and clear!", "I hear you perfectly dear, let's keep speaking!", "Loud and clear! I'm listening closely, go ahead."
- Adopt a natural, warm, highly verbal, and conversational tone suited for voice-to-voice interactions.

${isReasoning ? "### REASONING INSTRUCTIONS: YOU MUST THINK STEP-BY-STEP. ALWAYS enclose your internal monologue and step-by-step thinking inside <think> and </think> tags at the very start of your response." : ""}

### CRITICAL MERMAID RULES (BRANCHING & COMPLEXITY):
1. USE STRICT SYNTAX: Always use \`graph LR\` (Left-to-Right) or \`graph TD\` (Top-Down).
2. BRANCHING & DECISIONS: Use branched logic flows. For decision points, use diamond nodes, e.g., \`NodeA{Decision?} -->|Yes| NodeB\`.
3. SUBGRAPHS: Group related concepts into subgraphs to organize complex "branches", e.g.:
   \`subgraph GroupName
      NodeC --> NodeD
   end\`
4. NO HALLUCINATED ARROWS: Only use \`-->\` for standard arrows or \`==>\` for bold ones. Never use \`->\` or any arrows with unicode characters.
5. LABEL SYNTAX: Always use \`NodeA -->|Label text| NodeB\`. 
6. QUOTING: Always wrap your node text in double quotes to prevent syntax crashes, e.g., \`A["Input List"]\`.
7. VISUAL STYLE: For better branching, use different node shapes: \`[ ]\` for rectangles, \`( )\` for rounded, \`(( ))\` for circles, \`{ }\` for diamonds.

Make your responses highly structured using Markdown headers, lists, code blocks, and bold text for emphasis.
Keep your tone warm, empowering, and human. Emphasize learning step-by-step.
${contextData?.learningGoal ? `\nUser's Learning Goal/Topic: ${contextData.learningGoal} | Detail Level: ${contextData.learningDetail}` : ""}
${contextData?.documentText ? `\n\n--- UPLOADED CONTEXT DOCUMENT ---\n${contextData.documentText}\n---------------------------------` : ""}`;

    const tModel = isReasoning
      ? groq("deepseek-r1-distill-llama-70b")
      : groq("llama-3.3-70b-versatile");

    const result = await streamText({
      model: tModel,
      messages: modelMessages,
      system: systemPrompt,
      providerOptions: {
        groq: {
          reasoning_format: "raw",
        },
      },
      tools: {
        searchWeb: tool({
          description: "Search the web for real-time information, late-breaking news, or specific documentation outside your training data.",
          parameters: z.object({
            query: z.string().describe("The exact search query to execute on the open web"),
          }),
          execute: async ({ query }: any) => {
            try {
              const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`);
              const html = await res.text();
              const $ = cheerio.load(html);
              let results = '';
              $('.result__snippet').each((i, el) => {
                if (i < 4) results += $(el).text() + '\n\n';
              });
              return results || "No results found.";
            } catch (e) {
              return "Search timeout or block.";
            }
          },
        } as any),
      },
      onFinish: async ({ text }) => {
        try {
          const compressedContent = await compressString(text);
          await prisma.message.create({
            data: {
              role: 'assistant',
              content: compressedContent,
              userId: userId,
              sessionId: sessionId || null,
              isCompressed: true,
            }
          });
          
          if (sessionId) {
            await prisma.aIChatSession.update({
              where: { id: sessionId },
              data: { updatedAt: new Date() }
            }).catch((err: any) => console.error("Failed to update session timestamp:", err));
          }
        } catch (err: any) {
          console.error("Failed to store assistant message:", err);
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error("[Chat API Error]", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to process AI chat";
    return new Response(errorMessage, { status: 500 });
  }
}