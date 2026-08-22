const statusLabels = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
} as const;

type ReservationStatus = keyof typeof statusLabels;

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  const styles = {
    pending: "bg-amber-500/15 text-amber-800",
    confirmed: "bg-primary/10 text-primary",
    cancelled: "bg-accent/10 text-accent",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${styles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

export function formatReservationDate(date: Date) {
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatReservationDateShort(date: Date) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function getReservationDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function formatReservationMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("es-CO", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function getTodayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function groupReservationsByMonth<T extends { eventDate: Date }>(items: T[]) {
  const groups = new Map<string, T[]>();

  items.forEach((item) => {
    const key = formatReservationMonthLabel(item.eventDate);
    const current = groups.get(key) ?? [];
    current.push(item);
    groups.set(key, current);
  });

  return Array.from(groups.entries());
}
