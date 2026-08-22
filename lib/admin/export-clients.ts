import { formatDayLabel } from "@/lib/admin/availability";
import type { AdminClientRow } from "@/lib/admin/clients";

function escapeCsvCell(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

function formatExportDate(dayKey: string) {
  return formatDayLabel(dayKey);
}

export function buildClientsExportCsv(clients: AdminClientRow[]) {
  const headers = [
    "Nombre",
    "Teléfono",
    "Correo",
    "Ubicación",
    "Reservas",
    "Último evento (fecha)",
    "Último evento (título)",
    "Categoría / Plan",
    "Total abonado (COP)",
    "Total restante (COP)",
  ];

  const rows = clients.map((client) => [
    client.clientName,
    client.clientPhone,
    client.clientEmail ?? "",
    client.lastLocation ?? "",
    String(client.reservationCount),
    formatExportDate(client.lastEventDate),
    client.lastEventTitle ?? "",
    client.lastCategoryPlan ?? "",
    String(client.totalAmountPaid),
    String(client.totalAmountRemaining),
  ]);

  return [headers, ...rows]
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))
    .join("\r\n");
}

export function downloadClientsExcel(clients: AdminClientRow[]) {
  const csv = buildClientsExportCsv(clients);
  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);

  anchor.href = url;
  anchor.download = `clientes-capturastamara-${stamp}.csv`;
  anchor.click();

  URL.revokeObjectURL(url);
}
