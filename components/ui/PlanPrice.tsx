import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import { formatPlanPrice } from "@/lib/format/price";

type PlanPriceProps = {
  price: number | null | undefined;
  className?: string;
};

export function PlanPrice({ price, className }: Readonly<PlanPriceProps>) {
  const formatted = formatPlanPrice(price);
  if (!formatted) return null;

  return (
    <div
      className={cn(
        "border-l border-primary/15 pl-4 sm:pl-5",
        className,
      )}
    >
      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted sm:text-xs">
        {siteConfig.portfolio.planPriceLabel}
      </p>
      <p className="mt-1 font-display text-[clamp(1.35rem,3.2vw,2.15rem)] italic leading-none text-primary">
        {formatted}
      </p>
    </div>
  );
}
