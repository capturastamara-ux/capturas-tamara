"use client";

import { useEffect, useRef, useState } from "react";
import {
  formatPriceDigits,
  formatPriceInputValue,
  stripPriceDigits,
} from "@/lib/format/price";

type AdminPriceFieldProps = {
  label: string;
  name?: string;
  formId?: string;
  defaultValue?: number | null;
  value?: number | null;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  readOnly?: boolean;
  onDigitsChange?: (digits: string) => void;
};

export function AdminPriceField({
  label,
  name = "price",
  formId,
  defaultValue,
  value,
  placeholder = "8.500.000",
  hint = "Valor en pesos colombianos (COP). Los puntos se agregan solos.",
  required,
  readOnly,
  onDigitsChange,
}: Readonly<AdminPriceFieldProps>) {
  const hiddenRef = useRef<HTMLInputElement>(null);
  const initialValue = value !== undefined ? value : defaultValue;
  const initialDigits = initialValue != null ? String(initialValue) : "";
  const [digits, setDigits] = useState(initialDigits);
  const [display, setDisplay] = useState(formatPriceInputValue(initialValue));

  function syncHiddenValue(nextDigits: string) {
    if (hiddenRef.current) {
      hiddenRef.current.value = nextDigits;
    }
  }

  function handleChange(nextValue: string) {
    const nextDigits = stripPriceDigits(nextValue);
    setDigits(nextDigits);
    setDisplay(nextDigits ? formatPriceDigits(nextDigits) : "");
    syncHiddenValue(nextDigits);
    onDigitsChange?.(nextDigits);
  }

  useEffect(() => {
    if (value === undefined) return;
    const nextDigits = value != null ? String(value) : "";
    setDigits(nextDigits);
    setDisplay(formatPriceInputValue(value));
    syncHiddenValue(nextDigits);
  }, [value]);

  useEffect(() => {
    const form = formId
      ? document.getElementById(formId)
      : hiddenRef.current?.closest("form");

    if (!form) return;

    const syncBeforeSubmit = () => syncHiddenValue(digits);
    form.addEventListener("submit", syncBeforeSubmit);
    return () => form.removeEventListener("submit", syncBeforeSubmit);
  }, [digits, formId]);

  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-[0.12em] text-muted">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        readOnly={readOnly}
        value={display}
        onChange={(event) => handleChange(event.target.value)}
        placeholder={placeholder}
        className="rounded-sm border border-primary/15 bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary read-only:bg-primary/[0.03] read-only:text-muted"
      />
      <input
        ref={hiddenRef}
        type="hidden"
        name={name}
        defaultValue={initialDigits}
        {...(formId ? { form: formId } : {})}
      />
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}
