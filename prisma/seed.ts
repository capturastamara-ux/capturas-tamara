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

const PLAN_BASE = "/images/plans/todo-incluido";

async function main() {
  console.log("Seeding categories and plans...");

  await prisma.planGalleryImage.deleteMany();
  await prisma.planSection.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.category.deleteMany();

  const bodas = await prisma.category.create({
    data: {
      slug: "bodas",
      title: "Bodas",
      subtitle: "Celebraciones con intención",
      description:
        "Diseñamos y producimos bodas con rigor operativo y sensibilidad artística.",
      coverUrl: `${PLAN_BASE}/cover.png`,
      sortOrder: 1,
      published: true,
    },
  });

  const quinceaneras = await prisma.category.create({
    data: {
      slug: "quinceaneras",
      title: "15 años",
      subtitle: "Ritos de paso inolvidables",
      description:
        "Producimos quinceañeras con visión de legado: decoración, iluminación, logística y dirección del evento.",
      coverUrl: `${PLAN_BASE}/gallery-01.png`,
      sortOrder: 2,
      published: true,
    },
  });

  await prisma.plan.create({
    data: {
      categoryId: bodas.id,
      slug: "todo-incluido",
      title: "Todo Incluido",
      tagline: "Portafolio",
      coverUrl: `${PLAN_BASE}/cover.png`,
      description:
        "Paquete integral para bodas: banquetería, decoración, amplificación, iluminación, fotografía, maestro de ceremonia y locación.",
      sortOrder: 1,
      published: true,
      sections: {
        create: [
          {
            title: "Banquetería y catering",
            intro:
              "Incluye: Sillas, mesas, mantelería, cristalería, menaje, personal de cocina, meseros, plato fuerte, cóctel de bienvenida, ronda de pasabocas, champaña y torta.",
            note: "Contamos con varias opciones a elegir y degustación previa del plato fuerte.",
            imageUrl: `${PLAN_BASE}/section-banqueteria.png`,
            sortOrder: 1,
          },
          {
            title: "Decoración",
            intro:
              "Incluye: Decoración principal, decoración en la entrada, centros de mesa, velos en el techo y estación selfie.",
            note: "<p>Manejamos varias estructuras como opciones, basándonos en estilos vintage con complementos como globos o flores.</p><p>Tablero en acrílico dorado como bienvenida, pampas y canastos con ornamentaciones florales.</p>",
            imageUrl: `${PLAN_BASE}/section-decoracion.png`,
            sortOrder: 2,
          },
          {
            title: "Amplificación e iluminación",
            intro:
              "Incluye: Sonido profesional Beta3, micrófono, cámara de humo, DJ, luces controladas con DMX, ambientación según el color de tu decoración y hora loca neón.",
            note: "<p>Activamos luces ultravioleta, repartimos pintura neón y activamos un láser que genera figuras 3D.</p>",
            imageUrl: `${PLAN_BASE}/section-amplificacion.png`,
            sortOrder: 3,
          },
          {
            title: "Fotografía, ceremonia y locación",
            intro:
              "Incluye: Fotografía profesional, maestro de ceremonia y locación.",
            note: "<p>Entregamos 120 fotos en formato digital.</p><p>El maestro de ceremonia se encarga de modular todos los momentos importantes de la celebración.</p><p>Manejamos varias locaciones distribuidas en diferentes sectores de Manizales.</p>",
            imageUrl: `${PLAN_BASE}/section-extras.png`,
            sortOrder: 4,
          },
        ],
      },
      gallery: {
        create: [
          {
            url: `${PLAN_BASE}/gallery-01.png`,
            sortOrder: 1,
          },
          {
            url: `${PLAN_BASE}/gallery-02.png`,
            sortOrder: 2,
          },
          {
            url: `${PLAN_BASE}/gallery-03.png`,
            sortOrder: 3,
          },
        ],
      },
    },
  });

  // Placeholder plan under 15 años so the category exists for admin later
  await prisma.plan.create({
    data: {
      categoryId: quinceaneras.id,
      slug: "todo-incluido",
      title: "Todo Incluido",
      tagline: "Portafolio",
      coverUrl: `${PLAN_BASE}/gallery-01.png`,
      description:
        "Paquete integral para 15 años. Contenido de prueba — se puede editar desde el admin.",
      sortOrder: 1,
      published: true,
      sections: {
        create: [
          {
            title: "Producción integral",
            intro:
              "Incluye: Decoración temática, sonido e iluminación, fotografía y coordinación del evento.",
            sortOrder: 1,
          },
        ],
      },
    },
  });

  console.log("Seed complete:");
  console.log(`- Category: ${bodas.slug}`);
  console.log(`- Category: ${quinceaneras.slug}`);
  console.log("- Plan: bodas/todo-incluido (full content from PDF)");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
