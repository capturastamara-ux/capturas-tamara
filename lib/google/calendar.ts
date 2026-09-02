import { google } from "googleapis";
import { reservationConfig } from "@/config/reservations";
import { minutesToClock, parseTimeRange } from "@/lib/admin/time-slots";
import { richTextToPlainText } from "@/lib/sanitize-rich-text";

export type CalendarReservationInput = {
  eventDate: Date;
  startTime: string | null;
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  location: string | null;
  notes: string | null;
  status: "pending" | "confirmed" | "cancelled";
  categoryTitle?: string | null;
  planTitle?: string | null;
};

export type CalendarSyncResult =
  | { status: "skipped" }
  | { status: "ok"; eventId: string | null }
  | { status: "error"; error: string };

function getCalendarAuth() {
  const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim();
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();

  if (!calendarId || !clientEmail || !privateKey) {
    return null;
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  return {
    calendarId,
    calendar: google.calendar({ version: "v3", auth }),
  };
}

export function isGoogleCalendarConfigured() {
  return getCalendarAuth() !== null;
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function nextDateKey(dateKey: string) {
  const next = new Date(`${dateKey}T12:00:00.000Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString().slice(0, 10);
}

function buildEventTimes(eventDate: Date, startTime: string | null) {
  const dateKey = toDateKey(eventDate);
  const range = parseTimeRange(startTime);
  const timeZone = reservationConfig.calendar.timezone;

  if (!range || range.kind === "all-day") {
    return {
      start: { date: dateKey },
      end: { date: nextDateKey(dateKey) },
    };
  }

  return {
    start: {
      dateTime: `${dateKey}T${minutesToClock(range.startMinutes)}:00`,
      timeZone,
    },
    end: {
      dateTime:
        range.endMinutes >= 24 * 60
          ? `${nextDateKey(dateKey)}T00:00:00`
          : `${dateKey}T${minutesToClock(range.endMinutes)}:00`,
      timeZone,
    },
  };
}

function buildEventBody(input: CalendarReservationInput) {
  const planTitle = input.planTitle?.trim() || "";
  const notes = input.notes ? richTextToPlainText(input.notes) : "";
  const lines = [
    input.categoryTitle ? `Categoría: ${input.categoryTitle}` : null,
    planTitle ? `Plan: ${planTitle}` : null,
    `Cliente: ${input.clientName}`,
    `Teléfono: ${input.clientPhone}`,
    input.clientEmail ? `Correo: ${input.clientEmail}` : null,
    notes ? `Notas: ${notes}` : null,
  ].filter((line): line is string => Boolean(line));

  return {
    summary: reservationConfig.calendar.eventTitle(input.clientName, planTitle || "—"),
    description: lines.join("\n"),
    location: input.location ?? undefined,
    ...buildEventTimes(input.eventDate, input.startTime),
  };
}

async function deleteEvent(eventId: string) {
  const client = getCalendarAuth();
  if (!client) return { status: "skipped" } as const;

  try {
    await client.calendar.events.delete({
      calendarId: client.calendarId,
      eventId,
    });
    return { status: "ok", eventId: null } as const;
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo borrar el evento.";
    if (message.includes("404") || message.includes("Not Found")) {
      return { status: "ok", eventId: null } as const;
    }
    return { status: "error", error: message } as const;
  }
}

export async function syncReservationToGoogleCalendar(
  input: CalendarReservationInput,
  existingEventId?: string | null,
): Promise<CalendarSyncResult> {
  const client = getCalendarAuth();
  if (!client) return { status: "skipped" };

  if (input.status === "cancelled") {
    if (!existingEventId) return { status: "ok", eventId: null };
    return deleteEvent(existingEventId);
  }

  const body = buildEventBody(input);

  try {
    if (existingEventId) {
      const updated = await client.calendar.events.update({
        calendarId: client.calendarId,
        eventId: existingEventId,
        requestBody: body,
      });
      return { status: "ok", eventId: updated.data.id ?? existingEventId };
    }

    const created = await client.calendar.events.insert({
      calendarId: client.calendarId,
      requestBody: body,
    });

    if (!created.data.id) {
      return { status: "error", error: "Google Calendar no devolvió un ID de evento." };
    }

    return { status: "ok", eventId: created.data.id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo sincronizar con Google Calendar.";

    if (existingEventId && (message.includes("404") || message.includes("Not Found"))) {
      try {
        const created = await client.calendar.events.insert({
          calendarId: client.calendarId,
          requestBody: body,
        });
        return { status: "ok", eventId: created.data.id ?? null };
      } catch (retryError) {
        return {
          status: "error",
          error:
            retryError instanceof Error
              ? retryError.message
              : "No se pudo recrear el evento en Google Calendar.",
        };
      }
    }

    return { status: "error", error: message };
  }
}

export async function deleteReservationFromGoogleCalendar(eventId: string | null | undefined) {
  if (!eventId) return { status: "skipped" } as const;
  return deleteEvent(eventId);
}
