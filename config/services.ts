import { galleryAssetPaths } from "@/config/gallery";

export type Service = {
  slug: string;
  title: string;
  description: string;
  cta: { label: string; href: string };
  image: string;
  imageAlt: string;
};

export const services: Service[] = [
  {
    slug: "bodas",
    title: "Wedding planner",
    description:
      "Damos forma a la boda de sus sueños mediante un modelo de planificación de autor, transformando cada emoción en una experiencia auténtica y significativa.",
    cta: { label: "Cotiza tu boda", href: "/#contacto" },
    image: galleryAssetPaths.cover,
    imageAlt: "Producción de bodas",
  },
  {
    slug: "eventos",
    title: "Planeación y diseño de eventos",
    description:
      "Diseñamos celebraciones de alto nivel, desde ritos de paso como 15 años hasta eventos únicos, con una visión estratégica pensada para celebrar y dejar un legado eterno.",
    cta: { label: "Cotiza tu evento", href: "/#contacto" },
    image: galleryAssetPaths.gallery01,
    imageAlt: "Planeación y diseño de eventos",
  },
  {
    slug: "produccion",
    title: "Producción integral",
    description:
      "Coordinamos cada detalle operático — logística, proveedores, montaje y dirección — para que ustedes solo disfruten del momento.",
    cta: { label: "Conoce más", href: "/#contacto" },
    image: galleryAssetPaths.gallery02,
    imageAlt: "Producción integral de eventos",
  },
];
