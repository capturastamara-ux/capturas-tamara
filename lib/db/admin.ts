import { aggregateAdminClients } from "@/lib/admin/clients";
import { pathLabelMap } from "@/lib/admin/subcategory-tree";
import { prisma } from "@/lib/db/prisma";

export async function getAdminDashboardStats() {
  const [row] = await prisma.$queryRaw<
    Array<{
      categories: bigint;
      subcategories: bigint;
      plans: bigint;
      published_plans: bigint;
      reservations: bigint;
      reserved_value: bigint;
    }>
  >`
    SELECT
      (SELECT COUNT(*) FROM "Category") AS categories,
      (SELECT COUNT(*) FROM "Subcategory") AS subcategories,
      (SELECT COUNT(*) FROM "Plan") AS plans,
      (SELECT COUNT(*) FROM "Plan" WHERE "published" = true) AS published_plans,
      (SELECT COUNT(*) FROM "Reservation") AS reservations,
      (
        SELECT COALESCE(
          SUM(COALESCE("amountPaid", 0) + COALESCE("amountRemaining", 0)),
          0
        )
        FROM "Reservation"
        WHERE "status" <> 'cancelled'
      ) AS reserved_value
  `;

  return {
    categories: Number(row.categories),
    subcategories: Number(row.subcategories),
    plans: Number(row.plans),
    publishedPlans: Number(row.published_plans),
    reservations: Number(row.reservations),
    reservedValue: Number(row.reserved_value),
  };
}

export async function getAdminCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { subcategories: true } },
    },
  });
}

export async function getAdminCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      gallery: { orderBy: { sortOrder: "asc" } },
      subcategories: {
        orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
        include: { _count: { select: { plans: true } } },
      },
    },
  });
}

export async function getAdminSubcategories() {
  return prisma.subcategory.findMany({
    orderBy: [
      { category: { sortOrder: "asc" } },
      { parentId: "asc" },
      { sortOrder: "asc" },
    ],
    include: {
      category: { select: { id: true, title: true, slug: true } },
      _count: { select: { plans: true, children: true } },
    },
  });
}

export async function getAdminSubcategoryById(id: string) {
  return prisma.subcategory.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, title: true, slug: true } },
      children: {
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { plans: true } } },
      },
      gallery: { orderBy: { sortOrder: "asc" } },
      plans: {
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { sections: true, gallery: true } } },
      },
    },
  });
}

export async function getAdminPlans() {
  return prisma.plan.findMany({
    orderBy: [
      { category: { sortOrder: "asc" } },
      { subcategory: { sortOrder: "asc" } },
      { sortOrder: "asc" },
    ],
    include: {
      category: { select: { id: true, title: true, slug: true } },
      subcategory: {
        select: {
          id: true,
          title: true,
          slug: true,
          category: { select: { id: true, title: true, slug: true } },
        },
      },
      _count: { select: { sections: true, gallery: true } },
    },
  });
}

export async function getAdminPlanGroups() {
  const [categories, subcategories] = await Promise.all([
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        title: true,
        slug: true,
        plans: {
          where: { subcategoryId: null },
          orderBy: { sortOrder: "asc" },
          include: { _count: { select: { sections: true } } },
        },
      },
    }),
    prisma.subcategory.findMany({
      orderBy: [
        { category: { sortOrder: "asc" } },
        { sortOrder: "asc" },
      ],
      include: {
        category: { select: { id: true, title: true, slug: true } },
        plans: {
          orderBy: { sortOrder: "asc" },
          include: {
            _count: { select: { sections: true } },
          },
        },
      },
    }),
  ]);

  const labels = pathLabelMap(subcategories);

  const categoryGroups = categories
    .filter((category) => category.plans.length > 0)
    .map((category) => ({
      id: category.id,
      scope: "category" as const,
      title: category.title,
      slug: category.slug,
      categoryTitle: "Categoría",
      plans: category.plans.map((plan) => ({
        id: plan.id,
        title: plan.title,
        slug: plan.slug,
        price: plan.price,
        coverUrl: plan.coverUrl,
        published: plan.published,
        sectionCount: plan._count.sections,
        categorySlug: category.slug,
        subcategorySlug: null,
      })),
    }));

  const subcategoryGroups = subcategories
    .filter((subcategory) => subcategory.plans.length > 0)
    .map((subcategory) => ({
      id: subcategory.id,
      scope: "subcategory" as const,
      title: labels.get(subcategory.id) ?? subcategory.title,
      slug: subcategory.slug,
      categoryTitle: subcategory.category.title,
      plans: subcategory.plans.map((plan) => ({
        id: plan.id,
        title: plan.title,
        slug: plan.slug,
        price: plan.price,
        coverUrl: plan.coverUrl,
        published: plan.published,
        sectionCount: plan._count.sections,
        categorySlug: subcategory.category.slug,
        subcategorySlug: subcategory.slug,
      })),
    }));

  return [...categoryGroups, ...subcategoryGroups];
}

