import { emailConfig } from "@/config/email";
import { getResendClient, isEmailConfigured } from "@/lib/email/client";
import type { SendEmailInput, SendEmailResult } from "@/lib/email/types";

function normalizeRecipients(to: string | string[]): string[] {
  const list = Array.isArray(to) ? to : [to];
  return list.map((address) => address.trim()).filter(Boolean);
}

/** Envía un correo vía Resend. Solo usar en server actions o código de servidor. */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!isEmailConfigured()) {
    return {
      ok: false,
      error:
        "Correo no configurado. Define RESEND_API_KEY y RESEND_FROM_EMAIL en .env.",
    };
  }

  const to = normalizeRecipients(input.to);
  if (to.length === 0) {
    return { ok: false, error: "No hay destinatarios válidos." };
  }

  try {
    const { data, error } = await getResendClient().emails.send({
      from: emailConfig.from,
      to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo ?? emailConfig.replyTo,
      attachments: input.attachments?.map((file) => ({
        filename: file.filename,
        content: file.content,
        contentId: file.contentId,
      })),
    });

    if (error) {
      console.error("[email] Error al enviar:", error);
      return { ok: false, error: error.message };
    }

    if (!data?.id) {
      return { ok: false, error: "Resend no devolvió un id de envío." };
    }

    return { ok: true, id: data.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido al enviar.";
    return { ok: false, error: message };
  }
}
