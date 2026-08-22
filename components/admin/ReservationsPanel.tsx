"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toggleDayAvailabilityAction } from "@/app/admin/actions";
import { ClientsTable } from "@/components/admin/ClientsTable";
import { ExportClientsButton } from "@/components/admin/ExportClientsButton";
import { NewReservationModal } from "@/components/admin/NewReservationModal";
import { DayHoursStrip } from "@/components/admin/ReservationTimePicker";
import { PrintReservationContractButton } from "@/components/admin/PrintReservationContractButton";
import {
  type ReservationCategoryOption,
  type ReservationPlanOption,
  type ReservationSubcategoryOption,
} from "@/components/admin/ReservationFormFields";
import { getCategoryColor, reservationConfig } from "@/config/reservations";
import {
  formatCalendarMonthLabel,
  formatDayLabel,
  getAvailabilityLabel,
  getCalendarDays,
  isPastDayKey,
  parseDayKey,
  resolveDayAvailability,
  toDayKey,
} from "@/lib/admin/availability";
import { ReservationStatusBadge } from "@/lib/admin/reservations";
import { formatTimeRangeLabel, isDayFullyBooked } from "@/lib/admin/time-slots";
import type { AdminClientRow } from "@/lib/admin/clients";
import { cn } from "@/lib/cn";

export type CalendarReservation = {
  id: string;
  eventDate: string;
  startTime: string | null;
  clientName: string;
  eventTitle: string | null;
  status: "pending" | "confirmed" | "cancelled";
  category: { id: string; title: string; slug: string } | null;
};

export type CalendarCategory = {
  id: string;
  title: string;
  slug: string;
};

type AvailabilityOverride = {
  date: string;
  isOpen: boolean;
  note: string | null;
};

type ReservationsPanelProps = {
  reservations: CalendarReservation[];
  overrides: AvailabilityOverride[];
  categories: CalendarCategory[];
  categoryOptions: ReservationCategoryOption[];
  subcategoryOptions: ReservationSubcategoryOption[];
  planOptions: ReservationPlanOption[];
  clients: AdminClientRow[];
  initialNewReservationDate?: string;
};

type CalendarTabId = "reservas" | "parametrizacion";
type TabId = CalendarTabId | "clientes";

const calendarTabs: Array<{ id: CalendarTabId; label: string }> = [
  { id: "reservas", label: "Reservas" },
  { id: "parametrizacion", label: "Parametrización" },
];

function getTodayKey() {
  const now = new Date();
  return toDayKey(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())));
}

