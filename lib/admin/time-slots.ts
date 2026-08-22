import { reservationConfig } from "@/config/reservations";

export type TimeRange =
  | { kind: "all-day" }
  | { kind: "range"; startMinutes: number; endMinutes: number };

export type HourSlot = {
  startMinutes: number;
  endMinutes: number;
  clock: string;
  endClock: string;
  spoken: string;
};

export type OccupiedReservation = {
  startTime: string | null;
  clientName: string;
};

function padHour(value: number) {
  return String(value).padStart(2, "0");
}

export function minutesToClock(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${padHour(hours)}:${padHour(rest)}`;
}

export function minutesToSpoken(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const period = hours >= 12 ? "p. m." : "a. m.";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return rest === 0 ? `${hour12}:00 ${period}` : `${hour12}:${padHour(rest)} ${period}`;
}

export function listHourSlots(): HourSlot[] {
  const { startHour, endHour, stepMinutes } = reservationConfig.hours;
  const slots: HourSlot[] = [];

  for (let startMinutes = startHour * 60; startMinutes < endHour * 60; startMinutes += stepMinutes) {
    const endMinutes = startMinutes + stepMinutes;
    slots.push({
      startMinutes,
      endMinutes,
      clock: minutesToClock(startMinutes),
      endClock: minutesToClock(endMinutes),
      spoken: minutesToSpoken(startMinutes),
    });
  }

  return slots;
}

export function encodeTimeRange(range: TimeRange) {
  if (range.kind === "all-day") {
    return reservationConfig.hours.allDayValue;
  }

  return `${minutesToClock(range.startMinutes)}-${minutesToClock(range.endMinutes)}`;
}

export function parseTimeRange(value: string | null | undefined): TimeRange | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (
    trimmed === reservationConfig.hours.allDayValue ||
    /^todo el d[ií]a$/i.test(trimmed)
  ) {
    return { kind: "all-day" };
  }

  const rangeMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*[-–—]\s*(\d{1,2}):(\d{2})$/);
  if (rangeMatch) {
    const startMinutes = Number(rangeMatch[1]) * 60 + Number(rangeMatch[2]);
    const endMinutes = Number(rangeMatch[3]) * 60 + Number(rangeMatch[4]);
    if (endMinutes <= startMinutes) return null;
    return { kind: "range", startMinutes, endMinutes };
  }

  const singleMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (singleMatch) {
    const startMinutes = Number(singleMatch[1]) * 60 + Number(singleMatch[2]);
    return {
      kind: "range",
      startMinutes,
      endMinutes: startMinutes + reservationConfig.hours.stepMinutes,
    };
  }

  return null;
}

export function formatTimeRangeLabel(value: string | null | undefined) {
  const range = parseTimeRange(value);
  if (!range) return "";
  if (range.kind === "all-day") return reservationConfig.hours.allDayLabel;
  return `${minutesToSpoken(range.startMinutes)} – ${minutesToSpoken(range.endMinutes)}`;
}

export function rangesOverlap(left: TimeRange, right: TimeRange) {
  if (left.kind === "all-day" || right.kind === "all-day") return true;
  return left.startMinutes < right.endMinutes && right.startMinutes < left.endMinutes;
}

export function resolveOccupiedRange(startTime: string | null | undefined): TimeRange {
  return parseTimeRange(startTime) ?? { kind: "all-day" };
}

export function findSlotOccupant(slot: HourSlot, occupied: readonly OccupiedReservation[]) {
  const slotRange: TimeRange = {
    kind: "range",
    startMinutes: slot.startMinutes,
    endMinutes: slot.endMinutes,
  };

  return (
    occupied.find((item) => rangesOverlap(slotRange, resolveOccupiedRange(item.startTime))) ??
    null
  );
}

export function isRangeAvailable(range: TimeRange, occupied: readonly OccupiedReservation[]) {
  return occupied.every((item) => !rangesOverlap(range, resolveOccupiedRange(item.startTime)));
}

export function isDayFullyBooked(occupied: readonly OccupiedReservation[]) {
  if (occupied.length === 0) return false;
  if (occupied.some((item) => resolveOccupiedRange(item.startTime).kind === "all-day")) {
    return true;
  }

  return listHourSlots().every((slot) => findSlotOccupant(slot, occupied));
}

export function isAllDayAvailable(occupied: readonly OccupiedReservation[]) {
  return occupied.length === 0;
}
