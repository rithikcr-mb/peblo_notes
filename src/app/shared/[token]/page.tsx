import { notFound } from "next/navigation";
import SafeMarkdown from "@/components/SafeMarkdown";
import { BrandLogo } from "@/components/brand-logo";
import { prisma } from "@/lib/db";

type PageProps = { params: Promise<{ token: string }> };

export default async function SharedNotePage({ params }: PageProps) {
  const { token } = await params;
  const link = await prisma.sharedLink.findUnique({
    where: { token },
    include: { note: { include: { tags: true, user: { select: { name: true } } } } },
  });

  if (!link?.active) notFound();
  await prisma.sharedLink.update({ where: { id: link.id }, data: { views: { increment: 1 } } });

  return (
    <main className="peblo-shell min-h-screen px-5 py-10">
      <article className="peblo-surface mx-auto max-w-3xl rounded-lg p-6 backdrop-blur sm:p-10">
        <BrandLogo className="mb-8" />
        <div className="text-sm font-black text-[var(--peblo-purple)]">Shared Peblo note</div>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--peblo-ink)]">{link.note.title}</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          {link.note.tags.map((tag) => (
            <span key={tag.id} className="rounded-full bg-[var(--peblo-gold-soft)] px-2 py-1 text-xs font-bold text-[#805600]">
              {tag.name}
            </span>
          ))}
        </div>
        <div className="markdown-preview mt-8">
            <SafeMarkdown>{link.note.content}</SafeMarkdown>
        </div>
      </article>
    </main>
  );
}
