import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { prisma } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { prompt, type, noteId, userId } = await req.json();

    // Rate limiting
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0] || 'anonymous-ai-user';

    const identifier = userId || ip;

    const limitStatus = rateLimit(
      `ai_${identifier}`,
      5,
      60 * 1000
    );

    if (!limitStatus.success) {
      return new Response(
        JSON.stringify({
          error:
            'You are generating too fast. Please wait before trying again.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Gemini setup
    const genAI = new GoogleGenerativeAI(
      process.env.GOOGLE_GENERATIVE_AI_API_KEY!
    );

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });

    // Stream generation
    const result = await model.generateContentStream(prompt);

    let fullResponse = '';

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();

            fullResponse += text;

            controller.enqueue(
              encoder.encode(text)
            );
          }
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        } finally {
          controller.close();

          // Persist AI generation in background
          waitUntil(
            prisma.aiGeneration
              .create({
                data: {
                  type,
                  prompt,
                  response: fullResponse,
                  noteId,
                  userId,
                },
              })
              .catch((error) => {
                console.error(
                  'AI persistence error:',
                  error
                );
              })
          );
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('AI generation error:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to generate AI content',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}