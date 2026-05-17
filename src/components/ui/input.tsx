import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-2xl border border-[var(--peblo-border)] bg-white px-3 text-sm text-[var(--peblo-ink)] shadow-sm outline-none transition placeholder:text-[#a79eb7] focus:border-[#8a63f0] focus:ring-2 focus:ring-[#eadfff] peblo-motion-input transform-gpu",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
