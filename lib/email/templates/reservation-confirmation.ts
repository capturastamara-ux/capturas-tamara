import { emailConfig } from "@/config/email";
import { reservationConfig } from "@/config/reservations";
import { formatReservationDate } from "@/lib/admin/reservations";
import { escapeHtml } from "@/lib/email/escape-html";
import { formatPlanPrice } from "@/lib/format/price";

export type ReservationConfirmationEmailData = {
  clientName: string;
  clientEmail: string;
  eventDate: Date;
  categoryTitle: string;
  planTitle: string;
  location: string | null;
  amountPaid: number | null;
  amountRemaining: number | null;
  notes: string | null;
};

/** Paleta del correo = sitio (cream + negro + acento vino). */
const colors = {
  bg: "#f5f0eb",
  text: "#1a1a1a",
  muted: "#6b6560",
  soft: "#8b2635",
  boxBg: "#ffffff",
  boxBorder: "#e8e2db",
  accent: "#1a1a1a",
} as const;

function firstName(fullName: string) {
  const part = fullName.trim().split(/\s+/)[0];
  return part || "cliente";
}

function formatOptionalPrice(value: number | null): string {
  if (value == null) return "Por confirmar";
  return formatPlanPrice(value) ?? String(value);
}

/**
 * Plantilla HTML (table-based) para clientes de correo.
 * Fondo cream forzado también en dark mode (meta + CSS + imagen de fondo).
 */
