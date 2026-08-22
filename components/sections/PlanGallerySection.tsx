"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";

export type GalleryImage = {
  id: string;
  url: string;
};

function galleryImageAlt(planTitle: string, index: number) {
  return `${planTitle} — imagen ${index + 1}`;
}

type GalleryLightboxProps = {
  images: GalleryImage[];
  planTitle: string;
  activeIndex: number;
  onClose: () => void;
  onChange: (index: number) => void;
};

const ease = [0.22, 1, 0.36, 1] as const;
const SWIPE_THRESHOLD = 48;

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={direction === "left" ? "mr-0.5" : "ml-0.5"}
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

function GalleryLightbox({
  images,
  planTitle,
  activeIndex,
  onClose,
  onChange,
}: Readonly<GalleryLightboxProps>) {
  const reduceMotion = useReducedMotion();
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const [mounted, setMounted] = useState(false);

  const current = images[activeIndex];
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < images.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) onChange(activeIndex - 1);
  }, [activeIndex, hasPrev, onChange]);

  const goNext = useCallback(() => {
    if (hasNext) onChange(activeIndex + 1);
  }, [activeIndex, hasNext, onChange]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [goNext, goPrev, onClose]);

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

  if (!mounted || !current) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-primary/95"
      role="dialog"
      aria-modal="true"
      aria-label="Galería de imágenes"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <p className="text-xs uppercase tracking-[0.14em] text-white/70">
          {activeIndex + 1} / {images.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar galería"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
        >
          <span aria-hidden="true" className="text-xl leading-none">
            ×
          </span>
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 touch-pan-y items-center justify-center px-14 sm:px-20"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {hasPrev && (
          <button
            type="button"
            onClick={goPrev}
            aria-label="Imagen anterior"
            className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:left-6"
          >
            <ChevronIcon direction="left" />
          </button>
        )}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.id}
            className="relative h-full w-full max-w-5xl"
            initial={reduceMotion ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -24 }}
            transition={{ duration: 0.35, ease }}
          >
            <div className="media-frame relative mx-auto h-[min(calc(100svh-9rem),80vh)] w-full max-w-5xl overflow-hidden">
              <Image
                src={current.url}
                alt={galleryImageAlt(planTitle, activeIndex)}
                fill
                className="pointer-events-none object-contain"
                sizes="100vw"
                priority
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {hasNext && (
          <button
            type="button"
            onClick={goNext}
            aria-label="Imagen siguiente"
            className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:right-6"
          >
            <ChevronIcon direction="right" />
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}

function getGalleryGridClass(count: number) {
  if (count === 1) return "grid-cols-1 grid-rows-1";
  if (count === 2) return "grid-cols-2 grid-rows-1";
  if (count === 3) return "grid-cols-2 grid-rows-2 sm:grid-cols-3 sm:grid-rows-1";
  if (count === 4) return "grid-cols-2 grid-rows-2";
  if (count <= 6) return "grid-cols-2 grid-rows-3 sm:grid-cols-3 sm:grid-rows-2";
  if (count <= 9) return "grid-cols-2 grid-rows-4 sm:grid-cols-3 sm:grid-rows-3";
  return "grid-cols-2 grid-rows-4 sm:grid-cols-3 sm:grid-rows-4";
}

type PlanGallerySectionProps = {
  images: GalleryImage[];
  planTitle: string;
};

export function PlanGallerySection({
  images,
  planTitle,
}: Readonly<PlanGallerySectionProps>) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <section className="mt-16 scroll-mt-28 flex h-[min(calc(100svh-6.5rem),920px)] min-h-[min(560px,calc(100svh-6.5rem))] flex-col justify-center sm:mt-24">
        <SectionHeading className="shrink-0 font-display italic">
          Algo de lo que hacemos
        </SectionHeading>

        <div
          className={cn(
            "mt-5 grid min-h-0 flex-1 gap-2 sm:mt-6 sm:gap-3",
            getGalleryGridClass(images.length),
          )}
        >
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Ver ${galleryImageAlt(planTitle, index)}`}
              className={cn(
                "media-frame group relative h-full min-h-0 w-full cursor-pointer overflow-hidden border-0 bg-transparent p-0 text-left",
                images.length === 3 && index === 2 && "col-span-2 sm:col-span-1",
              )}
            >
              <Image
                src={image.url}
                alt={galleryImageAlt(planTitle, index)}
                fill
                draggable={false}
                className="pointer-events-none object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
              <span className="pointer-events-none absolute inset-0 bg-primary/0 transition-colors group-hover:bg-primary/10 group-active:bg-primary/15" />
            </button>
          ))}
        </div>
      </section>

      {activeIndex !== null && (
        <GalleryLightbox
          images={images}
          planTitle={planTitle}
          activeIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
          onChange={setActiveIndex}
        />
      )}
    </>
  );
}
