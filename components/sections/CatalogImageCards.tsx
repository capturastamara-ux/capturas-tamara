import Image from "next/image";
import Link from "next/link";
import { catalogConfig } from "@/config/catalog";
import { RevealItem, RevealStagger } from "@/components/ui/Reveal";

export type CatalogImageCard = {
  href: string;
  title: string;
  coverUrl: string | null;
};

type CatalogImageCardsProps = {
  items: ReadonlyArray<CatalogImageCard>;
  ctaLabel?: string;
};

function formatIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function CatalogImageCards({
  items,
  ctaLabel = catalogConfig.categories.cardCta,
}: Readonly<CatalogImageCardsProps>) {
  if (items.length === 0) return null;

  return (
    <RevealStagger
      stagger={0.08}
      className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5"
    >
      {items.map((item, index) => (
        <RevealItem key={item.href}>
          <Link
            href={item.href}
            className="group relative block aspect-[3/4] overflow-hidden sm:aspect-[4/5] lg:aspect-[5/6]"
            aria-label={`Ver ${item.title}`}
          >
            {item.coverUrl ? (
              <Image
                src={item.coverUrl}
                alt=""
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 520px"
              />
            ) : (
              <div className="absolute inset-0 bg-catalog-ink/40" />
            )}
            <div
              className="absolute inset-0 bg-gradient-to-t from-catalog via-catalog/35 to-black/15"
              aria-hidden="true"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/15 transition-colors duration-300 group-hover:ring-catalog-gold/50" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-center sm:p-5 lg:text-left">
              <p className="text-[0.62rem] uppercase tracking-[0.26em] text-catalog-gold">
                {formatIndex(index)}
              </p>
              <h3 className="mt-1.5 font-display text-[clamp(1.25rem,2.8vw,1.85rem)] italic leading-none text-white">
                {item.title}
              </h3>
              <p className="mt-2.5 text-[0.62rem] uppercase tracking-[0.18em] text-white/80 lg:text-white/75 lg:opacity-0 lg:transition-opacity lg:duration-300 lg:group-hover:opacity-100">
                {ctaLabel}
              </p>
            </div>
          </Link>
        </RevealItem>
      ))}
    </RevealStagger>
  );
}
