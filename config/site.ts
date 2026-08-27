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
  title: "CapturasTamara | Fotografía profesional",
  description:
    "Fotografía profesional de retratos, 15 años, embarazo, bebés, grados y cumpleaños en Manizales y Villamaría.",
  url: "https://www.capturastamara.com",
  logo: {
    main: "/images/logo/logo-3.png",
    isotype: "/images/logo/logo-3.png",
    wordmark: "Capturas Tamara",
    alt: "Logo Capturas Tamara",
  },
  hero: {
    titleLine: "WILL",
    title: "TAMARA",
    tagline: "historias que algún día volverás a mirar",
    scrollLabel: "Ir a las categorías",
    poster: "/images/hero/hero-desktop.jpeg",
    wordmark: "/images/hero/texto-hero-2.png",
    alt: "Sesión fotográfica profesional Capturas Tamara",
  },
  nav: [
    { type: "link", label: "Home", href: "/" },
    { type: "link", label: "Categorías", href: "/#categorias" },
    { type: "link", label: "Productos", href: "/#productos" },
    { type: "link", label: "Condiciones", href: "/#condiciones" },
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
    "15 años",
    "Maternidad",
    "Bebés",
    "Grados",
    "Cumpleaños",
    "Reencuentros",
    "Familia",
    "Eventos"
  ],
  about: {
    headline:
      "Capturamos los momentos que quieres recordar, con calidez y detalle.",
    body: "",
    cta: { label: "Ver categorías", href: "/#categorias" },
  },
  portfolio: {
    headline: "Elige la sesión\nque quieres vivir",
    pageTitle: "Portafolio",
    backLabel: "Categorías",
    backHref: "/#categorias",
    pageIntro:
      "Explora nuestras categorías y conoce cómo retratamos cada momento.",
    planPriceLabel: "Valor",
    planPriceTiersTitle: "Nuestros precios",
    planGuestSuffix: "invitados",
    galleryHeading: "Galería",
    reserveLabel: "Reservar por WhatsApp",
    reserveMessage: (planTitle: string) =>
      `Hola, quiero reservar el plan ${planTitle}.`,
    cta: { label: "Explora el portafolio", href: "/portafolio" },
  },
  servicesIntro: {
    headline: "Arquitectura de momentos:\nintención, diseño y rigor.",
    subheadline: "Diseñamos experiencias\ncon intención y significado",
  },
  ctaBanner: {
    headline: "Agenda tu sesión y captura tu mejor imagen.",
    body: "Reserva con el 50% por WhatsApp y elige la categoría que quieres vivir. El material digital se entrega en máximo 2 días.",
    cta: { label: "Agendar por WhatsApp", href: "/#contacto" },
    image: galleryAssetPaths.cover,
    imageAlt: "Pareja en celebración elegante",
  },
  contact: {
    headline: "Agendemos tu sesión fotográfica",
    email: "contacto@capturastamara.com",
    phone: "+57 304 471 1872",
    city: "Manizales, Colombia",
    eventTypes: [
      "Retratos",
      "15 años",
      "Embarazo",
      "Bebés",
      "Grados",
      "Cumpleaños",
      "Otro",
    ],
    privacyLabel: "Acepto las Políticas de privacidad de CapturasTamara.",
    privacyPrefix: "Acepto las",
    privacySuffix: "de CapturasTamara.",
    submitLabel: "Quiero agendar",
    image: galleryAssetPaths.gallery01,
    imageAlt: "Detalle de celebración de boda",
  },
  social: {
    instagram: "https://www.instagram.com/capturastamara/",
    facebook: "https://www.facebook.com/capturastamara/",
  },
  whatsapp: {
    label: "Agendar sesión",
    href: "https://wa.me/573044711872",
    chatBase: "https://wa.me",
    countryCode: "57",
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
    quote: "Captura tu mejor imagen.",
    copyright: "CapturasTamara",
    privacyHref: "/politicas-privacidad",
    privacyLabel: "Políticas de privacidad",
    credits: {
      label: "Create by Prakto.co",
      href: "https://prakto.co",
    },
  },
} as const;
