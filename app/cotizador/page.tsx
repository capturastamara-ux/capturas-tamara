import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/config/site";
import { getPublicComparisonCategories } from "@/lib/db/portfolio";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${siteConfig.cotizador.pageTitle} | ${siteConfig.name}`,
  description: siteConfig.cotizador.pageIntro,
};

export default async function CotizadorIndexPage() {
  const categories = await getPublicComparisonCategories();
  const available = categories.filter((category) => category.plans.length > 0);

  return (
    <>
      <SiteHeader variant="solid" />
      <main className="bg-surface px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
        <div className="mx-auto max-w-[1400px]">
          <SectionHeading className="font-display text-[clamp(2rem,5vw,3.5rem)] italic">
            {siteConfig.cotizador.pageTitle}
          </SectionHeading>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            {siteConfig.cotizador.pageIntro}
          </p>

          {available.length === 0 ? (
            <p className="mt-10 rounded-sm border border-primary/10 bg-background p-6 text-sm text-muted">
              Pronto publicaremos comparativas de planes disponibles.
            </p>
          ) : (
            <ul className="mt-10 flex flex-wrap gap-3">
              {available.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/cotizador/${category.slug}`}
                    className="inline-block rounded-full border border-primary/15 px-5 py-2.5 text-xs uppercase tracking-[0.12em] text-primary transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    {category.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
