import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RichTextContent } from "@/components/ui/RichTextContent";
import { PortfolioSplitContent } from "@/components/ui/PortfolioSplitContent";
import { PortfolioSplitGrid } from "@/components/ui/PortfolioSplitGrid";
import { PortfolioSplitMedia } from "@/components/ui/PortfolioSplitMedia";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

export type PortfolioCategoryCard = {
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  coverUrl: string | null;
  plans: Array<{
    id: string;
    slug: string;
    title: string;
    coverUrl: string | null;
  }>;
};

type PortfolioCategorySplitsProps = {
  categories: PortfolioCategoryCard[];
  fillViewport?: boolean;
};

export function PortfolioCategorySplits({
  categories,
  fillViewport = false,
}: PortfolioCategorySplitsProps) {
  return (
    <div className="flex flex-col gap-16 sm:gap-20 lg:gap-24">
      {categories.map((category, index) => {
        const imageLeft = index % 2 === 0;
        const href = `/portafolio/${category.slug}`;
        const cover =
          category.coverUrl ??
          category.plans[0]?.coverUrl ??
          "/images/plans/todo-incluido/cover.png";
        const thumbs = category.plans
          .map((plan) => ({
            id: plan.id,
            src: plan.coverUrl ?? cover,
            alt: plan.title,
          }))
          .slice(0, 4);

        while (thumbs.length > 0 && thumbs.length < 4) {
          const source = thumbs[thumbs.length % thumbs.length];
          thumbs.push({
            ...source,
            id: `${source.id}-pad-${thumbs.length}`,
          });
        }

        return (
          <article
            key={category.slug}
            id={category.slug}
            className="scroll-mt-28"
          >
            <PortfolioSplitGrid
              priority={index === 0}
              compactViewport={fillViewport && index === 0}
            >
              <Reveal
                className={cn("min-h-0", !imageLeft && "lg:order-2")}
                delay={imageLeft ? 0 : 0.08}
              >
                <Link href={href} className="block h-full">
                  <PortfolioSplitMedia>
                    <Image
                      src={cover}
                      alt={category.title}
                      fill
                      className="object-cover transition-transform duration-700 hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority={index === 0}
                    />
                  </PortfolioSplitMedia>
                </Link>
              </Reveal>

              <Reveal
                className={cn("min-h-0", !imageLeft && "lg:order-1")}
                delay={imageLeft ? 0.08 : 0}
              >
                <PortfolioSplitContent>
                {category.subtitle && (
                  <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted sm:text-xs">
                    {category.subtitle}
                  </p>
                )}
                <SectionHeading
                  as="h2"
                  align="left"
                  className="mt-2 font-display text-[clamp(1.75rem,4vw,3rem)] italic sm:mt-3"
                >
                  <Link
                    href={href}
                    className="transition-opacity hover:opacity-70"
                  >
                    {category.title}
                  </Link>
                </SectionHeading>
                {category.description && (
                  <RichTextContent
                    html={category.description}
                    className="mt-4 max-w-lg text-sm leading-relaxed sm:mt-5 sm:text-base lg:text-[0.95rem] lg:leading-relaxed"
                  />
                )}

                {category.plans.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2 sm:mt-5">
                    {category.plans.map((plan) => (
                      <li key={plan.id}>
                        <Link
                          href={`/portafolio/${category.slug}/${plan.slug}`}
                          className="inline-block rounded-full border border-primary/15 px-3 py-1 text-[0.65rem] uppercase tracking-[0.12em] text-muted transition-colors hover:border-primary/40 hover:text-primary sm:text-xs"
                        >
                          {plan.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                {thumbs.length > 0 && (
                  <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-3 lg:hidden">
                    {thumbs.map((image) => (
                      <Link
                        key={image.id}
                        href={href}
                        className="media-frame relative aspect-square overflow-hidden"
                      >
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          className="object-cover transition-transform duration-700 hover:scale-105"
                          sizes="(max-width: 1024px) 40vw, 20vw"
                        />
                      </Link>
                    ))}
                  </div>
                )}

                <div className="mt-5 sm:mt-6">
                  <Button href={href} variant="filled" className="w-full sm:w-auto">
                    Ver planes
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
