import Link from "next/link";
import {
  formatReservationDate,
  formatReservationDateShort,
  ReservationStatusBadge,
} from "@/lib/admin/reservations";
import { formatTimeRangeLabel } from "@/lib/admin/time-slots";

type ReservationRow = {
  id: string;
  eventDate: Date;
  startTime: string | null;
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  eventTitle: string | null;
  location: string | null;
  status: "pending" | "confirmed" | "cancelled";
  category: { id: string; title: string } | null;
  plan: { id: string; title: string } | null;
};

type ReservationsTableProps = {
  reservations: ReservationRow[];
  variant: "upcoming" | "past";
};

export function ReservationsTable({ reservations, variant }: Readonly<ReservationsTableProps>) {
  const isUpcoming = variant === "upcoming";

  return (
    <div className="overflow-hidden rounded-sm border border-primary/10 bg-background">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-primary/10 text-xs uppercase tracking-[0.12em] text-muted">
          <tr>
            <th className="px-4 py-3 font-normal">Fecha</th>
            {isUpcoming && (
              <th className="hidden px-4 py-3 font-normal sm:table-cell">Hora</th>
            )}
            <th className="px-4 py-3 font-normal">Evento</th>
            <th className="hidden px-4 py-3 font-normal md:table-cell">Cliente</th>
            {isUpcoming && (
              <th className="hidden px-4 py-3 font-normal lg:table-cell">Categoría / Plan</th>
            )}
            <th className="px-4 py-3 font-normal">Estado</th>
            <th className="px-4 py-3 font-normal">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation) => {
            const title = reservation.eventTitle || reservation.clientName;
            const categoryPlan = [reservation.category?.title, reservation.plan?.title]
              .filter(Boolean)
              .join(" · ");

            return (
              <tr
                key={reservation.id}
                className="border-b border-primary/5 last:border-0"
              >
                <td className="px-4 py-4 align-top text-muted">
                  {isUpcoming
                    ? formatReservationDate(reservation.eventDate)
                    : formatReservationDateShort(reservation.eventDate)}
                  {isUpcoming && reservation.startTime && (
                    <p className="mt-1 sm:hidden">
                      {formatTimeRangeLabel(reservation.startTime) || reservation.startTime}
                    </p>
                  )}
                </td>
                {isUpcoming && (
                  <td className="hidden px-4 py-4 align-top sm:table-cell">
                    {formatTimeRangeLabel(reservation.startTime) ||
                      reservation.startTime ||
                      "—"}
                  </td>
                )}
                <td className="px-4 py-4 align-top">
                  <Link
                    href={`/admin/reservas/${reservation.id}`}
                    className="font-medium hover:opacity-70"
                  >
                    {title}
                  </Link>
                  {reservation.location && (
                    <p className="mt-1 text-xs text-muted">{reservation.location}</p>
                  )}
                  <p className="mt-1 text-xs text-muted md:hidden">
                    {reservation.clientName}
                    {reservation.clientPhone ? ` · ${reservation.clientPhone}` : ""}
                  </p>
                  {isUpcoming && categoryPlan && (
                    <p className="mt-1 text-xs uppercase tracking-[0.1em] text-muted lg:hidden">
                      {categoryPlan}
                    </p>
                  )}
                </td>
                <td className="hidden px-4 py-4 align-top md:table-cell">
                  <p>{reservation.clientName}</p>
                  <p className="mt-1 text-xs text-muted">{reservation.clientPhone}</p>
                  {reservation.clientEmail && (
                    <p className="mt-1 text-xs text-muted">{reservation.clientEmail}</p>
                  )}
                </td>
                {isUpcoming && (
                  <td className="hidden px-4 py-4 align-top text-muted lg:table-cell">
                    {categoryPlan || "—"}
                  </td>
                )}
                <td className="px-4 py-4 align-top">
                  <ReservationStatusBadge status={reservation.status} />
                </td>
                <td className="px-4 py-4 align-top">
                  <Link
                    href={`/admin/reservas/${reservation.id}`}
                    className="text-xs uppercase tracking-[0.1em] text-primary hover:opacity-70"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
