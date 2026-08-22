import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { PortfolioPlanDetail } from "@/components/sections/PortfolioPlanDetail";
import { siteConfig } from "@/config/site";
import { getPlanBySlugs } from "@/lib/db/portfolio";
import { richTextToPlainText } from "@/lib/sanitize-rich-text";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ categorySlug: string; planSlug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { categorySlug, planSlug } = await params;
  const plan = await getPlanBySlugs(categorySlug, planSlug);

  if (!plan) {
    return { title: `Plan | ${siteConfig.name}` };
  }

  return {
    title: `${plan.title} | ${plan.category.title} | ${siteConfig.name}`,
    description: plan.description
      ? richTextToPlainText(plan.description)
      : siteConfig.description,
  };
}

export default async function PlanDetailPage({ params }: PageProps) {
  const { categorySlug, planSlug } = await params;
  const plan = await getPlanBySlugs(categorySlug, planSlug);

  if (!plan) {
    notFound();
  }

  return (
    <>
      <SiteHeader variant="solid" />
      <main className="bg-surface px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-10">
        <PortfolioPlanDetail plan={plan} />
      </main>
      <Footer />
    </>
  );
}
