"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { siteConfig } from "@/config/site";

const ease = [0.22, 1, 0.36, 1] as const;

export function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-black">
      <motion.div
        className="absolute inset-0"
        initial={reduceMotion ? false : { scale: 1.08, opacity: 0.85 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease }}
      >
        {reduceMotion ? (
          <Image
            src={siteConfig.hero.poster}
            alt={siteConfig.hero.alt}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        ) : (
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={siteConfig.hero.poster}
            className="absolute inset-0 h-full w-full object-cover object-center"
            aria-label={siteConfig.hero.alt}
          >
            <source src={siteConfig.hero.video} type="video/mp4" />
          </video>
        )}
      </motion.div>
      <div
        className="absolute inset-0 bg-black/45"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/55"
        aria-hidden="true"
      />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center text-white">
        <motion.h1
          className="font-display text-[clamp(2.25rem,7.5vw,5.75rem)] font-normal uppercase leading-[0.95] tracking-[0.04em]"
          initial={reduceMotion ? false : { opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease }}
        >
          {siteConfig.hero.title}
        </motion.h1>
        <motion.p
          className="mt-5 max-w-3xl text-[clamp(0.65rem,1.35vw,0.85rem)] font-normal uppercase tracking-[0.22em] text-white/95 sm:mt-6 sm:tracking-[0.28em]"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease }}
        >
          {siteConfig.hero.tagline}
        </motion.p>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 sm:bottom-10"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.9, ease }}
      >
        <Link
          href="/#nosotros"
          aria-label={siteConfig.hero.scrollLabel}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 text-white transition-transform hover:translate-y-0.5 hover:border-white"
        >
          <motion.svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
            animate={
              reduceMotion
                ? undefined
                : { y: [0, 4, 0] }
            }
            transition={
              reduceMotion
                ? undefined
                : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
            }
          >
            <path
              d="M7 2v9M3.5 8.5 7 12l3.5-3.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </Link>
      </motion.div>
    </section>
  );
}
