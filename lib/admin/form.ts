import { prisma } from "@/lib/db/prisma";
import { sanitizeRichText } from "@/lib/sanitize-rich-text";

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function uniqueCategorySlug(title: string, excludeId?: string) {
  const base = slugify(title) || "categoria";
  let candidate = base;
  let suffix = 2;

  while (true) {
    const existing = await prisma.category.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function uniqueSubcategorySlug(
  categoryId: string,
  title: string,
  excludeId?: string,
) {
  const base = slugify(title) || "subcategoria";
  let candidate = base;
  let suffix = 2;

  while (true) {
    const existing = await prisma.subcategory.findFirst({
      where: {
        categoryId,
        slug: candidate,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function uniquePlanSlug(
  categoryId: string,
  title: string,
  excludeId?: string,
  subcategoryId?: string | null,
) {
  const base = slugify(title) || "plan";
  let candidate = base;
  let suffix = 2;

  while (true) {
    const existing = await prisma.plan.findFirst({
      where: subcategoryId
        ? {
            subcategoryId,
            slug: candidate,
            ...(excludeId ? { NOT: { id: excludeId } } : {}),
          }
        : {
            categoryId,
            subcategoryId: null,
            slug: candidate,
            ...(excludeId ? { NOT: { id: excludeId } } : {}),
          },
      select: { id: true },
    });

    if (!existing) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function nextCategorySortOrder() {
  const result = await prisma.category.aggregate({ _max: { sortOrder: true } });
  return (result._max.sortOrder ?? -1) + 1;
}

export async function nextSubcategorySortOrder(
  categoryId: string,
  parentId: string | null = null,
) {
  const result = await prisma.subcategory.aggregate({
    where: { categoryId, parentId },
    _max: { sortOrder: true },
  });
  return (result._max.sortOrder ?? -1) + 1;
}

export async function nextPlanSortOrder(input: {
  categoryId: string;
  subcategoryId: string | null;
}) {
  const result = await prisma.plan.aggregate({
    where: input.subcategoryId
      ? { subcategoryId: input.subcategoryId }
      : { categoryId: input.categoryId, subcategoryId: null },
    _max: { sortOrder: true },
  });
  return (result._max.sortOrder ?? -1) + 1;
}

export async function nextSectionSortOrder(planId: string) {
  const result = await prisma.planSection.aggregate({
    where: { planId },
    _max: { sortOrder: true },
  });
  return (result._max.sortOrder ?? -1) + 1;
}

export async function nextGallerySortOrder(planId: string) {
  const result = await prisma.planGalleryImage.aggregate({
    where: { planId },
    _max: { sortOrder: true },
  });
  return (result._max.sortOrder ?? -1) + 1;
}

export async function nextSubcategoryGallerySortOrder(subcategoryId: string) {
  const result = await prisma.subcategoryGalleryImage.aggregate({
    where: { subcategoryId },
    _max: { sortOrder: true },
  });
  return (result._max.sortOrder ?? -1) + 1;
}

export async function nextCategoryGallerySortOrder(categoryId: string) {
  const result = await prisma.categoryGalleryImage.aggregate({
    where: { categoryId },
    _max: { sortOrder: true },
  });
  return (result._max.sortOrder ?? -1) + 1;
}

export function parseOptionalString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

export function parseRichTextOptional(value: FormDataEntryValue | null) {
  return sanitizeRichText(String(value ?? ""));
}

export function parseSortOrder(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = Number(String(value ?? fallback));
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}

export function parsePublished(value: FormDataEntryValue | null) {
  return value === "on" || value === "true" || value === "1";
}

export function parseOptionalPrice(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return null;

  const parsed = Number.parseInt(text, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("El precio debe ser un número entero válido en pesos (COP).");
  }

  return parsed;
}

export function parsePriceTiersJson(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("La lista de precios no es válida.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("La lista de precios debe ser un arreglo.");
  }

  return parsed.map((entry, index) => {
    if (!entry || typeof entry !== "object") {
      throw new Error(`Fila ${index + 1} de precios no es válida.`);
    }

    const guestCount = Number.parseInt(String((entry as { guestCount?: unknown }).guestCount ?? ""), 10);
    const price = Number.parseInt(String((entry as { price?: unknown }).price ?? ""), 10);

    if (!Number.isFinite(guestCount) || guestCount <= 0) {
      throw new Error(`Indica un número válido de invitados en la fila ${index + 1}.`);
    }

    if (!Number.isFinite(price) || price < 0) {
      throw new Error(`Indica un precio válido en la fila ${index + 1}.`);
    }

    return { guestCount, price };
  });
}

export function parseCatalogPrintRowsJson(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("La lista de impresiones no es válida.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("La lista de impresiones debe ser un arreglo.");
  }

  return parsed.map((entry, index) => {
    if (!entry || typeof entry !== "object") {
      throw new Error(`Fila ${index + 1} no es válida.`);
    }

    const name = String((entry as { name?: unknown }).name ?? "").trim();
    const price = Number.parseInt(String((entry as { price?: unknown }).price ?? ""), 10);

    if (!name) {
      throw new Error(`Indica un nombre en la fila ${index + 1}.`);
    }

    if (!Number.isFinite(price) || price < 0) {
      throw new Error(`Indica un valor válido en la fila ${index + 1}.`);
    }

    return { name, price };
  });
}
