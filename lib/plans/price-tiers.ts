export type PlanPriceTierInput = {
  guestCount: number;
  price: number;
};

export type PlanPriceTierView = PlanPriceTierInput & {
  id?: string;
};

export function getMinPriceFromTiers(tiers: PlanPriceTierInput[]) {
  if (tiers.length === 0) return null;
  return tiers.reduce(
    (min, tier) => (tier.price < min ? tier.price : min),
    tiers[0].price,
  );
}

export function normalizePriceTiers(tiers: PlanPriceTierInput[]) {
  return tiers
    .filter((tier) => tier.guestCount > 0 && tier.price >= 0)
    .sort((a, b) => a.guestCount - b.guestCount);
}

export function getGuestCountOptions(
  plans: ReadonlyArray<{ priceTiers: ReadonlyArray<PlanPriceTierInput> }>,
) {
  const counts = new Set<number>();
  for (const plan of plans) {
    for (const tier of plan.priceTiers) {
      if (tier.guestCount > 0) counts.add(tier.guestCount);
    }
  }
  return [...counts].sort((a, b) => a - b);
}

export function getPriceForGuestCount(
  tiers: ReadonlyArray<PlanPriceTierInput>,
  guestCount: number | null | undefined,
) {
  if (guestCount == null) return null;
  return tiers.find((tier) => tier.guestCount === guestCount)?.price ?? null;
}
