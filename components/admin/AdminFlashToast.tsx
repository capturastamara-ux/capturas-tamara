"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const TOAST_VISIBLE_MS = 2800;

type AdminFlashToastProps = {
  message: string | null;
  clearPath: string;
};

export function AdminFlashToast({ message, clearPath }: Readonly<AdminFlashToastProps>) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!message) return;

    setText(message);
    setVisible(true);

    hideTimerRef.current = window.setTimeout(() => {
      hideTimerRef.current = null;
      setVisible(false);
      router.replace(clearPath, { scroll: false });
    }, TOAST_VISIBLE_MS);

    return () => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [message, clearPath, router]);

  return (
    <AnimatePresence>
      {visible && text && (
        <motion.div
          key="admin-flash-toast"
          role="status"
          aria-live="polite"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.22 }}
          className="pointer-events-none fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-full bg-primary px-5 py-3 text-xs uppercase tracking-[0.12em] text-white shadow-lg sm:bottom-8"
        >
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
