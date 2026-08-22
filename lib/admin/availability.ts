import { reservationConfig } from "@/config/reservations";

export function toDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function isPastDayKey(dayKey: string, todayKey: string) {
  return dayKey < todayKey;
}

export function parseDayKey(key: string) {
  return new Date(`${key}T12:00:00.000Z`);
}

export function isDefaultOpenDay(date: Date) {
  return (reservationConfig.defaultOpenWeekdays as readonly number[]).includes(
    date.getUTCDay(),
  );
}

export function resolveDayAvailability(
  date: Date,
  overrides: ReadonlyMap<string, boolean>,
) {
  const key = toDayKey(date);
  const override = overrides.get(key);
  const isOpen = override ?? isDefaultOpenDay(date);
  const hasOverride = override !== undefined;

  return { key, isOpen, hasOverride, isDefaultOpen: isDefaultOpenDay(date) };
}

export function getCalendarDays(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1, 12));
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  // Encabezados del calendario empiezan en domingo (0 = dom … 6 = sáb).
  const startPad = first.getUTCDay();
  const days: Array<Date | null> = Array.from({ length: startPad }, () => null);

  for (let day = 1; day <= lastDay; day += 1) {
    days.push(new Date(Date.UTC(year, month, day, 12)));
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

export function formatCalendarMonthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat("es-CO", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month, 1)));
}

export function formatDayLabel(key: string) {
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parseDayKey(key));
}

export function getAvailabilityLabel(
  isOpen: boolean,
  hasOverride: boolean,
  isDefaultOpen: boolean,
) {
  if (hasOverride) {
    return isOpen ? "Abierto (excepción)" : "Cerrado (excepción)";
  }

  if (isDefaultOpen) {
    return "Abierto";
  }

  return "Cerrado";
}

export function getNextAvailabilityState(
  isOpen: boolean,
  hasOverride: boolean,
  isDefaultOpen: boolean,
) {
  const nextOpen = !isOpen;

  if (nextOpen === isDefaultOpen) {
    return { isOpen: nextOpen, clearOverride: true };
  }

  return { isOpen: nextOpen, clearOverride: false };
}
