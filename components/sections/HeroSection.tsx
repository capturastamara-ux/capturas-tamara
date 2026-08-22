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
        <Image
          src={siteConfig.hero.poster}
          alt={siteConfig.hero.alt}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </motion.div>
      <div
        className="absolute inset-0 bg-black/45"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/55"
        aria-hidden="true"
      />

      <motion.h1
        className="absolute left-1/2 top-[72%] z-10 w-[120vw] -translate-x-1/2 -translate-y-1/2 sm:top-[70%] sm:w-[min(88vw,62rem)]"
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.25, ease }}
      >
        <Image
          src={siteConfig.hero.wordmark}
          alt={`${siteConfig.hero.titleLine} ${siteConfig.hero.title}. ${siteConfig.hero.tagline}`}
          width={1400}
          height={700}
          priority
          className="h-auto w-full mix-blend-screen"
        />
      </motion.h1>

      <motion.div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 sm:bottom-10"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.9, ease }}
      >
        <Link
          href="/#categorias"
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
