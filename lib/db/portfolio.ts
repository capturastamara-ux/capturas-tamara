import { cache } from "react";
import { unstable_cache } from "next/cache";
import { nestByParent, type TreeNode } from "@/lib/admin/subcategory-tree";
import { prisma } from "@/lib/db/prisma";
import { landingGallerySlots } from "@/config/gallery";
import type { PortfolioSubcategoryCoverNode } from "@/components/sections/PortfolioSubcategoryTree";

export const PORTFOLIO_CACHE_TAG = "portfolio";

const galleryOrder = { sortOrder: "asc" as const };

const planCardSelect = {
  id: true,
  slug: true,
  title: true,
  tagline: true,
  price: true,
  coverUrl: true,
  description: true,
  sections: {
    orderBy: galleryOrder,
    select: {
      id: true,
      title: true,
      intro: true,
      note: true,
    },
  },
} as const;

const coverSubcategorySelect = {
  id: true,
  slug: true,
  title: true,
  parentId: true,
  coverUrl: true,
  gallery: {
    orderBy: galleryOrder,
    take: 1,
    select: { url: true },
  },
  plans: {
    where: { published: true },
    orderBy: galleryOrder,
    take: 1,
    select: { coverUrl: true },
  },
} as const;

type SlimSubcategory = {
  id: string;
  slug: string;
  title: string;
  parentId: string | null;
  coverUrl: string | null;
  gallery: Array<{ url: string }>;
  plans: Array<{ coverUrl: string | null }>;
};

function cachedPortfolio<T>(key: string, loader: () => Promise<T>) {
  return unstable_cache(loader, [key], {
    tags: [PORTFOLIO_CACHE_TAG],
    revalidate: 120,
  })();
}

function toCoverNodes(items: SlimSubcategory[]): PortfolioSubcategoryCoverNode[] {
  const mapNode = (
    node: TreeNode<SlimSubcategory>,
  ): PortfolioSubcategoryCoverNode => ({
    slug: node.slug,
    title: node.title,
    coverUrl: node.coverUrl,
    gallery: node.gallery,
    plans: node.plans,
    children: node.children.map(mapNode),
  });

  return nestByParent(items).map(mapNode);
}

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

export const getPublishedCategorySummaries = cache(() =>
  cachedPortfolio("category-summaries", () =>
    prisma.category.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      select: {
        slug: true,
        title: true,
        coverUrl: true,
      },
    }),
  ),
);

export const getPublishedCategories = cache(() =>
  cachedPortfolio("published-categories", () =>
    prisma.category.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      select: {
        slug: true,
        title: true,
        subtitle: true,
        description: true,
        coverUrl: true,
        subcategories: {
          where: { published: true },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            slug: true,
            title: true,
            coverUrl: true,
            plans: {
              where: { published: true },
              orderBy: { sortOrder: "asc" },
              take: 1,
              select: { coverUrl: true, title: true, slug: true },
            },
          },
        },
      },
    }),
  ),
);

async function loadCategoryBySlug(slug: string) {
  const category = await prisma.category.findFirst({
    where: { slug, published: true },
    select: {
      slug: true,
      title: true,
      description: true,
      gallery: {
        orderBy: galleryOrder,
        select: { id: true, url: true },
      },
      plans: {
        where: { published: true, subcategoryId: null },
        orderBy: galleryOrder,
        select: planCardSelect,
      },
      subcategories: {
        where: { published: true },
        orderBy: galleryOrder,
        select: coverSubcategorySelect,
      },
    },
  });

  if (!category) return null;

  return {
    slug: category.slug,
    title: category.title,
    description: category.description,
    gallery: category.gallery,
    plans: category.plans,
    subcategories: toCoverNodes(category.subcategories),
  };
}

export const getCategoryBySlug = cache((slug: string) =>
  cachedPortfolio(`category-by-slug:${slug}`, () => loadCategoryBySlug(slug)),
);

function findSubcategoryNode<
  T extends { slug: string; title: string; children: T[] },
>(
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

async function loadSubcategoryBranch(
  categorySlug: string,
  subcategorySlug: string,
) {
  const category = await prisma.category.findFirst({
    where: { slug: categorySlug, published: true },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
    },
  });
  if (!category) return null;

  const relatives = await prisma.subcategory.findMany({
    where: { categoryId: category.id, published: true },
    orderBy: { sortOrder: "asc" },
    select: coverSubcategorySelect,
  });

  const tree = toCoverNodes(relatives);
  const match = findSubcategoryNode(tree, subcategorySlug);
  if (!match) return null;

  const currentId = relatives.find((item) => item.slug === subcategorySlug)?.id;
  if (!currentId) return null;

  const current = await prisma.subcategory.findFirst({
    where: { id: currentId },
    select: {
      gallery: {
        orderBy: galleryOrder,
        select: { id: true, url: true },
      },
      plans: {
        where: { published: true },
        orderBy: galleryOrder,
        select: planCardSelect,
      },
    },
  });

  return {
    category: {
      slug: category.slug,
      title: category.title,
      description: category.description,
    },
    parent: match.parent
      ? { slug: match.parent.slug, title: match.parent.title }
      : null,
    node: {
      slug: match.node.slug,
      title: match.node.title,
      children: match.node.children,
      gallery: current?.gallery ?? [],
      plans: current?.plans ?? [],
    },
  };
}

export const getPublishedSubcategoryBranch = cache(
  (categorySlug: string, subcategorySlug: string) =>
    cachedPortfolio(
      `subcategory-branch:${categorySlug}:${subcategorySlug}`,
      () => loadSubcategoryBranch(categorySlug, subcategorySlug),
    ),
);

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
        select: planCardSelect,
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
      sections: {
        orderBy: galleryOrder,
      },
      gallery: {
        orderBy: galleryOrder,
      },
      priceTiers: {
        orderBy: galleryOrder,
      },
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

export const getPublishedPlanImages = cache(() =>
  cachedPortfolio("published-plan-images", loadPublishedPlanImages),
);

async function loadPublishedPlanImages(): Promise<PlanMediaImage[]> {
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

export const getCatalogPrintRowsByProduct = cache(() =>
  cachedPortfolio("catalog-print-rows", async () => {
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
  }),
);

export const getCatalogConditions = cache(() =>
  cachedPortfolio("catalog-conditions", async () => {
    return prisma.catalogCondition.findMany({
      orderBy: { sortOrder: "asc" },
      select: { title: true, body: true },
    });
  }),
);

const liveEventSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  buttonLabel: true,
  buttonUrl: true,
} as const;

export const getPublishedLiveEvents = cache(() =>
  cachedPortfolio("live-events", async () => {
    return prisma.liveEvent.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: liveEventSelect,
    });
  }),
);

export const getPublishedLiveEventBySlug = cache((slug: string) =>
  cachedPortfolio(`live-event-${slug}`, async () => {
    return prisma.liveEvent.findFirst({
      where: { slug, published: true },
      select: liveEventSelect,
    });
  }),
);
