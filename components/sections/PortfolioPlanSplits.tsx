import { Button } from "@/components/ui/Button";
import { PlanPricing } from "@/components/ui/PlanPricing";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RichTextContent } from "@/components/ui/RichTextContent";
import { PortfolioSplitContent } from "@/components/ui/PortfolioSplitContent";
import { PortfolioSplitGrid } from "@/components/ui/PortfolioSplitGrid";
import { PortfolioSplitMedia } from "@/components/ui/PortfolioSplitMedia";
import { Reveal } from "@/components/ui/Reveal";
import { siteConfig } from "@/config/site";
import { catalogConfig } from "@/config/catalog";
import { cn } from "@/lib/cn";
import Image from "next/image";
import Link from "next/link";

export type PortfolioPlanCard = {
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

type PortfolioPlanSplitsProps = {
  categoryTitle: string;
  plans: PortfolioPlanCard[];
  tone?: "default" | "catalog";
};

function reserveHref(planTitle: string) {
  return `${siteConfig.whatsapp.href}?text=${encodeURIComponent(
    siteConfig.portfolio.reserveMessage(planTitle),
  )}`;
}

export function PortfolioPlanSplits({
  categoryTitle,
  plans,
  tone = "default",
}: Readonly<PortfolioPlanSplitsProps>) {
  const isCatalog = tone === "catalog";

  if (plans.length === 0) {
    return (
      <p className={isCatalog ? "text-white/70" : "text-muted"}>
        Aún no hay planes publicados en {categoryTitle}.
      </p>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-12 sm:gap-20 lg:gap-24">
      {plans.map((plan, index) => {
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
                  <Image
                    src={cover}
                    alt={plan.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
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
                    <p
                      className={cn(
                        "text-[0.65rem] uppercase tracking-[0.18em] sm:text-xs",
                        isCatalog ? "text-catalog-gold" : "text-muted",
                      )}
                    >
                      {plan.tagline}
                    </p>
                  )}
                  <SectionHeading
                    as="h2"
                    align="left"
                    className={cn(
                      "mt-2 font-display text-[clamp(1.75rem,4vw,3rem)] italic sm:mt-3",
                      isCatalog && "text-white",
                    )}
                  >
                    {plan.title}
                  </SectionHeading>
                  {isCatalog ? (
                    <span
                      className="mt-4 block h-px w-14 bg-catalog-gold/80"
                      aria-hidden="true"
                    />
                  ) : null}
                  <PlanPricing
                    price={plan.price}
                    tone={tone}
                    variant="compact"
                    className="mt-4 sm:mt-5"
                  />
                  {plan.description && (
                    <RichTextContent
                      html={plan.description}
                      className={cn(
                        "mt-4 max-w-lg text-sm leading-relaxed sm:mt-5 sm:text-base lg:text-[0.95rem] lg:leading-relaxed",
                        isCatalog && "text-white/75 [&_a]:text-catalog-gold",
                      )}
                    />
                  )}

                  {plan.sections.length > 0 && (
                    <ul className="mt-5 space-y-4 sm:mt-6">
                      {plan.sections.map((section) => (
                        <li key={section.id}>
                          <p
                            className={cn(
                              "text-[0.65rem] uppercase tracking-[0.16em] sm:text-xs",
                              isCatalog ? "text-catalog-gold" : "text-muted",
                            )}
                          >
                            {section.title}
                          </p>
                          {section.intro ? (
                            <p
                              className={cn(
                                "mt-1 text-sm",
                                isCatalog ? "text-white/80" : "text-primary",
                              )}
                            >
                              {section.intro}
                            </p>
                          ) : null}
                          {section.note ? (
                            <RichTextContent
                              html={section.note}
                              className={cn(
                                "mt-1.5 text-sm italic",
                                isCatalog && "text-white/70 [&_a]:text-catalog-gold",
                              )}
                            />
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-5 flex flex-col items-start gap-3 sm:mt-6">
                    <Link
                      href={`/#${catalogConfig.conditions.id}`}
                      className={cn(
                        "inline-flex max-w-md text-left text-[0.65rem] uppercase leading-relaxed tracking-[0.14em] underline-offset-[0.22em] transition-colors hover:underline sm:text-xs",
                        isCatalog
                          ? "text-catalog-gold hover:text-white"
                          : "text-catalog hover:text-catalog-ink",
                      )}
                    >
                      {catalogConfig.conditions.planLinkLabel}
                    </Link>
                    <Button
                      href={reserveHref(plan.title)}
                      external
                      variant={isCatalog ? "catalog" : "outline"}
                      className={cn(
                        "w-full sm:w-auto",
                        !isCatalog &&
                          "border-catalog/40 text-catalog hover:border-catalog hover:bg-catalog hover:text-white",
                      )}
                    >
                      {siteConfig.portfolio.reserveLabel}
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
