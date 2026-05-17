import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";

type Params = { params: Promise<{ noteId: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { noteId } = await params;
    await prisma.note.findFirstOrThrow({ where: { id: noteId, userId } });

    const link = await prisma.sharedLink.create({
      data: { noteId, token: randomBytes(8).toString("hex") },
    });
    return NextResponse.json(link, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create share link." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { noteId } = await params;
    await prisma.note.findFirstOrThrow({ where: { id: noteId, userId } });
    await prisma.sharedLink.updateMany({ where: { noteId }, data: { active: false } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to revoke share links." }, { status: 400 });
  }
}
