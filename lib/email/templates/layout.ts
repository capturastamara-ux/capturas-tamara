import { siteConfig } from "@/config/site";

type EmailLayoutOptions = {
  title: string;
  bodyHtml: string;
  preheader?: string;
};

/** Plantilla HTML base para notificaciones (extender por tipo de correo). */
export function renderEmailLayout({
  title,
  bodyHtml,
  preheader,
}: EmailLayoutOptions): string {
  const preheaderBlock = preheader
    ? `<span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden">${preheader}</span>`
    : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;">
  ${preheaderBlock}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e8e8e8;">
          <tr>
            <td style="padding:32px 28px 16px;border-bottom:1px solid #eee;">
              <p style="margin:0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#888;">${siteConfig.name}</p>
              <h1 style="margin:8px 0 0;font-size:22px;font-weight:400;line-height:1.3;">${title}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 32px;font-size:15px;line-height:1.6;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 24px;border-top:1px solid #eee;font-size:12px;color:#888;">
              ${siteConfig.footer.copyright} · ${siteConfig.url.replace(/^https?:\/\//, "")}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
