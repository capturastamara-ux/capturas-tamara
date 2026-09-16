import { SiteHeader } from "@/components/layout/SiteHeader";
import { CatalogBand } from "@/components/sections/catalog-ui";
import { cn } from "@/lib/cn";

type PortfolioPageSkeletonProps = {
  tone?: "catalog" | "surface";
  cards?: number;
};

function Pulse({ className }: Readonly<{ className?: string }>) {
  return (
    <div
      className={cn("animate-pulse rounded-sm", className)}
      aria-hidden="true"
    />
  );
}

export function PortfolioPageSkeleton({
  tone = "catalog",
  cards = 4,
}: Readonly<PortfolioPageSkeletonProps>) {
  const isCatalog = tone === "catalog";

  return (
    <>
      <SiteHeader variant="solid" />
      <main aria-busy="true">
        <p className="sr-only">Cargando portafolio</p>
        {isCatalog ? (
          <CatalogBand className="px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
            <div className="mx-auto min-w-0 max-w-[1400px]">
              <Pulse className="h-3 w-28 bg-white/20" />
              <Pulse className="mt-8 h-4 w-36 bg-catalog-gold/30" />
              <Pulse className="mt-4 h-12 w-52 bg-white/25 sm:w-72" />
              <span className="mt-5 block h-px w-14 bg-catalog-gold/50" />
              <div className="mx-auto mt-12 grid max-w-[820px] grid-cols-2 gap-3 sm:mt-16 sm:gap-4 lg:gap-5">
                {Array.from({ length: cards }, (_, index) => (
                  <Pulse
                    key={index}
                    className="aspect-[3/4] bg-white/10 sm:aspect-[4/5] lg:aspect-[5/6]"
                  />
                ))}
              </div>
            </div>
          </CatalogBand>
        ) : (
          <section className="bg-surface px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
            <div className="mx-auto max-w-[1400px]">
              <Pulse className="h-3 w-28 bg-catalog/15" />
              <Pulse className="mt-4 h-12 w-56 bg-catalog/10 sm:w-72" />
              <Pulse className="mt-5 h-4 w-full max-w-xl bg-catalog/10" />
              <div className="mt-12 grid gap-8 lg:grid-cols-2">
                {Array.from({ length: 2 }, (_, index) => (
                  <Pulse
                    key={index}
                    className="min-h-56 bg-catalog/10 sm:min-h-72"
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
