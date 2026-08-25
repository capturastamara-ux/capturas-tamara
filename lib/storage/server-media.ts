import { createClient } from "@/lib/supabase/server";
import { collectMediaUrls, deleteMediaUrls } from "@/lib/storage/media";

export async function deleteStoredMedia(
  urls: Array<string | null | undefined>,
) {
  const stored = collectMediaUrls(...urls);
  if (stored.length === 0) return;

  const supabase = await createClient();
  await deleteMediaUrls(supabase, stored);
}

type PlanWithMedia = {
  coverUrl: string | null;
  sections: Array<{ imageUrl: string | null }>;
  gallery: Array<{ url: string }>;
};

type SubcategoryWithMedia = {
  coverUrl: string | null;
  gallery?: Array<{ url: string }>;
  plans: PlanWithMedia[];
};

type CategoryWithMedia = {
  coverUrl: string | null;
  gallery?: Array<{ url: string }>;
  plans?: PlanWithMedia[];
  subcategories: SubcategoryWithMedia[];
};

export function collectPlanMediaUrls(plan: PlanWithMedia) {
  return collectMediaUrls(
    plan.coverUrl,
    plan.sections.map((section) => section.imageUrl),
    plan.gallery.map((image) => image.url),
  );
}

export function collectSubcategoryMediaUrls(subcategory: SubcategoryWithMedia) {
  return collectMediaUrls(
    subcategory.coverUrl,
    subcategory.gallery?.map((image) => image.url),
    ...subcategory.plans.map((plan) => collectPlanMediaUrls(plan)),
  );
}

export function collectCategoryMediaUrls(category: CategoryWithMedia) {
  return collectMediaUrls(
    category.coverUrl,
    category.gallery?.map((image) => image.url),
    ...(category.plans ?? []).map((plan) => collectPlanMediaUrls(plan)),
    ...category.subcategories.map((subcategory) =>
      collectSubcategoryMediaUrls(subcategory),
    ),
  );
}
