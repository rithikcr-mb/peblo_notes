import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-[var(--peblo-border)] bg-white/95 shadow-[var(--card-shadow)] peblo-motion-card transform-gpu",
        className,
      )}
      {...props}
    />
  );
}
