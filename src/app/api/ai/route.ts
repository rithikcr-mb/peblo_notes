// src/app/api/ai/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest } from 'next/server';
import { waitUntil } from '@vercel/functions'; // Assumes you are using Vercel
import prisma from '@/lib/prisma'; // Ensure this is configured for Edge/Neon
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { prompt, type, noteId, userId } = await req.json();

    // --- RATE LIMITING ---
    // Protects against API abuse, spam clicks, and potential billing exhaustion for the Gemini API.
    // We track requests by userId (or IP as a fallback for safety).
    // Limit: 5 requests per minute per user.
    const identifier = userId || req.ip || 'anonymous-ai-user';
    const limitStatus = rateLimit(`ai_${identifier}`, 5, 60 * 1000);

    if (!limitStatus.success) {
      return new Response(JSON.stringify({ error: 'You are generating too fast. Please wait a moment before trying again.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Setup Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // 2. Request Stream from Gemini
    const result = await model.generateContentStream(prompt);

    // 3. Create a ReadableStream to pipe to the client
    let fullResponse = '';
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            fullResponse += text;
            controller.enqueue(encoder.encode(text));
          }
        } catch (err) {
          console.error('Streaming error:', err);
          controller.error(err);
        } finally {
          controller.close();
          
          // 4. Background persistence: Save to Prisma AFTER stream closes
          // waitUntil ensures Vercel doesn't kill the function before this completes
          waitUntil(
            prisma.aIHistory.create({
              data: {
                noteId,
                userId,
                type,
                content: fullResponse,
              },
            }).catch(console.error)
          );
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('AI Generation Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate AI content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
