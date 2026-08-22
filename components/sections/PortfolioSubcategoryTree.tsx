import { PlanGallerySection } from "@/components/sections/PlanGallerySection";
import { PortfolioPlanSplits } from "@/components/sections/PortfolioPlanSplits";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";

type GalleryImage = {
  id: string;
  url: string;
};

type PlanCard = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  price: number | null;
  coverUrl: string | null;
  description: string | null;
  sections: Array<{
    id: string;
    title: string;
    intro: string | null;
    note: string | null;
  }>;
};

export type PortfolioSubcategoryNode = {
  id: string;
  slug: string;
  title: string;
  coverUrl: string | null;
  gallery: GalleryImage[];
  plans: PlanCard[];
  children: PortfolioSubcategoryNode[];
};

export function subcategoryCoverUrl(node: PortfolioSubcategoryNode): string | null {
  return (
    node.coverUrl ??
    node.plans[0]?.coverUrl ??
    node.gallery[0]?.url ??
    node.children.map(subcategoryCoverUrl).find(Boolean) ??
    null
  );
}

type PortfolioSubcategoryTreeProps = {
  nodes: PortfolioSubcategoryNode[];
  categoryTitle: string;
  depth?: number;
};

export function PortfolioSubcategoryTree({
  nodes,
  categoryTitle,
  depth = 0,
}: Readonly<PortfolioSubcategoryTreeProps>) {
  if (nodes.length === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-col",
        depth === 0 ? "gap-16 sm:gap-24" : "mt-12 gap-12 sm:mt-16 sm:gap-16",
      )}
    >
      {nodes.map((subcategory) => {
        const HeadingTag = depth === 0 ? "h2" : "h3";
        const showPlans =
          subcategory.plans.length > 0 || subcategory.children.length === 0;

        return (
          <section
            key={subcategory.id}
            id={subcategory.slug}
            className="scroll-mt-28"
          >
            <Reveal>
              <p className="text-[0.65rem] uppercase tracking-[0.32em] text-catalog-gold">
                {categoryTitle}
              </p>
              <SectionHeading
                as={HeadingTag}
                align="left"
                className={cn(
                  "mt-3 font-display italic text-white",
                  depth === 0
                    ? "text-[clamp(1.6rem,4vw,2.5rem)]"
                    : "text-[clamp(1.35rem,3vw,2rem)]",
                )}
              >
                {subcategory.title}
              </SectionHeading>
              <span
                className="mt-4 block h-px w-14 bg-catalog-gold/80"
                aria-hidden="true"
              />
            </Reveal>

            {showPlans && (
              <div className="mt-8 sm:mt-10">
                <PortfolioPlanSplits
                  tone="catalog"
                  categoryTitle={subcategory.title}
                  plans={subcategory.plans}
                />
              </div>
            )}

            <PlanGallerySection
              compact
              tone="catalog"
              planTitle={subcategory.title}
              images={subcategory.gallery}
            />

            <PortfolioSubcategoryTree
              nodes={subcategory.children}
              categoryTitle={subcategory.title}
              depth={depth + 1}
            />
          </section>
        );
      })}
    </div>
  );
}
