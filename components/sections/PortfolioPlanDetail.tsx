import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PlanPricing } from "@/components/ui/PlanPricing";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RichTextContent } from "@/components/ui/RichTextContent";
import { PortfolioSplitContent } from "@/components/ui/PortfolioSplitContent";
import { PortfolioSplitGrid } from "@/components/ui/PortfolioSplitGrid";
import { PortfolioSplitMedia } from "@/components/ui/PortfolioSplitMedia";
import { Reveal } from "@/components/ui/Reveal";
import { PlanGallerySection } from "@/components/sections/PlanGallerySection";
import { siteConfig } from "@/config/site";

type PlanDetail = {
  title: string;
  tagline: string | null;
  price: number | null;
  priceTiers: Array<{
    id: string;
    guestCount: number;
    price: number;
  }>;
  coverUrl: string | null;
  description: string | null;
  sections: Array<{
    id: string;
    title: string;
    intro: string | null;
    note: string | null;
    imageUrl: string | null;
  }>;
  gallery: Array<{
    id: string;
    url: string;
  }>;
  subcategory: {
    slug: string;
    title: string;
    category: {
      slug: string;
      title: string;
    };
  };
};

type PortfolioPlanDetailProps = {
  plan: PlanDetail;
};

export function PortfolioPlanDetail({ plan }: PortfolioPlanDetailProps) {
  const cover = plan.coverUrl ?? "/images/plans/todo-incluido/cover.png";
  const whatsappHref = `${siteConfig.whatsapp.href}?text=${encodeURIComponent(
    `Hola, me interesa cotizar el plan ${plan.title}.`,
  )}`;

  // La portada del plan ocupa el turno 0 (imagen a la izquierda), así que la
  // primera sección con imagen va a la derecha y de ahí se van alternando.
  let imageTurn = 1;
  const sections = plan.sections.map((section) => ({
    ...section,
    imageLeft: section.imageUrl ? imageTurn++ % 2 === 0 : false,
  }));

  return (
    <div className="mx-auto max-w-[1400px]">
      <Reveal y={16} className="mb-6">
        <Link
          href={`/portafolio/${plan.subcategory.category.slug}/${plan.subcategory.slug}`}
          className="text-xs uppercase tracking-[0.14em] text-muted transition-opacity hover:opacity-70"
        >
          ← {plan.subcategory.title}
        </Link>
      </Reveal>

      <PortfolioSplitGrid priority>
        <Reveal className="min-h-0">
          <PortfolioSplitMedia className="[&_img]:max-lg:object-[center_68%] [&_img]:lg:object-center">
            <Image
              src={cover}
              alt={plan.title}
              fill
              priority
              className="object-cover max-lg:object-[center_68%] lg:object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </PortfolioSplitMedia>
        </Reveal>

        <Reveal delay={0.1} className="min-h-0">
          <PortfolioSplitContent>
            {plan.tagline && (
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted sm:text-xs">
                {plan.tagline}
              </p>
            )}
            <SectionHeading
              as="h1"
              align="left"
              className="mt-2 font-display text-[clamp(1.75rem,5vw,3rem)] italic sm:mt-3"
            >
              {plan.title}
            </SectionHeading>
            <PlanPricing
              price={plan.price}
              priceTiers={plan.priceTiers}
              variant="compact"
              className="mt-4 sm:mt-5"
            />
            {plan.description && (
              <RichTextContent
                html={plan.description}
                className="mt-4 max-w-lg text-sm leading-relaxed sm:mt-5 sm:text-base lg:text-[0.95rem] lg:leading-relaxed"
              />
            )}
          </PortfolioSplitContent>
        </Reveal>
      </PortfolioSplitGrid>

      <div className="mt-20 flex flex-col gap-16 sm:mt-28 sm:gap-24">
        {sections.map((section) => {
          const imageLeft = section.imageLeft;

          return (
            <section
              key={section.id}
              className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
            >
              {section.imageUrl && (
                <Reveal
                  className={imageLeft ? "" : "lg:order-2"}
                  delay={imageLeft ? 0 : 0.08}
                >
                  <div className="media-frame relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={section.imageUrl}
                      alt={section.title}
                      fill
                      className="object-cover max-lg:object-[center_68%] lg:object-center"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </Reveal>
              )}

              <Reveal
                className={imageLeft ? "" : "lg:order-1"}
                delay={imageLeft ? 0.08 : 0}
              >
                <SectionHeading
                  as="h2"
                  align="left"
                  className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] italic"
                >
                  {section.title}
                </SectionHeading>
                {section.intro && (
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-muted">
                    {section.intro}
                  </p>
                )}
                {section.note && (
                  <RichTextContent
                    html={section.note}
                    className="mt-6 text-sm italic"
                  />
                )}
              </Reveal>
            </section>
          );
        })}
        <Reveal>
          <div className="flex justify-center pt-6 sm:pt-10">
            <Button
              href={whatsappHref}
              external
              variant="filled"
              className="w-full max-w-md px-10 py-4 text-sm tracking-[0.14em] shadow-[0_10px_28px_rgb(26_26_26_/_0.24)] hover:shadow-[0_14px_32px_rgb(26_26_26_/_0.28)] sm:w-auto sm:px-12 sm:py-[1.125rem] sm:text-base"
            >
              Cotizar este plan
            </Button>
          </div>
        </Reveal>
      </div>

      {plan.gallery.length > 0 && (
        <PlanGallerySection images={plan.gallery} planTitle={plan.title} />
      )}
    </div>
  );
}
