import Image from "next/image";
import Link from "next/link";
import { catalogConfig } from "@/config/catalog";
import { CatalogBand, CatalogHeading } from "@/components/sections/catalog-ui";
import { Button } from "@/components/ui/Button";
import { Reveal, RevealItem, RevealStagger } from "@/components/ui/Reveal";

type CategoryItem = {
  slug: string;
  title: string;
  coverUrl: string | null;
};

type CatalogCategoriesSectionProps = {
  categories: ReadonlyArray<CategoryItem>;
};

function formatIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function CatalogCategoriesSection({
  categories,
}: Readonly<CatalogCategoriesSectionProps>) {
  const { previewLimit, moreLabel, moreHref, cardCta } = catalogConfig.categories;
  const preview = categories.slice(0, previewLimit);
  const hasMore = categories.length > previewLimit;

  return (
    <CatalogBand
      id={catalogConfig.categories.id}
      className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-20"
    >
      <div className="mx-auto max-w-[820px]">
        <Reveal>
          <CatalogHeading
            eyebrow={catalogConfig.categories.eyebrow}
            title={catalogConfig.categories.heading}
          />
        </Reveal>

        {categories.length === 0 ? (
          <p className="mt-12 text-center text-sm text-white/75">
            {catalogConfig.categories.empty}
          </p>
        ) : (
          <RevealStagger
            stagger={0.08}
            className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-4 lg:gap-5"
          >
            {preview.map((category, index) => (
              <RevealItem key={category.slug}>
                <Link
                  href={`/portafolio/${category.slug}`}
                  className="group relative block aspect-[3/4] overflow-hidden sm:aspect-[4/5] lg:aspect-[5/6]"
                  aria-label={`Ver ${category.title}`}
                >
                  {category.coverUrl ? (
                    <Image
                      src={category.coverUrl}
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
                      {category.title}
                    </h3>
                    <p className="mt-2.5 text-[0.62rem] uppercase tracking-[0.18em] text-white/80 lg:text-white/75 lg:opacity-0 lg:transition-opacity lg:duration-300 lg:group-hover:opacity-100">
                      {cardCta}
                    </p>
                  </div>
                </Link>
              </RevealItem>
            ))}
          </RevealStagger>
        )}

        {hasMore ? (
          <Reveal className="mt-10 flex justify-center sm:mt-12">
            <Button
              href={moreHref}
              variant="outline"
              className="border-white/35 text-white hover:border-catalog-gold hover:bg-catalog-gold hover:text-catalog-ink"
            >
              {moreLabel}
            </Button>
          </Reveal>
        ) : null}
      </div>
    </CatalogBand>
  );
}
