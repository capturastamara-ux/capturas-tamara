"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import {
  getNextAvailabilityState,
  isDefaultOpenDay,
  parseDayKey,
} from "@/lib/admin/availability";
import {
  nextCategorySortOrder,
  nextGallerySortOrder,
  nextPlanSortOrder,
  nextSectionSortOrder,
  nextSubcategoryGallerySortOrder,
  nextSubcategorySortOrder,
  parseOptionalString,
  parseOptionalPrice,
  parseRichTextOptional,
  parsePublished,
  parseSortOrder,
  uniqueCategorySlug,
  uniquePlanSlug,
  uniqueSubcategorySlug,
} from "@/lib/admin/form";
import { descendantIdSet } from "@/lib/admin/subcategory-tree";
import { removedStorageUrls } from "@/lib/storage/media";
import {
  collectCategoryMediaUrls,
  collectPlanMediaUrls,
  collectSubcategoryMediaUrls,
  deleteStoredMedia,
} from "@/lib/storage/server-media";
import {
  getFirstReservationFormError,
  validateReservationFormData,
  type ReservationFormErrors,
} from "@/lib/admin/reservation-form-validation";
import { sendReservationConfirmationEmail } from "@/lib/email/send-reservation-confirmation";
import { buildReservationContractData } from "@/lib/admin/reservation-contract";
import { getAdminReservationById } from "@/lib/db/admin";
import { redirectAfterSave } from "@/lib/admin/return-to";
import { reservationConfig } from "@/config/reservations";
import { isRangeAvailable, parseTimeRange } from "@/lib/admin/time-slots";
import {
  deleteReservationFromGoogleCalendar,
  syncReservationToGoogleCalendar,
} from "@/lib/google/calendar";

export type CreateReservationModalResult =
  | {
      ok: true;
      emailSent: boolean;
      emailSentTo?: string;
      emailError?: string;
      calendarSynced?: boolean;
      calendarError?: string;
    }
  | { ok: false; message: string; fieldErrors?: ReservationFormErrors };

function revalidatePortfolio() {
  revalidatePath("/");
  revalidatePath("/portafolio");
  revalidatePath("/cotizador");
  revalidatePath("/admin");
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/subcategorias");
  revalidatePath("/admin/planes");
  revalidatePath("/admin/reservas");
  revalidatePath("/admin/cotizador");
}

export async function createCategoryAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    throw new Error("El título es obligatorio.");
  }

  const slug = await uniqueCategorySlug(title);

  const coverUrl = parseOptionalString(formData.get("coverUrl"));

  try {
    await prisma.category.create({
      data: {
        title,
        slug,
        subtitle: parseOptionalString(formData.get("subtitle")),
        description: parseRichTextOptional(formData.get("description")),
        coverUrl,
        sortOrder: await nextCategorySortOrder(),
        published: parsePublished(formData.get("published")),
      },
    });
  } catch (error) {
    await deleteStoredMedia([coverUrl]);
    throw error;
  }

  revalidatePortfolio();
  redirectAfterSave(formData, "/admin/categorias", "created");
}

export async function updateCategoryAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!id || !title) {
    throw new Error("Datos incompletos.");
  }

  const slug = await uniqueCategorySlug(title, id);
  const existing = await prisma.category.findUnique({
    where: { id },
    select: { coverUrl: true },
  });
  const coverUrl = parseOptionalString(formData.get("coverUrl"));

  await prisma.category.update({
    where: { id },
    data: {
      title,
      slug,
      subtitle: parseOptionalString(formData.get("subtitle")),
      description: parseRichTextOptional(formData.get("description")),
      coverUrl,
      published: parsePublished(formData.get("published")),
    },
  });

  await deleteStoredMedia(removedStorageUrls(existing?.coverUrl, coverUrl));

  revalidatePortfolio();
  redirectAfterSave(formData, "/admin/categorias", "updated");
}