export async function getAdminPlanById(id: string) {
  return prisma.plan.findUnique({
    where: { id },
    include: {
      category: true,
      subcategory: {
        include: { category: true },
      },
      sections: {
        orderBy: { sortOrder: "asc" },
      },
      gallery: { orderBy: { sortOrder: "asc" } },
      priceTiers: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getAdminSectionById(id: string) {
  return prisma.planSection.findUnique({
    where: { id },
    include: {
      plan: {
        select: {
          id: true,
          title: true,
          category: { select: { title: true } },
          subcategory: {
            select: {
              title: true,
              category: { select: { title: true } },
            },
          },
        },
      },
    },
  });
}

export async function getAdminCategoryOptions() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, title: true, slug: true },
  });
}

export async function getAdminSubcategoryOptions() {
  return prisma.subcategory.findMany({
    orderBy: [
      { category: { sortOrder: "asc" } },
      { sortOrder: "asc" },
    ],
    select: {
      id: true,
      title: true,
      slug: true,
      categoryId: true,
      parentId: true,
      category: { select: { id: true, title: true } },
    },
  });
}

export async function getAdminReservations() {
  return prisma.reservation.findMany({
    orderBy: [{ eventDate: "asc" }, { startTime: "asc" }],
    include: {
      category: { select: { id: true, title: true, slug: true } },
      subcategory: { select: { id: true, title: true, slug: true } },
      plan: { select: { id: true, title: true } },
    },
  });
}

export async function getAdminCalendarData() {
  const reservations = await prisma.reservation.findMany({
    where: { status: { not: "cancelled" } },
    orderBy: [{ eventDate: "asc" }, { startTime: "asc" }],
    select: {
      id: true,
      eventDate: true,
      startTime: true,
      clientName: true,
      clientPhone: true,
      eventTitle: true,
      status: true,
      category: { select: { id: true, title: true, slug: true } },
    },
  });

  const overrides = await prisma.availabilityOverride.findMany({
    orderBy: { date: "asc" },
    select: { date: true, isOpen: true, note: true },
  });

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, title: true, slug: true },
  });

  const subcategories = await prisma.subcategory.findMany({
    orderBy: [
      { category: { sortOrder: "asc" } },
      { sortOrder: "asc" },
    ],
    select: {
      id: true,
      title: true,
      categoryId: true,
      parentId: true,
    },
  });

  const plans = await prisma.plan.findMany({
    orderBy: [
      { category: { sortOrder: "asc" } },
      { subcategory: { sortOrder: "asc" } },
      { sortOrder: "asc" },
    ],
    select: {
      id: true,
      title: true,
      categoryId: true,
      subcategoryId: true,
      category: { select: { title: true } },
      subcategory: {
        select: {
          categoryId: true,
          title: true,
          category: { select: { title: true } },
        },
      },
      price: true,
    },
  });

  return { reservations, overrides, categories, subcategories, plans };
}

export async function getAdminReservationsForDate(eventDate: Date) {
  return prisma.reservation.findMany({
    where: {
      eventDate,
      status: { not: "cancelled" },
    },
    select: {
      id: true,
      startTime: true,
      clientName: true,
    },
  });
}

export async function getAdminClients() {
  const reservations = await prisma.reservation.findMany({
    orderBy: [{ eventDate: "desc" }],
    select: {
      id: true,
      eventDate: true,
      clientName: true,
      clientPhone: true,
      clientEmail: true,
      eventTitle: true,
      location: true,
      status: true,
      amountPaid: true,
      amountRemaining: true,
      category: { select: { title: true } },
      plan: { select: { title: true } },
    },
  });

  return aggregateAdminClients(reservations);
}

export async function getAdminReservationById(id: string) {
  return prisma.reservation.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, title: true } },
      subcategory: { select: { id: true, title: true } },
      plan: {
        select: {
          id: true,
          title: true,
          tagline: true,
          description: true,
          price: true,
          categoryId: true,
          subcategoryId: true,
          subcategory: {
            select: {
              categoryId: true,
            },
          },
          sections: {
            orderBy: { sortOrder: "asc" },
            select: { title: true, intro: true },
          },
        },
      },
    },
  });
}

export async function getAdminPlanOptions() {
  return prisma.plan.findMany({
    orderBy: [
      { category: { sortOrder: "asc" } },
      { subcategory: { sortOrder: "asc" } },
      { sortOrder: "asc" },
    ],
    select: {
      id: true,
      title: true,
      categoryId: true,
      subcategoryId: true,
      category: { select: { title: true } },
      subcategory: {
        select: {
          categoryId: true,
          title: true,
          category: { select: { title: true } },
        },
      },
      price: true,
    },
  });
}

export async function getAdminComparisonCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      plans: {
        where: { subcategoryId: null },
        orderBy: { sortOrder: "asc" },
        include: {
          sections: { orderBy: { sortOrder: "asc" } },
          priceTiers: { orderBy: { sortOrder: "asc" } },
        },
      },
      subcategories: {
        orderBy: { sortOrder: "asc" },
        include: {
          plans: {
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

  return categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    title: category.title,
    plans: [
      ...category.plans,
      ...category.subcategories.flatMap((subcategory) => subcategory.plans),
    ],
  }));
}
