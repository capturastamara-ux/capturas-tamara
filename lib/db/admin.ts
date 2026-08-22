import { aggregateAdminClients } from "@/lib/admin/clients";
import { prisma } from "@/lib/db/prisma";

export async function getAdminDashboardStats() {
  const [row] = await prisma.$queryRaw<
    Array<{
      categories: bigint;
      plans: bigint;
      published_plans: bigint;
      reservations: bigint;
    }>
  >`
    SELECT
      (SELECT COUNT(*) FROM "Category") AS categories,
      (SELECT COUNT(*) FROM "Plan") AS plans,
      (SELECT COUNT(*) FROM "Plan" WHERE "published" = true) AS published_plans,
      (SELECT COUNT(*) FROM "Reservation") AS reservations
  `;

  return {
    categories: Number(row.categories),
    plans: Number(row.plans),
    publishedPlans: Number(row.published_plans),
    reservations: Number(row.reservations),
  };
}

export async function getAdminCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { plans: true } },
    },
  });
}

export async function getAdminCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      plans: {
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { sections: true, gallery: true } } },
      },
    },
  });
}

export async function getAdminPlans() {
  return prisma.plan.findMany({
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    include: {
      category: { select: { id: true, title: true, slug: true } },
      _count: { select: { sections: true, gallery: true } },
    },
  });
}

export async function getAdminPlanGroups() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      plans: {
        orderBy: { sortOrder: "asc" },
        include: {
          _count: { select: { sections: true } },
        },
      },
    },
  });

  return categories
    .filter((category) => category.plans.length > 0)
    .map((category) => ({
      id: category.id,
      title: category.title,
      slug: category.slug,
      plans: category.plans.map((plan) => ({
        id: plan.id,
        title: plan.title,
        slug: plan.slug,
        price: plan.price,
        coverUrl: plan.coverUrl,
        published: plan.published,
        sectionCount: plan._count.sections,
        categorySlug: category.slug,
      })),
    }));
}

export async function getAdminPlanById(id: string) {
  return prisma.plan.findUnique({
    where: { id },
    include: {
      category: true,
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

export async function getAdminReservations() {
  return prisma.reservation.findMany({
    orderBy: [{ eventDate: "asc" }, { startTime: "asc" }],
    include: {
      category: { select: { id: true, title: true, slug: true } },
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

  const plans = await prisma.plan.findMany({
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    select: {
      id: true,
      title: true,
      categoryId: true,
      category: { select: { title: true } },
      priceTiers: {
        orderBy: { sortOrder: "asc" },
        select: { guestCount: true, price: true },
      },
    },
  });

  return { reservations, overrides, categories, plans };
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
      plan: {
        select: {
          id: true,
          title: true,
          tagline: true,
          description: true,
          price: true,
          categoryId: true,
          priceTiers: {
            orderBy: { sortOrder: "asc" },
            select: { guestCount: true, price: true },
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
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    select: {
      id: true,
      title: true,
      categoryId: true,
      category: { select: { title: true } },
      priceTiers: {
        orderBy: { sortOrder: "asc" },
        select: { guestCount: true, price: true },
      },
    },
  });
}

export async function getAdminComparisonCategories() {
  return prisma.category.findMany({
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
  });
}
