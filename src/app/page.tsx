import Link from "next/link";
import { ArrowRight, BookOpen, Link2, Sparkles } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";

const featureCards = [
  { label: "Notes", Icon: BookOpen },
  { label: "AI", Icon: Sparkles },
  { label: "Share", Icon: Link2 },
];

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <main className="peblo-shell min-h-screen">
      <section className="mx-auto grid min-h-screen max-w-6xl content-center gap-10 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <BrandLogo className="mb-8" />
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--peblo-border)] bg-white/85 px-3 py-1 text-sm font-bold text-[var(--peblo-purple-deep)] shadow-sm">
            <Sparkles size={15} /> Premium AI notes workspace
          </div>
          <h1 className="max-w-3xl text-5xl font-black tracking-tight text-[var(--peblo-ink)] sm:text-6xl">
            Peblo Notes
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--peblo-muted)]">
            Capture Markdown notes, organize tags, generate summaries, share public pages, and track writing momentum from one focused dashboard.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/signup">
                Start building <ArrowRight size={16} />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/login">Log in</Link>
            </Button>
          </div>
        </div>
        <div className="peblo-surface rounded-[2rem] p-4 sm:p-6 backdrop-blur peblo-motion-card transform-gpu">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(247,240,255,0.9))] p-5 shadow-[0_30px_80px_rgba(116,71,232,0.14)]">
            <div className="pointer-events-none hidden md:block absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,_rgba(116,71,232,0.18),transparent_45%)]" />
            <div className="pointer-events-none hidden md:block absolute right-0 top-10 h-36 w-36 rounded-full bg-[rgba(255,214,10,0.14)] blur-2xl" />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/90 px-3 py-2 text-sm font-black text-[var(--peblo-purple-deep)] shadow-[0_10px_30px_rgba(116,71,232,0.08)]">
                <BrandLogo compact />
                <span>Launch ideas</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--peblo-purple-soft)] px-3 py-2 text-sm font-bold text-[var(--peblo-purple-deep)] shadow-[0_6px_24px_rgba(116,71,232,0.12)]">
                <Sparkles size={14} />
                AI assistant active
              </div>
            </div>

            <div className="mt-5 rounded-[1.75rem] border border-[var(--peblo-border)] bg-white/95 p-4 sm:p-5 shadow-[0_20px_50px_rgba(74,37,189,0.08)] peblo-motion-card transform-gpu">
              <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[var(--peblo-purple-deep)]">
                <span className="rounded-full bg-[var(--peblo-gold-soft)] px-2.5 py-1 text-[var(--peblo-purple-deep)]">Draft</span>
                <span>Shared note</span>
                <span>2 min ago</span>
              </div>
              <h3 className="mt-4 text-lg font-black text-[var(--peblo-ink)]">Customer experience roadmap</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--peblo-muted)]">
                Capture research, refine ideas, and generate polished note summaries in one AI-powered workspace.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[var(--peblo-purple-soft)] px-3 py-1 text-xs font-black text-[var(--peblo-purple-deep)]">Product</span>
                <span className="rounded-full bg-[var(--peblo-gold-soft)] px-3 py-1 text-xs font-black text-[#805600]">AI summary</span>
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-black text-[var(--peblo-muted)] shadow-sm">Markdown</span>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-[#f7f0ff] p-4 shadow-[0_15px_35px_rgba(116,71,232,0.08)]">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-[var(--peblo-purple)]">AI summary</div>
                <p className="mt-3 text-sm leading-6 text-[var(--peblo-ink)]">
                  “Launch a new workspace preview that feels instantly modern and productivity-focused.”
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white/95 p-4 shadow-[0_15px_35px_rgba(74,37,189,0.06)]">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-[var(--peblo-purple)]">Ready to share</div>
                <div className="mt-3 flex items-center gap-2 text-sm font-bold text-[var(--peblo-purple-deep)]">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[var(--peblo-gold)]" />
                  Public note link
                </div>
                <p className="mt-2 text-sm text-[var(--peblo-muted)]">A polished preview card built for fast idea capture and collaboration.</p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {featureCards.map(({ label, Icon }) => (
              <div key={label} className="rounded-[1.75rem] border border-[var(--peblo-border)] bg-white/95 p-4 shadow-[0_12px_28px_rgba(116,71,232,0.08)] peblo-motion-card transform-gpu">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--peblo-purple-deep)]">
                  <Icon size={14} /> {label}
                </div>
                <div className="mt-3 h-16 rounded-[1.5rem] bg-gradient-to-br from-white via-[#f6f0ff] to-[#faf7ff] p-3">
                  <div className="h-3.5 w-3/5 rounded-full bg-[var(--peblo-purple)]/15" />
                  <div className="mt-3 h-2.5 w-4/5 rounded-full bg-[var(--peblo-purple)]/10" />
                  <div className="mt-2 h-2.5 w-1/2 rounded-full bg-[var(--peblo-purple)]/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
