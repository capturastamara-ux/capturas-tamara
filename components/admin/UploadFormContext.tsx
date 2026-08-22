"use client";

import { createContext, useContext, type ComponentProps } from "react";
import { AdminForm } from "@/components/admin/AdminForm";
import { useUploadProgressTracker } from "@/components/admin/useUploadProgressTracker";
import { cn } from "@/lib/cn";

const UploadTrackContext = createContext<((uploading: boolean) => void) | null>(
  null,
);
const UploadsInProgressContext = createContext(0);

export function useUploadFormTrack() {
  return useContext(UploadTrackContext) ?? (() => {});
}

export function useUploadsInProgress() {
  return useContext(UploadsInProgressContext);
}

type AdminMediaFormProps = ComponentProps<typeof AdminForm>;

/** Provee un contador de subidas compartido para formularios y botones hermanos. */
export function AdminMediaScope({ children }: { children: React.ReactNode }) {
  const { uploadsInProgress, trackUpload } = useUploadProgressTracker();

  return (
    <UploadTrackContext.Provider value={trackUpload}>
      <UploadsInProgressContext.Provider value={uploadsInProgress}>
        {children}
      </UploadsInProgressContext.Provider>
    </UploadTrackContext.Provider>
  );
}

export function AdminMediaForm({ children, ...props }: AdminMediaFormProps) {
  return (
    <AdminMediaScope>
      <AdminForm {...props}>{children}</AdminForm>
    </AdminMediaScope>
  );
}

export function AdminMediaSubmitButton({
  label,
  variant = "primary",
  formId,
}: {
  label: string;
  variant?: "primary" | "danger" | "ghost";
  formId?: string;
}) {
  const uploadsInProgress = useUploadsInProgress();
  const disabled = uploadsInProgress > 0;

  const styles = {
    primary: "bg-primary text-white hover:bg-primary/90",
    danger: "border border-accent/40 text-accent hover:bg-accent hover:text-white",
    ghost: "border border-primary/20 text-primary hover:bg-primary hover:text-white",
  };

  return (
    <button
      type="submit"
      form={formId}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-xs uppercase tracking-[0.12em] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
        styles[variant],
      )}
    >
      {disabled ? "Subiendo archivos…" : label}
    </button>
  );
}
