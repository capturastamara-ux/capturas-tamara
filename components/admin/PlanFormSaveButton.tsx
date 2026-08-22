"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { useUploadsInProgress } from "@/components/admin/UploadFormContext";
import { cn } from "@/lib/cn";

const PlanFormPendingContext = createContext<{
  pending: boolean;
  setPending: (pending: boolean) => void;
}>({
  pending: false,
  setPending: () => undefined,
});

export function PlanFormSaveProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [pending, setPending] = useState(false);

  return (
    <PlanFormPendingContext.Provider value={{ pending, setPending }}>
      {children}
    </PlanFormPendingContext.Provider>
  );
}

/** Renderizar al final de <AdminForm id="plan-form"> */
export function PlanFormSaveStatusBridge() {
  const { pending } = useFormStatus();
  const { setPending } = useContext(PlanFormPendingContext);

  useEffect(() => {
    setPending(pending);
  }, [pending, setPending]);

  return null;
}

type PlanFormSaveButtonProps = {
  formId?: string;
};

export function PlanFormSaveButton({ formId = "plan-form" }: Readonly<PlanFormSaveButtonProps>) {
  const uploadsInProgress = useUploadsInProgress();
  const { pending: isSaving } = useContext(PlanFormPendingContext);
  const disabled = uploadsInProgress > 0;

  function handleClick() {
    if (disabled) return;
    const form = document.getElementById(formId) as HTMLFormElement | null;
    form?.requestSubmit();
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-xs uppercase tracking-[0.12em] text-white transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
        isSaving && "opacity-70",
      )}
    >
      {uploadsInProgress > 0
        ? "Subiendo archivos…"
        : isSaving
          ? "Guardando…"
          : "Guardar plan"}
    </button>
  );
}
