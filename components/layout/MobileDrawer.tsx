"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { siteConfig } from "@/config/site";
import { SiteLogo } from "@/components/layout/SiteLogo";
import { cn } from "@/lib/cn";
import { useScrollLock } from "@/lib/hooks/useScrollLock";

const menuEase = [0.22, 1, 0.36, 1] as const;

type MobileDrawerProps = {
  theme?: "light" | "dark";
};

function MenuToggleIcon({ open }: { open: boolean }) {
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.38, ease: menuEase };

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="pointer-events-none"
    >
      <motion.line
        animate={{
          x1: open ? 6 : 5,
          y1: open ? 6 : 7,
          x2: open ? 18 : 19,
          y2: open ? 18 : 7,
        }}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        transition={transition}
      />

      <motion.line
        x1={5}
        y1={12}
        x2={19}
        y2={12}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        animate={{ opacity: open ? 0 : 1 }}
        transition={transition}
      />

      <motion.line
        animate={{
          x1: open ? 18 : 5,
          y1: open ? 6 : 17,
          x2: open ? 6 : 19,
          y2: open ? 18 : 17,
        }}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        transition={transition}
      />
    </svg>
  );
}

export function MobileDrawer({ theme = "light" }: MobileDrawerProps) {
  const [open, setOpen] = useState(false);
  useScrollLock(open);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        aria-controls="mobile-drawer"
        onClick={() => setOpen(!open)}
        className={cn(
          "relative z-[60] flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 active:scale-[0.94]",
          open || theme === "light"
            ? "text-white/95 hover:bg-white/10"
            : "text-catalog-ink hover:bg-catalog/10",
        )}
      >
        <MenuToggleIcon open={open} />
      </button>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <nav
        id="mobile-drawer"
        aria-label="Menú principal"
        className={cn(
          "fixed right-0 top-0 z-[55] flex h-full w-[min(360px,88vw)] flex-col bg-catalog px-8 pb-8 pt-24 shadow-xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "translate-x-0" : "pointer-events-none invisible translate-x-full",
        )}
      >
        <ul className="flex flex-col gap-6">
          {siteConfig.nav.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-sm uppercase tracking-[0.14em] text-white transition-colors hover:text-catalog-gold"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex justify-center pt-10">
          <SiteLogo
            size="md"
            onClick={() => setOpen(false)}
            nameClassName="text-white"
          />
        </div>
      </nav>
    </>
  );
}
