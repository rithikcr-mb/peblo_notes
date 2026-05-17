import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ token: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { token } = await params;
  const link = await prisma.sharedLink.findUnique({
    where: { token },
    include: { note: { include: { tags: true, user: { select: { name: true } } } } },
  });

  if (!link?.active) {
    return NextResponse.json({ error: "This shared note is unavailable." }, { status: 404 });
  }

  await prisma.sharedLink.update({ where: { id: link.id }, data: { views: { increment: 1 } } });
  return NextResponse.json(link.note);
}
