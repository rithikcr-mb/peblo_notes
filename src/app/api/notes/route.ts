import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { noteSchema } from "@/lib/validators";

function includeTags() {
  return { tags: { orderBy: { name: "asc" as const } }, aiGenerations: { orderBy: { createdAt: "desc" as const }, take: 5 }, sharedLinks: { where: { active: true }, take: 1 } };
}

export async function GET() {
  try {
    const userId = await requireUserId();
    const notes = await prisma.note.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: includeTags(),
    });
    return NextResponse.json(notes);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const parsed = noteSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const note = await prisma.note.create({
      data: {
        title: parsed.data.title,
        content: parsed.data.content,
        category: parsed.data.category,
        archived: parsed.data.archived,
        userId,
        tags: { create: parsed.data.tags.map((name) => ({ name })) },
      },
      include: includeTags(),
    });
    return NextResponse.json(note, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
