import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-32 w-full resize-none rounded-2xl border border-[var(--peblo-border)] bg-white px-3 py-2 text-sm text-[var(--peblo-ink)] shadow-sm outline-none transition placeholder:text-[#a79eb7] focus:border-[#8a63f0] focus:ring-2 focus:ring-[#eadfff] peblo-motion-input transform-gpu",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