export async function reorderCategoriesAction(orderedIds: string[]) {
  if (orderedIds.length === 0) return;

  const existing = await prisma.category.findMany({
    select: { id: true },
  });
  const existingIds = new Set(existing.map((category) => category.id));
  if (
    orderedIds.length !== existingIds.size ||
    orderedIds.some((id) => !existingIds.has(id))
  ) {
    throw new Error("El orden de categorías no es válido.");
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.category.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  revalidatePortfolio();
  revalidatePath("/admin/categorias");
}

export async function deleteCategoryAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      subcategories: {
        include: {
          gallery: true,
          plans: {
            include: {
              sections: true,
              gallery: true,
            },
          },
        },
      },
    },
  });

  if (category) {
    await deleteStoredMedia(collectCategoryMediaUrls(category));
    await prisma.category.delete({ where: { id } });
  }
  revalidatePortfolio();
  redirect("/admin/categorias");
}

async function resolveSubcategoryPlacement(
  categoryId: string,
  parentId: string | null,
  excludeId?: string,
) {
  if (!parentId) {
    return { categoryId, parentId: null };
  }

  if (excludeId && parentId === excludeId) {
    throw new Error("Una subcategoría no puede colgar de sí misma.");
  }

  const parent = await prisma.subcategory.findUnique({
    where: { id: parentId },
    select: { id: true, categoryId: true },
  });
  if (!parent) {
    throw new Error("La subcategoría padre no existe.");
  }

  if (excludeId) {
    const relatives = await prisma.subcategory.findMany({
      select: { id: true, parentId: true },
    });
    if (descendantIdSet(relatives, excludeId).has(parentId)) {
      throw new Error("No puedes colgar una subcategoría dentro de una hija suya.");
    }
  }

  return { categoryId: parent.categoryId, parentId: parent.id };
}

export async function createSubcategoryAction(formData: FormData) {
  const categoryId = String(formData.get("categoryId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!categoryId || !title) {
    throw new Error("Categoría y título son obligatorios.");
  }

  const placement = await resolveSubcategoryPlacement(
    categoryId,
    parseOptionalId(formData.get("parentId")),
  );
  const slug = await uniqueSubcategorySlug(placement.categoryId, title);
  const coverUrl = parseOptionalString(formData.get("coverUrl"));

  let subcategory;
  try {
    subcategory = await prisma.subcategory.create({
      data: {
        categoryId: placement.categoryId,
        parentId: placement.parentId,
        title,
        slug,
        subtitle: parseOptionalString(formData.get("subtitle")),
        description: parseRichTextOptional(formData.get("description")),
        coverUrl,
        sortOrder: await nextSubcategorySortOrder(
          placement.categoryId,
          placement.parentId,
        ),
        published: parsePublished(formData.get("published")),
      },
    });
  } catch (error) {
    await deleteStoredMedia([coverUrl]);
    throw error;
  }

  revalidatePortfolio();
  redirectAfterSave(formData, "/admin/subcategorias", "created");
}

export async function updateSubcategoryAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!id || !categoryId || !title) {
    throw new Error("Datos incompletos.");
  }

  const placement = await resolveSubcategoryPlacement(
    categoryId,
    parseOptionalId(formData.get("parentId")),
    id,
  );
  const slug = await uniqueSubcategorySlug(placement.categoryId, title, id);
  const existing = await prisma.subcategory.findUnique({
    where: { id },
    select: { coverUrl: true, categoryId: true, parentId: true },
  });
  const coverUrl = parseOptionalString(formData.get("coverUrl"));
  const moved =
    existing?.categoryId !== placement.categoryId ||
    existing?.parentId !== placement.parentId;
  const sortOrder = moved
    ? await nextSubcategorySortOrder(placement.categoryId, placement.parentId)
    : undefined;

  await prisma.subcategory.update({
    where: { id },
    data: {
      categoryId: placement.categoryId,
      parentId: placement.parentId,
      title,
      slug,
      subtitle: parseOptionalString(formData.get("subtitle")),
      description: parseRichTextOptional(formData.get("description")),
      coverUrl,
      published: parsePublished(formData.get("published")),
      ...(sortOrder != null ? { sortOrder } : {}),
    },
  });

  if (existing && existing.categoryId !== placement.categoryId) {
    const relatives = await prisma.subcategory.findMany({
      select: { id: true, parentId: true },
    });
    const descendantIds = [...descendantIdSet(relatives, id)];
    if (descendantIds.length > 0) {
      await prisma.subcategory.updateMany({
        where: { id: { in: descendantIds } },
        data: { categoryId: placement.categoryId },
      });
    }
  }

  await deleteStoredMedia(removedStorageUrls(existing?.coverUrl, coverUrl));

  revalidatePortfolio();
  redirectAfterSave(formData, "/admin/subcategorias", "updated");
}

