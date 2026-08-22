export type GalleryImage = {
  id: string;
  src: string;
  alt: string;
  aspect: "portrait" | "landscape" | "square";
};

export type PortfolioCategory = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  cover: string;
  coverAlt: string;
  images: GalleryImage[];
};

const planImages = {
  cover: "/images/plans/todo-incluido/cover.png",
  gallery01: "/images/plans/todo-incluido/gallery-01.png",
  gallery02: "/images/plans/todo-incluido/gallery-02.png",
  gallery03: "/images/plans/todo-incluido/gallery-03.png",
  decoracion: "/images/plans/todo-incluido/section-decoracion.png",
  banqueteria: "/images/plans/todo-incluido/section-banqueteria.png",
  hero: "/images/hero/hero-desktop.jpeg",
} as const;

export const portfolioCategories: PortfolioCategory[] = [
  {
    slug: "bodas",
    title: "Bodas",
    subtitle: "Celebraciones con intención",
    description:
      "Diseñamos y producimos bodas con rigor operativo y sensibilidad artística. Cada detalle —desde el montaje hasta la dirección del día— está pensado para que ustedes solo vivan el momento.",
    cover: planImages.hero,
    coverAlt: "Pareja en boda elegante",
    images: [
      {
        id: "boda-1",
        src: planImages.gallery01,
        alt: "Celebración de boda con decoración elegante",
        aspect: "portrait",
      },
      {
        id: "boda-2",
        src: planImages.gallery02,
        alt: "Detalle de banquetería en evento",
        aspect: "square",
      },
      {
        id: "boda-3",
        src: planImages.decoracion,
        alt: "Decoración de salón para boda",
        aspect: "landscape",
      },
      {
        id: "boda-4",
        src: planImages.cover,
        alt: "Pareja en celebración de boda",
        aspect: "portrait",
      },
    ],
  },
  {
    slug: "quinceaneras",
    title: "15 años",
    subtitle: "Ritos de paso inolvidables",
    description:
      "Producimos quinceañeras con visión de legado: decoración, iluminación, logística y dirección del evento para que cada instante se sienta único, mágico y bien cuidado.",
    cover: planImages.cover,
    coverAlt: "Celebración de quinceañera elegante",
    images: [
      {
        id: "15-1",
        src: planImages.hero,
        alt: "Celebración de quinceañera con luces y decoración",
        aspect: "landscape",
      },
      {
        id: "15-2",
        src: planImages.gallery03,
        alt: "Detalle de mesa en celebración de 15 años",
        aspect: "portrait",
      },
      {
        id: "15-3",
        src: planImages.banqueteria,
        alt: "Banquetería y catering en evento",
        aspect: "portrait",
      },
      {
        id: "15-4",
        src: planImages.gallery01,
        alt: "Momento especial en celebración de 15 años",
        aspect: "portrait",
      },
    ],
  },
];

export const galleryImages: GalleryImage[] = portfolioCategories.flatMap(
  (category) => category.images,
);

/** Layout fijo de la galería en home: misma cantidad y formas, fotos vienen de planes publicados. */
export const landingGallerySlots = galleryImages.map((image) => ({
  id: image.id,
  aspect: image.aspect,
  fallbackSrc: image.src,
  fallbackAlt: image.alt,
}));

export { planImages as galleryAssetPaths };
