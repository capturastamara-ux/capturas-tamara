import { galleryAssetPaths } from "@/config/gallery";

export type CatalogPriceRow = {
  size: string;
  price: number;
};

export type CatalogProductImage = {
  src: string;
  alt: string;
};

export type CatalogProduct = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  hero?: CatalogProductImage;
  images: ReadonlyArray<CatalogProductImage>;
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
      hero: {
        src: galleryAssetPaths.retablo,
        alt: "Retablos en madera con fotografías de CapturasTamara",
      },
      images: [],
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
      hero: {
        src: galleryAssetPaths.impresiones,
        alt: "Impresiones fotográficas en papel de CapturasTamara",
      },
      images: [],
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
    planLinkLabel: "Antes de escribirnos, te invitamos a leer las condiciones",
    items: [
      {
        title: "Galería",
        body: "Tu galería digital privada para la selección de fotos del paquete contratado estará disponible en 24 horas máximo.",
      },
      {
        title: "Digital",
        body: "El material digital seleccionado se entregará 72 horas máximo luego de la selección.",
      },
      {
        title: "Físico",
        body: "El material físico se entregará 5 días después de la sesión.",
      },
      {
        title: "Anticipo",
        body: "Debe reservar con el 50% del valor del paquete contratado y el otro 50% una vez finalizada la sesión.",
      },
      {
        title: "Cobertura",
        body: "Se cubre en la ciudad de Manizales y Villamaría. Si la locación es por fuera de estas, los viáticos corren por cuenta del cliente (desplazamiento, comida y hospedaje de ser el caso).",
      },
      {
        title: "Fotos extra",
        body: "Si deseas fotos impresas adicionales a las contratadas, tendrá un costo de $5.000 cada una.",
      },
      {
        title: "Uso de imagen",
        body: "El material puede ser usado como parte del portafolio y contenido publicitario de la marca. En caso de no autorizar el uso del mismo, informar al fotógrafo.",
      },
      {
        title: "Confirmación",
        body: "Recuerda enviarnos un pantallazo a nuestro WhatsApp del 50% para agendar tu reserva.",
      },
      {
        title: "Cancelación",
        body: "En caso de cancelación por algún motivo, se puede reprogramar la sesión pero no se hará devolución de dinero, a no ser que sea un caso fortuito donde esté en juego la integridad del cliente.",
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
