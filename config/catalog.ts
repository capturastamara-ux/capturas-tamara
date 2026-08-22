import { galleryAssetPaths } from "@/config/gallery";

export type CatalogPriceRow = {
  size: string;
  price: number;
};

export type CatalogProduct = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  images: ReadonlyArray<{ src: string; alt: string }>;
  rows: ReadonlyArray<CatalogPriceRow>;
};

export const catalogConfig = {
  categories: {
    id: "categorias",
    eyebrow: "Categorías",
    heading: "Elige la categoría de tu interés",
    empty:
      "Aún no hay categorías publicadas. Agrégalas desde el panel de administración.",
    previewLimit: 4,
    moreLabel: "Ver más categorías",
    moreHref: "/portafolio",
    cardCta: "Ver categoría",
  },
  products: [
    {
      id: "retablos",
      eyebrow: "Impresión premium",
      title: "Retablos en madera",
      subtitle: "Tamaño y valor de impresión en madera",
      images: [
        {
          src: galleryAssetPaths.gallery01,
          alt: "Retablo en madera con retrato fotográfico",
        },
        {
          src: galleryAssetPaths.cover,
          alt: "Retablo en madera con sesión familiar",
        },
        {
          src: galleryAssetPaths.gallery02,
          alt: "Retablo en madera con fotografía de celebración",
        },
      ],
      rows: [
        { size: "10×15", price: 20_000 },
        { size: "13×18", price: 24_000 },
        { size: "15×21", price: 30_000 },
        { size: "20×30", price: 46_000 },
        { size: "30×45", price: 72_000 },
        { size: "40×60", price: 143_000 },
        { size: "50×70", price: 185_000 },
        { size: "60×100", price: 234_000 },
      ],
    },
    {
      id: "impresiones",
      eyebrow: "Papel fotográfico",
      title: "Impresiones",
      subtitle: "Tamaño y valor de impresión en papel",
      images: [
        {
          src: galleryAssetPaths.gallery03,
          alt: "Impresión fotográfica en papel",
        },
        {
          src: galleryAssetPaths.banqueteria,
          alt: "Ampliación fotográfica impresa",
        },
        {
          src: galleryAssetPaths.decoracion,
          alt: "Set de impresiones fotográficas",
        },
      ],
      rows: [
        { size: "10×15", price: 1_800 },
        { size: "13×18", price: 2_400 },
        { size: "15×21", price: 3_000 },
        { size: "20×30", price: 12_000 },
        { size: "30×45", price: 24_000 },
        { size: "40×60", price: 37_000 },
      ],
    },
  ] as const satisfies ReadonlyArray<CatalogProduct>,
  conditions: {
    id: "condiciones",
    eyebrow: "Reserva",
    title: "Condiciones",
    items: [
      {
        title: "Entrega",
        body: "El material visual digital se entrega en máx. 2 días; impresiones o retablo de madera en máx. 5 días después de haber realizado la sesión.",
      },
      {
        title: "Anticipo",
        body: "Debe reservar con el 50% de la sesión y el otro 50% una vez entregado el material físico si es el caso; de lo contrario deberá cancelar el otro 50% una vez finalizada la sesión.",
      },
      {
        title: "Cobertura",
        body: "Se cubre todo Manizales y Villamaría. Si es por fuera de estas, los viáticos corren por cuenta del cliente (desplazamiento, comida y hospedaje de ser el caso).",
      },
      {
        title: "Fotos extra",
        body: "Si desea fotos en formato digital adicionales al paquete contratado, tendrá un costo de $4.000 cada una.",
      },
      {
        title: "Selección",
        body: "Se envían todas las fotos tomadas en la sesión y usted escoge la cantidad de fotos del paquete que contrató para su respectiva edición en posproducción.",
      },
      {
        title: "Uso de imagen",
        body: "El material puede ser usado como parte del portafolio y contenido publicitario del fotógrafo.",
      },
      {
        title: "Confirmación",
        body: "Recuerda enviarnos un pantallazo a nuestro WhatsApp del 50% para agendar tu reserva.",
      },
    ],
  },
  payments: {
    id: "pagos",
    eyebrow: "Reserva",
    title: "Medios de pago",
    accounts: [
      { id: "nequi", label: "Nequi", number: "3044711872" },
      { id: "llave", label: "Llave", number: "3044711872" },
    ],
  },
} as const;

export function formatCop(value: number) {
  return `$ ${value.toLocaleString("es-CO")}`;
}
