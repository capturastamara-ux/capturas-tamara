import { galleryAssetPaths } from "@/config/gallery";

export type Testimonial = {
  id: string;
  quote: string;
  body: string;
  author: string;
  location: string;
  image: string;
  imageAlt: string;
};

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote: "Se notó el cuidado en cada detalle",
    body: "No tuvimos que estar encima de nada ni preocuparnos por los tiempos o los detalles. Todo fluyó y pudimos disfrutar el evento con tranquilidad.",
    author: "Andrea M.",
    location: "Medellín, Colombia",
    image: galleryAssetPaths.gallery03,
    imageAlt: "Detalle decorativo en celebración",
  },
  {
    id: "t2",
    quote: "Sentimos que todo estaba bajo control",
    body: "Todo estuvo muy bien cuidado. Desde la organización hasta los pequeños detalles, nada se sintió improvisado.",
    author: "María y Andrés",
    location: "Bogotá, Colombia",
    image: galleryAssetPaths.decoracion,
    imageAlt: "Decoración elegante en salón de eventos",
  },
];
