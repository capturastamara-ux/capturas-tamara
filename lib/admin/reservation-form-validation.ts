import { reservationConfig } from "@/config/reservations";

const PHONE_PATTERN = /^\d{1,10}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CLIENT_ID_PATTERN = /^\d{6,12}$/;

export type ReservationFormField =
  | "clientName"
  | "clientIdNumber"
  | "clientPhone"
  | "clientEmail"
  | "categoryId"
  | "planId"
  | "guestCount"
  | "eventDate";

export type ReservationFormErrors = Partial<Record<ReservationFormField, string>>;

export type ReservationFormValidationResult =
  | { ok: true }
  | { ok: false; errors: ReservationFormErrors };

function requiredField(
  value: FormDataEntryValue | null,
  field: ReservationFormField,
  message: string,
  errors: ReservationFormErrors,
) {
  const text = String(value ?? "").trim();
  if (!text) {
    errors[field] = message;
  }
  return text;
}

/** Validación compartida cliente/servidor para crear o editar reservas. */
export function validateReservationFormData(
  formData: FormData,
): ReservationFormValidationResult {
  const errors: ReservationFormErrors = {};
  const { validation } = reservationConfig.form;

  requiredField(formData.get("eventDate"), "eventDate", "La fecha es obligatoria.", errors);
  requiredField(formData.get("clientName"), "clientName", "El nombre es obligatorio.", errors);

  const clientIdNumber = String(formData.get("clientIdNumber") ?? "").trim();
  if (!clientIdNumber) {
    errors.clientIdNumber = "La cédula es obligatoria.";
  } else if (!CLIENT_ID_PATTERN.test(clientIdNumber)) {
    errors.clientIdNumber = validation.clientIdNumber;
  }

  const clientPhone = String(formData.get("clientPhone") ?? "").trim();
  if (!clientPhone) {
    errors.clientPhone = "El teléfono es obligatorio.";
  } else if (!PHONE_PATTERN.test(clientPhone)) {
    errors.clientPhone = validation.phone;
  }

  const clientEmail = String(formData.get("clientEmail") ?? "").trim();
  if (!clientEmail) {
    errors.clientEmail = "El correo es obligatorio.";
  } else if (!EMAIL_PATTERN.test(clientEmail)) {
    errors.clientEmail = validation.email;
  }

  const categoryId = String(formData.get("categoryId") ?? "").trim();
  if (!categoryId) {
    errors.categoryId = validation.category;
  }

  const planId = String(formData.get("planId") ?? "").trim();
  if (!planId) {
    errors.planId = validation.plan;
  }

  const guestCountRaw = String(formData.get("guestCount") ?? "").trim();
  if (guestCountRaw) {
    const guestCount = Number.parseInt(guestCountRaw, 10);
    if (!Number.isFinite(guestCount) || guestCount <= 0) {
      errors.guestCount = validation.guestCount;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true };
}

export function getFirstReservationFormError(errors: ReservationFormErrors): string {
  const firstKey = Object.keys(errors)[0] as ReservationFormField | undefined;
  return firstKey ? (errors[firstKey] ?? "Revisa los datos del formulario.") : "Revisa los datos del formulario.";
}