export async function reorderSubcategoriesAction(orderedIds: string[]) {
  if (orderedIds.length === 0) return;

  const existing = await prisma.subcategory.findMany({
    where: { id: { in: orderedIds } },
    select: { id: true, parentId: true, categoryId: true },
  });
  if (existing.length !== orderedIds.length) {
    throw new Error("El orden de subcategorías no es válido.");
  }

  const parentId = existing[0]?.parentId ?? null;
  const categoryId = existing[0]?.categoryId;
  if (
    existing.some(
      (item) =>
        item.parentId !== parentId || item.categoryId !== categoryId,
    )
  ) {
    throw new Error("Solo puedes reordenar subcategorías del mismo nivel.");
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.subcategory.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  revalidatePortfolio();
  revalidatePath("/admin/subcategorias");
}

export async function deleteSubcategoryAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const subcategory = await prisma.subcategory.findUnique({
    where: { id },
    select: { id: true, categoryId: true },
  });
  if (!subcategory) return;

  const relatives = await prisma.subcategory.findMany({
    where: { categoryId: subcategory.categoryId },
    include: {
      gallery: true,
      plans: {
        include: {
          sections: true,
          gallery: true,
        },
      },
    },
  });
  const subtreeIds = new Set([id, ...descendantIdSet(relatives, id)]);
  const mediaUrls = relatives
    .filter((item) => subtreeIds.has(item.id))
    .flatMap((item) => collectSubcategoryMediaUrls(item));

  await deleteStoredMedia(mediaUrls);
  await prisma.subcategory.delete({ where: { id } });
  revalidatePortfolio();
  redirect("/admin/subcategorias");
}

export async function createPlanAction(formData: FormData) {
  const subcategoryId = String(formData.get("subcategoryId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!subcategoryId || !title) {
    throw new Error("Subcategoría y título son obligatorios.");
  }

  const slug = await uniquePlanSlug(subcategoryId, title);

  const coverUrl = parseOptionalString(formData.get("coverUrl"));
  const planPrice = parseOptionalPrice(formData.get("price"));

  let plan;
  try {
    plan = await prisma.plan.create({
      data: {
        subcategoryId,
        title,
        slug,
        tagline: parseOptionalString(formData.get("tagline")),
        price: planPrice,
        description: parseRichTextOptional(formData.get("description")),
        coverUrl,
        sortOrder: await nextPlanSortOrder(subcategoryId),
        published: parsePublished(formData.get("published")),
      },
    });
  } catch (error) {
    await deleteStoredMedia([coverUrl]);
    throw error;
  }

  revalidatePortfolio();
  redirectAfterSave(formData, "/admin/planes", "created");
}

export async function updatePlanAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const subcategoryId = String(formData.get("subcategoryId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!id || !subcategoryId || !title) {
    throw new Error("Datos incompletos.");
  }

  const slug = await uniquePlanSlug(subcategoryId, title, id);
  const existing = await prisma.plan.findUnique({
    where: { id },
    select: { coverUrl: true, subcategoryId: true },
  });
  const coverUrl = parseOptionalString(formData.get("coverUrl"));
  const planPrice = parseOptionalPrice(formData.get("price"));
  const subcategoryChanged = existing?.subcategoryId !== subcategoryId;
  const sortOrder = subcategoryChanged
    ? await nextPlanSortOrder(subcategoryId)
    : undefined;

  await prisma.$transaction([
    prisma.planPriceTier.deleteMany({ where: { planId: id } }),
    prisma.plan.update({
      where: { id },
      data: {
        subcategoryId,
        title,
        slug,
        tagline: parseOptionalString(formData.get("tagline")),
        price: planPrice,
        description: parseRichTextOptional(formData.get("description")),
        coverUrl,
        ...(sortOrder != null ? { sortOrder } : {}),
        published: parsePublished(formData.get("published")),
      },
    }),
  ]);

  await deleteStoredMedia(removedStorageUrls(existing?.coverUrl, coverUrl));

  revalidatePortfolio();
  redirectAfterSave(formData, "/admin/planes", "updated");
}

export async function deletePlanAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const plan = await prisma.plan.findUnique({
    where: { id },
    include: {
      sections: true,
      gallery: true,
    },
  });

  if (plan) {
    await deleteStoredMedia(collectPlanMediaUrls(plan));
    await prisma.plan.delete({ where: { id } });
  }
  revalidatePortfolio();
  redirect("/admin/planes");
}

