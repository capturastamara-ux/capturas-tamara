"use client";

import { useReducedMotion } from "motion/react";
import { siteConfig } from "@/config/site";

const itemClassName =
  "shrink-0 whitespace-nowrap px-10 font-display text-lg italic text-hero-sand/75 sm:px-14 sm:text-xl md:px-16 md:text-2xl";

const staticItemClassName =
  "whitespace-nowrap font-display text-lg italic text-hero-sand/75 sm:text-xl md:text-2xl";

export function RegionsTicker() {
  const reduceMotion = useReducedMotion();
  const regions = siteConfig.regions;

  return (
    <section
      aria-label="Zonas de la región"
      className="border-y border-black bg-black py-4"
    >
      {reduceMotion ? (
        <ul className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-x-8 gap-y-3 px-5 sm:gap-x-12 sm:px-8 md:gap-x-16">
          {regions.map((region) => (
            <li key={region} className={staticItemClassName}>
              {region}
            </li>
          ))}
        </ul>
      ) : (
        <div className="regions-ticker-mask overflow-hidden">
          <div className="flex w-max animate-marquee will-change-transform">
            {regions.map((region) => (
              <span key={region} className={itemClassName}>
                {region}
              </span>
            ))}
            {regions.map((region) => (
              <span key={`dup-${region}`} aria-hidden="true" className={itemClassName}>
                {region}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
