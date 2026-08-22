import { Resend } from "resend";

const globalForResend = globalThis as unknown as {
  resend: Resend | undefined;
};

function createResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY no está definida. Agrégala en .env para enviar correos.",
    );
  }

  return new Resend(apiKey);
}

/** Cliente Resend (lazy). No falla al importar si falta la API key. */
export function getResendClient(): Resend {
  if (!globalForResend.resend) {
    globalForResend.resend = createResendClient();
  }
  return globalForResend.resend;
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}
