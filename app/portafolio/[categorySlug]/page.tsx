import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { CatalogBand } from "@/components/sections/catalog-ui";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { siteConfig } from "@/config/site";
import { getCategoryBySlug } from "@/lib/db/portfolio";
import { richTextToPlainText } from "@/lib/sanitize-rich-text";
import { PortfolioSubcategoryTree } from "@/components/sections/PortfolioSubcategoryTree";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ categorySlug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);

  if (!category) {
    return { title: `Portafolio | ${siteConfig.name}` };
  }

  return {
    title: `${category.title} | Portafolio | ${siteConfig.name}`,
    description: category.description
      ? richTextToPlainText(category.description)
      : siteConfig.portfolio.pageIntro,
  };
}

export default async function CategorySubcategoriesPage({ params }: PageProps) {
  const { categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  return (
    <>
      <SiteHeader variant="solid" />
      <main>
        <CatalogBand className="px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
          <div className="mx-auto min-w-0 max-w-[1400px]">
            <Reveal>
              <Link
                href="/portafolio"
                className="text-[0.65rem] uppercase tracking-[0.14em] text-white/70 transition-colors hover:text-catalog-gold sm:text-xs"
              >
                ← Portafolio
              </Link>
            </Reveal>

            <Reveal delay={0.06} className="mt-6 sm:mt-8">
              <p className="text-[0.65rem] uppercase tracking-[0.32em] text-catalog-gold">
                Subcategorías
              </p>
              <SectionHeading
                as="h1"
                align="left"
                className="mt-3 font-display text-[clamp(1.75rem,5vw,3rem)] italic text-white"
              >
                {category.title}
              </SectionHeading>
              <span
                className="mt-5 block h-px w-14 bg-catalog-gold/80"
                aria-hidden="true"
              />
            </Reveal>

            {category.subcategories.length > 0 ? (
              <div className="mt-12 sm:mt-16">
                <PortfolioSubcategoryTree
                  nodes={category.subcategories}
                  categoryTitle={category.title}
                />
              </div>
            ) : (
              <p className="mt-10 text-white/70">
                Aún no hay subcategorías publicadas en {category.title}.
              </p>
            )}
          </div>
        </CatalogBand>
      </main>
      <Footer />
    </>
  );
}
