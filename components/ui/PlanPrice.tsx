import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import { formatPlanPrice } from "@/lib/format/price";

type PlanPriceProps = {
  price: number | null | undefined;
  className?: string;
  tone?: "default" | "catalog";
};

export function PlanPrice({
  price,
  className,
  tone = "default",
}: Readonly<PlanPriceProps>) {
  const formatted = formatPlanPrice(price);
  if (!formatted) return null;

  const isCatalog = tone === "catalog";

  return (
    <div
      className={cn(
        "border-l pl-4 sm:pl-5",
        isCatalog ? "border-catalog-gold/70" : "border-primary/15",
        className,
      )}
    >
      <p
        className={cn(
          "text-[0.65rem] uppercase tracking-[0.18em] sm:text-xs",
          isCatalog ? "text-catalog-gold" : "text-muted",
        )}
      >
        {siteConfig.portfolio.planPriceLabel}
      </p>
      <p
        className={cn(
          "mt-1 font-display text-[clamp(1.35rem,3.2vw,2.15rem)] italic leading-none",
          isCatalog ? "text-white" : "text-primary",
        )}
      >
        {formatted}
      </p>
    </div>
  );
}
