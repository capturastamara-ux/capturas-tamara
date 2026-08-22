import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { PortfolioPlanSplits } from "@/components/sections/PortfolioPlanSplits";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { siteConfig } from "@/config/site";
import { getCategoryBySlug } from "@/lib/db/portfolio";
import { richTextToPlainText } from "@/lib/sanitize-rich-text";

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

export default async function CategoryPlansPage({ params }: PageProps) {
  const { categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  return (
    <>
      <SiteHeader variant="solid" />
      <main className="bg-surface">
        <section className="overflow-x-clip px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
          <div className="mx-auto min-w-0 max-w-[1400px]">
            <Reveal>
              <Link
                href="/portafolio"
                className="text-[0.65rem] uppercase tracking-[0.14em] text-muted transition-opacity hover:opacity-70 sm:text-xs"
              >
                ← Portafolio
              </Link>
            </Reveal>

            <Reveal delay={0.06} className="mt-6 sm:mt-8">
              <SectionHeading
                as="h1"
                align="left"
                className="font-display text-[clamp(1.75rem,5vw,3rem)] italic"
              >
                {category.title}
              </SectionHeading>
            </Reveal>

            {category.plans.length > 0 ? (
              <div className="mt-10 sm:mt-12 lg:mt-14">
                <PortfolioPlanSplits
                  categorySlug={category.slug}
                  categoryTitle={category.title}
                  plans={category.plans}
                />
              </div>
            ) : (
              <p className="mt-10 text-muted">
                Aún no hay planes publicados en {category.title}.
              </p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
