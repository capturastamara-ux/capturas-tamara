import { Button } from "@/components/ui/Button";
import { PlanPricing } from "@/components/ui/PlanPricing";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RichTextContent } from "@/components/ui/RichTextContent";
import { PlanGalleryCarousel } from "@/components/ui/PlanGalleryCarousel";
import { PortfolioSplitContent } from "@/components/ui/PortfolioSplitContent";
import { PortfolioSplitGrid } from "@/components/ui/PortfolioSplitGrid";
import { PortfolioSplitMedia } from "@/components/ui/PortfolioSplitMedia";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

export type PortfolioPlanCard = {
  id: string;
  slug: string;
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
  }>;
  gallery: Array<{
    id: string;
    url: string;
  }>;
};

type PortfolioPlanSplitsProps = {
  categorySlug: string;
  subcategorySlug: string;
  categoryTitle: string;
  plans: PortfolioPlanCard[];
};

export function PortfolioPlanSplits({
  categorySlug,
  subcategorySlug,
  categoryTitle,
  plans,
}: PortfolioPlanSplitsProps) {
  if (plans.length === 0) {
    return (
      <p className="text-muted">
        Aún no hay planes publicados en {categoryTitle}.
      </p>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-12 sm:gap-20 lg:gap-24">
      {plans.map((plan, index) => {
        // Sin hero de categoría: el primer plan inicia con imagen a la izquierda.
        const imageLeft = index % 2 === 0;
        const cover =
          plan.coverUrl ?? "/images/plans/todo-incluido/cover.png";

        return (
          <article
            key={plan.id}
            id={plan.slug}
            className="min-w-0 scroll-mt-28"
          >
            <PortfolioSplitGrid priority={index === 0}>
              <Reveal
                className={cn(
                  "min-h-0 min-w-0 w-full overflow-hidden",
                  !imageLeft && "lg:order-2",
                )}
                delay={imageLeft ? 0 : 0.08}
              >
                <PortfolioSplitMedia>
                  <PlanGalleryCarousel
                    images={plan.gallery}
                    fallbackUrl={cover}
                    fallbackAlt={plan.title}
                    priority={index === 0}
                  />
                </PortfolioSplitMedia>
              </Reveal>

              <Reveal
                className={cn(
                  "min-h-0 min-w-0 w-full",
                  !imageLeft && "lg:order-1",
                )}
                delay={imageLeft ? 0.08 : 0}
              >
                <PortfolioSplitContent>
                {plan.tagline && (
                  <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted sm:text-xs">
                    {plan.tagline}
                  </p>
                )}
                <SectionHeading
                  as="h2"
                  align="left"
                  className="mt-2 font-display text-[clamp(1.75rem,4vw,3rem)] italic sm:mt-3"
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

                {plan.sections.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2 sm:mt-5">
                    {plan.sections.map((section) => (
                      <li
                        key={section.id}
                        className="rounded-full border border-primary/15 px-3 py-1 text-[0.65rem] uppercase tracking-[0.12em] text-muted sm:text-xs"
                      >
                        {section.title}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-5 sm:mt-6">
                  <Button
                    href={`/portafolio/${categorySlug}/${subcategorySlug}/${plan.slug}`}
                    variant="filled"
                    className="w-full sm:w-auto"
                  >
                    Ver detalle del plan
                  </Button>
                </div>
                </PortfolioSplitContent>
              </Reveal>
            </PortfolioSplitGrid>
          </article>
        );
      })}
    </div>
  );
}
