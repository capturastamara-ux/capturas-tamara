import { CatalogImageCards } from "@/components/sections/CatalogImageCards";
import {
  subcategoryCoverUrl,
  type PortfolioSubcategoryNode,
} from "@/components/sections/PortfolioSubcategoryTree";
import { catalogConfig } from "@/config/catalog";

type PortfolioLevelViewProps = {
  categorySlug: string;
  nodes: PortfolioSubcategoryNode[];
};

export function PortfolioLevelView({
  categorySlug,
  nodes,
}: Readonly<PortfolioLevelViewProps>) {
  if (nodes.length === 0) return null;

  return (
    <div className="mx-auto mt-12 w-full max-w-[820px] sm:mt-16">
      <CatalogImageCards
        ctaLabel={catalogConfig.categories.cardCta}
        items={nodes.map((node) => ({
          href: `/portafolio/${categorySlug}/${node.slug}`,
          title: node.title,
          coverUrl: subcategoryCoverUrl(node),
        }))}
      />
    </div>
  );
}
