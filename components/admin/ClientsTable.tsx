import { formatDayLabel } from "@/lib/admin/availability";
import type { AdminClientRow } from "@/lib/admin/clients";
import { formatPlanPrice } from "@/lib/format/price";

type ClientsTableProps = {
  clients: AdminClientRow[];
};

export function ClientsTable({ clients }: Readonly<ClientsTableProps>) {
  if (clients.length === 0) {
    return (
      <div className="rounded-sm border border-primary/10 bg-background px-5 py-10 text-center">
        <p className="text-sm text-muted">Aún no hay clientes registrados en reservas.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-primary/10 bg-background">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-primary/10 text-xs uppercase tracking-[0.12em] text-muted">
          <tr>
            <th className="px-4 py-3 font-normal">Cliente</th>
            <th className="px-4 py-3 font-normal">Reservas</th>
            <th className="hidden px-4 py-3 font-normal md:table-cell">Último evento</th>
            <th className="hidden px-4 py-3 font-normal lg:table-cell">Categoría / Plan</th>
            <th className="hidden px-4 py-3 font-normal sm:table-cell">Abonado</th>
            <th className="hidden px-4 py-3 font-normal sm:table-cell">Restante</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => {
            const lastEventLabel = client.lastEventTitle || "Sin título";
            const paidLabel = formatPlanPrice(client.totalAmountPaid) ?? "—";
            const remainingLabel = formatPlanPrice(client.totalAmountRemaining) ?? "—";

            return (
              <tr
                key={client.key}
                className="border-b border-primary/5 last:border-0"
              >
                <td className="px-4 py-4 align-top">
                  <p className="font-medium">{client.clientName}</p>
                  <p className="mt-1 text-xs text-muted">{client.clientPhone}</p>
                  {client.clientEmail && (
                    <p className="mt-1 text-xs text-muted">{client.clientEmail}</p>
                  )}
                  {client.lastLocation && (
                    <p className="mt-1 text-xs text-muted">{client.lastLocation}</p>
                  )}
                </td>
                <td className="px-4 py-4 align-top tabular-nums">{client.reservationCount}</td>
                <td className="hidden px-4 py-4 align-top md:table-cell">
                  <p className="capitalize">{formatDayLabel(client.lastEventDate)}</p>
                  <p className="mt-1 text-xs text-muted">{lastEventLabel}</p>
                </td>
                <td className="hidden px-4 py-4 align-top text-muted lg:table-cell">
                  {client.lastCategoryPlan || "—"}
                </td>
                <td className="hidden px-4 py-4 align-top sm:table-cell">{paidLabel}</td>
                <td className="hidden px-4 py-4 align-top sm:table-cell">{remainingLabel}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
