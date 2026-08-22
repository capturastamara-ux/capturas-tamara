import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicCotizadorComparison } from "@/components/cotizador/PublicCotizadorComparison";
import { CotizadorPrintButton } from "@/components/cotizador/CotizadorPrintButton";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { SiteLogo } from "@/components/layout/SiteLogo";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/config/site";
import { filterPlansBySlugs } from "@/lib/cotizador/sections";
import { parseGuestCountParam, parsePlanSlugsParam } from "@/lib/cotizador/url";
import { getPublicComparisonBySlug } from "@/lib/db/portfolio";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ planes?: string; invitados?: string }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const { planes: planesParam } = await searchParams;
  const category = await getPublicComparisonBySlug(categorySlug);
  const selectedSlugs = parsePlanSlugsParam(planesParam);
  const visiblePlans = category
    ? filterPlansBySlugs(category.plans, selectedSlugs)
    : [];

  if (!category || visiblePlans.length === 0) {
    return { title: `${siteConfig.cotizador.pageTitle} | ${siteConfig.name}` };
  }

  return {
    title: `${siteConfig.cotizador.pageTitle} — ${category.title} | ${siteConfig.name}`,
    description: siteConfig.cotizador.pageIntro,
  };
}

export default async function PublicCotizadorPage({
  params,
  searchParams,
}: PageProps) {
  const { categorySlug } = await params;
  const { planes: planesParam, invitados: invitadosParam } = await searchParams;
  const category = await getPublicComparisonBySlug(categorySlug);

  if (!category || category.plans.length === 0) {
    notFound();
  }

  const selectedSlugs = parsePlanSlugsParam(planesParam);
  const initialGuestCount = parseGuestCountParam(invitadosParam);
  const visiblePlans = filterPlansBySlugs(category.plans, selectedSlugs);

  if (visiblePlans.length === 0) {
    notFound();
  }

  const printTargetId = `cotizador-public-${category.id}`;

  const plans = visiblePlans.map((plan) => ({
    id: plan.id,
    slug: plan.slug,
    title: plan.title,
    tagline: plan.tagline,
    price: plan.price,
    priceTiers: plan.priceTiers.map((tier) => ({
      guestCount: tier.guestCount,
      price: tier.price,
    })),
    description: plan.description,
    published: true,
    sections: plan.sections.map((section) => ({
      id: section.id,
      title: section.title,
      intro: section.intro,
      note: section.note,
    })),
  }));

  return (
    <>
      <SiteHeader variant="solid" />
      <main className="bg-surface px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
        <div className="mx-auto max-w-[1400px]">
          <Link
            href="/cotizador"
            className="text-xs uppercase tracking-[0.14em] text-muted transition-opacity hover:opacity-70"
          >
            ← {siteConfig.cotizador.pageTitle}
          </Link>

          <div className="cotizador-public-actions mt-6 flex flex-wrap items-center gap-3 sm:mt-8">
            <CotizadorPrintButton printTargetId={printTargetId} />
            <Button href={siteConfig.cotizador.contactCta.href} variant="filled">
              {siteConfig.cotizador.contactCta.label}
            </Button>
          </div>

          <div
            id={printTargetId}
            className="cotizador-print-area mt-10 rounded-sm border border-primary/10 bg-cream p-4 sm:mt-12 sm:p-8 print:mt-0 print:border-0 print:bg-white print:p-0"
          >
            <div className="mb-8 text-center print:mb-6">
              <div className="flex justify-center">
                <SiteLogo size="md" showName nameClassName="text-primary" />
              </div>
              <SectionHeading className="mt-5 font-display text-[clamp(1.75rem,4vw,2.75rem)] italic">
                {category.title}
              </SectionHeading>
              <p className="mt-2 text-sm text-muted">{siteConfig.cotizador.publicSubtitle}</p>
            </div>

            <PublicCotizadorComparison
              categorySlug={categorySlug}
              plans={plans}
              selectedPlanSlugs={selectedSlugs.length > 0 ? selectedSlugs : plans.map((p) => p.slug)}
              initialGuestCount={initialGuestCount}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
