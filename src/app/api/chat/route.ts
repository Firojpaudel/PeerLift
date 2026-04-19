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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }
    const userId = session.user.id;

    const { messages, contextData } = await req.json();

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
          isCompressed: true,
        }
      }).catch((err: any) => console.error("Failed to store user message:", err));
    }

    const tutorName = contextData?.tutorName || "Lumina AI";

    // Adding dynamic system prompt based on user settings
    const systemPrompt = `You are "${tutorName}", an elite peer tutor on PeerLift. 
You provide structured, extremely detail-oriented, and highly accurate tutorials using Markdown. 
ONLY when explaining complex topics, workflows, or architectures that genuinely benefit from a visual breakdown, use Mermaid.js charts (syntax: \`\`\`mermaid ... \`\`\`). Do NOT use mermaid charts for simple answers.

${contextData?.isReasoning ? "### REASONING INSTRUCTIONS: YOU MUST THINK STEP-BY-STEP. ALWAYS enclose your internal monologue and step-by-step thinking inside <think> and </think> tags at the very start of your response." : ""}

### CRITICAL MERMAID RULES:
1. USE STRICT SYNTAX: Always use \`graph LR\` or \`graph TD\`.
2. NO HALLUCINATED ARROWS: Only use \`-->\` for standard arrows. Never use \`->\` or any arrows with unicode characters.
3. LABEL SYNTAX: Always use \`NodeA -->|Label text| NodeB\`. Never include extra characters like \`|Label|> \` or \`--> |Label| \`. 
4. QUOTING: Always wrap your node text in double quotes to prevent syntax crashes, e.g., \`A["Input List"]\`.
5. MINIMALISM: Keep diagrams focused; do not over-style.

Make your responses highly structured using Markdown headers, lists, code blocks, and bold text for emphasis.
Keep your tone warm, empowering, and human. Emphasize learning step-by-step.
${contextData?.learningGoal ? `\nUser's Learning Goal/Topic: ${contextData.learningGoal} | Detail Level: ${contextData.learningDetail}` : ""}
${contextData?.documentText ? `\n\n--- UPLOADED CONTEXT DOCUMENT ---\n${contextData.documentText}\n---------------------------------` : ""}`;

    const tModel = contextData?.isReasoning
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
          execute: async ({ query }) => {
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
        }),
      },
      onFinish: async ({ text }) => {
        try {
          const compressedContent = await compressString(text);
          await prisma.message.create({
            data: {
              role: 'assistant',
              content: compressedContent,
              userId: userId,
              isCompressed: true,
            }
          });
        } catch (err: any) {
          console.error("Failed to store assistant message:", err);
        }
      },
    });

    return (result as any).toTextStreamResponse();
  } catch (error: any) {
    console.error("[Chat API Error]", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to process AI chat";
    return new Response(errorMessage, { status: 500 });
  }
}