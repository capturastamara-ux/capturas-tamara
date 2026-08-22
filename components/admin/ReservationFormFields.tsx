"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AdminPhoneField } from "@/components/admin/AdminPhoneField";
import {
  AdminField,
  AdminSubmitButton,
} from "@/components/admin/AdminUi";
import { AdminPriceField } from "@/components/admin/AdminPriceField";
import { AdminRichText } from "@/components/admin/AdminRichText";
import { reservationConfig } from "@/config/reservations";
import type { ReservationFormErrors } from "@/lib/admin/reservation-form-validation";
import { cn } from "@/lib/cn";
import { formatPlanPrice } from "@/lib/format/price";

export type ReservationCategoryOption = {
  id: string;
  title: string;
  slug: string;
};

export type ReservationSubcategoryOption = {
  id: string;
  title: string;
  categoryId: string;
};

export type ReservationPlanOption = {
  id: string;
  title: string;
  categoryId: string;
  subcategoryId: string;
  category: { title: string };
  price: number | null;
};

export type ReservationFormDefaults = {
  eventDate?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientIdNumber?: string;
  categoryId?: string;
  subcategoryId?: string;
  planId?: string;
  guestCount?: number | null;
  location?: string;
  notes?: string;
  status?: string;
  amountPaid?: number | null;
  amountRemaining?: number | null;
};

type ReservationFormFieldsProps = {
  categories: ReservationCategoryOption[];
  subcategories: ReservationSubcategoryOption[];
  plans: ReservationPlanOption[];
  defaults?: ReservationFormDefaults;
  fieldErrors?: ReservationFormErrors;
  submitLabel?: string;
  showStatus?: boolean;
  hideEventDateField?: boolean;
  extraActions?: ReactNode;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-accent">{message}</p>;
}

