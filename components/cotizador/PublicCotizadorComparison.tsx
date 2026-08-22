"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PlanComparisonTable } from "@/components/cotizador/PlanComparisonTable";
import { GuestCountSelector } from "@/components/cotizador/GuestCountSelector";
import { buildPublicCotizadorPath } from "@/lib/cotizador/url";
import { getGuestCountOptions } from "@/lib/plans/price-tiers";
import type { ComparisonPlan } from "@/lib/cotizador/types";

type PublicCotizadorComparisonProps = {
  categorySlug: string;
  plans: ComparisonPlan[];
  selectedPlanSlugs: string[];
  initialGuestCount: number | null;
};

function resolveGuestCount(
  options: number[],
  preferred: number | null,
): number | null {
  if (options.length === 0) return null;
  if (preferred != null && options.includes(preferred)) return preferred;
  return options[0];
}

export function PublicCotizadorComparison({
  categorySlug,
  plans,
  selectedPlanSlugs,
  initialGuestCount,
}: Readonly<PublicCotizadorComparisonProps>) {
  const router = useRouter();
  const guestCountOptions = useMemo(
    () => getGuestCountOptions(plans),
    [plans],
  );
  const [guestCount, setGuestCount] = useState<number | null>(() =>
    resolveGuestCount(guestCountOptions, initialGuestCount),
  );

  const effectiveGuestCount = resolveGuestCount(guestCountOptions, guestCount);

  const handleGuestCountChange = useCallback(
    (nextGuestCount: number) => {
      setGuestCount(nextGuestCount);
      const path = buildPublicCotizadorPath(
        categorySlug,
        selectedPlanSlugs,
        nextGuestCount,
      );
      router.replace(path, { scroll: false });
    },
    [categorySlug, router, selectedPlanSlugs],
  );

  return (
    <>
      {guestCountOptions.length > 0 && (
        <div className="cotizador-public-actions mb-4 flex justify-end sm:mb-6">
          <GuestCountSelector
            options={guestCountOptions}
            value={effectiveGuestCount}
            onChange={handleGuestCountChange}
          />
        </div>
      )}

      <PlanComparisonTable
        plans={plans}
        variant="client"
        selectedGuestCount={effectiveGuestCount}
      />
    </>
  );
}
