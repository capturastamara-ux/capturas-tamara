import { catalogConfig } from "@/config/catalog";
import { CatalogBand, CatalogHeading } from "@/components/sections/catalog-ui";
import { CatalogImageCards } from "@/components/sections/CatalogImageCards";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

type CategoryItem = {
  slug: string;
  title: string;
  coverUrl: string | null;
};

type CatalogCategoriesSectionProps = {
  categories: ReadonlyArray<CategoryItem>;
};

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
          <div className="mt-10 sm:mt-12">
            <CatalogImageCards
              ctaLabel={cardCta}
              items={preview.map((category) => ({
                href: `/portafolio/${category.slug}`,
                title: category.title,
                coverUrl: category.coverUrl,
              }))}
            />
          </div>
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
