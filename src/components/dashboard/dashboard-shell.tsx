"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { BarChart3, LayoutDashboard, LogOut } from "lucide-react";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { initials } from "@/lib/utils";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Workspace", icon: LayoutDashboard },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const node = drawerRef.current;
    const focusableElements = node
      ? Array.from(node.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )).filter((el) => !el.hasAttribute("disabled"))
      : [];

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    firstFocusable?.focus();
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key === "Tab" && focusableElements.length) {
        if (event.shiftKey && document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable?.focus();
        }
        if (!event.shiftKey && document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable?.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="peblo-shell min-h-screen bg-[#f8f4ff] text-[var(--peblo-ink)]">
      <div className="min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between border-b border-[var(--peblo-border)] bg-white/90 px-4 py-3">
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 bg-white/95 px-3 py-2 rounded-md text-sm font-medium">
            Skip to content
          </a>
          <BrandLogo />
          <button
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-drawer"
            onClick={() => setOpen(true)}
            className="rounded-md p-2 hover:bg-white/80"
          >
            <Menu size={18} />
          </button>
        </div>

        <div className="grid min-h-[calc(100vh-48px)] lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden lg:flex flex-col gap-6 border-r border-[var(--peblo-border)] bg-white/90 px-4 py-6 shadow-[8px_0_30px_rgba(74,37,189,0.06)] backdrop-blur">
            <div>
              <BrandLogo />
            </div>
            <div className="mt-8 flex items-center gap-3 rounded-[1.75rem] bg-[var(--peblo-purple-soft)] p-3 sm:p-4 shadow-[0_16px_40px_rgba(116,71,232,0.12)]">
              <div className="peblo-gloss grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-full bg-[var(--peblo-purple)] text-sm font-black text-white">
                {initials(session?.user?.name ?? session?.user?.email)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm sm:text-base font-black text-[var(--peblo-ink)]">{session?.user?.name ?? "Peblo writer"}</p>
                <p className="truncate text-xs sm:text-sm text-[var(--peblo-muted)]">{session?.user?.email}</p>
              </div>
            </div>

            <nav className="mt-8 space-y-2" aria-label="Workspace navigation">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname?.startsWith(`${href}/`);
              return (
                <Link key={href} href={href} className={cn(
                  "flex items-center gap-3 rounded-[1.5rem] px-4 py-3 text-sm font-bold transition",
                  active
                    ? "bg-[var(--peblo-purple-soft)] text-[var(--peblo-purple-deep)] shadow-[0_18px_50px_rgba(116,71,232,0.12)]"
                    : "text-[var(--peblo-muted)] hover:bg-white/90 hover:text-[var(--peblo-ink)]",
                )}>
                  <Icon size={16} /> {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 border-t border-[var(--peblo-border)] pt-4">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center justify-between rounded-[1.75rem] border border-[var(--peblo-border)] bg-white px-4 py-3 text-sm font-bold text-[var(--peblo-purple-deep)] transition hover:bg-[var(--peblo-purple-soft)]"
            >
              Sign out
              <LogOut size={16} />
            </button>
          </div>
          </aside>

          <div className="min-h-screen bg-[#faf7ff]/60 p-4 lg:p-6">
              <div id="main-content" className="mx-auto min-h-screen max-w-[1600px]">{children}</div>
          </div>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="lg:hidden">
            <div className="fixed inset-0 z-50 flex">
              <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
              <aside
                id="mobile-drawer"
                ref={drawerRef}
                role="dialog"
                aria-modal="true"
                aria-label="Mobile navigation menu"
                className="relative z-50 w-72 border-r border-[var(--peblo-border)] bg-white/95 p-4 shadow-[0_30px_60px_rgba(16,8,40,0.4)] peblo-motion-card"
              >
                <div className="flex items-center justify-between">
                  <BrandLogo />
                  <button aria-label="Close menu" onClick={() => setOpen(false)} className="rounded-md p-2 hover:bg-white/80">
                    <X size={18} />
                  </button>
                </div>
                <div className="mt-6 flex items-center gap-3 rounded-[1.75rem] bg-[var(--peblo-purple-soft)] p-3 shadow-[0_12px_30px_rgba(116,71,232,0.08)]">
                  <div className="peblo-gloss grid h-10 w-10 place-items-center rounded-full bg-[var(--peblo-purple)] text-sm font-black text-white">
                    {initials(session?.user?.name ?? session?.user?.email)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-[var(--peblo-ink)]">{session?.user?.name ?? "Peblo writer"}</p>
                    <p className="truncate text-xs text-[var(--peblo-muted)]">{session?.user?.email}</p>
                  </div>
                </div>

                <nav className="mt-6 space-y-2">
                  {navItems.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href || pathname?.startsWith(`${href}/`);
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-[1.5rem] px-4 py-3 text-sm font-bold transition",
                          active
                            ? "bg-[var(--peblo-purple-soft)] text-[var(--peblo-purple-deep)] shadow-[0_18px_50px_rgba(116,71,232,0.12)]"
                            : "text-[var(--peblo-muted)] hover:bg-white/90 hover:text-[var(--peblo-ink)]",
                        )}
                      >
                        <Icon size={16} /> {label}
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-6 border-t border-[var(--peblo-border)] pt-4">
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full items-center justify-between rounded-2xl border border-[var(--peblo-border)] bg-white px-4 py-3 text-sm font-bold text-[var(--peblo-purple-deep)] transition hover:bg-[var(--peblo-purple-soft)]"
                  >
                    Sign out
                    <LogOut size={16} />
                  </button>
                </div>
              </aside>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
