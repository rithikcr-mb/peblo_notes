import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";

export async function GET() {
  try {
    const userId = await requireUserId();
    const [totalNotes, archivedNotes, aiGenerations, notes] = await Promise.all([
      prisma.note.count({ where: { userId } }),
      prisma.note.count({ where: { userId, archived: true } }),
      prisma.aiGeneration.count({ where: { userId } }),
      prisma.note.findMany({ where: { userId }, include: { tags: true }, orderBy: { updatedAt: "desc" } }),
    ]);

    const tagCounts = new Map<string, number>();
    const weekly = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return { day: date.toLocaleDateString("en", { weekday: "short" }), notes: 0 };
    });

    for (const note of notes) {
      for (const tag of note.tags) tagCounts.set(tag.name, (tagCounts.get(tag.name) ?? 0) + 1);
      const diff = Math.floor((Date.now() - note.updatedAt.getTime()) / 86400000);
      if (diff >= 0 && diff < 7) weekly[6 - diff].notes += 1;
    }

    return NextResponse.json({
      totalNotes,
      archivedNotes,
      aiGenerations,
      topTags: [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6),
      weekly,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
