"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type PortfolioSplitContentProps = {
  children: ReactNode;
  className?: string;
};

export function PortfolioSplitContent({
  children,
  className,
}: PortfolioSplitContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const media = window.matchMedia("(min-width: 1024px)");

    const measure = () => {
      if (!media.matches) {
        setScrollable(false);
        return;
      }

      const maxHeight = Number.parseFloat(getComputedStyle(el).maxHeight);
      if (!Number.isFinite(maxHeight) || maxHeight <= 0) {
        setScrollable(false);
        return;
      }

      setScrollable(el.scrollHeight > maxHeight + 2);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);

    media.addEventListener("change", measure);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      media.removeEventListener("change", measure);
      window.removeEventListener("resize", measure);
    };
  }, [children]);

  return (
    <div
      ref={ref}
      className={cn(
        "flex min-h-0 min-w-0 flex-col justify-start lg:justify-center lg:max-h-[var(--split-h)] lg:py-1",
        scrollable && "lg:overflow-y-auto lg:pr-1 lg:pb-2",
        className,
      )}
    >
      {children}
    </div>
  );
}
