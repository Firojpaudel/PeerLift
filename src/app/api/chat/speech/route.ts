import { NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { text, voice } = await req.json();

    if (!text) {
      return new Response("Missing text parameter", { status: 400 });
    }

    if (text.length > 200) {
      return new Response("Text exceeds 200 character limit", { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return new Response("Groq API key not configured", { status: 500 });
    }

    // Call Groq audio speech API
    const res = await fetch("https://api.groq.com/openai/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "canopylabs/orpheus-v1-english",
        input: text,
        voice: voice || "autumn",
        response_format: "wav",
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[Groq TTS API Error]", res.status, errText);
      return new Response(`Groq TTS failed: ${errText}`, { status: res.status });
    }

    // Proxy the audio stream directly back to the client
    const headers = new Headers();
    headers.set("Content-Type", "audio/wav");
    headers.set("Cache-Control", "public, max-age=3600");

    return new Response(res.body, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error("[Speech API Route Error]", error);
    return new Response(error.message || "Internal server error", { status: 500 });
  }
}
