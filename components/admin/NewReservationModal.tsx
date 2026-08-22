"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { createReservationModalAction } from "@/app/admin/actions";
import { AdminForm } from "@/components/admin/AdminForm";
import {
  ReservationFormFields,
  type ReservationCategoryOption,
  type ReservationPlanOption,
  type ReservationSubcategoryOption,
} from "@/components/admin/ReservationFormFields";
import { reservationConfig } from "@/config/reservations";
import { formatDayLabel } from "@/lib/admin/availability";
import {
  validateReservationFormData,
  type ReservationFormErrors,
} from "@/lib/admin/reservation-form-validation";
import { syncRichTextBeforeSubmit } from "@/lib/admin/rich-text-form";
import { formatPlanPrice } from "@/lib/format/price";
import { cn } from "@/lib/cn";

type NewReservationModalProps = {
  open: boolean;
  eventDate: string | null;
  categories: ReservationCategoryOption[];
  subcategories: ReservationSubcategoryOption[];
  plans: ReservationPlanOption[];
  onClose: () => void;
  onSuccess?: (message: string) => void;
};

type ReservationSummary = {
  eventDate: string;
  clientName: string;
  clientIdNumber: string;
  clientPhone: string;
  clientEmail: string;
  categoryTitle: string;
  planTitle: string;
  guestCount: string;
  location: string;
  amountPaid: string;
  amountRemaining: string;
};

function buildReservationSummary(
  formData: FormData,
  categories: ReservationCategoryOption[],
  plans: ReservationPlanOption[],
): ReservationSummary {
  const categoryId = String(formData.get("categoryId") ?? "");
  const planId = String(formData.get("planId") ?? "");
  const category = categories.find((item) => item.id === categoryId);
  const plan = plans.find((item) => item.id === planId);

  const amountPaidRaw = String(formData.get("amountPaid") ?? "").replace(/\D/g, "");
  const amountRemainingRaw = String(formData.get("amountRemaining") ?? "").replace(/\D/g, "");
  const guestCountRaw = String(formData.get("guestCount") ?? "").trim();

  return {
    eventDate: String(formData.get("eventDate") ?? ""),
    clientName: String(formData.get("clientName") ?? "").trim(),
    clientIdNumber: String(formData.get("clientIdNumber") ?? "").trim(),
    clientPhone: String(formData.get("clientPhone") ?? "").trim(),
    clientEmail: String(formData.get("clientEmail") ?? "").trim(),
    categoryTitle: category?.title ?? "—",
    planTitle: plan ? `${plan.category.title} · ${plan.title}` : "—",
    guestCount: guestCountRaw || "—",
    location: String(formData.get("location") ?? "").trim(),
    amountPaid: amountPaidRaw
      ? (formatPlanPrice(Number(amountPaidRaw)) ?? amountPaidRaw)
      : "—",
    amountRemaining: amountRemainingRaw
      ? (formatPlanPrice(Number(amountRemainingRaw)) ?? amountRemainingRaw)
      : "—",
  };
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-primary/10 py-3 text-left sm:flex-row sm:gap-4">
      <dt className="shrink-0 text-xs uppercase tracking-[0.12em] text-muted sm:w-36">{label}</dt>
      <dd className="text-sm text-primary">{value || "—"}</dd>
    </div>
  );
}