export function renderReservationConfirmationEmail(
  data: ReservationConfirmationEmailData,
): string {
  const copy = reservationConfig.email;
  const brand = emailConfig.brand;
  const name = firstName(data.clientName);
  const eventDateLabel = formatReservationDate(data.eventDate);
  const locationLine = data.location
    ? `<p class="email-text" style="margin:0 0 8px;font-size:14px;line-height:1.5;color:${colors.text};">📍 ${escapeHtml(data.location)}</p>`
    : `<p class="email-text" style="margin:0 0 8px;font-size:14px;line-height:1.5;color:${colors.muted};">📍 Por confirmar</p>`;
  const notesBlock = data.notes
    ? `<p class="email-text" style="margin:16px 0 0;font-size:14px;line-height:1.55;color:${colors.text};"><strong>Notas:</strong> ${escapeHtml(data.notes)}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="es" style="color-scheme: light only;">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(copy.subject(data.clientName))}</title>
  <style type="text/css">
    :root { color-scheme: light only; }
    body, .email-root {
      background-color: ${colors.bg} !important;
    }
    @media (prefers-color-scheme: dark) {
      body,
      .email-root,
      .email-root td,
      .email-box,
      .email-box td {
        background-color: ${colors.bg} !important;
        color: ${colors.text} !important;
      }
      .email-root {
        background-image: url("cid:${brand.bgContentId}") !important;
        background-color: ${colors.bg} !important;
      }
      .email-text { color: ${colors.text} !important; }
      .email-muted { color: ${colors.muted} !important; }
      .email-accent { color: ${colors.soft} !important; }
      .email-box {
        background-color: ${colors.boxBg} !important;
        border-color: ${colors.boxBorder} !important;
      }
      .email-divider { background-color: ${colors.accent} !important; }
    }
    [data-ogsc] body,
    [data-ogsc] .email-root,
    [data-ogsb] body,
    [data-ogsb] .email-root {
      background-color: ${colors.bg} !important;
      background-image: url("cid:${brand.bgContentId}") !important;
    }
    [data-ogsc] .email-text,
    [data-ogsb] .email-text {
      color: ${colors.text} !important;
    }
  </style>
</head>
<body bgcolor="${colors.bg}" style="margin:0;padding:0;background-color:${colors.bg};color-scheme:light only;">
  <table role="presentation" class="email-root" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${colors.bg}" style="background-color:${colors.bg};background-image:linear-gradient(${colors.bg},${colors.bg});background-image:url('cid:${brand.bgContentId}');">
    <tr>
      <td align="center" bgcolor="${colors.bg}" style="padding:40px 20px;background-color:${colors.bg};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;">
          <tr>
            <td align="center" class="email-muted" style="padding:0 12px 20px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:${colors.muted};">
              ${escapeHtml(copy.noReplyNotice)}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 0 24px;">
              <img
                src="cid:${escapeHtml(brand.logoContentId)}"
                alt="${escapeHtml(brand.logoAlt)}"
                width="120"
                style="display:block;margin:0 auto;width:120px;max-width:40%;height:auto;border:0;"
              />
            </td>
          </tr>
          <tr>
            <td align="center" class="email-text" style="padding:0 0 28px;font-family:Georgia,'Times New Roman',serif;font-size:13px;line-height:1.5;color:${colors.text};letter-spacing:0.04em;">
              ${escapeHtml(copy.motto)}
            </td>
          </tr>
          <tr>
            <td align="center" class="email-text" style="padding:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:28px;line-height:1.2;font-weight:700;letter-spacing:0.06em;color:${colors.text};text-transform:uppercase;">
              ${escapeHtml(copy.heading)}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 0 20px;">
              <div class="email-divider" style="width:64px;height:2px;background-color:${colors.accent};margin:0 auto;"></div>
            </td>
          </tr>
          <tr>
            <td align="center" class="email-text" style="padding:0 12px 12px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55;color:${colors.text};">
              ${escapeHtml(copy.greeting(name))}
            </td>
          </tr>
          <tr>
            <td align="center" class="email-text" style="padding:0 12px 32px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55;color:${colors.text};">
              ${escapeHtml(copy.intro)}
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 28px;">
              <table role="presentation" class="email-box" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${colors.boxBg}" style="background-color:${colors.boxBg};border:1px solid ${colors.boxBorder};">
                <tr>
                  <td bgcolor="${colors.boxBg}" style="padding:28px 24px;text-align:center;background-color:${colors.boxBg};">
                    <p class="email-text" style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;letter-spacing:0.12em;color:${colors.text};text-transform:uppercase;">
                      ${escapeHtml(copy.detailsTitle)}
                    </p>
                    <p class="email-accent" style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;line-height:1.4;color:${colors.soft};">
                      ${escapeHtml(data.categoryTitle)} · ${escapeHtml(data.planTitle)}
                    </p>
                    <p class="email-text" style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:${colors.text};">
                      🗓 ${escapeHtml(eventDateLabel)}
                    </p>
                    ${locationLine}
                    <p class="email-text" style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:${colors.text};">
                      <strong>Precio que abona:</strong> ${escapeHtml(formatOptionalPrice(data.amountPaid))}
                    </p>
                    <p class="email-text" style="margin:4px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:${colors.text};">
                      <strong>Lo que resta:</strong> ${escapeHtml(formatOptionalPrice(data.amountRemaining))}
                    </p>
                    ${notesBlock}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" class="email-text" style="padding:0 12px 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:${colors.text};">
              ${escapeHtml(copy.outro)}
            </td>
          </tr>
          <tr>
            <td align="center" class="email-text" style="padding:8px 12px 12px;font-family:Georgia,'Times New Roman',serif;font-size:13px;line-height:1.5;font-style:italic;color:${colors.text};">
              ${escapeHtml(copy.footerNote)}
            </td>
          </tr>
          <tr>
            <td align="center" class="email-muted" style="padding:0 12px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:${colors.muted};">
              ${escapeHtml(emailConfig.addressLine)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderReservationConfirmationText(
  data: ReservationConfirmationEmailData,
): string {
  const copy = reservationConfig.email;
  const brand = emailConfig.brand;
  const name = firstName(data.clientName);
  const eventDateLabel = formatReservationDate(data.eventDate);

  return [
    copy.noReplyNotice,
    "",
    brand.name,
    brand.byline,
    "",
    copy.motto,
    "",
    copy.heading,
    "",
    copy.greeting(name),
    copy.intro,
    "",
    copy.detailsTitle,
    "",
    `${data.categoryTitle} · ${data.planTitle}`,
    `Fecha: ${eventDateLabel}`,
    `Lugar: ${data.location ?? "Por confirmar"}`,
    `Precio que abona: ${formatOptionalPrice(data.amountPaid)}`,
    `Lo que resta: ${formatOptionalPrice(data.amountRemaining)}`,
    data.notes ? `Notas: ${data.notes}` : null,
    "",
    copy.outro,
    "",
    copy.footerNote,
    emailConfig.addressLine,
  ]
    .filter((line): line is string => line != null && line !== "")
    .join("\n");
}
