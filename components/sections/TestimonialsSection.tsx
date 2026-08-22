"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { testimonials } from "@/config/testimonials";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

const ease = [0.22, 1, 0.36, 1] as const;

export function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => window.clearInterval(interval);
  }, []);

  const current = testimonials[active];

  return (
    <section className="overflow-hidden bg-primary px-5 py-20 text-white sm:px-8 sm:py-28 lg:px-12">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <Reveal className="media-frame relative aspect-[4/5] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                className="absolute inset-0"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.5, ease }}
              >
                <Image
                  src={current.image}
                  alt={current.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </motion.div>
            </AnimatePresence>
          </Reveal>

          <Reveal delay={0.1}>
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease }}
              >
                <SectionHeading
                  as="h2"
                  align="left"
                  className="font-display text-[clamp(1.5rem,3.5vw,2.5rem)] italic text-white"
                >
                  &ldquo;{current.quote}&rdquo;
                </SectionHeading>
                <blockquote className="mt-6 text-base leading-relaxed text-white/75 sm:text-lg">
                  &ldquo;{current.body}&rdquo;
                </blockquote>
                <p className="mt-8 text-sm uppercase tracking-[0.12em] text-white/60">
                  {current.author} • {current.location}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex gap-3" role="tablist" aria-label="Testimonios">
              {testimonials.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={index === active}
                  aria-label={`Testimonio de ${item.author}`}
                  onClick={() => setActive(index)}
                  className={cn(
                    "h-px w-10 transition-all duration-300",
                    index === active ? "bg-white" : "bg-white/30 hover:bg-white/50",
                  )}
                />
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
