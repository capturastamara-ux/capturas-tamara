"use client";

import { useEffect, useRef, useState } from "react";
import { adminConfig } from "@/config/admin";
import {
  formatPriceDigits,
  formatPriceInputValue,
  stripPriceDigits,
} from "@/lib/format/price";
import { cn } from "@/lib/cn";

export type PrintPriceRow = {
  name: string;
  price: number;
};

type EditorRow = {
  key: string;
  name: string;
  priceDigits: string;
  priceDisplay: string;
};

type AdminPrintPriceListProps = {
  productId: string;
  defaultRows?: PrintPriceRow[];
};

function createRow(row?: PrintPriceRow): EditorRow {
  const priceDigits = row?.price != null ? String(row.price) : "";
  return {
    key: crypto.randomUUID(),
    name: row?.name ?? "",
    priceDigits,
    priceDisplay: formatPriceInputValue(priceDigits),
  };
}

function serializeRows(rows: EditorRow[]) {
  return rows
    .map((row) => {
      const name = row.name.trim();
      const price = Number.parseInt(row.priceDigits, 10);
      if (!name) return null;
      if (!Number.isFinite(price) || price < 0) return null;
      return { name, price };
    })
    .filter((row): row is PrintPriceRow => row != null);
}

export function AdminPrintPriceList({
  productId,
  defaultRows = [],
}: Readonly<AdminPrintPriceListProps>) {
  const copy = adminConfig.printLists;
  const hiddenRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<EditorRow[]>(() =>
    defaultRows.length > 0 ? defaultRows.map((row) => createRow(row)) : [createRow()],
  );

  const syncHiddenValue = (nextRows: EditorRow[]) => {
    if (hiddenRef.current) {
      hiddenRef.current.value = JSON.stringify(serializeRows(nextRows));
    }
  };

  useEffect(() => {
    syncHiddenValue(rows);
  }, [rows]);

  useEffect(() => {
    const form = hiddenRef.current?.closest("form");
    if (!form) return;

    const syncBeforeSubmit = () => syncHiddenValue(rows);
    form.addEventListener("submit", syncBeforeSubmit);
    return () => form.removeEventListener("submit", syncBeforeSubmit);
  }, [rows]);

  function updateRow(key: string, patch: Partial<EditorRow>) {
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
      <ul className="space-y-3">
        {rows.map((row) => (
          <li
            key={row.key}
            className="grid gap-3 rounded-sm border border-primary/10 bg-surface/40 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-4"
          >
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.12em] text-muted">
                {copy.nameLabel}
              </span>
              <input
                type="text"
                value={row.name}
                onChange={(event) =>
                  updateRow(row.key, { name: event.target.value })
                }
                placeholder={copy.namePlaceholder}
                className="rounded-sm border border-primary/15 bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.12em] text-muted">
                {copy.valueLabel}
              </span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={row.priceDisplay}
                onChange={(event) => handlePriceChange(row.key, event.target.value)}
                placeholder={copy.valuePlaceholder}
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
              {copy.removeLabel}
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={addRow}
        className="rounded-full border border-dashed border-primary/25 px-4 py-2 text-xs uppercase tracking-[0.12em] text-primary transition-colors hover:border-primary/40 hover:bg-primary/5"
      >
        + {copy.addLabel}
      </button>

      <input
        ref={hiddenRef}
        type="hidden"
        name={`rows-${productId}`}
        defaultValue={JSON.stringify(serializeRows(rows))}
      />
    </div>
  );
}
