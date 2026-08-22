"use client";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

type GuestCountSelectorProps = {
  options: number[];
  value: number | null;
  onChange: (guestCount: number) => void;
  className?: string;
  id?: string;
};

export function GuestCountSelector({
  options,
  value,
  onChange,
  className,
  id = "cotizador-guest-count",
}: Readonly<GuestCountSelectorProps>) {
  if (options.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={id}
        className="text-xs uppercase tracking-[0.12em] text-muted"
      >
        {siteConfig.cotizador.guestCountLabel}
      </label>
      <select
        id={id}
        value={value ?? options[0]}
        onChange={(event) => onChange(Number.parseInt(event.target.value, 10))}
        className="min-w-[9.5rem] rounded-full border border-primary/20 bg-background px-4 py-2 text-xs uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {options.map((count) => (
          <option key={count} value={count}>
            {count.toLocaleString("es-CO")} {siteConfig.portfolio.planGuestSuffix}
          </option>
        ))}
      </select>
    </div>
  );
}
