import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const parsed = authSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const { email, password, name } = parsed.data;
  const normalizedEmail = email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  await prisma.user.create({
    data: {
      email: normalizedEmail,
      name,
      passwordHash: await hash(password, 12),
      notes: {
        create: {
          title: "Welcome to Peblo Notes",
          category: "Getting Started",
          content:
            "# Welcome\n\nUse Peblo to write notes, preview Markdown, generate AI summaries, and share polished read-only pages.\n\n- Create your first note\n- Add tags\n- Try the AI actions panel",
          tags: { create: [{ name: "welcome", color: "#0f766e" }] },
        },
      },
    },
  });

  return NextResponse.json({ ok: true });
}
