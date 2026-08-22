import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PortfolioSplitMediaProps = {
  children: ReactNode;
  className?: string;
};

export function PortfolioSplitMedia({
  children,
  className,
}: PortfolioSplitMediaProps) {
  return (
    <div
      className={cn(
        "media-frame relative min-w-0 w-full overflow-hidden",
        "aspect-[4/3] sm:aspect-[5/4]",
        "lg:aspect-auto lg:h-[var(--split-h)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