export function NewReservationModal({
  open,
  eventDate,
  categories,
  subcategories,
  plans,
  onClose,
  onSuccess,
}: Readonly<NewReservationModalProps>) {
  const router = useRouter();
  const titleId = useId();
  const confirmTitleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirmDialogRef = useRef<HTMLDialogElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [summary, setSummary] = useState<ReservationSummary | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ReservationFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [emailWarning, setEmailWarning] = useState<string | null>(null);
  const [formVersion, setFormVersion] = useState(0);
  const formKey = `${eventDate ?? "new"}-${formVersion}`;

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

  useEffect(() => {
    const dialog = confirmDialogRef.current;
    if (!dialog) return;

    if (confirmOpen && !dialog.open) {
      dialog.showModal();
      return;
    }

    if (!confirmOpen && dialog.open) {
      dialog.close();
    }
  }, [confirmOpen]);

  useEffect(() => {
    if (!open) {
      setConfirmOpen(false);
      setPendingFormData(null);
      setSummary(null);
      setFieldErrors({});
      setSubmitError(null);
      setEmailWarning(null);
      setEmailWarning(null);
    }
  }, [open]);

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    syncRichTextBeforeSubmit(event.currentTarget);

    const formData = new FormData(event.currentTarget);
    const validation = validateReservationFormData(formData);

    if (!validation.ok) {
      setFieldErrors(validation.errors);
      setSubmitError(null);
      return;
    }

    setFieldErrors({});
    setSubmitError(null);
    setSummary(buildReservationSummary(formData, categories, plans));
    setPendingFormData(formData);
    setConfirmOpen(true);
  }

  async function confirmCreate() {
    if (!pendingFormData) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await createReservationModalAction(pendingFormData);

      if (!result.ok) {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        setSubmitError(result.message);
        setConfirmOpen(false);
        return;
      }

      if (!result.emailSent) {
        setEmailWarning(
          result.emailError ??
            "La reserva se guardó, pero no se pudo enviar el correo de confirmación.",
        );
        setConfirmOpen(false);
        setFormVersion((value) => value + 1);
        router.refresh();
        return;
      }

      const successMessage = result.emailSentTo
        ? `Reserva creada. Correo de confirmación enviado a ${result.emailSentTo}.`
        : "Reserva creada. Correo de confirmación enviado.";

      setConfirmOpen(false);
      setFormVersion((value) => value + 1);
      onSuccess?.(successMessage);
      onClose();
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo guardar la reserva.";
      setSubmitError(message);
      setConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  const { confirm } = reservationConfig.form;

  return (
    <>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="fixed left-1/2 top-1/2 w-[min(calc(100%-2rem),44rem)] max-h-[calc(100vh-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-sm border border-primary/10 bg-background p-5 text-primary shadow-lg backdrop:bg-primary/40 sm:p-6"
        onClose={onClose}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Nueva reserva</p>
            <h2 id={titleId} className="mt-1 font-display text-2xl italic sm:text-3xl">
              Registrar evento
            </h2>
            {eventDate && (
              <p className="mt-1 text-sm capitalize text-muted">{formatDayLabel(eventDate)}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-primary/15 px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-muted transition-colors hover:bg-primary/5 hover:text-primary"
            aria-label="Cerrar"
          >
            Cerrar
          </button>
        </div>

        {submitError && (
          <p className="mt-4 rounded-sm border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent">
            {submitError}
          </p>
        )}

        {emailWarning && (
          <p className="mt-4 rounded-sm border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-900">
            {emailWarning}
          </p>
        )}

        <AdminForm
          key={formKey}
          resetOnSuccess
          className="mt-6 grid gap-4 sm:grid-cols-2"
          onSubmit={handleFormSubmit}
        >
          <ReservationFormFields
            categories={categories}
            subcategories={subcategories}
            plans={plans}
            defaults={{ eventDate: eventDate ?? "" }}
            hideEventDateField
            fieldErrors={fieldErrors}
            submitLabel="Revisar y confirmar"
          />
        </AdminForm>

        {isSubmitting && !confirmOpen && (
          <p className="mt-4 text-center text-xs uppercase tracking-[0.12em] text-muted">
            Guardando…
          </p>
        )}
      </dialog>

      <dialog
        ref={confirmDialogRef}
        aria-labelledby={confirmTitleId}
        className="fixed left-1/2 top-1/2 w-[min(calc(100%-2rem),32rem)] max-h-[calc(100vh-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-sm border border-primary/10 bg-background p-6 text-primary shadow-lg backdrop:bg-primary/50"
        onClose={() => setConfirmOpen(false)}
      >
        <h2 id={confirmTitleId} className="font-display text-2xl italic">
          {confirm.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{confirm.description}</p>

        {summary && (
          <dl className="mt-5">
            <SummaryRow label="Fecha" value={formatDayLabel(summary.eventDate)} />
            <SummaryRow label="Cliente" value={summary.clientName} />
            <SummaryRow label="Cédula" value={summary.clientIdNumber} />
            <SummaryRow label="Teléfono" value={summary.clientPhone} />
            <SummaryRow label="Correo" value={summary.clientEmail} />
            <SummaryRow label="Categoría" value={summary.categoryTitle} />
            <SummaryRow label="Plan" value={summary.planTitle} />
            <SummaryRow label="Personas" value={summary.guestCount} />
            <SummaryRow label="Lugar" value={summary.location} />
            <SummaryRow label="Abona" value={summary.amountPaid} />
            <SummaryRow label="Resta" value={summary.amountRemaining} />
          </dl>
        )}

        <p className="mt-4 text-xs text-muted">
          Se enviará un correo de confirmación a {summary?.clientEmail ?? "el cliente"}.
        </p>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => setConfirmOpen(false)}
            disabled={isSubmitting}
            className="rounded-full border border-primary/20 px-5 py-2.5 text-xs uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-50"
          >
            {confirm.cancelLabel}
          </button>
          <button
            type="button"
            onClick={confirmCreate}
            disabled={isSubmitting}
            className={cn(
              "rounded-full bg-primary px-5 py-2.5 text-xs uppercase tracking-[0.12em] text-white transition-all hover:-translate-y-0.5 disabled:opacity-50",
            )}
          >
            {isSubmitting ? "Creando…" : confirm.confirmLabel}
          </button>
        </div>
      </dialog>
    </>
  );
}
