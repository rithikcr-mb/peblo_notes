"use client";

import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { useMemo } from "react";
import { Sparkles } from "lucide-react";

type Analytics = {
  totalNotes: number;
  archivedNotes: number;
  aiGenerations: number;
  topTags: [string, number][];
  weekly: { day: string; notes: number }[];
};

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error("Request failed");
  return response.json();
}

export function AnalyticsPanel() {
  const analyticsQuery = useQuery({
    queryKey: ["analytics"],
    queryFn: () => jsonFetch<Analytics>("/api/analytics"),
  });

  const totalTags = useMemo(
    () => analyticsQuery.data?.topTags.reduce((sum, [, count]) => sum + count, 0) ?? 0,
    [analyticsQuery.data],
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="rounded-[2rem] border border-[var(--peblo-border)] bg-white/95 p-6 shadow-[0_20px_55px_rgba(74,37,189,0.08)] peblo-motion-card transform-gpu">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--peblo-purple)]">Workspace insights</p>
            <h1 className="mt-3 text-3xl font-black text-[var(--peblo-ink)]">Writing trends & AI momentum</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--peblo-muted)]">
              Track your note creation cadence, AI usage, and tag momentum across the workspace.
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-[var(--peblo-purple-soft)] px-4 py-3 text-sm font-black text-[var(--peblo-purple-deep)] shadow-[0_18px_40px_rgba(116,71,232,0.12)]">
            <Sparkles className="inline-block mr-2 h-4 w-4" /> Live analytics
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <MetricCard label="Total notes" value={analyticsQuery.data?.totalNotes ?? 0} />
        <MetricCard label="Archived notes" value={analyticsQuery.data?.archivedNotes ?? 0} />
        <MetricCard label="AI generations" value={analyticsQuery.data?.aiGenerations ?? 0} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.55fr_0.85fr]">
        <Card className="rounded-[1.75rem] border border-[var(--peblo-border)] bg-white/95 p-5 shadow-[0_18px_45px_rgba(74,37,189,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-[var(--peblo-ink)]">Weekly activity</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--peblo-muted)]">Your writing volume over the past week, updated to show momentum and streaks.</p>
            </div>
            <span className="rounded-full bg-[var(--peblo-gold-soft)] px-3 py-2 text-xs font-black text-[#805600]">{analyticsQuery.data?.weekly.length ?? 0} days</span>
          </div>
          <div className="mt-6 h-56 sm:h-72 rounded-[1.75rem] bg-[#f7f3ff] p-3">
            {analyticsQuery.isLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-[var(--peblo-muted)]">Loading chart…</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsQuery.data?.weekly ?? []}>
                  <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis hide />
                  <Bar dataKey="notes" radius={[4, 4, 0, 0]} fill="#7447e8" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-[1.75rem] border border-[var(--peblo-border)] bg-white/95 p-5 shadow-[0_18px_45px_rgba(74,37,189,0.08)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-[var(--peblo-ink)]">Top tags</h2>
                <p className="mt-1 text-sm text-[var(--peblo-muted)]">Most popular tags from your notes.</p>
              </div>
              <span className="rounded-full bg-[var(--peblo-purple-soft)] px-3 py-2 text-xs font-bold text-[var(--peblo-purple-deep)]">{totalTags} uses</span>
            </div>
            <div className="mt-4 grid gap-3 max-h-40 overflow-auto">
              {analyticsQuery.data?.topTags.length ? (
                analyticsQuery.data.topTags.map(([tag, count]) => (
                  <div key={tag} className="flex items-center justify-between rounded-2xl bg-[#f7f0ff] px-4 py-3 text-sm text-[var(--peblo-ink)] peblo-motion-card transform-gpu">
                    <span className="font-bold">#{tag}</span>
                    <span className="text-[var(--peblo-muted)]">{count}</span>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-[#faf7ff] px-4 py-4 text-sm text-[var(--peblo-muted)]">
                  No tags yet. Add a few tags to see your most-used topics.
                </div>
              )}
            </div>
          </Card>

          <Card className="rounded-[1.75rem] border border-[var(--peblo-border)] bg-white/95 p-5 shadow-[0_18px_45px_rgba(74,37,189,0.08)]">
            <h2 className="text-lg font-black text-[var(--peblo-ink)]">Productivity insights</h2>
            <div className="mt-4 space-y-4 text-sm leading-6 text-[var(--peblo-muted)]">
              <p>
                Build momentum by checking your weekly note output and using AI generations to accelerate your writing flow.
              </p>
              <p>
                Archive old notes that no longer matter and focus on the ideas that are shaping your next projects.
              </p>
              <p>
                Use tags to organize priorities and make it easier to revisit your best ideas later.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.75rem] border border-[var(--peblo-border)] bg-[#f6f0ff] p-5 text-center shadow-[0_18px_45px_rgba(116,71,232,0.12)]">
      <div className="text-4xl font-black text-[var(--peblo-purple-deep)]">{value}</div>
      <div className="mt-3 text-xs font-black uppercase tracking-[0.24em] text-[var(--peblo-purple)]">{label}</div>
    </div>
  );
}
