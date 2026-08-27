import { siteConfig } from "@/config/site";

export function clientWhatsAppHref(phone: string | null | undefined): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return null;

  const { countryCode, chatBase } = siteConfig.whatsapp;
  const international = digits.startsWith(countryCode) ? digits : `${countryCode}${digits}`;
  return `${chatBase}/${international}`;
}
