"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  formatPriceDigits,
  formatPriceInputValue,
  stripPriceDigits,
} from "@/lib/format/price";
import type { PlanPriceTierView } from "@/lib/plans/price-tiers";
import { cn } from "@/lib/cn";

type TierRow = {
  key: string;
  guestCount: string;
  priceDigits: string;
  priceDisplay: string;
};

type AdminPriceTierListProps = {
  formId?: string;
  defaultTiers?: PlanPriceTierView[];
};

function createRow(tier?: PlanPriceTierView): TierRow {
  const priceDigits = tier?.price != null ? String(tier.price) : "";
  return {
    key: tier?.id ?? crypto.randomUUID(),
    guestCount: tier?.guestCount != null ? String(tier.guestCount) : "",
    priceDigits,
    priceDisplay: formatPriceInputValue(priceDigits),
  };
}

function serializeRows(rows: TierRow[]) {
  return rows
    .map((row) => {
      const guestCount = Number.parseInt(row.guestCount, 10);
      const price = Number.parseInt(row.priceDigits, 10);
      if (!Number.isFinite(guestCount) || guestCount <= 0) return null;
      if (!Number.isFinite(price) || price < 0) return null;
      return { guestCount, price };
    })
    .filter((tier): tier is { guestCount: number; price: number } => tier != null);
}

export function AdminPriceTierList({
  formId,
  defaultTiers = [],
}: Readonly<AdminPriceTierListProps>) {
  const listId = useId();
  const hiddenRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<TierRow[]>(() =>
    defaultTiers.length > 0 ? defaultTiers.map((tier) => createRow(tier)) : [createRow()],
  );

  const syncHiddenValue = (nextRows: TierRow[]) => {
    if (hiddenRef.current) {
      hiddenRef.current.value = JSON.stringify(serializeRows(nextRows));
    }
  };

  useEffect(() => {
    syncHiddenValue(rows);
  }, [rows]);

  useEffect(() => {
    const form = formId
      ? document.getElementById(formId)
      : hiddenRef.current?.closest("form");

    if (!form) return;

    const syncBeforeSubmit = () => syncHiddenValue(rows);
    form.addEventListener("submit", syncBeforeSubmit);
    return () => form.removeEventListener("submit", syncBeforeSubmit);
  }, [formId, rows]);

  function updateRow(key: string, patch: Partial<TierRow>) {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  }

  function handlePriceChange(key: string, value: string) {
    const priceDigits = stripPriceDigits(value);
    updateRow(key, {
      priceDigits,
      priceDisplay: priceDigits ? formatPriceDigits(priceDigits) : "",
    });
  }

  function addRow() {
    setRows((current) => [...current, createRow()]);
  }

  function removeRow(key: string) {
    setRows((current) => {
      if (current.length <= 1) {
        return [createRow()];
      }
      return current.filter((row) => row.key !== key);
    });
  }

  return (
    <div className="space-y-3">
      <div>
        <p
          id={`${listId}-label`}
          className="text-xs uppercase tracking-[0.12em] text-muted"
        >
          Lista de precios
        </p>
        <p className="mt-1 text-sm text-muted">
          Define cuánto cuesta el plan según el número de invitados.
        </p>
      </div>

      <ul
        aria-labelledby={`${listId}-label`}
        className="space-y-3"
      >
        {rows.map((row, index) => (
          <li
            key={row.key}
            className="grid gap-3 rounded-sm border border-primary/10 bg-surface/40 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-4"
          >
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.12em] text-muted">
                Invitados {index + 1}
              </span>
              <input
                type="number"
                min={1}
                inputMode="numeric"
                value={row.guestCount}
                onChange={(event) =>
                  updateRow(row.key, { guestCount: event.target.value })
                }
                placeholder="50"
                className="rounded-sm border border-primary/15 bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.12em] text-muted">
                Precio (COP)
              </span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={row.priceDisplay}
                onChange={(event) => handlePriceChange(row.key, event.target.value)}
                placeholder="10.100.000"
                className="rounded-sm border border-primary/15 bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
              />
            </label>

            <button
              type="button"
              onClick={() => removeRow(row.key)}
              className={cn(
                "rounded-full border border-primary/20 px-4 py-2 text-xs uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary/5",
                "sm:mb-0.5",
              )}
            >
              Quitar
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={addRow}
        className="rounded-full border border-dashed border-primary/25 px-4 py-2 text-xs uppercase tracking-[0.12em] text-primary transition-colors hover:border-primary/40 hover:bg-primary/5"
      >
        + Agregar precio
      </button>

      <input
        ref={hiddenRef}
        type="hidden"
        name="priceTiers"
        defaultValue={JSON.stringify(serializeRows(rows))}
        {...(formId ? { form: formId } : {})}
      />
    </div>
  );
}
