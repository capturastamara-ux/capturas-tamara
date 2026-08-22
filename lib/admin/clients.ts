import { toDayKey } from "@/lib/admin/availability";

type ReservationClientSource = {
  id: string;
  eventDate: Date;
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  eventTitle: string | null;
  location: string | null;
  status: "pending" | "confirmed" | "cancelled";
  amountPaid: number | null;
  amountRemaining: number | null;
  category: { title: string } | null;
  plan: { title: string } | null;
};

export type AdminClientRow = {
  key: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  reservationCount: number;
  lastEventDate: string;
  lastEventTitle: string | null;
  lastLocation: string | null;
  lastCategoryPlan: string | null;
  totalAmountPaid: number;
  totalAmountRemaining: number;
  latestReservationId: string;
};

function normalizeClientKey(phone: string, email: string | null, name: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length > 0) return `phone:${digits}`;
  if (email?.trim()) return `email:${email.trim().toLowerCase()}`;
  return `name:${name.trim().toLowerCase()}`;
}

export function aggregateAdminClients(
  reservations: ReservationClientSource[],
): AdminClientRow[] {
  const map = new Map<
    string,
    AdminClientRow & { lastEventDateValue: number }
  >();

  for (const reservation of reservations) {
    const key = normalizeClientKey(
      reservation.clientPhone,
      reservation.clientEmail,
      reservation.clientName,
    );
    const eventDateKey = toDayKey(reservation.eventDate);
    const eventDateValue = reservation.eventDate.getTime();
    const categoryPlan = [reservation.category?.title, reservation.plan?.title]
      .filter(Boolean)
      .join(" · ");
    const paid = reservation.status !== "cancelled" ? (reservation.amountPaid ?? 0) : 0;
    const remaining =
      reservation.status !== "cancelled" ? (reservation.amountRemaining ?? 0) : 0;

    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        key,
        clientName: reservation.clientName,
        clientPhone: reservation.clientPhone,
        clientEmail: reservation.clientEmail,
        reservationCount: 1,
        lastEventDate: eventDateKey,
        lastEventTitle: reservation.eventTitle,
        lastLocation: reservation.location,
        lastCategoryPlan: categoryPlan || null,
        totalAmountPaid: paid,
        totalAmountRemaining: remaining,
        latestReservationId: reservation.id,
        lastEventDateValue: eventDateValue,
      });
      continue;
    }

    existing.reservationCount += 1;
    existing.totalAmountPaid += paid;
    existing.totalAmountRemaining += remaining;

    if (eventDateValue >= existing.lastEventDateValue) {
      existing.clientName = reservation.clientName;
      existing.clientPhone = reservation.clientPhone;
      existing.clientEmail = reservation.clientEmail;
      existing.lastEventDate = eventDateKey;
      existing.lastEventTitle = reservation.eventTitle;
      existing.lastLocation = reservation.location;
      existing.lastCategoryPlan = categoryPlan || null;
      existing.latestReservationId = reservation.id;
      existing.lastEventDateValue = eventDateValue;
    }
  }

  return [...map.values()]
    .sort((a, b) => b.lastEventDateValue - a.lastEventDateValue)
    .map(({ lastEventDateValue: _ignored, ...row }) => row);
}
