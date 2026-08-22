import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { CatalogBand } from "@/components/sections/catalog-ui";
import { PortfolioLevelView } from "@/components/sections/PortfolioLevelView";
import { PlanGallerySection } from "@/components/sections/PlanGallerySection";
import { PortfolioPlanSplits } from "@/components/sections/PortfolioPlanSplits";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { siteConfig } from "@/config/site";
import { getPublishedSubcategoryBranch } from "@/lib/db/portfolio";
import { richTextToPlainText } from "@/lib/sanitize-rich-text";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ categorySlug: string; subcategorySlug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { categorySlug, subcategorySlug } = await params;
  const branch = await getPublishedSubcategoryBranch(
    categorySlug,
    subcategorySlug,
  );

  if (!branch) {
    return { title: `Portafolio | ${siteConfig.name}` };
  }

  return {
    title: `${branch.node.title} | ${branch.category.title} | ${siteConfig.name}`,
    description: branch.category.description
      ? richTextToPlainText(branch.category.description)
      : siteConfig.portfolio.pageIntro,
  };
}

export default async function SubcategoryPage({ params }: PageProps) {
  const { categorySlug, subcategorySlug } = await params;
  const branch = await getPublishedSubcategoryBranch(
    categorySlug,
    subcategorySlug,
  );

  if (!branch) {
    notFound();
  }

  const { category, node, parent } = branch;
  const isLeaf = node.children.length === 0;
  const hasOwnContent = node.plans.length > 0 || node.gallery.length > 0;
  const backHref = parent
    ? `/portafolio/${category.slug}/${parent.slug}`
    : `/portafolio/${category.slug}`;
  const backLabel = parent?.title ?? category.title;
  const eyebrow = parent?.title ?? category.title;

  return (
    <>
      <SiteHeader variant="solid" />
      <main>
        <CatalogBand className="px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
          <div className="mx-auto min-w-0 max-w-[1400px]">
            <Reveal>
              <Link
                href={backHref}
                className="text-[0.65rem] uppercase tracking-[0.14em] text-white/70 transition-colors hover:text-catalog-gold sm:text-xs"
              >
                ← {backLabel}
              </Link>
            </Reveal>

            <Reveal delay={0.06} className="mt-6 sm:mt-8">
              <p className="text-[0.65rem] uppercase tracking-[0.32em] text-catalog-gold">
                {eyebrow}
              </p>
              <SectionHeading
                as="h1"
                align="left"
                className="mt-3 font-display text-[clamp(1.75rem,5vw,3rem)] italic text-white"
              >
                {node.title}
              </SectionHeading>
              <span
                className="mt-5 block h-px w-14 bg-catalog-gold/80"
                aria-hidden="true"
              />
            </Reveal>

            {!isLeaf ? (
              <>
                <PortfolioLevelView
                  categorySlug={category.slug}
                  nodes={node.children}
                />
                {node.gallery.length > 0 && (
                  <PlanGallerySection
                    tone="catalog"
                    planTitle={node.title}
                    images={node.gallery}
                  />
                )}
              </>
            ) : hasOwnContent ? (
              <div className="mt-10 sm:mt-12">
                {node.plans.length > 0 && (
                  <PortfolioPlanSplits
                    tone="catalog"
                    categoryTitle={node.title}
                    plans={node.plans}
                  />
                )}
                <PlanGallerySection
                  tone="catalog"
                  planTitle={node.title}
                  images={node.gallery}
                />
              </div>
            ) : (
              <p className="mt-10 text-white/70">
                Aún no hay contenido publicado en {node.title}.
              </p>
            )}
          </div>
        </CatalogBand>
      </main>
      <Footer />
    </>
  );
}
