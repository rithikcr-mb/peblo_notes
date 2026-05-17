import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { noteSchema } from "@/lib/validators";

type Params = { params: Promise<{ noteId: string }> };

const noteInclude = {
  tags: { orderBy: { name: "asc" as const } },
  aiGenerations: { orderBy: { createdAt: "desc" as const }, take: 8 },
  sharedLinks: { where: { active: true }, take: 1 },
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { noteId } = await params;
    const parsed = noteSchema.partial().safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { tags, ...data } = parsed.data;
    const note = await prisma.note.update({
      where: { id: noteId, userId },
      data: {
        ...data,
        ...(tags
          ? {
              tags: {
                deleteMany: {},
                create: tags.map((name) => ({ name })),
              },
            }
          : {}),
      },
      include: noteInclude,
    });

    return NextResponse.json(note);
  } catch {
    return NextResponse.json({ error: "Unable to update note." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { noteId } = await params;
    await prisma.note.delete({ where: { id: noteId, userId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete note." }, { status: 400 });
  }
}
