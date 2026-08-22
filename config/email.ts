import { siteConfig } from "./site";

/**
 * Remitente y defaults de correo.
 * `from` y `replyTo` se leen de env para no hardcodear el dominio verificado en Resend.
 */
export const emailConfig = {
  from:
    process.env.RESEND_FROM_EMAIL ??
    `${siteConfig.name} <onboarding@resend.dev>`,
  replyTo: process.env.RESEND_REPLY_TO ?? siteConfig.contact.email,
  notifyTo: siteConfig.contact.email,
  brand: {
    name: siteConfig.name,
    byline: "PRODUCCIÓN DE EVENTOS",
    /** Ruta relativa en /public — se incrusta en el correo vía CID (no depende del dominio). */
    logoPublicPath: siteConfig.logo.main,
    logoContentId: "logo-jmontoya",
    logoAlt: siteConfig.logo.alt,
    /** PNG sólido #f5f0eb: ayuda a que el fondo no se invierta en dark mode. */
    bgPublicPath: "/images/email/bg-cream-light.png",
    bgContentId: "bg-cream-light",
  },
  addressLine: "Manizales, Caldas, Colombia",
} as const;
