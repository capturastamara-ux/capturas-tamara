"use client";

import type { AdminClientRow } from "@/lib/admin/clients";
import { downloadClientsExcel } from "@/lib/admin/export-clients";

type ExportClientsButtonProps = {
  clients: AdminClientRow[];
};

export function ExportClientsButton({ clients }: Readonly<ExportClientsButtonProps>) {
  return (
    <button
      type="button"
      disabled={clients.length === 0}
      onClick={() => downloadClientsExcel(clients)}
      className="inline-flex shrink-0 rounded-full border border-primary/20 px-4 py-2 text-xs uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40"
    >
      Exportar a Excel
    </button>
  );
}
