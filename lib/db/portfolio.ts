import { prisma } from "@/lib/db/prisma";
import { landingGallerySlots } from "@/config/gallery";

const planInclude = {
  sections: {
    orderBy: { sortOrder: "asc" as const },
  },
  gallery: {
    orderBy: { sortOrder: "asc" as const },
  },
  priceTiers: {
    orderBy: { sortOrder: "asc" as const },
    select: {
      id: true,
      guestCount: true,
      price: true,
      sortOrder: true,
    },
  },
};

export async function getPublishedCategories() {
  return prisma.category.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: {
      plans: {
        where: { published: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          slug: true,
          title: true,
          tagline: true,
          coverUrl: true,
          description: true,
          sortOrder: true,
        },
      },
    },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findFirst({
    where: { slug, published: true },
    include: {
      plans: {
        where: { published: true },
        orderBy: { sortOrder: "asc" },
        include: planInclude,
      },
    },
  });
}

export async function getPlanBySlugs(categorySlug: string, planSlug: string) {
  return prisma.plan.findFirst({
    where: {
      slug: planSlug,
      published: true,
      category: { slug: categorySlug, published: true },
    },
    include: {
      category: true,
      ...planInclude,
    },
  });
}

export async function getAllPublishedPlans() {
  return prisma.plan.findMany({
    where: { published: true, category: { published: true } },
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    include: {
      category: {
        select: { id: true, slug: true, title: true },
      },
    },
  });
}

export async function getLandingGalleryImages() {
  const plans = await prisma.plan.findMany({
    where: { published: true, category: { published: true } },
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    select: {
      title: true,
      coverUrl: true,
      gallery: {
        orderBy: { sortOrder: "asc" },
        select: { url: true },
      },
      sections: {
        orderBy: { sortOrder: "asc" },
        select: { title: true, imageUrl: true },
      },
    },
  });

  const collected: Array<{ src: string; alt: string }> = [];
  const seen = new Set<string>();

  const add = (src: string | null | undefined, alt: string) => {
    const url = src?.trim();
    if (!url || seen.has(url)) return;
    seen.add(url);
    collected.push({ src: url, alt });
  };

  for (const plan of plans) {
    add(plan.coverUrl, plan.title);
    for (const image of plan.gallery) {
      add(image.url, plan.title);
    }
    for (const section of plan.sections) {
      add(section.imageUrl, `${plan.title} · ${section.title}`);
    }
  }

  const pool = [...collected];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = pool[i];
    const swap = pool[j];
    if (current && swap) {
      pool[i] = swap;
      pool[j] = current;
    }
  }

  return landingGallerySlots.map((slot, index) => {
    const real = pool.length > 0 ? pool[index % pool.length] : null;
    return {
      id: slot.id,
      aspect: slot.aspect,
      src: real?.src ?? slot.fallbackSrc,
      alt: real?.alt ?? slot.fallbackAlt,
    };
  });
}

export type PlanMediaImage = {
  src: string;
  alt: string;
};

function shuffle<T>(items: T[]) {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = pool[i];
    const swap = pool[j];
    if (current && swap) {
      pool[i] = swap;
      pool[j] = current;
    }
  }
  return pool;
}

export async function getPublishedPlanImages(): Promise<PlanMediaImage[]> {
  const plans = await prisma.plan.findMany({
    where: { published: true, category: { published: true } },
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    select: {
      title: true,
      coverUrl: true,
      gallery: {
        orderBy: { sortOrder: "asc" },
        select: { url: true },
      },
      sections: {
        orderBy: { sortOrder: "asc" },
        select: { title: true, imageUrl: true },
      },
    },
  });

  const collected: PlanMediaImage[] = [];
  const seen = new Set<string>();

  const add = (src: string | null | undefined, alt: string) => {
    const url = src?.trim();
    if (!url || seen.has(url)) return;
    seen.add(url);
    collected.push({ src: url, alt });
  };

  for (const plan of plans) {
    add(plan.coverUrl, plan.title);
    for (const image of plan.gallery) {
      add(image.url, plan.title);
    }
    for (const section of plan.sections) {
      add(section.imageUrl, `${plan.title} · ${section.title}`);
    }
  }

  if (collected.length === 0) {
    const categories = await prisma.category.findMany({
      where: { published: true, coverUrl: { not: null } },
      orderBy: { sortOrder: "asc" },
      select: { title: true, coverUrl: true },
    });
    for (const category of categories) {
      add(category.coverUrl, category.title);
    }
  }

  return shuffle(collected);
}

export function pickRandomPlanImages(
  pool: ReadonlyArray<PlanMediaImage>,
  count: number,
  fallbacks: ReadonlyArray<PlanMediaImage>,
): PlanMediaImage[] {
  if (pool.length === 0) {
    return fallbacks.slice(0, count).map((image) => ({ ...image }));
  }

  const shuffled = shuffle([...pool]);
  return Array.from({ length: count }, (_, index) => {
    const real = shuffled[index % shuffled.length];
    const fallback = fallbacks[index] ?? fallbacks[0];
    return real ?? (fallback ? { ...fallback } : { src: "", alt: "" });
  }).filter((image) => image.src);
}

export async function getPublicComparisonCategories() {
  return prisma.category.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: {
      plans: {
        where: { published: true },
        orderBy: { sortOrder: "asc" },
        select: { id: true },
      },
    },
  });
}

export async function getPublicComparisonBySlug(slug: string) {
  return prisma.category.findFirst({
    where: { slug, published: true },
    include: {
      plans: {
        where: { published: true },
        orderBy: { sortOrder: "asc" },
        include: {
          sections: { orderBy: { sortOrder: "asc" } },
          priceTiers: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });
}
