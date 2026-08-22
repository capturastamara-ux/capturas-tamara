import { cn } from "@/lib/cn";

type CatalogBandProps = {
  id?: string;
  children: React.ReactNode;
  className?: string;
};

export function CatalogBand({
  id,
  children,
  className,
}: Readonly<CatalogBandProps>) {
  return (
    <section
      id={id}
      className={cn(
        "relative overflow-hidden bg-catalog bg-[radial-gradient(ellipse_at_center,rgb(106_154_148_/_0.55)_0%,var(--color-catalog)_68%)]",
        className,
      )}
    >
      <div className="catalog-grain pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative z-10">{children}</div>
    </section>
  );
}

type CatalogHeadingProps = {
  eyebrow?: string;
  title: string;
  className?: string;
};

export function CatalogHeading({
  eyebrow,
  title,
  className,
}: Readonly<CatalogHeadingProps>) {
  return (
    <div className={cn("text-center", className)}>
      {eyebrow ? (
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.32em] text-catalog-gold">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 font-display text-[clamp(1.85rem,4.4vw,3.15rem)] font-normal italic leading-[1.12] text-white">
        {title}
      </h2>
      <span
        className="mx-auto mt-5 block h-px w-14 bg-catalog-gold/80"
        aria-hidden="true"
      />
    </div>
  );
}
