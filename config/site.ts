import { galleryAssetPaths } from "@/config/gallery";

export type NavLink = {
  label: string;
  href: string;
};

export type NavItem =
  | { type: "link"; label: string; href: string }
  | {
      type: "dropdown";
      label: string;
      items: NavLink[];
    };

export const siteConfig = {
  name: "CapturasTamara",
  title: "CapturasTamara | Producción de Eventos",
  description:
    "Producción profesional de bodas, quinceañeras y eventos especiales con rigor operativo y sensibilidad artística.",
  url: "https://www.capturastamara.com",
  logo: {
    main: "/images/logo/logo-1.png",
    isotype: "/images/logo/logo-1.png",
    wordmark: "CapturasTamara",
    alt: "Logo CapturasTamara",
  },
  hero: {
    title: "PRODUCCIÓN DE EVENTOS",
    tagline: "DISEÑAMOS Y CUBRIMOS EL EVENTO DE TUS SUEÑOS.",
    scrollLabel: "Desplazarse hacia abajo",
    video: "/images/hero/video-hero-1.mp4",
    poster: "/images/hero/hero-desktop.png",
    alt: "Celebración de quinceañera con luces, decoración y pista de baile",
  },
  nav: [
    { type: "link", label: "Home", href: "/" },
    { type: "link", label: "Nosotros", href: "/#nosotros" },
    { type: "link", label: "Portafolio", href: "/portafolio" },
    { type: "link", label: "Iniciar sesión", href: "/admin/login" },
  ] satisfies NavItem[],
  login: {
    title: "Iniciar sesión",
    subtitle: "Accede al panel de administración",
    emailLabel: "Correo electrónico",
    passwordLabel: "Contraseña",
    submitLabel: "Entrar",
    backLabel: "Volver al inicio",
    redirectTo: "/admin",
  },
  regions: [
    "Manizales",
    "Villamaría",
    "Chinchiná",
    "Neira",
    "Palestina",
    "Santagueda"
  ],
  about: {
    headline:
      "Diseñamos legados emocionales que trascienden el instante y se convierten en parte de una historia inolvidable.",
    body: "Contamos con más de 10 años de trayectoria diseñando celebraciones de alto nivel con una visión estratégica global. Nuestro enfoque une el rigor operativo con la sensibilidad de quien ejecuta con el corazón, para dar vida a momentos extraordinarios en cualquier escenario del mundo; pensados para ser recordados como un legado.",
    cta: { label: "Conoce más", href: "/portafolio" },
  },
  portfolio: {
    headline: "La clave es hacerlo\ncon el corazón",
    pageTitle: "Portafolio",
    pageIntro:
      "Explora nuestras categorías y conoce la forma en que damos vida a cada celebración.",
    planPriceLabel: "Desde",
    planPriceTiersTitle: "Nuestros precios",
    planGuestSuffix: "invitados",
    cta: { label: "Explora el portafolio", href: "/portafolio" },
  },
  servicesIntro: {
    headline: "Arquitectura de momentos:\nintención, diseño y rigor.",
    subheadline: "Diseñamos experiencias\ncon intención y significado",
  },
  ctaBanner: {
    headline:
      "SÍ, QUIERO: la maestría de diseñar con propósito e intención.",
    body: "Contamos con más de 10 años de trayectoria diseñando celebraciones de alto nivel con una visión estratégica global. Nuestro enfoque une el rigor operativo con la sensibilidad de quien ejecuta con el corazón, para dar vida a momentos extraordinarios en cualquier escenario del mundo; pensados para ser recordados como un legado.",
    cta: { label: "Lo quiero", href: "/#contacto" },
    image: galleryAssetPaths.cover,
    imageAlt: "Pareja en celebración elegante",
  },
  contact: {
    headline: "Construyamos juntos el evento de tus sueños",
    email: "contacto@capturastamara.com",
    phone: "+57 300 000 0000",
    city: "Colombia",
    eventTypes: [
      "Boda",
      "Quinceañera",
      "Evento corporativo",
      "Evento social",
      "Otro",
    ],
    privacyLabel: "Acepto las Políticas de privacidad de CapturasTamara.",
    submitLabel: "Escribe tu historia",
    image: galleryAssetPaths.gallery01,
    imageAlt: "Detalle de celebración de boda",
  },
  social: {
    instagram: "https://www.instagram.com/capturastamara/",
    tiktok: "https://www.tiktok.com/@capturastamara",
    facebook: "https://www.facebook.com/capturastamara",
  },
  whatsapp: {
    label: "Cotizar evento",
    href: "https://wa.me/573000000000",
  },
  pwa: {
    themeColor: "#1a1a1a",
    backgroundColor: "#ffffff",
  },
  cotizador: {
    pageTitle: "Cotización",
    pageIntro: "Compara nuestros planes y elige la propuesta ideal para tu celebración.",
    publicSubtitle: "Comparación de planes",
    guestCountLabel: "Invitados",
    copyLinkLabel: "Copiar enlace",
    copiedLabel: "Enlace copiado",
    openLinkLabel: "Abrir enlace",
    printLabel: "Imprimir / PDF",
    planPickerLabel: "Planes a comparar",
    planPickerHint: "Elige de 1 a 3 planes",
    contactCta: { label: "Solicitar cotización", href: "/#contacto" },
  },
  footer: {
    quote:
      "Cada evento es una historia única y mágica, donde los sueños se entrelazan para siempre y cobran vida.",
    copyright: "CapturasTamara",
    privacyHref: "/politicas-privacidad",
    privacyLabel: "Políticas de privacidad",
    credits: {
      label: "Create by Prakto.co",
      href: "https://prakto.co",
    },
  },
} as const;
