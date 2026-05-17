import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { requireUserId } from "@/lib/session";
import { aiSchema } from "@/lib/validators";

type Params = { params: Promise<{ noteId: string }> };

function localAi(type: string, title: string, content: string) {
  const text = content.replace(/[#*_>`-]/g, " ").replace(/\s+/g, " ").trim();
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (type === "title") return sentences[0]?.slice(0, 70) || title || "Untitled insight";
  if (type === "actions") {
    const chunks = sentences.slice(0, 4);
    return chunks.length
      ? chunks.map((sentence) => `- ${sentence.replace(/\.$/, "")}`).join("\n")
      : "- Review this note\n- Add next steps\n- Share with stakeholders";
  }
  return sentences.slice(0, 3).join(" ") || "This note is ready for a richer summary once more content is added.";
}

async function geminiAi(type: string, title: string, content: string) {
  if (!env.GEMINI_API_KEY) return localAi(type, title, content);

  const instruction =
    type === "summary"
      ? "Summarize this note in 3 concise bullets."
      : type === "actions"
        ? "Extract clear action items from this note as bullets."
        : "Suggest one concise product-quality title for this note.";

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${instruction}\n\nTitle: ${title}\n\n${content}` }] }],
      }),
    },
  );

  if (!response.ok) return localAi(type, title, content);
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? localAi(type, title, content);
}

export async function POST(request: Request, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { noteId } = await params;
    const parsed = aiSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const note = await prisma.note.findFirstOrThrow({ where: { id: noteId, userId } });
    const response = await geminiAi(parsed.data.type, note.title, note.content);
    const generation = await prisma.aiGeneration.create({
      data: {
        type: parsed.data.type,
        prompt: `${parsed.data.type}:${note.title}`,
        response,
        noteId,
        userId,
      },
    });

    return NextResponse.json(generation, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to generate AI response." }, { status: 400 });
  }
}