export function ReservationFormFields({
  categories,
  subcategories,
  plans,
  defaults = {},
  fieldErrors,
  submitLabel = "Guardar reserva",
  showStatus = true,
  hideEventDateField = false,
  extraActions,
}: Readonly<ReservationFormFieldsProps>) {
  const inputClassName =
    "rounded-sm border border-primary/15 bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary";

  const [categoryId, setCategoryId] = useState(defaults.categoryId ?? "");
  const [subcategoryId, setSubcategoryId] = useState(defaults.subcategoryId ?? "");
  const [planId, setPlanId] = useState(defaults.planId ?? "");
  const [amountPaidDigits, setAmountPaidDigits] = useState(
    defaults.amountPaid != null ? String(defaults.amountPaid) : "",
  );

  const filteredSubcategories = useMemo(
    () =>
      categoryId
        ? subcategories.filter((item) => item.categoryId === categoryId)
        : [],
    [categoryId, subcategories],
  );

  const filteredPlans = useMemo(
    () =>
      subcategoryId
        ? plans.filter((plan) => plan.subcategoryId === subcategoryId)
        : [],
    [plans, subcategoryId],
  );

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === planId) ?? null,
    [planId, plans],
  );

  const selectedPlanPrice = selectedPlan?.price ?? null;

  const amountRemaining = useMemo(() => {
    if (selectedPlanPrice == null) return null;
    const paid = amountPaidDigits ? Number.parseInt(amountPaidDigits, 10) : 0;
    return Math.max(0, selectedPlanPrice - (Number.isFinite(paid) ? paid : 0));
  }, [amountPaidDigits, selectedPlanPrice]);

  useEffect(() => {
    if (
      subcategoryId &&
      categoryId &&
      !filteredSubcategories.some((item) => item.id === subcategoryId)
    ) {
      setSubcategoryId("");
      setPlanId("");
    }
  }, [categoryId, filteredSubcategories, subcategoryId]);

  useEffect(() => {
    if (planId && subcategoryId && !filteredPlans.some((plan) => plan.id === planId)) {
      setPlanId("");
    }
  }, [filteredPlans, planId, subcategoryId]);

  function handleCategoryChange(nextCategoryId: string) {
    setCategoryId(nextCategoryId);
    setSubcategoryId("");
    setPlanId("");
  }

  function handleSubcategoryChange(nextSubcategoryId: string) {
    setSubcategoryId(nextSubcategoryId);
    setPlanId("");
  }

  return (
    <>
      {hideEventDateField ? (
        <input type="hidden" name="eventDate" value={defaults.eventDate ?? ""} />
      ) : (
        <label className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-[0.12em] text-muted">
            Fecha del evento *
          </span>
          <input
            type="date"
            name="eventDate"
            required
            defaultValue={defaults.eventDate ?? ""}
            className={cn(inputClassName, fieldErrors?.eventDate && "border-accent/50")}
          />
          <FieldError message={fieldErrors?.eventDate} />
        </label>
      )}

      <div>
        <AdminField
          label="Nombre del cliente"
          name="clientName"
          required
          defaultValue={defaults.clientName}
        />
        <FieldError message={fieldErrors?.clientName} />
      </div>

      <div>
        <AdminField
          label={reservationConfig.form.clientIdNumberLabel}
          name="clientIdNumber"
          required
          defaultValue={defaults.clientIdNumber}
          placeholder="Ej. 1234567890"
        />
        <FieldError message={fieldErrors?.clientIdNumber} />
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.12em] text-muted">Teléfono *</span>
        <AdminPhoneField
          required
          defaultValue={defaults.clientPhone}
          className={fieldErrors?.clientPhone ? "border-accent/50" : undefined}
        />
        <FieldError message={fieldErrors?.clientPhone} />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.12em] text-muted">Correo *</span>
        <input
          type="email"
          name="clientEmail"
          required
          autoComplete="email"
          defaultValue={defaults.clientEmail ?? ""}
          className={cn(inputClassName, fieldErrors?.clientEmail && "border-accent/50")}
        />
        <FieldError message={fieldErrors?.clientEmail} />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.12em] text-muted">Categoría *</span>
        <select
          name="categoryId"
          required
          value={categoryId}
          onChange={(event) => handleCategoryChange(event.target.value)}
          className={cn(inputClassName, fieldErrors?.categoryId && "border-accent/50")}
        >
          <option value="" disabled>
            Selecciona una categoría
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.title}
            </option>
          ))}
        </select>
        <FieldError message={fieldErrors?.categoryId} />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.12em] text-muted">Subcategoría *</span>
        <select
          name="subcategoryId"
          required
          value={subcategoryId}
          disabled={!categoryId}
          onChange={(event) => handleSubcategoryChange(event.target.value)}
          className={cn(inputClassName, fieldErrors?.subcategoryId && "border-accent/50")}
        >
          <option value="" disabled>
            {categoryId ? "Selecciona una subcategoría" : "Primero elige una categoría"}
          </option>
          {filteredSubcategories.map((subcategory) => (
            <option key={subcategory.id} value={subcategory.id}>
              {subcategory.title}
            </option>
          ))}
        </select>
        <FieldError message={fieldErrors?.subcategoryId} />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.12em] text-muted">Plan *</span>
        <select
          name="planId"
          required
          value={planId}
          disabled={!subcategoryId}
          onChange={(event) => setPlanId(event.target.value)}
          className={cn(inputClassName, fieldErrors?.planId && "border-accent/50")}
        >
          <option value="" disabled>
            {subcategoryId ? "Selecciona un plan" : "Primero elige una subcategoría"}
          </option>
          {filteredPlans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.title}
            </option>
          ))}
        </select>
        <FieldError message={fieldErrors?.planId} />
      </label>

      <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-[0.12em] text-muted">
            {reservationConfig.form.planPriceLabel}
          </span>
          <p className="rounded-sm border border-primary/10 bg-primary/[0.03] px-3 py-2.5 text-sm text-primary">
            {formatPlanPrice(selectedPlanPrice) ?? "—"}
          </p>
          <span className="text-xs text-muted">{reservationConfig.form.priceHint}</span>
        </div>
      </div>

      <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
        <AdminPriceField
          label={reservationConfig.form.amountPaidLabel}
          name="amountPaid"
          defaultValue={defaults.amountPaid}
          hint={reservationConfig.form.priceHint}
          onDigitsChange={setAmountPaidDigits}
        />
        <AdminPriceField
          label={reservationConfig.form.amountRemainingLabel}
          name="amountRemaining"
          value={amountRemaining}
          readOnly
          hint={reservationConfig.form.priceHint}
        />
      </div>

      <div className="sm:col-span-2">
        <AdminField label="Lugar" name="location" defaultValue={defaults.location} />
      </div>
      <div className="sm:col-span-2">
        <AdminRichText
          label="Notas"
          name="notes"
          compact
          placeholder="Detalles adicionales…"
          defaultValue={defaults.notes}
        />
      </div>

      {showStatus && (
        <label className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-[0.12em] text-muted">Estado</span>
          <select
            name="status"
            defaultValue={defaults.status ?? "pending"}
            className={inputClassName}
          >
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </label>
      )}

      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <AdminSubmitButton label={submitLabel} />
        {extraActions}
      </div>
    </>
  );
}
