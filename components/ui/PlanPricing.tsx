import { cn } from "@/lib/cn";
import { PlanPrice } from "@/components/ui/PlanPrice";

type PlanPricingProps = {
  price: number | null | undefined;
  className?: string;
  variant?: "compact" | "full";
};

export function PlanPricing({
  price,
  className,
}: Readonly<PlanPricingProps>) {
  return <PlanPrice price={price} className={cn(className)} />;
}
