import { cn } from "@/lib/cn";
import { PlanPrice } from "@/components/ui/PlanPrice";

type PlanPricingProps = {
  price: number | null | undefined;
  className?: string;
  variant?: "compact" | "full";
  tone?: "default" | "catalog";
};

export function PlanPricing({
  price,
  className,
  tone = "default",
}: Readonly<PlanPricingProps>) {
  return <PlanPrice price={price} tone={tone} className={cn(className)} />;
}
