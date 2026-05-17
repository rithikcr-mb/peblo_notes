import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = SelectPrimitive;

export const SelectTrigger = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>>(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
      ref={ref}
        className={cn(
        "group flex min-h-[44px] w-full items-center justify-between rounded-[1.5rem] border border-[var(--peblo-border)] bg-[#f7f1ff] px-4 text-sm text-[var(--peblo-ink)] shadow-sm shadow-[0_10px_28px_rgba(116,71,232,0.08)] outline-none transition duration-200 focus:border-[var(--peblo-purple)] focus:ring-2 focus:ring-[rgba(116,71,232,0.14)] peblo-motion-card transform-gpu",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon className="text-[var(--peblo-purple)] transition duration-200 group-data-[state=open]:rotate-180">
        <ChevronDown className="h-4 w-4" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  ),
);
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

export const SelectContent = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Content>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>>(
  ({ className, children, position = "popper", ...props }, ref) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        position={position}
        sideOffset={8}
        className={cn(
          "z-50 min-w-[220px] overflow-hidden rounded-[26px] border border-white/80 bg-white/95 shadow-[0_30px_80px_rgba(116,71,232,0.16)] backdrop-blur-xl transition duration-200 data-[state=open]:animate-[fadeIn_180ms_ease]",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-2">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  ),
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

export const SelectItem = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Item>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>>(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-[1.25rem] px-4 py-3 text-sm text-[var(--peblo-ink)] outline-none transition duration-150 whitespace-nowrap data-[highlighted]:bg-[var(--peblo-purple-soft)] data-[highlighted]:text-[var(--peblo-ink)] data-[state=checked]:bg-[var(--peblo-purple)] data-[state=checked]:text-white",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-3 inline-flex items-center text-white">
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  ),
);
SelectItem.displayName = SelectPrimitive.Item.displayName;

export const SelectValue = SelectPrimitive.Value;
export const SelectLabel = SelectPrimitive.Label;
export const SelectSeparator = SelectPrimitive.Separator;
