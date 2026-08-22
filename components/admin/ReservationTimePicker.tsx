"use client";

import { useMemo } from "react";
import { reservationConfig } from "@/config/reservations";
import {
  encodeTimeRange,
  findSlotOccupant,
  formatTimeRangeLabel,
  isAllDayAvailable,
  isRangeAvailable,
  listHourSlots,
  parseTimeRange,
  type OccupiedReservation,
  type TimeRange,
} from "@/lib/admin/time-slots";
import { cn } from "@/lib/cn";

type ReservationTimePickerProps = {
  occupied: readonly OccupiedReservation[];
  value: string | null;
  onChange: (value: string | null) => void;
};

function isSlotInRange(slotStart: number, slotEnd: number, range: TimeRange | null) {
  if (!range || range.kind === "all-day") return false;
  return slotStart < range.endMinutes && range.startMinutes < slotEnd;
}

export function ReservationTimePicker({
  occupied,
  value,
  onChange,
}: Readonly<ReservationTimePickerProps>) {
  const copy = reservationConfig.hours;
  const slots = useMemo(() => listHourSlots(), []);
  const selected = parseTimeRange(value);
  const selectedLabel = formatTimeRangeLabel(value);
  const allDayOpen = isAllDayAvailable(occupied);
  const stepMinutes = reservationConfig.hours.stepMinutes;
  const isSingleSlot =
    selected?.kind === "range" && selected.endMinutes - selected.startMinutes === stepMinutes;

  function selectAllDay() {
    if (!allDayOpen) return;
    onChange(encodeTimeRange({ kind: "all-day" }));
  }

  function selectSlot(startMinutes: number, endMinutes: number) {
    const clicked = slots.find((slot) => slot.startMinutes === startMinutes);
    if (!clicked || findSlotOccupant(clicked, occupied)) return;

    if (!selected || selected.kind === "all-day" || !isSingleSlot) {
      onChange(encodeTimeRange({ kind: "range", startMinutes, endMinutes }));
      return;
    }

    if (startMinutes === selected.startMinutes) return;

    const nextRange: TimeRange = {
      kind: "range",
      startMinutes: Math.min(selected.startMinutes, startMinutes),
      endMinutes: Math.max(selected.endMinutes, endMinutes),
    };

    if (!isRangeAvailable(nextRange, occupied)) {
      onChange(encodeTimeRange({ kind: "range", startMinutes, endMinutes }));
      return;
    }

    onChange(encodeTimeRange(nextRange));
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        disabled={!allDayOpen}
        onClick={selectAllDay}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-sm border px-4 py-3 text-left transition-all",
          selected?.kind === "all-day"
            ? "border-catalog-gold bg-catalog-gold text-catalog-ink shadow-sm"
            : allDayOpen
              ? "border-catalog/20 bg-catalog/5 hover:-translate-y-0.5 hover:border-catalog hover:bg-catalog/10"
              : "cursor-not-allowed border-primary/10 bg-surface text-muted",
        )}
      >
        <span>
          <span className="block text-xs uppercase tracking-[0.14em] opacity-80">
            {copy.allDayLabel}
          </span>
          <span className="mt-1 block text-sm">
            {allDayOpen ? copy.allDayHint : copy.allDayUnavailable}
          </span>
        </span>
        <span
          className={cn(
            "hidden rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.12em] sm:inline",
            selected?.kind === "all-day" ? "bg-catalog-ink/10" : "bg-background/80",
          )}
        >
          {copy.allDayLabel}
        </span>
      </button>

      <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.12em] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-catalog" aria-hidden />
          {copy.availableLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-catalog-gold" aria-hidden />
          {copy.selectedLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary/25" aria-hidden />
          {copy.occupiedLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {slots.map((slot) => {
          const occupant = findSlotOccupant(slot, occupied);
          const isSelected =
            selected?.kind === "all-day" ||
            isSlotInRange(slot.startMinutes, slot.endMinutes, selected);
          const disabled = Boolean(occupant);

          return (
            <button
              key={slot.clock}
              type="button"
              disabled={disabled}
              aria-pressed={isSelected}
              aria-label={`${slot.spoken}${occupant ? `, ${copy.occupiedLabel}: ${occupant.clientName}` : ""}`}
              onClick={() => selectSlot(slot.startMinutes, slot.endMinutes)}
              className={cn(
                "flex min-h-[4.25rem] flex-col items-start justify-between rounded-sm border px-3 py-2.5 text-left transition-all",
                disabled && "cursor-not-allowed border-primary/10 bg-surface text-muted",
                !disabled &&
                  !isSelected &&
                  "border-catalog/15 bg-background hover:-translate-y-0.5 hover:border-catalog hover:shadow-sm",
                isSelected &&
                  "border-catalog-gold bg-catalog-gold text-catalog-ink shadow-sm",
              )}
            >
              <span className="font-display text-xl italic leading-none">{slot.clock}</span>
              {occupant ? (
                <span className="mt-2 line-clamp-2 text-[11px] leading-snug">
                  {occupant.clientName}
                </span>
              ) : (
                <span className="mt-2 text-[10px] uppercase tracking-[0.12em] opacity-70">
                  {isSelected ? copy.selectedLabel : copy.availableLabel}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="rounded-sm border border-catalog/15 bg-catalog/5 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.14em] text-catalog-ink/70">
          {copy.selectedLabel}
        </p>
        <p className="mt-1 font-display text-2xl italic text-catalog-ink">
          {selectedLabel || copy.emptySelectionHint}
        </p>
      </div>
    </div>
  );
}

type DayHoursStripProps = {
  occupied: readonly OccupiedReservation[];
};

export function DayHoursStrip({ occupied }: Readonly<DayHoursStripProps>) {
  const slots = useMemo(() => listHourSlots(), []);

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.14em] text-muted">
        {reservationConfig.hours.stripTitle}
      </p>
      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {slots.map((slot) => {
          const occupant = findSlotOccupant(slot, occupied);
          return (
            <div
              key={slot.clock}
              title={occupant ? `${slot.clock} · ${occupant.clientName}` : `${slot.clock} disponible`}
              className={cn(
                "rounded-sm px-1 py-1.5 text-center text-[10px] tracking-wide",
                occupant
                  ? "bg-primary/10 text-muted"
                  : "bg-catalog/10 text-catalog-ink",
              )}
            >
              {slot.clock}
            </div>
          );
        })}
      </div>
    </div>
  );
}
