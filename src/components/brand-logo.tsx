import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="grid h-10 w-10 sm:h-12 sm:w-12 place-items-center overflow-hidden rounded-full border border-white bg-white shadow-[0_10px_28px_rgba(74,37,189,0.18)]">
        <Image src="/logo.jpeg" alt="Peblo" width={48} height={48} className="h-full w-full object-cover" priority />
      </div>
      {!compact ? (
        <div>
          <div className="text-base sm:text-lg font-black tracking-tight text-[var(--peblo-purple-deep)]">Peblo Notes</div>
          <div className="text-xs sm:text-sm font-semibold text-[var(--peblo-gold)]">AI writing workspace</div>
        </div>
      ) : null}
    </div>
  );
}
