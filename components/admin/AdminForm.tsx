"use client";

import { useRef, type ComponentProps, type SubmitEventHandler } from "react";
import { syncRichTextBeforeSubmit } from "@/lib/admin/rich-text-form";

type AdminFormProps = ComponentProps<"form"> & {
  /** Limpia el formulario (incluye texto enriquecido y media) cuando la acción termina sin error. */
  resetOnSuccess?: boolean;
};

export function AdminForm({
  onSubmit,
  action,
  resetOnSuccess,
  children,
  ...props
}: AdminFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    syncRichTextBeforeSubmit(event.currentTarget);
    onSubmit?.(event);
  };

  const formAction =
    resetOnSuccess && typeof action === "function"
      ? async (formData: FormData) => {
          await action(formData);
          formRef.current?.reset();
        }
      : action;

  return (
    <form {...props} ref={formRef} action={formAction} onSubmit={handleSubmit}>
      {children}
    </form>
  );
}
