import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import { formatPlanPrice, formatPriceDigits } from "@/lib/format/price";
import type { PlanPriceTierView } from "@/lib/plans/price-tiers";
import { PlanPrice } from "@/components/ui/PlanPrice";

type PlanPricingProps = {
  price: number | null | undefined;
  priceTiers?: PlanPriceTierView[];
  className?: string;
  variant?: "compact" | "full";
};

export function PlanPricing({
  price,
  priceTiers = [],
  className,
  variant = "full",
}: Readonly<PlanPricingProps>) {
  const tiers = [...priceTiers].sort((a, b) => a.guestCount - b.guestCount);

  if (tiers.length === 0) {
    return <PlanPrice price={price} className={className} />;
  }

  if (variant === "compact") {
    return <PlanPrice price={price} className={className} />;
  }

  return (
    <div className={cn("space-y-4 sm:space-y-5", className)}>
      {price != null && <PlanPrice price={price} />}

      <div className="rounded-sm border border-primary/10 bg-cream/35 px-4 py-4 sm:px-5 sm:py-5">
        <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted sm:text-xs">
          {siteConfig.portfolio.planPriceTiersTitle}
        </p>
        <ul className="mt-3 space-y-2.5">
          {tiers.map((tier) => (
            <li
              key={`${tier.guestCount}-${tier.price}`}
              className="flex items-baseline justify-between gap-4 border-b border-primary/5 pb-2.5 last:border-b-0 last:pb-0"
            >
              <span className="font-display text-base italic text-primary sm:text-lg">
                {tier.guestCount.toLocaleString("es-CO")}{" "}
                {siteConfig.portfolio.planGuestSuffix}
              </span>
              <span className="shrink-0 font-display text-base italic tabular-nums text-primary sm:text-lg">
                {formatPriceDigits(String(tier.price))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function PlanPriceTierSummary({
  priceTiers = [],
  className,
}: Readonly<{ priceTiers?: PlanPriceTierView[]; className?: string }>) {
  const tiers = [...priceTiers].sort((a, b) => a.guestCount - b.guestCount);
  if (tiers.length === 0) return null;

  return (
    <ul className={cn("space-y-2 text-sm", className)}>
      {tiers.map((tier) => (
        <li
          key={`${tier.guestCount}-${tier.price}`}
          className="flex items-baseline justify-between gap-3"
        >
          <span className="text-primary">
            {tier.guestCount.toLocaleString("es-CO")}{" "}
            {siteConfig.portfolio.planGuestSuffix}
          </span>
          <span className="shrink-0 font-medium tabular-nums text-primary">
            {formatPlanPrice(tier.price) ?? formatPriceDigits(String(tier.price))}
          </span>
        </li>
      ))}
    </ul>
  );
}