export function ReservationsPanel({
  reservations,
  overrides,
  categories,
  categoryOptions,
  subcategoryOptions,
  planOptions,
  clients,
  initialNewReservationDate,
}: Readonly<ReservationsPanelProps>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [reservationModalOpen, setReservationModalOpen] = useState(false);
  const [reservationModalDate, setReservationModalDate] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const todayKey = getTodayKey();
  const initialMonth = useMemo(() => {
    const now = new Date();
    return { year: now.getUTCFullYear(), month: now.getUTCMonth() };
  }, []);

  const [activeTab, setActiveTab] = useState<TabId>("reservas");
  const [viewYear, setViewYear] = useState(initialMonth.year);
  const [viewMonth, setViewMonth] = useState(initialMonth.month);
  const [selectedDay, setSelectedDay] = useState<string | null>(todayKey);

  const overrideMap = useMemo(
    () => new Map(overrides.map((item) => [item.date, item.isOpen])),
    [overrides],
  );

  const reservationsByDay = useMemo(() => {
    const map = new Map<string, CalendarReservation[]>();
    reservations.forEach((reservation) => {
      const current = map.get(reservation.eventDate) ?? [];
      current.push(reservation);
      map.set(reservation.eventDate, current);
    });
    return map;
  }, [reservations]);

  const calendarDays = useMemo(
    () => getCalendarDays(viewYear, viewMonth),
    [viewMonth, viewYear],
  );

  const selectedAvailability = selectedDay
    ? resolveDayAvailability(parseDayKey(selectedDay), overrideMap)
    : null;
  const selectedReservations = selectedDay ? (reservationsByDay.get(selectedDay) ?? []) : [];
  const selectedIsPast = selectedDay ? isPastDayKey(selectedDay, todayKey) : false;

  useEffect(() => {
    if (!initialNewReservationDate) return;
    setReservationModalDate(initialNewReservationDate);
    setReservationModalOpen(true);
  }, [initialNewReservationDate]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(null), 6000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  function openReservationModal(date: string) {
    setReservationModalDate(date);
    setReservationModalOpen(true);
  }

  function closeReservationModal() {
    setReservationModalOpen(false);
    if (initialNewReservationDate) {
      router.replace("/admin/reservas");
    }
  }

  function shiftMonth(delta: number) {
    const next = new Date(Date.UTC(viewYear, viewMonth + delta, 1));
    setViewYear(next.getUTCFullYear());
    setViewMonth(next.getUTCMonth());
  }

  function handleDayClick(dayKey: string, hasReservation: boolean, isOpen: boolean) {
    const isPast = isPastDayKey(dayKey, todayKey);
    if (isPast && !(activeTab === "reservas" && hasReservation)) return;
    setSelectedDay(dayKey);
    if (activeTab === "reservas" && isOpen && !isPast) {
      openReservationModal(dayKey);
    }
  }

  function handleToggleAvailability() {
    if (!selectedDay) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("date", selectedDay);
      await toggleDayAvailabilityAction(formData);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Agenda</p>
          <h1 className="mt-1 font-display text-2xl italic sm:text-3xl">Reservas</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Consulta la disponibilidad en el calendario y gestiona excepciones de días abiertos o
            cerrados.
          </p>
        </div>

        <div className="flex w-full shrink-0 flex-wrap items-center gap-2 lg:w-auto lg:min-w-[22rem] lg:pt-5">
          {calendarTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-full px-4 py-2 text-xs uppercase tracking-[0.12em] transition-colors",
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "border border-primary/20 text-primary hover:bg-primary/5",
              )}
            >
              {tab.label}
            </button>
          ))}
          <span className="hidden min-w-4 flex-1 lg:block" aria-hidden />
          <button
            type="button"
            onClick={() => setActiveTab("clientes")}
            className={cn(
              "rounded-full px-4 py-2 text-xs uppercase tracking-[0.12em] transition-colors",
              activeTab === "clientes"
                ? "bg-primary text-white"
                : "border border-primary/20 text-primary hover:bg-primary/5",
            )}
          >
            Clientes
          </button>
        </div>
      </div>

      {successMessage && (
        <p className="rounded-sm border border-green-600/30 bg-green-600/10 px-3 py-2 text-sm text-green-900">
          {successMessage}
        </p>
      )}

      {activeTab === "reservas" && categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-sm border border-primary/10 bg-background px-3 py-2">
          <span className="text-xs uppercase tracking-[0.12em] text-muted">Categorías</span>
          {categories.map((category, index) => {
            const color = getCategoryColor(category.slug, index);
            return (
              <span key={category.id} className="inline-flex items-center gap-2 text-sm">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: color.bg }}
                  aria-hidden
                />
                {category.title}
              </span>
            );
          })}
          <span className="inline-flex items-center gap-2 text-sm text-muted">
            <span
              className="h-3 w-3 rounded-full"
              style={{
                backgroundColor: reservationConfig.calendarStatusColors.open.indicator,
              }}
              aria-hidden
            />
            Disponible
          </span>
          <span className="inline-flex items-center gap-2 text-sm text-muted">
            <span
              className="h-3 w-3 rounded-full"
              style={{
                backgroundColor: reservationConfig.calendarStatusColors.closed.indicator,
              }}
              aria-hidden
            />
            Cerrado
          </span>
        </div>
      )}

      {activeTab === "parametrizacion" && (
        <p className="rounded-sm border border-primary/10 bg-background px-3 py-2 text-sm text-muted">
          Por defecto solo se trabaja <strong>viernes y sábado</strong>. Selecciona un día y
          usa el botón del panel para activarlo o desactivarlo como excepción.
        </p>
      )}

      {activeTab === "clientes" ? (
        <section className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">
              Listado de clientes agrupados por teléfono con el historial de reservas registradas.
            </p>
            <ExportClientsButton clients={clients} />
          </div>
          <ClientsTable clients={clients} />
        </section>
      ) : (
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="rounded-sm border border-primary/10 bg-background p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="rounded-full border border-primary/15 px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary/5"
              aria-label="Mes anterior"
            >
              ←
            </button>
            <h2 className="font-display text-2xl italic capitalize">
              {formatCalendarMonthLabel(viewYear, viewMonth)}
            </h2>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="rounded-full border border-primary/15 px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary/5"
              aria-label="Mes siguiente"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {reservationConfig.weekdayLabels.map((label, index) => (
              <div
                key={label}
                className="py-1.5 text-center text-[10px] uppercase tracking-[0.14em] text-muted sm:py-2 sm:text-xs"
              >
                <span className="sm:hidden">{reservationConfig.weekdayLabelsShort[index]}</span>
                <span className="hidden sm:inline">{label}</span>
              </div>
            ))}

            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="min-h-11 sm:min-h-20" aria-hidden />;
              }

              const dayKey = toDayKey(date);
              const availability = resolveDayAvailability(date, overrideMap);
              const dayReservations = reservationsByDay.get(dayKey) ?? [];
              const isSelected = selectedDay === dayKey;
              const isToday = dayKey === todayKey;
              const isPast = isPastDayKey(dayKey, todayKey);
              const primaryReservation = dayReservations[0];
              const categoryColor = primaryReservation?.category
                ? getCategoryColor(
                    primaryReservation.category.slug,
                    categories.findIndex((item) => item.id === primaryReservation.category?.id),
                  )
                : null;

              const isReserved = dayReservations.length > 0;
              const canSelectDay =
                !isPast || (activeTab === "reservas" && isReserved);
              const isPastLocked = isPast && !canSelectDay;
              const showReservedStyle = activeTab === "reservas" && isReserved && categoryColor;
              const showOpenStyle =
                activeTab === "reservas" && availability.isOpen && !isReserved;
              const showClosedStyle =
                activeTab === "reservas" && !availability.isOpen && !isReserved;

              const statusLabel =
                activeTab === "reservas"
                  ? isReserved
                    ? primaryReservation?.category?.title ?? "Reservado"
                    : availability.isOpen
                      ? "Disponible"
                      : "Cerrado"
                  : availability.isOpen
                    ? "Abierto"
                    : "Cerrado";

              const mobileIndicatorColor = showReservedStyle
                ? categoryColor.bg
                : showClosedStyle ||
                    (activeTab === "parametrizacion" && !availability.isOpen)
                  ? reservationConfig.calendarStatusColors.closed.indicator
                  : reservationConfig.calendarStatusColors.open.indicator;

              return (
                <button
                  key={dayKey}
                  type="button"
                  disabled={isPending || !canSelectDay}
                  onClick={() => handleDayClick(dayKey, isReserved, availability.isOpen)}
                  className={cn(
                    "relative flex min-h-11 flex-col rounded-sm border p-1 text-left transition-all sm:min-h-20 sm:p-2",
                    canSelectDay &&
                      "hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                    isPastLocked && "cursor-not-allowed opacity-45",
                    isSelected && canSelectDay && "ring-2 ring-primary ring-offset-1 sm:ring-offset-2",
                    isToday && !isSelected && !isPastLocked && "ring-1 ring-primary/30",
                    showClosedStyle && "border-primary/10 bg-surface/80 text-muted",
                    showOpenStyle && "border-emerald-600/20 bg-background",
                    showReservedStyle && "border-transparent text-white",
                    activeTab === "parametrizacion" &&
                      availability.isOpen &&
                      "border-emerald-600/20 bg-background",
                    activeTab === "parametrizacion" &&
                      !availability.isOpen &&
                      "border-primary/10 bg-surface text-muted",
                    availability.hasOverride &&
                      activeTab === "parametrizacion" &&
                      "ring-1 ring-accent/40",
                  )}
                  style={
                    showReservedStyle
                      ? { backgroundColor: categoryColor.bg, color: categoryColor.text }
                      : undefined
                  }
                  aria-pressed={isSelected && canSelectDay}
                  aria-disabled={!canSelectDay}
                  aria-label={`${date.getUTCDate()} ${formatCalendarMonthLabel(viewYear, viewMonth)}, ${statusLabel}${isPastLocked ? ", pasado" : ""}`}
                >
                  <span className="text-xs font-medium sm:text-sm">{date.getUTCDate()}</span>

                  {(activeTab === "reservas" || activeTab === "parametrizacion") && (
                    <span className="mt-auto flex items-center justify-center gap-1 sm:justify-start">
                      {!showReservedStyle && (
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: mobileIndicatorColor }}
                          aria-hidden
                        />
                      )}
                      <span className="hidden text-[10px] uppercase tracking-[0.1em] opacity-80 sm:inline">
                        {statusLabel}
                      </span>
                    </span>
                  )}

                  {dayReservations.length > 1 && (
                    <span className="absolute right-0.5 top-0.5 rounded-full bg-white/90 px-1 py-0.5 text-[8px] font-medium text-primary sm:right-1.5 sm:top-1.5 sm:px-1.5 sm:text-[9px]">
                      +{dayReservations.length - 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <aside className="rounded-sm border border-primary/10 bg-background p-5">
          {!selectedDay || !selectedAvailability ? (
            <p className="text-sm text-muted">Selecciona un día del calendario.</p>
          ) : (
            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted">Día seleccionado</p>
                <h3 className="mt-2 font-display text-2xl italic capitalize">
                  {formatDayLabel(selectedDay)}
                </h3>
                <p className="mt-2 text-sm text-muted">
                  {getAvailabilityLabel(
                    selectedAvailability.isOpen,
                    selectedAvailability.hasOverride,
                    selectedAvailability.isDefaultOpen,
                  )}
                </p>
              </div>

              {activeTab === "reservas" && (
                <>
                  {selectedAvailability.isOpen && (
                    <DayHoursStrip occupied={selectedReservations} />
                  )}

                  {selectedReservations.length === 0 ? (
                    <div className="rounded-sm border border-primary/10 bg-surface px-4 py-5">
                      <p className="font-medium">
                        {selectedAvailability.isOpen ? "Disponible" : "Día cerrado"}
                      </p>
                      <p className="mt-2 text-sm text-muted">
                        {selectedAvailability.isOpen
                          ? "No hay reservas registradas para esta fecha."
                          : "Este día no está disponible para eventos."}
                      </p>
                      {selectedAvailability.isOpen && !selectedIsPast && (
                        <button
                          type="button"
                          onClick={() => openReservationModal(selectedDay)}
                          className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-xs uppercase tracking-[0.12em] text-white transition-transform hover:-translate-y-0.5"
                        >
                          Nueva reserva
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedReservations.map((reservation) => (
                        <div
                          key={reservation.id}
                          className="rounded-sm border border-primary/10 px-4 py-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium">
                                {reservation.eventTitle || reservation.clientName}
                              </p>
                              <p className="mt-1 text-sm text-muted">{reservation.clientName}</p>
                              <p className="mt-1 text-sm text-muted">
                                {formatTimeRangeLabel(reservation.startTime) ||
                                  reservation.startTime ||
                                  reservationConfig.hours.allDayLabel}
                              </p>
                              {reservation.category && (
                                <p className="mt-2 text-xs uppercase tracking-[0.12em] text-muted">
                                  {reservation.category.title}
                                </p>
                              )}
                            </div>
                            <ReservationStatusBadge status={reservation.status} />
                          </div>
                          <div className="mt-3 flex flex-col items-start gap-2">
                            <Link
                              href={`/admin/reservas/${reservation.id}`}
                              className="inline-flex text-xs uppercase tracking-[0.1em] text-primary hover:opacity-70"
                            >
                              Editar reserva
                            </Link>
                            <PrintReservationContractButton
                              reservationId={reservation.id}
                              variant="link"
                            />
                          </div>
                        </div>
                      ))}
                      {selectedAvailability.isOpen &&
                        !selectedIsPast &&
                        !isDayFullyBooked(selectedReservations) && (
                        <button
                          type="button"
                          onClick={() => openReservationModal(selectedDay)}
                          className="inline-flex rounded-full bg-primary px-4 py-2 text-xs uppercase tracking-[0.12em] text-white transition-transform hover:-translate-y-0.5"
                        >
                          Nueva reserva
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}

              {activeTab === "parametrizacion" && (
                <div className="rounded-sm border border-primary/10 bg-surface px-4 py-5">
                  <p className="font-medium">
                    {selectedAvailability.isOpen ? "Día abierto" : "Día cerrado"}
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    {selectedAvailability.isOpen
                      ? "Este día está disponible."
                      : selectedAvailability.hasOverride
                        ? "Este día fue cerrado como excepción."
                        : "Este día está cerrado."}
                  </p>
                  {selectedAvailability.hasOverride && (
                    <p className="mt-3 text-xs uppercase tracking-[0.12em] text-accent">
                      Excepción activa
                    </p>
                  )}
                  <button
                    type="button"
                    disabled={isPending || selectedIsPast}
                    onClick={handleToggleAvailability}
                    className={cn(
                      "mt-4 inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-xs uppercase tracking-[0.12em] transition-transform hover:-translate-y-0.5 disabled:opacity-60",
                      selectedAvailability.isOpen
                        ? "border border-accent/30 bg-background text-accent"
                        : "bg-primary text-white",
                    )}
                  >
                    {isPending
                      ? "Guardando…"
                      : selectedAvailability.isOpen
                        ? "Desactivar fecha"
                        : "Activar fecha"}
                  </button>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
      )}

      <NewReservationModal
        open={reservationModalOpen}
        eventDate={reservationModalDate}
        dayReservations={
          reservationModalDate ? (reservationsByDay.get(reservationModalDate) ?? []) : []
        }
        categories={categoryOptions}
        subcategories={subcategoryOptions}
        plans={planOptions}
        onClose={closeReservationModal}
        onSuccess={setSuccessMessage}
      />
    </div>
  );
}
