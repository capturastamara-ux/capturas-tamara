"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

const ease = [0.22, 1, 0.36, 1] as const;
const INTERVAL_MS = 5500;
const SWIPE_THRESHOLD = 48;

type CarouselImage = {
  id: string;
  url: string;
};

type PlanGalleryCarouselProps = {
  images: CarouselImage[];
  fallbackUrl: string;
  fallbackAlt: string;
  priority?: boolean;
};

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={direction === "left" ? "M12 4l-6 6 6 6" : "M8 4l6 6-6 6"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlanGalleryCarousel({
  images,
  fallbackUrl,
  fallbackAlt,
  priority = false,
}: Readonly<PlanGalleryCarouselProps>) {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState(0);

  const slides =
    images.length > 0
      ? images
      : [{ id: "fallback", url: fallbackUrl }];

  const goPrev = useCallback(() => {
    setActive((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goNext = useCallback(() => {
    setActive((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const measure = () => setWidth(element.offsetWidth);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    if (slides.length <= 1 || reduceMotion) return;

    const interval = window.setInterval(goNext, INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [active, goNext, reduceMotion, slides.length]);

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? 0;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    const currentX = event.touches[0]?.clientX ?? touchStartX.current;
    touchDeltaX.current = currentX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (touchDeltaX.current <= -SWIPE_THRESHOLD) goNext();
    else if (touchDeltaX.current >= SWIPE_THRESHOLD) goPrev();
    touchDeltaX.current = 0;
  };

  if (slides.length === 0) return null;

  const trackReady = width > 0;

  return (
    <div
      ref={containerRef}
      className="relative h-full min-w-0 w-full overflow-hidden bg-primary/10"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <motion.div
        className="flex h-full"
        animate={{ x: trackReady ? -active * width : 0 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.55, ease }
        }
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="relative h-full shrink-0 grow-0 basis-full"
            style={trackReady ? { width, flexBasis: width } : undefined}
          >
            <Image
              src={slide.url}
              alt={fallbackAlt}
              fill
              priority={priority && index === 0}
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        ))}
      </motion.div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Imagen anterior"
            className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/45 sm:left-4"
          >
            <ChevronIcon direction="left" />
          </button>

          <button
            type="button"
            onClick={goNext}
            aria-label="Imagen siguiente"
            className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/45 sm:right-4"
          >
            <ChevronIcon direction="right" />
          </button>

          <div
            className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2"
            aria-hidden="true"
          >
            {slides.map((slide, index) => (
              <span
                key={slide.id}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === active ? "w-6 bg-white" : "w-1.5 bg-white/45",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
