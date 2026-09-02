"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AdminPhoneField } from "@/components/admin/AdminPhoneField";
import {
  AdminField,
  AdminSubmitButton,
} from "@/components/admin/AdminUi";
import { AdminPriceField } from "@/components/admin/AdminPriceField";
import { AdminRichText } from "@/components/admin/AdminRichText";
import { ReservationTimePicker } from "@/components/admin/ReservationTimePicker";
import { reservationConfig } from "@/config/reservations";
import type { ReservationFormErrors } from "@/lib/admin/reservation-form-validation";
import type { OccupiedReservation } from "@/lib/admin/time-slots";
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
  label?: string;
};

export type ReservationPlanOption = {
  id: string;
  title: string;
  categoryId: string;
  subcategoryId: string | null;
  category: { title: string };
  price: number | null;
};

export type ReservationFormDefaults = {
  eventDate?: string;
  startTime?: string;
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
  imageAuthorized?: boolean;
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
  showTimePicker?: boolean;
  occupiedReservations?: readonly OccupiedReservation[];
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
  showTimePicker = false,
  occupiedReservations = [],
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
  const [startTime, setStartTime] = useState(defaults.startTime ?? "");
  const [imageAuthorized, setImageAuthorized] = useState<"yes" | "no" | "">(
    defaults.imageAuthorized == null
      ? ""
      : defaults.imageAuthorized
        ? "yes"
        : "no",
  );

  const filteredSubcategories = useMemo(
    () =>
      categoryId
        ? subcategories.filter((item) => item.categoryId === categoryId)
        : [],
    [categoryId, subcategories],
  );

  const filteredPlans = useMemo(() => {
    if (!categoryId) return [];
    if (subcategoryId) {
      return plans.filter((plan) => plan.subcategoryId === subcategoryId);
    }
    return plans.filter(
      (plan) => plan.categoryId === categoryId && plan.subcategoryId == null,
    );
  }, [categoryId, plans, subcategoryId]);

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
    if (planId && categoryId && !filteredPlans.some((plan) => plan.id === planId)) {
      setPlanId("");
    }
  }, [categoryId, filteredPlans, planId]);

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

      {showTimePicker && (
        <div className="sm:col-span-2">
          <p className="mb-3 text-xs uppercase tracking-[0.12em] text-muted">
            {reservationConfig.hours.timeLabel} *
          </p>
          <ReservationTimePicker
            occupied={occupiedReservations}
            value={startTime || null}
            onChange={(next) => setStartTime(next ?? "")}
          />
          <input type="hidden" name="startTime" value={startTime} />
          <FieldError message={fieldErrors?.startTime} />
        </div>
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
        <span className="text-xs uppercase tracking-[0.12em] text-muted">Subcategoría</span>
        <select
          name="subcategoryId"
          value={subcategoryId}
          disabled={!categoryId}
          onChange={(event) => handleSubcategoryChange(event.target.value)}
          className={cn(inputClassName, fieldErrors?.subcategoryId && "border-accent/50")}
        >
          <option value="">
            {categoryId
              ? filteredSubcategories.length > 0
                ? "Solo categoría (sin subcategoría)"
                : "Esta categoría no tiene subcategorías"
              : "Primero elige una categoría"}
          </option>
          {filteredSubcategories.map((subcategory) => (
            <option key={subcategory.id} value={subcategory.id}>
              {subcategory.label ?? subcategory.title}
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
          disabled={!categoryId}
          onChange={(event) => setPlanId(event.target.value)}
          className={cn(inputClassName, fieldErrors?.planId && "border-accent/50")}
        >
          <option value="" disabled>
            {categoryId ? "Selecciona un plan" : "Primero elige una categoría"}
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

      <fieldset className="sm:col-span-2">
        <legend className="text-xs uppercase tracking-[0.12em] text-muted">
          {reservationConfig.form.imageAuth.legend}
        </legend>
        <p className="mt-2 text-xs text-muted">{reservationConfig.form.imageAuth.hint}</p>
        <input type="hidden" name="imageAuthorized" value={imageAuthorized} />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {(
            [
              { value: "yes" as const, label: reservationConfig.form.imageAuth.yesLabel },
              { value: "no" as const, label: reservationConfig.form.imageAuth.noLabel },
            ] as const
          ).map((option) => {
            const selected = imageAuthorized === option.value;
            return (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-sm border px-3 py-3 text-sm transition-colors",
                  selected
                    ? "border-catalog bg-catalog/5 text-primary"
                    : "border-primary/15 text-primary hover:border-primary/40",
                  fieldErrors?.imageAuthorized && !imageAuthorized && "border-accent/50",
                )}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => setImageAuthorized(option.value)}
                  className="accent-catalog"
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
        <FieldError message={fieldErrors?.imageAuthorized} />
      </fieldset>

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
