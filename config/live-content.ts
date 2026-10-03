export const liveContentConfig = {
  path: "/contenido-en-vivo",
  eyebrow: "En vivo",
  pageTitle: "Contenido en vivo",
  pageIntro:
    "Encuentra el álbum o la transmisión de tu evento y ábrelo cuando quieras.",
  empty: "Aún no hay contenido publicado.",
  cardCta: "Ver evento",
  defaultButtonLabel: "Ver álbum",
  maxImages: 5,
  instagram: {
    heading: "Síguenos en Instagram",
    body: "Descubre más historias, celebraciones y fotografías.",
    buttonLabel: "Seguir a CapturasTamara",
  },
  services: {
    heading: "¿Tienes un evento próximamente?",
    body: "Nosotros también podemos contar tu historia.",
    buttonLabel: "Conoce nuestros servicios",
    href: "/#categorias",
    image: "/images/eventos/camara-sony-2.jpg",
    imageAlt: "Cámara Sony de CapturasTamara lista para una sesión",
  },
} as const;

export function liveEventPath(slug: string) {
  return `${liveContentConfig.path}/${slug}`;
}
