import { emailConfig } from "@/config/email";
import { reservationConfig } from "@/config/reservations";
import { loadPublicAttachment } from "@/lib/email/load-attachment";
import { sendEmail } from "@/lib/email/send";
import {
  renderReservationConfirmationEmail,
  renderReservationConfirmationText,
  type ReservationConfirmationEmailData,
} from "@/lib/email/templates/reservation-confirmation";
import type { SendEmailAttachment } from "@/lib/email/types";
import { richTextToPlainText } from "@/lib/sanitize-rich-text";

export type SendReservationConfirmationResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

async function loadBrandAttachments(): Promise<SendEmailAttachment[]> {
  const attachments: SendEmailAttachment[] = [];

  try {
    attachments.push(
      await loadPublicAttachment(
        emailConfig.brand.logoPublicPath,
        emailConfig.brand.logoContentId,
      ),
    );
  } catch (error) {
    console.error("[email] No se pudo cargar el logo para el correo:", error);
  }

  try {
    attachments.push(
      await loadPublicAttachment(
        emailConfig.brand.bgPublicPath,
        emailConfig.brand.bgContentId,
      ),
    );
  } catch (error) {
    console.error("[email] No se pudo cargar el fondo del correo:", error);
  }

  return attachments;
}

export async function sendReservationConfirmationEmail(
  data: ReservationConfirmationEmailData,
): Promise<SendReservationConfirmationResult> {
  const notesPlain = data.notes ? richTextToPlainText(data.notes) : null;
  const payload = { ...data, notes: notesPlain };
  const attachments = await loadBrandAttachments();

  const result = await sendEmail({
    to: data.clientEmail,
    subject: reservationConfig.email.subject(data.clientName),
    html: renderReservationConfirmationEmail(payload),
    text: renderReservationConfirmationText(payload),
    attachments,
  });

  if (!result.ok) {
    return result;
  }

  return { ok: true, id: result.id };
}
