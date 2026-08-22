/** Fuentes del sitio (carga en runtime vía Google Fonts; evita fallos de build en Vercel). */
export const fontConfig = {
  googleFontsUrl:
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;500;600;700&display=swap",
  body: '"Inter", sans-serif',
  display: '"Cormorant Garamond", serif',
  hero: '"Playfair Display", serif',
} as const;
