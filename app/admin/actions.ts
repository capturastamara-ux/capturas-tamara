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
  parseOptionalString,
  parseOptionalPrice,
  parsePriceTiersJson,
  parseRichTextOptional,
  parsePublished,
  parseSortOrder,
  uniqueCategorySlug,
  uniquePlanSlug,
} from "@/lib/admin/form";
import { removedStorageUrls } from "@/lib/storage/media";
import {
  collectCategoryMediaUrls,
  collectPlanMediaUrls,
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
import {
  getMinPriceFromTiers,
  normalizePriceTiers,
} from "@/lib/plans/price-tiers";

export type CreateReservationModalResult =
  | { ok: true; emailSent: boolean; emailSentTo?: string; emailError?: string }
  | { ok: false; message: string; fieldErrors?: ReservationFormErrors };

function revalidatePortfolio() {
  revalidatePath("/");
  revalidatePath("/portafolio");
  revalidatePath("/cotizador");
  revalidatePath("/admin");
  revalidatePath("/admin/categorias");
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
  redirect("/admin/categorias");
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
  redirect(`/admin/categorias/${id}`);
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
      plans: {
        include: {
          sections: true,
          gallery: true,
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

export async function createPlanAction(formData: FormData) {
  const categoryId = String(formData.get("categoryId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!categoryId || !title) {
    throw new Error("Categoría y título son obligatorios.");
  }

  const slug = await uniquePlanSlug(categoryId, title);

  const coverUrl = parseOptionalString(formData.get("coverUrl"));
  const priceTiers = normalizePriceTiers(
    parsePriceTiersJson(formData.get("priceTiers")),
  );
  const planPrice = getMinPriceFromTiers(priceTiers);

  let plan;
  try {
    plan = await prisma.plan.create({
      data: {
        categoryId,
        title,
        slug,
        tagline: parseOptionalString(formData.get("tagline")),
        price: planPrice,
        description: parseRichTextOptional(formData.get("description")),
        coverUrl,
        sortOrder: await nextPlanSortOrder(categoryId),
        published: parsePublished(formData.get("published")),
        priceTiers: {
          create: priceTiers.map((tier, index) => ({
            guestCount: tier.guestCount,
            price: tier.price,
            sortOrder: index,
          })),
        },
      },
    });
  } catch (error) {
    await deleteStoredMedia([coverUrl]);
    throw error;
  }

  revalidatePortfolio();
  redirect(`/admin/planes/${plan.id}`);
}

export async function updatePlanAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!id || !categoryId || !title) {
    throw new Error("Datos incompletos.");
  }

  const slug = await uniquePlanSlug(categoryId, title, id);
  const existing = await prisma.plan.findUnique({
    where: { id },
    select: { coverUrl: true, categoryId: true },
  });
  const coverUrl = parseOptionalString(formData.get("coverUrl"));
  const priceTiers = normalizePriceTiers(
    parsePriceTiersJson(formData.get("priceTiers")),
  );
  const planPrice = getMinPriceFromTiers(priceTiers);
  const categoryChanged = existing?.categoryId !== categoryId;
  const sortOrder = categoryChanged
    ? await nextPlanSortOrder(categoryId)
    : undefined;

  await prisma.$transaction([
    prisma.planPriceTier.deleteMany({ where: { planId: id } }),
    ...priceTiers.map((tier, index) =>
      prisma.planPriceTier.create({
        data: {
          planId: id,
          guestCount: tier.guestCount,
          price: tier.price,
          sortOrder: index,
        },
      }),
    ),
    prisma.plan.update({
      where: { id },
      data: {
        categoryId,
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
  redirect("/admin/planes?saved=plan");
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

export async function reorderPlansAction(categoryId: string, orderedIds: string[]) {
  if (!categoryId || orderedIds.length === 0) return;

  const existing = await prisma.plan.findMany({
    where: { categoryId },
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
  const planId = String(formData.get("planId") ?? "").trim();

  return prisma.reservation.create({
    data: {
      eventDate: parseEventDate(formData.get("eventDate")),
      startTime: parseOptionalString(formData.get("startTime")),
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

  const reservation = await createReservationFromFormData(formData);
  revalidatePortfolio();

  if (!reservation.clientEmail) {
    return { ok: true, emailSent: false, emailError: "La reserva no tiene correo." };
  }

  const emailResult = await sendReservationConfirmationEmail({
    clientName: reservation.clientName,
    clientEmail: reservation.clientEmail,
    eventDate: reservation.eventDate,
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
    return { ok: true, emailSent: false, emailError: emailResult.error };
  }

  console.info(
    "[reservas] Correo enviado:",
    emailResult.id,
    "→",
    reservation.clientEmail,
  );

  return { ok: true, emailSent: true, emailSentTo: reservation.clientEmail };
}

export async function createReservationAction(formData: FormData) {
  const reservation = await createReservationFromFormData(formData);
  revalidatePortfolio();

  if (reservation.clientEmail) {
    await sendReservationConfirmationEmail({
      clientName: reservation.clientName,
      clientEmail: reservation.clientEmail,
      eventDate: reservation.eventDate,
      categoryTitle: reservation.category?.title ?? "—",
      planTitle: reservation.plan?.title ?? "—",
      location: reservation.location,
      amountPaid: reservation.amountPaid,
      amountRemaining: reservation.amountRemaining,
      notes: reservation.notes,
    });
  }

  redirect("/admin/reservas");
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

  await prisma.reservation.update({
    where: { id },
    data: {
      eventDate: parseEventDate(formData.get("eventDate")),
      startTime: parseOptionalString(formData.get("startTime")),
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
      planId: parseOptionalId(formData.get("planId")),
    },
  });

  revalidatePortfolio();
  redirect(`/admin/reservas/${id}`);
}

export async function deleteReservationAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.reservation.delete({ where: { id } });
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
