import type { ComparisonPlan } from "@/lib/cotizador/types";

export function getComparisonSectionTitles(plans: ComparisonPlan[]) {
  const titles = new Set<string>();
  plans.forEach((plan) => {
    plan.sections.forEach((section) => titles.add(section.title));
  });
  return Array.from(titles);
}

export function getPublishedComparisonPlans(plans: ComparisonPlan[]) {
  return plans.filter((plan) => plan.published);
}

export function getDefaultSelectedPlanIds(plans: ComparisonPlan[]) {
  return plans.slice(0, 3).map((plan) => plan.id);
}

export function filterPlansBySelection(
  plans: ComparisonPlan[],
  selectedIds: string[],
) {
  const selected = new Set(selectedIds);
  return plans.filter((plan) => selected.has(plan.id));
}

export function filterPlansBySlugs(plans: ComparisonPlan[], slugs: string[]) {
  if (slugs.length === 0) return plans;

  const bySlug = new Map(plans.map((plan) => [plan.slug, plan]));
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((plan): plan is ComparisonPlan => plan != null);
}
