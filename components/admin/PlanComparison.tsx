"use client";

import { useCallback, useMemo, useState } from "react";
import { PlanComparisonTable } from "@/components/cotizador/PlanComparisonTable";
import { CotizadorShareToolbar } from "@/components/cotizador/CotizadorShareToolbar";
import { GuestCountSelector } from "@/components/cotizador/GuestCountSelector";
import { SiteLogo } from "@/components/layout/SiteLogo";
import { siteConfig } from "@/config/site";
import {
  filterPlansBySelection,
  getDefaultSelectedPlanIds,
  getPublishedComparisonPlans,
} from "@/lib/cotizador/sections";
import { cotizadorMaxPlans } from "@/lib/cotizador/url";
import type { ComparisonCategory } from "@/lib/cotizador/types";
import { getGuestCountOptions } from "@/lib/plans/price-tiers";
import { cn } from "@/lib/cn";

type PlanComparisonProps = {
  categories: ComparisonCategory[];
};

function buildInitialSelection(categories: ComparisonCategory[]) {
  return Object.fromEntries(
    categories.map((category) => [
      category.id,
      getDefaultSelectedPlanIds(category.plans),
    ]),
  );
}

function resolveGuestCount(
  options: number[],
  preferred: number | null,
): number | null {
  if (options.length === 0) return null;
  if (preferred != null && options.includes(preferred)) return preferred;
  return options[0];
}

export function PlanComparison({ categories }: Readonly<PlanComparisonProps>) {
  const [activeCategoryId, setActiveCategoryId] = useState(
    categories[0]?.id ?? "",
  );
  const [selectedByCategory, setSelectedByCategory] = useState<
    Record<string, string[]>
  >(() => buildInitialSelection(categories));
  const [guestCountByCategory, setGuestCountByCategory] = useState<
    Record<string, number | null>
  >({});

  const activeCategory = useMemo(
    () => categories.find((category) => category.id === activeCategoryId),
    [activeCategoryId, categories],
  );

  const plans = activeCategory?.plans ?? [];
  const selectedPlanIds = activeCategory
    ? (selectedByCategory[activeCategory.id] ??
      getDefaultSelectedPlanIds(activeCategory.plans))
    : [];

  const selectedPlans = useMemo(
    () => filterPlansBySelection(plans, selectedPlanIds),
    [plans, selectedPlanIds],
  );

  const displayPlans = useMemo(
    () => getPublishedComparisonPlans(selectedPlans),
    [selectedPlans],
  );

  const guestCountOptions = useMemo(
    () => getGuestCountOptions(displayPlans),
    [displayPlans],
  );

  const selectedGuestCount = activeCategory
    ? resolveGuestCount(
        guestCountOptions,
        guestCountByCategory[activeCategory.id] ?? null,
      )
    : null;

  const selectedPlanSlugs = selectedPlans.map((plan) => plan.slug);

  const togglePlan = useCallback(
    (planId: string) => {
      if (!activeCategory) return;

      setSelectedByCategory((prev) => {
        const current =
          prev[activeCategory.id] ??
          getDefaultSelectedPlanIds(activeCategory.plans);
        const isSelected = current.includes(planId);

        if (isSelected) {
          if (current.length <= 1) return prev;
          return {
            ...prev,
            [activeCategory.id]: current.filter((id) => id !== planId),
          };
        }

        if (current.length >= cotizadorMaxPlans) return prev;

        return {
          ...prev,
          [activeCategory.id]: [...current, planId],
        };
      });
    },
    [activeCategory],
  );

  const handleCategoryChange = useCallback((categoryId: string) => {
    setActiveCategoryId(categoryId);
  }, []);

  const handleGuestCountChange = useCallback(
    (guestCount: number) => {
      if (!activeCategory) return;
      setGuestCountByCategory((prev) => ({
        ...prev,
        [activeCategory.id]: guestCount,
      }));
    },
    [activeCategory],
  );

  const printTargetId = `cotizador-print-${activeCategoryId}`;

  if (categories.length === 0) {
    return (
      <p className="rounded-sm border border-primary/10 bg-background p-6 text-sm text-muted">
        Crea categorías y planes para usar el cotizador.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="cotizador-admin-only flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => handleCategoryChange(category.id)}
            className={cn(
              "rounded-full px-4 py-2 text-xs uppercase tracking-[0.12em] transition-colors",
              category.id === activeCategoryId
                ? "bg-primary text-white"
                : "border border-primary/20 text-primary hover:bg-primary/5",
            )}
          >
            {category.title}
          </button>
        ))}
      </div>

      {activeCategory && plans.length > 0 && (
        <div className="cotizador-admin-only rounded-sm border border-primary/10 bg-surface/60 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.12em] text-muted">
                {siteConfig.cotizador.planPickerLabel}
              </p>
              <p className="mt-1 text-sm text-muted">
                {siteConfig.cotizador.planPickerHint}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {plans.map((plan) => {
                  const isSelected = selectedPlanIds.includes(plan.id);
                  const atMax =
                    !isSelected && selectedPlanIds.length >= cotizadorMaxPlans;

                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => togglePlan(plan.id)}
                      disabled={atMax}
                      aria-pressed={isSelected}
                      className={cn(
                        "rounded-full px-4 py-2 text-xs uppercase tracking-[0.12em] transition-colors",
                        isSelected
                          ? "bg-primary text-white"
                          : "border border-primary/20 text-primary hover:bg-primary/5",
                        atMax &&
                          "cursor-not-allowed opacity-40 hover:bg-transparent",
                      )}
                    >
                      {plan.title}
                      {!plan.published && (
                        <span className="ml-1.5 normal-case tracking-normal text-accent">
                          (borrador)
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {guestCountOptions.length > 0 && (
              <GuestCountSelector
                options={guestCountOptions}
                value={selectedGuestCount}
                onChange={handleGuestCountChange}
              />
            )}
          </div>
        </div>
      )}

      {activeCategory && (
        <CotizadorShareToolbar
          categorySlug={activeCategory.slug}
          selectedPlanSlugs={selectedPlanSlugs}
          guestCount={selectedGuestCount}
          printTargetId={printTargetId}
        />
      )}

      {plans.length === 0 ? (
        <p className="rounded-sm border border-primary/10 bg-background p-6 text-sm text-muted">
          Esta categoría aún no tiene planes para comparar.
        </p>
      ) : displayPlans.length === 0 ? (
        <p className="rounded-sm border border-primary/10 bg-background p-6 text-sm text-muted">
          Los planes seleccionados no están publicados.
        </p>
      ) : (
        <div
          id={printTargetId}
          className="cotizador-print-area rounded-sm border border-primary/10 bg-cream p-4 sm:p-8 print:border-0 print:bg-white print:p-0"
        >
          {activeCategory && (
            <div className="mb-8 text-center print:mb-6">
              <div className="flex justify-center">
                <SiteLogo size="md" showName nameClassName="text-primary" />
              </div>
              <p className="mt-5 font-display text-[clamp(1.5rem,3vw,2.25rem)] italic text-primary">
                {activeCategory.title}
              </p>
              <p className="mt-2 text-sm text-muted">
                {siteConfig.cotizador.publicSubtitle}
              </p>
            </div>
          )}

          <PlanComparisonTable
            plans={displayPlans}
            variant="client"
            selectedGuestCount={selectedGuestCount}
          />
        </div>
      )}
    </div>
  );
}
