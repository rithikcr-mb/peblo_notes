import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-bold transition disabled:pointer-events-none disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8a63f0] transform-gpu peblo-button-press",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--peblo-purple)] text-white shadow-[0_10px_24px_rgba(74,37,189,0.24)] hover:bg-[var(--peblo-purple-deep)]",
        secondary: "border border-[var(--peblo-border)] bg-white text-[var(--peblo-purple-deep)] hover:bg-[var(--peblo-purple-soft)]",
        ghost: "text-[var(--peblo-purple-deep)] hover:bg-[var(--peblo-purple-soft)]",
        danger: "bg-rose-600 text-white hover:bg-rose-700",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        icon: "h-9 w-9 px-0",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";
