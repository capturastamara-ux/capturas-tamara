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

type CategoryWithMedia = {
  coverUrl: string | null;
  plans: PlanWithMedia[];
};

export function collectPlanMediaUrls(plan: PlanWithMedia) {
  return collectMediaUrls(
    plan.coverUrl,
    plan.sections.map((section) => section.imageUrl),
    plan.gallery.map((image) => image.url),
  );
}

export function collectCategoryMediaUrls(category: CategoryWithMedia) {
  return collectMediaUrls(
    category.coverUrl,
    ...category.plans.map((plan) => collectPlanMediaUrls(plan)),
  );
}
