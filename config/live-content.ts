export const liveContentConfig = {
  path: "/contenido-en-vivo",
  eyebrow: "En vivo",
  pageTitle: "Contenido en vivo",
  pageIntro:
    "Encuentra el álbum o la transmisión de tu evento y ábrelo cuando quieras.",
  empty: "Aún no hay contenido publicado.",
  cardCta: "Ver evento",
  defaultButtonLabel: "Ver álbum",
} as const;

export function liveEventPath(slug: string) {
  return `${liveContentConfig.path}/${slug}`;
}