export async function createSectionAction(formData: FormData) {
  const planId = String(formData.get("planId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!planId || !title) return;

  const imageUrl = parseOptionalString(formData.get("imageUrl"));

  try {
    await prisma.planSection.create({
      data: {
        planId,
        title,
        intro: parseOptionalString(formData.get("intro")),
        note: parseRichTextOptional(formData.get("note")),
        imageUrl,
        sortOrder: await nextSectionSortOrder(planId),
      },
    });
  } catch (error) {
    await deleteStoredMedia([imageUrl]);
    throw error;
  }

  revalidatePortfolio();
  revalidatePath(`/admin/planes/${planId}`);
}

export async function reorderPlansAction(subcategoryId: string, orderedIds: string[]) {
  if (!subcategoryId || orderedIds.length === 0) return;

  const existing = await prisma.plan.findMany({
    where: { subcategoryId },
    select: { id: true },
  });
  const existingIds = new Set(existing.map((plan) => plan.id));
  if (
    orderedIds.length !== existingIds.size ||
    orderedIds.some((id) => !existingIds.has(id))
  ) {
    throw new Error("El orden de planes no es válido.");
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.plan.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  revalidatePortfolio();
  revalidatePath("/admin/planes");
}

export async function reorderSectionsAction(planId: string, orderedIds: string[]) {
  if (!planId || orderedIds.length === 0) return;

  const existing = await prisma.planSection.findMany({
    where: { planId },
    select: { id: true },
  });
  const existingIds = new Set(existing.map((section) => section.id));
  if (
    orderedIds.length !== existingIds.size ||
    orderedIds.some((id) => !existingIds.has(id))
  ) {
    throw new Error("El orden de secciones no es válido.");
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.planSection.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  revalidatePortfolio();
  revalidatePath(`/admin/planes/${planId}`);
}

export async function updateSectionAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const planId = String(formData.get("planId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!id || !planId || !title) return;

  const existing = await prisma.planSection.findUnique({
    where: { id },
    select: { imageUrl: true },
  });
  const imageUrl = parseOptionalString(formData.get("imageUrl"));

  await prisma.planSection.update({
    where: { id },
    data: {
      title,
      intro: parseOptionalString(formData.get("intro")),
      note: parseRichTextOptional(formData.get("note")),
      imageUrl,
    },
  });

  await deleteStoredMedia(removedStorageUrls(existing?.imageUrl, imageUrl));

  revalidatePortfolio();
  revalidatePath(`/admin/planes/${planId}`);
  redirect(`/admin/planes/${planId}?saved=section`);
}

export async function deleteSectionAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const planId = String(formData.get("planId") ?? "");
  if (!id || !planId) return;

  const section = await prisma.planSection.findUnique({
    where: { id },
    select: { imageUrl: true },
  });

  if (section) {
    await deleteStoredMedia([section.imageUrl]);
    await prisma.planSection.delete({ where: { id } });
  }
  revalidatePortfolio();
  revalidatePath(`/admin/planes/${planId}`);
  redirect(`/admin/planes/${planId}`);
}

export async function createSubcategoryGalleryImagesAction(formData: FormData) {
  const subcategoryId = String(formData.get("subcategoryId") ?? "");
  const urls = formData
    .getAll("url")
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (!subcategoryId || urls.length === 0) return;

  const startOrder = await nextSubcategoryGallerySortOrder(subcategoryId);

  try {
    await prisma.subcategoryGalleryImage.createMany({
      data: urls.map((url, index) => ({
        subcategoryId,
        url,
        sortOrder: startOrder + index,
      })),
    });
  } catch (error) {
    await deleteStoredMedia(urls);
    throw error;
  }

  revalidatePortfolio();
  revalidatePath(`/admin/subcategorias/${subcategoryId}`);
}

export async function deleteSubcategoryGalleryImageAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const subcategoryId = String(formData.get("subcategoryId") ?? "");
  if (!id || !subcategoryId) return;

  const image = await prisma.subcategoryGalleryImage.findUnique({
    where: { id },
    select: { url: true },
  });

  if (image) {
    await deleteStoredMedia([image.url]);
    await prisma.subcategoryGalleryImage.delete({ where: { id } });
  }

  revalidatePortfolio();
  revalidatePath(`/admin/subcategorias/${subcategoryId}`);
}

export async function createGalleryImageAction(formData: FormData) {
  const planId = String(formData.get("planId") ?? "");
  const url = String(formData.get("url") ?? "").trim();
  if (!planId || !url) return;

  try {
    await prisma.planGalleryImage.create({
      data: {
        planId,
        url,
        sortOrder: await nextGallerySortOrder(planId),
      },
    });
  } catch (error) {
    await deleteStoredMedia([url]);
    throw error;
  }

  revalidatePortfolio();
  revalidatePath(`/admin/planes/${planId}`);
}

export async function deleteGalleryImageAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const planId = String(formData.get("planId") ?? "");
  if (!id || !planId) return;

  const image = await prisma.planGalleryImage.findUnique({
    where: { id },
    select: { url: true },
  });

  if (image) {
    await deleteStoredMedia([image.url]);
    await prisma.planGalleryImage.delete({ where: { id } });
  }
  revalidatePortfolio();
  revalidatePath(`/admin/planes/${planId}`);
}

type ReservationStatus = "pending" | "confirmed" | "cancelled";

function parseReservationStatus(value: FormDataEntryValue | null): ReservationStatus {
  const status = String(value ?? "pending");
  if (status === "confirmed" || status === "cancelled") return status;
  return "pending";
}

function parseEventDate(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) {
    throw new Error("La fecha del evento es obligatoria.");
  }
  return new Date(`${text}T12:00:00.000Z`);
}

async function findReservationTimeConflict(
  eventDate: Date,
  startTime: string | null,
  excludeId?: string,
) {
  if (!startTime) return reservationConfig.hours.requiredError;

  const range = parseTimeRange(startTime);
  if (!range) return reservationConfig.hours.invalidError;

  const existing = await prisma.reservation.findMany({
    where: {
      eventDate,
      status: { not: "cancelled" },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { startTime: true, clientName: true },
  });

  if (!isRangeAvailable(range, existing)) {
    return reservationConfig.hours.overlapError;
  }

  return null;
}

function parseOptionalId(value: FormDataEntryValue | null) {
  const id = String(value ?? "").trim();
  return id.length > 0 ? id : null;
}

function parseOptionalGuestCount(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const count = Number.parseInt(text, 10);
  return Number.isFinite(count) && count > 0 ? count : null;
}

export async function toggleDayAvailabilityAction(formData: FormData) {
  const dateKey = String(formData.get("date") ?? "").trim();
  if (!dateKey) {
    throw new Error("La fecha es obligatoria.");
  }

  const date = parseDayKey(dateKey);
  const existing = await prisma.availabilityOverride.findUnique({
    where: { date },
    select: { isOpen: true },
  });

  const currentOpen = existing?.isOpen ?? isDefaultOpenDay(date);
  const hasOverride = existing !== null;
  const { isOpen, clearOverride } = getNextAvailabilityState(
    currentOpen,
    hasOverride,
    isDefaultOpenDay(date),
  );

  if (clearOverride) {
    await prisma.availabilityOverride.deleteMany({ where: { date } });
  } else {
    await prisma.availabilityOverride.upsert({
      where: { date },
      create: { date, isOpen },
      update: { isOpen },
    });
  }

  revalidatePortfolio();
  revalidatePath("/admin/reservas");
}

async function persistGoogleCalendarSync(
  reservation: {
    id: string;
    eventDate: Date;
    startTime: string | null;
    clientName: string;
    clientPhone: string;
    clientEmail: string | null;
    location: string | null;
    notes: string | null;
    status: ReservationStatus;
    category?: { title: string } | null;
    plan?: { title: string } | null;
  },
  existingEventId?: string | null,
) {
  const result = await syncReservationToGoogleCalendar(
    {
      eventDate: reservation.eventDate,
      startTime: reservation.startTime,
      clientName: reservation.clientName,
      clientPhone: reservation.clientPhone,
      clientEmail: reservation.clientEmail,
      location: reservation.location,
      notes: reservation.notes,
      status: reservation.status,
      categoryTitle: reservation.category?.title,
      planTitle: reservation.plan?.title,
    },
    existingEventId,
  );

  if (result.status === "ok") {
    await prisma.reservation.update({
      where: { id: reservation.id },
      data: { googleEventId: result.eventId },
    });
  } else if (result.status === "error") {
    console.error("[reservas] Google Calendar:", result.error);
  }

  return result;
}

async function createReservationFromFormData(formData: FormData) {
  const validation = validateReservationFormData(formData);
  if (!validation.ok) {
    throw new Error(getFirstReservationFormError(validation.errors));
  }

  const clientName = String(formData.get("clientName") ?? "").trim();
  const clientPhone = String(formData.get("clientPhone") ?? "").trim();
  const clientEmail = String(formData.get("clientEmail") ?? "").trim();
  const clientIdNumber = String(formData.get("clientIdNumber") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const subcategoryId = String(formData.get("subcategoryId") ?? "").trim();
  const planId = String(formData.get("planId") ?? "").trim();
  const eventDate = parseEventDate(formData.get("eventDate"));
  const startTime = parseOptionalString(formData.get("startTime"));
  const timeConflict = await findReservationTimeConflict(eventDate, startTime);
  if (timeConflict) {
    throw new Error(timeConflict);
  }

  return prisma.reservation.create({
    data: {
      eventDate,
      startTime,
      clientName,
      clientPhone,
      clientEmail,
      clientIdNumber,
      guestCount: parseOptionalGuestCount(formData.get("guestCount")),
      eventTitle: parseOptionalString(formData.get("eventTitle")),
      location: parseOptionalString(formData.get("location")),
      notes: parseRichTextOptional(formData.get("notes")),
      amountPaid: parseOptionalPrice(formData.get("amountPaid")),
      amountRemaining: parseOptionalPrice(formData.get("amountRemaining")),
      status: parseReservationStatus(formData.get("status")),
      categoryId,
      subcategoryId,
      planId,
    },
    include: {
      category: { select: { title: true } },
      plan: { select: { title: true } },
    },
  });
}

export async function createReservationModalAction(
  formData: FormData,
): Promise<CreateReservationModalResult> {
  const validation = validateReservationFormData(formData);
  if (!validation.ok) {
    return {
      ok: false,
      message: getFirstReservationFormError(validation.errors),
      fieldErrors: validation.errors,
    };
  }

  let reservation;
  try {
    reservation = await createReservationFromFormData(formData);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo guardar la reserva.";
    const isTimeError =
      message === reservationConfig.hours.overlapError ||
      message === reservationConfig.hours.requiredError ||
      message === reservationConfig.hours.invalidError;

    return {
      ok: false,
      message,
      fieldErrors: isTimeError ? { startTime: message } : undefined,
    };
  }

  revalidatePortfolio();

  const calendarResult = await persistGoogleCalendarSync(reservation);
  const calendarSynced = calendarResult.status === "ok";
  const calendarError =
    calendarResult.status === "error" ? calendarResult.error : undefined;

  if (!reservation.clientEmail) {
    return {
      ok: true,
      emailSent: false,
      emailError: "La reserva no tiene correo.",
      calendarSynced,
      calendarError,
    };
  }

  const emailResult = await sendReservationConfirmationEmail({
    clientName: reservation.clientName,
    clientEmail: reservation.clientEmail,
    eventDate: reservation.eventDate,
    startTime: reservation.startTime,
    categoryTitle: reservation.category?.title ?? "—",
    planTitle: reservation.plan?.title ?? "—",
    location: reservation.location,
    amountPaid: reservation.amountPaid,
    amountRemaining: reservation.amountRemaining,
    notes: reservation.notes,
  });

  if (!emailResult.ok) {
    console.error(
      "[reservas] Correo no enviado:",
      emailResult.error,
      "→",
      reservation.clientEmail,
    );
    return {
      ok: true,
      emailSent: false,
      emailError: emailResult.error,
      calendarSynced,
      calendarError,
    };
  }

  console.info(
    "[reservas] Correo enviado:",
    emailResult.id,
    "→",
    reservation.clientEmail,
  );

  return {
    ok: true,
    emailSent: true,
    emailSentTo: reservation.clientEmail,
    calendarSynced,
    calendarError,
  };
}

export async function createReservationAction(formData: FormData) {
  const reservation = await createReservationFromFormData(formData);
  revalidatePortfolio();
  await persistGoogleCalendarSync(reservation);

  if (reservation.clientEmail) {
    await sendReservationConfirmationEmail({
      clientName: reservation.clientName,
      clientEmail: reservation.clientEmail,
      eventDate: reservation.eventDate,
      startTime: reservation.startTime,
      categoryTitle: reservation.category?.title ?? "—",
      planTitle: reservation.plan?.title ?? "—",
      location: reservation.location,
      amountPaid: reservation.amountPaid,
      amountRemaining: reservation.amountRemaining,
      notes: reservation.notes,
    });
  }

  redirectAfterSave(formData, "/admin/reservas", "created");
}

export async function updateReservationAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const validation = validateReservationFormData(formData);
  if (!validation.ok) {
    throw new Error(getFirstReservationFormError(validation.errors));
  }

  const clientName = String(formData.get("clientName") ?? "").trim();
  const clientPhone = String(formData.get("clientPhone") ?? "").trim();
  const clientIdNumber = String(formData.get("clientIdNumber") ?? "").trim();
  if (!id || !clientName || !clientPhone) {
    throw new Error("Datos incompletos.");
  }

  const eventDate = parseEventDate(formData.get("eventDate"));
  const startTime = parseOptionalString(formData.get("startTime"));
  const timeConflict = await findReservationTimeConflict(eventDate, startTime, id);
  if (timeConflict) {
    throw new Error(timeConflict);
  }

  const existing = await prisma.reservation.findUnique({
    where: { id },
    select: { googleEventId: true },
  });

  const reservation = await prisma.reservation.update({
    where: { id },
    data: {
      eventDate,
      startTime,
      clientName,
      clientPhone,
      clientEmail: parseOptionalString(formData.get("clientEmail")),
      clientIdNumber,
      guestCount: parseOptionalGuestCount(formData.get("guestCount")),
      eventTitle: parseOptionalString(formData.get("eventTitle")),
      location: parseOptionalString(formData.get("location")),
      notes: parseRichTextOptional(formData.get("notes")),
      amountPaid: parseOptionalPrice(formData.get("amountPaid")),
      amountRemaining: parseOptionalPrice(formData.get("amountRemaining")),
      status: parseReservationStatus(formData.get("status")),
      categoryId: parseOptionalId(formData.get("categoryId")),
      subcategoryId: parseOptionalId(formData.get("subcategoryId")),
      planId: parseOptionalId(formData.get("planId")),
    },
    include: {
      category: { select: { title: true } },
      plan: { select: { title: true } },
    },
  });

  await persistGoogleCalendarSync(reservation, existing?.googleEventId);

  revalidatePortfolio();
  redirectAfterSave(formData, "/admin/reservas", "updated");
}

export async function deleteReservationAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const existing = await prisma.reservation.findUnique({
    where: { id },
    select: { googleEventId: true },
  });

  await prisma.reservation.delete({ where: { id } });
  await deleteReservationFromGoogleCalendar(existing?.googleEventId);
  revalidatePortfolio();
  redirect("/admin/reservas");
}

export async function getReservationContractAction(id: string) {
  const reservation = await getAdminReservationById(id);
  if (!reservation) return null;

  return buildReservationContractData({
    clientName: reservation.clientName,
    clientIdNumber: reservation.clientIdNumber,
    clientPhone: reservation.clientPhone,
    clientEmail: reservation.clientEmail,
    eventDate: reservation.eventDate,
    location: reservation.location,
    guestCount: reservation.guestCount,
    amountPaid: reservation.amountPaid,
    amountRemaining: reservation.amountRemaining,
    notes: reservation.notes,
    category: reservation.category,
    plan: reservation.plan,
  });
}
