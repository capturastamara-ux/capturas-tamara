import { nestByParent } from "@/lib/admin/subcategory-tree";
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

const publishedPlanWhere = {
  published: true,
  category: { published: true },
  OR: [{ subcategoryId: null }, { subcategory: { published: true } }],
};

const publishedPlanOrderBy = [
  { category: { sortOrder: "asc" as const } },
  { subcategory: { sortOrder: "asc" as const } },
  { sortOrder: "asc" as const },
];

export async function getPublishedCategories() {
  return prisma.category.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: {
      subcategories: {
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
      },
    },
  });
}

export async function getCategoryBySlug(slug: string) {
  const category = await prisma.category.findFirst({
    where: { slug, published: true },
    include: {
      gallery: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, url: true },
      },
      plans: {
        where: { published: true, subcategoryId: null },
        orderBy: { sortOrder: "asc" },
        include: planInclude,
      },
      subcategories: {
        where: { published: true },
        orderBy: { sortOrder: "asc" },
        include: {
          gallery: {
            orderBy: { sortOrder: "asc" },
            select: { id: true, url: true },
          },
          plans: {
            where: { published: true },
            orderBy: { sortOrder: "asc" },
            include: planInclude,
          },
        },
      },
    },
  });

  if (!category) return null;

  return {
    ...category,
    subcategories: nestByParent(category.subcategories),
  };
}

function findSubcategoryNode<T extends { slug: string; title: string; children: T[] }>(
  nodes: T[],
  slug: string,
  parent: T | null = null,
): { node: T; parent: T | null } | null {
  for (const node of nodes) {
    if (node.slug === slug) return { node, parent };
    const nested = findSubcategoryNode(node.children, slug, node);
    if (nested) return nested;
  }
  return null;
}

export async function getPublishedSubcategoryBranch(
  categorySlug: string,
  subcategorySlug: string,
) {
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return null;

  const match = findSubcategoryNode(category.subcategories, subcategorySlug);
  if (!match) return null;

  return { category, node: match.node, parent: match.parent };
}

export async function getSubcategoryBySlugs(
  categorySlug: string,
  subcategorySlug: string,
) {
  return prisma.subcategory.findFirst({
    where: {
      slug: subcategorySlug,
      published: true,
      category: { slug: categorySlug, published: true },
    },
    include: {
      category: {
        select: { id: true, slug: true, title: true, description: true },
      },
      gallery: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, url: true },
      },
      plans: {
        where: { published: true },
        orderBy: { sortOrder: "asc" },
        include: planInclude,
      },
    },
  });
}

export async function getPlanBySlugs(
  categorySlug: string,
  subcategorySlug: string,
  planSlug: string,
) {
  return prisma.plan.findFirst({
    where: {
      slug: planSlug,
      published: true,
      subcategory: {
        slug: subcategorySlug,
        published: true,
        category: { slug: categorySlug, published: true },
      },
    },
    include: {
      subcategory: {
        include: {
          category: true,
        },
      },
      ...planInclude,
    },
  });
}

export async function getAllPublishedPlans() {
  return prisma.plan.findMany({
    where: publishedPlanWhere,
    orderBy: publishedPlanOrderBy,
    include: {
      category: { select: { id: true, slug: true, title: true } },
      subcategory: {
        select: {
          id: true,
          slug: true,
          title: true,
          category: { select: { id: true, slug: true, title: true } },
        },
      },
    },
  });
}

export async function getLandingGalleryImages() {
  const plans = await prisma.plan.findMany({
    where: publishedPlanWhere,
    orderBy: publishedPlanOrderBy,
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
    where: publishedPlanWhere,
    orderBy: publishedPlanOrderBy,
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
  const categories = await prisma.category.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: {
      plans: {
        where: { published: true, subcategoryId: null },
        select: { id: true },
      },
      subcategories: {
        where: { published: true },
        include: {
          plans: {
            where: { published: true },
            select: { id: true },
          },
        },
      },
    },
  });

  return categories.map((category) => ({
    ...category,
    plans: [
      ...category.plans,
      ...category.subcategories.flatMap((subcategory) => subcategory.plans),
    ],
  }));
}

export async function getPublicComparisonBySlug(slug: string) {
  const category = await prisma.category.findFirst({
    where: { slug, published: true },
    include: {
      plans: {
        where: { published: true, subcategoryId: null },
        orderBy: { sortOrder: "asc" },
        include: {
          sections: { orderBy: { sortOrder: "asc" } },
          priceTiers: { orderBy: { sortOrder: "asc" } },
        },
      },
      subcategories: {
        where: { published: true },
        orderBy: { sortOrder: "asc" },
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
      },
    },
  });

  if (!category) return null;

  return {
    ...category,
    plans: [
      ...category.plans,
      ...category.subcategories.flatMap((subcategory) => subcategory.plans),
    ],
  };
}

export async function getCatalogPrintRowsByProduct() {
  const rows = await prisma.catalogPrintRow.findMany({
    orderBy: [{ productId: "asc" }, { sortOrder: "asc" }],
    select: { productId: true, name: true, price: true },
  });

  const byProduct: Record<string, Array<{ size: string; price: number }>> = {};
  for (const row of rows) {
    const current = byProduct[row.productId] ?? [];
    current.push({ size: row.name, price: row.price });
    byProduct[row.productId] = current;
  }
  return byProduct;
}
