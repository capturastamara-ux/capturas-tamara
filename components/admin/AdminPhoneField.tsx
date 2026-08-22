"use client";

import { useState, type ChangeEvent, type ClipboardEvent, type KeyboardEvent } from "react";
import { reservationConfig } from "@/config/reservations";
import { stripPriceDigits } from "@/lib/format/price";
import { cn } from "@/lib/cn";

const MAX_PHONE_LENGTH = 10;
const NAVIGATION_KEYS = new Set([
  "Backspace",
  "Delete",
  "Tab",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
]);

type AdminPhoneFieldProps = {
  name?: string;
  defaultValue?: string | null;
  required?: boolean;
  className?: string;
};

function sanitizePhoneInput(value: string) {
  return stripPriceDigits(value).slice(0, MAX_PHONE_LENGTH);
}

export function AdminPhoneField({
  name = "clientPhone",
  defaultValue,
  required,
  className,
}: Readonly<AdminPhoneFieldProps>) {
  const [value, setValue] = useState(() => sanitizePhoneInput(defaultValue ?? ""));

  function updateValue(nextRaw: string) {
    setValue(sanitizePhoneInput(nextRaw));
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    updateValue(event.target.value);
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    updateValue(event.clipboardData.getData("text"));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (NAVIGATION_KEYS.has(event.key)) return;
    if (event.ctrlKey || event.metaKey) return;
    if (/^\d$/.test(event.key)) return;
    event.preventDefault();
  }

  return (
    <input
      type="text"
      name={name}
      value={value}
      required={required}
      inputMode="numeric"
      autoComplete="tel"
      maxLength={MAX_PHONE_LENGTH}
      pattern="[0-9]{1,10}"
      title={reservationConfig.form.validation.phone}
      onChange={handleChange}
      onPaste={handlePaste}
      onKeyDown={handleKeyDown}
      className={cn(
        "rounded-sm border border-primary/15 bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary",
        className,
      )}
    />
  );
}
