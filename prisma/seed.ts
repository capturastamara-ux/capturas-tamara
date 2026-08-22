import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL no está definida. Configura la conexión Postgres de Supabase en .env",
  );
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const COVER = "/images/plans/todo-incluido/cover.png";

const categories = [
  {
    slug: "retratos",
    title: "Retratos",
    subtitle: "Tu mejor imagen",
    description: "Sesiones de retrato con dirección y edición profesional.",
    coverUrl: COVER,
    sortOrder: 1,
  },
  {
    slug: "quinceaneras",
    title: "15 Años",
    subtitle: "Un rito para recordar",
    description: "Fotografía de 15 años: preparación, ceremonia y fiesta.",
    coverUrl: "/images/plans/todo-incluido/gallery-01.png",
    sortOrder: 2,
  },
  {
    slug: "embarazo",
    title: "Embarazo",
    subtitle: "Espera con arte",
    description: "Sesiones de maternidad para guardar esta etapa.",
    coverUrl: "/images/plans/todo-incluido/gallery-02.png",
    sortOrder: 3,
  },
  {
    slug: "bebes",
    title: "Bebés",
    subtitle: "Primeros días",
    description: "Fotografía de bebés y newborn con calma y detalle.",
    coverUrl: "/images/plans/todo-incluido/gallery-03.png",
    sortOrder: 4,
  },
  {
    slug: "grados",
    title: "Grados",
    subtitle: "El logro",
    description: "Cobertura de grados y sesiones de egreso.",
    coverUrl: "/images/plans/todo-incluido/section-decoracion.png",
    sortOrder: 5,
  },
  {
    slug: "cumpleanos",
    title: "Cumpleaños",
    subtitle: "Celebra el año",
    description: "Fotografía de cumpleaños y celebraciones familiares.",
    coverUrl: "/images/plans/todo-incluido/section-banqueteria.png",
    sortOrder: 6,
  },
] as const;

async function main() {
  console.log("Seeding photography categories...");

  await prisma.subcategoryGalleryImage.deleteMany();
  await prisma.planGalleryImage.deleteMany();
  await prisma.planSection.deleteMany();
  await prisma.planPriceTier.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.subcategory.deleteMany();
  await prisma.category.deleteMany();

  for (const category of categories) {
    await prisma.category.create({
      data: {
        ...category,
        published: true,
      },
    });
  }

  console.log("Seed complete:");
  for (const category of categories) {
    console.log(`- Category: ${category.slug}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
