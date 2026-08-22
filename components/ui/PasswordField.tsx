"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

type PasswordFieldProps = {
  label: string;
  name?: string;
  required?: boolean;
  autoComplete?: string;
  className?: string;
};

function EyeOpenIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
      aria-hidden
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
      aria-hidden
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <path d="M2 2l20 20" />
    </svg>
  );
}

export function PasswordField({
  label,
  name = "password",
  required = false,
  autoComplete = "current-password",
  className,
}: PasswordFieldProps) {
  const inputId = useId();
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();

  const iconMotion = reduceMotion
    ? { initial: false, animate: { opacity: 1, scale: 1, rotate: 0 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 0.65, rotate: -12 },
        animate: { opacity: 1, scale: 1, rotate: 0 },
        exit: { opacity: 0, scale: 0.65, rotate: 12 },
      };

  return (
    <label htmlFor={inputId} className={cn("flex flex-col gap-2", className)}>
      <span className="text-xs uppercase tracking-[0.14em] text-muted">{label}</span>
      <div className="relative border-b border-primary/20 transition-colors focus-within:border-primary">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          name={name}
          required={required}
          autoComplete={autoComplete}
          className="w-full bg-transparent py-3 pr-10 text-sm outline-none"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-0 top-1/2 -translate-y-1/2 rounded-sm p-1.5 text-muted transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={visible}
        >
          <span className="relative block size-5">
            <AnimatePresence mode="wait" initial={false}>
              {visible ? (
                <motion.span
                  key="closed"
                  className="absolute inset-0 flex items-center justify-center"
                  {...iconMotion}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  <EyeClosedIcon />
                </motion.span>
              ) : (
                <motion.span
                  key="open"
                  className="absolute inset-0 flex items-center justify-center"
                  {...iconMotion}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  <EyeOpenIcon />
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </button>
      </div>
    </label>
  );
}
