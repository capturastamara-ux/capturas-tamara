"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

type AdminConfirmDeleteFormProps = {
  action: ComponentProps<"form">["action"];
  itemLabel: string;
  buttonLabel: string;
  variant?: "danger" | "link";
  className?: string;
  children: ReactNode;
};

export function AdminConfirmDeleteForm({
  action,
  itemLabel,
  buttonLabel,
  variant = "danger",
  className,
  children,
}: Readonly<AdminConfirmDeleteFormProps>) {
  const titleId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      return;
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const confirmDelete = () => {
    formRef.current?.requestSubmit();
    setOpen(false);
  };

  const buttonStyles = {
    danger:
      "inline-flex items-center justify-center rounded-full border border-accent/40 px-5 py-2.5 text-xs uppercase tracking-[0.12em] text-accent transition-all hover:-translate-y-0.5 hover:bg-accent hover:text-white",
    link: "text-xs uppercase tracking-[0.1em] text-accent hover:opacity-70",
  };

  return (
    <>
      <form ref={formRef} action={action} className={className}>
        {children}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={buttonStyles[variant]}
        >
          {buttonLabel}
        </button>
      </form>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="fixed left-1/2 top-1/2 w-[min(calc(100%-2rem),28rem)] -translate-x-1/2 -translate-y-1/2 rounded-sm border border-primary/10 bg-background p-6 text-center text-primary shadow-lg backdrop:bg-primary/40"
        onClose={() => setOpen(false)}
      >
        <h2 id={titleId} className="font-display text-2xl italic">
          Confirmar eliminación
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          ¿Seguro que desea borrar {itemLabel}?
        </p>
        <p className="mt-2 text-sm text-muted">Esta acción no se puede deshacer.</p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full border border-primary/20 px-5 py-2.5 text-xs uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmDelete}
            className={cn(
              "rounded-full px-5 py-2.5 text-xs uppercase tracking-[0.12em] transition-all hover:-translate-y-0.5",
              "bg-accent text-white hover:bg-accent/90",
            )}
          >
            Sí, eliminar
          </button>
        </div>
      </dialog>
    </>
  );
}
