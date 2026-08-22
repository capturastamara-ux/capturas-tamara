import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

type PortfolioSplitGridProps = {
  children: ReactNode;
  className?: string;
  priority?: boolean;
  /** Cuando hay título/intro encima (p. ej. /portafolio), usa el viewport restante */
  compactViewport?: boolean;
};

export function PortfolioSplitGrid({
  children,
  className,
  priority = false,
  compactViewport = false,
}: PortfolioSplitGridProps) {
  const splitHeight = compactViewport
    ? "min(calc(100svh - 11.5rem), 820px)"
    : priority
      ? "min(calc(100svh - 6.5rem), 800px)"
      : "min(calc(100svh - 8.5rem), 700px)";

  return (
    <div
      className={cn(
        "grid min-w-0 gap-8 sm:gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-10 xl:gap-14",
        className,
      )}
      style={{ "--split-h": splitHeight } as CSSProperties}
    >
      {children}
    </div>
  );
}
