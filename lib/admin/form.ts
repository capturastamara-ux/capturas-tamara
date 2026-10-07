import { catalogConfig } from "@/config/catalog";
import { prisma } from "@/lib/db/prisma";
import { sanitizeRichText } from "@/lib/sanitize-rich-text";
import { isStoredMediaUrl } from "@/lib/storage/media";

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

export async function uniqueLiveEventSlug(title: string, excludeId?: string) {
  const base = slugify(title) || "evento";
  let candidate = base;
  let suffix = 2;

  while (true) {
    const existing = await prisma.liveEvent.findFirst({
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

export async function nextLiveEventSortOrder() {
  const result = await prisma.liveEvent.aggregate({ _max: { sortOrder: true } });
  return (result._max.sortOrder ?? -1) + 1;
}

export async function nextTeamMemberSortOrder() {
  const result = await prisma.teamMember.aggregate({ _max: { sortOrder: true } });
  return (result._max.sortOrder ?? -1) + 1;
}

export function parseLiveEventImageUrls(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("La lista de fotos no es válida.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("La lista de fotos debe ser un arreglo.");
  }

  const urls = parsed.map((entry, index) => {
    const url = String(entry ?? "").trim();
    if (!url || !isStoredMediaUrl(url)) {
      throw new Error(`La foto ${index + 1} no es válida.`);
    }
    return url;
  });

  if (urls.length > 5) {
    throw new Error("Puedes subir máximo 5 fotos por evento.");
  }

  return urls;
}

export function parseExternalHttpUrl(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) {
    throw new Error("El enlace del botón es obligatorio.");
  }

  let parsed: URL;
  try {
    parsed = new URL(text);
  } catch {
    throw new Error(
      "El enlace del botón no es válido. Usa una URL completa (https://…).",
    );
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("El enlace del botón debe empezar por http:// o https://.");
  }

  return parsed.toString();
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

export function parseCatalogKitRowsJson(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("La lista de kits no es válida.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("La lista de kits debe ser un arreglo.");
  }

  return parsed.map((entry, index) => {
    if (!entry || typeof entry !== "object") {
      throw new Error(`Kit ${index + 1} no es válido.`);
    }

    const rawName = String((entry as { name?: unknown }).name ?? "");
    const name = sanitizeRichText(rawName);
    const price = Number.parseInt(String((entry as { price?: unknown }).price ?? ""), 10);

    if (!name) {
      throw new Error(`Indica el contenido del kit ${index + 1}.`);
    }

    if (!Number.isFinite(price) || price < 0) {
      throw new Error(`Indica un valor válido en el kit ${index + 1}.`);
    }

    return { name, price };
  });
}

export function catalogPrintProductIds() {
  return catalogConfig.products
    .filter((product) => product.id !== "kit")
    .map((product) => product.id);
}

export function catalogKitProduct() {
  const kit = catalogConfig.products.find((product) => product.id === "kit");
  if (!kit) {
    throw new Error("No hay producto Kit configurado.");
  }
  return kit;
}

export function parseCatalogConditionsJson(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("La lista de condiciones no es válida.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("La lista de condiciones debe ser un arreglo.");
  }

  return parsed.map((entry, index) => {
    if (!entry || typeof entry !== "object") {
      throw new Error(`Condición ${index + 1} no es válida.`);
    }

    const title = String((entry as { title?: unknown }).title ?? "").trim();
    const body = String((entry as { body?: unknown }).body ?? "").trim();

    if (!title) {
      throw new Error(`Indica un título en la condición ${index + 1}.`);
    }

    if (!body) {
      throw new Error(`Indica un texto en la condición ${index + 1}.`);
    }

    return { title, body };
  });
}
