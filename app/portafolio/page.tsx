import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { PortfolioCategorySplits } from "@/components/sections/PortfolioCategorySplits";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { siteConfig } from "@/config/site";
import { getPublishedCategories } from "@/lib/db/portfolio";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Portafolio | ${siteConfig.name}`,
  description: siteConfig.portfolio.pageIntro,
};

export default async function PortafolioPage() {
  const categories = await getPublishedCategories();

  return (
    <>
      <SiteHeader variant="solid" />
      <main className="bg-surface">
        <section className="px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
          <div className="mx-auto max-w-[1400px]">
            <Reveal className="mb-8 max-w-2xl sm:mb-10 lg:mb-10">
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted sm:text-xs">
                Categorías
              </p>
              <SectionHeading
                as="h1"
                align="left"
                className="mt-2 font-display text-[clamp(1.75rem,5vw,3.5rem)] italic sm:mt-3"
              >
                {siteConfig.portfolio.pageTitle}
              </SectionHeading>
              <p className="mt-4 text-sm leading-relaxed text-muted sm:mt-5 sm:text-base">
                {siteConfig.portfolio.pageIntro}
              </p>
            </Reveal>

            <PortfolioCategorySplits categories={categories} fillViewport />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
