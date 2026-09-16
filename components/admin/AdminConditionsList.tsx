"use client";

import { useEffect, useRef, useState } from "react";
import { adminConfig } from "@/config/admin";
import type { CatalogConditionItem } from "@/config/catalog";
import { cn } from "@/lib/cn";

type EditorRow = {
  key: string;
  title: string;
  body: string;
};

type AdminConditionsListProps = {
  defaultItems?: CatalogConditionItem[];
};

function createRow(item?: CatalogConditionItem): EditorRow {
  return {
    key: crypto.randomUUID(),
    title: item?.title ?? "",
    body: item?.body ?? "",
  };
}

function serializeItems(rows: EditorRow[]) {
  return rows
    .map((row) => {
      const title = row.title.trim();
      const body = row.body.trim();
      if (!title || !body) return null;
      return { title, body };
    })
    .filter((item): item is CatalogConditionItem => item != null);
}

export function AdminConditionsList({
  defaultItems = [],
}: Readonly<AdminConditionsListProps>) {
  const copy = adminConfig.conditions;
  const hiddenRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<EditorRow[]>(() =>
    defaultItems.length > 0 ? defaultItems.map((item) => createRow(item)) : [createRow()],
  );

  const syncHiddenValue = (nextRows: EditorRow[]) => {
    if (hiddenRef.current) {
      hiddenRef.current.value = JSON.stringify(serializeItems(nextRows));
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
            className="grid gap-3 rounded-sm border border-primary/10 bg-surface/40 p-3 sm:grid-cols-[1fr_auto] sm:items-start sm:p-4"
          >
            <div className="grid gap-3">
              <label className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.12em] text-muted">
                  {copy.titleLabel}
                </span>
                <input
                  type="text"
                  value={row.title}
                  onChange={(event) =>
                    updateRow(row.key, { title: event.target.value })
                  }
                  placeholder={copy.titlePlaceholder}
                  className="rounded-sm border border-primary/15 bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.12em] text-muted">
                  {copy.bodyLabel}
                </span>
                <textarea
                  value={row.body}
                  onChange={(event) =>
                    updateRow(row.key, { body: event.target.value })
                  }
                  placeholder={copy.bodyPlaceholder}
                  rows={4}
                  className="min-h-[6.5rem] resize-y rounded-sm border border-primary/15 bg-background px-3 py-2.5 text-sm leading-relaxed outline-none transition-colors focus:border-primary"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => removeRow(row.key)}
              className={cn(
                "rounded-full border border-primary/20 px-4 py-2 text-xs uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary/5",
                "sm:mt-7",
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
        name="conditions"
        defaultValue={JSON.stringify(serializeItems(rows))}
      />
    </div>
  );
}
