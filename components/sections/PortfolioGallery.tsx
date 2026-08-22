import Image from "next/image";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

export type LandingGalleryImage = {
  id: string;
  src: string;
  alt: string;
  aspect: "portrait" | "landscape" | "square";
};

const aspectClasses = {
  portrait: "md:row-span-2",
  landscape: "md:col-span-2",
  square: "",
};

type PortfolioGalleryProps = {
  images: LandingGalleryImage[];
};

export function PortfolioGallery({ images }: Readonly<PortfolioGalleryProps>) {
  return (
    <section
      id="portafolio"
      className="flex h-[100svh] min-h-[580px] flex-col bg-background px-4 py-4 sm:px-8 sm:py-6 lg:px-12"
    >
      <div className="mx-auto flex h-full w-full max-w-[1400px] flex-col">
        <Reveal className="shrink-0 pb-2 text-center sm:pb-4">
          <SectionHeading className="font-display text-[clamp(1.15rem,4.8vw,2.5rem)] italic leading-[1.12] sm:leading-tight">
            {siteConfig.portfolio.headline}
          </SectionHeading>
        </Reveal>

        <RevealStagger
          stagger={0.06}
          className="grid min-h-0 flex-1 grid-cols-2 grid-rows-[repeat(4,minmax(0,1fr))] gap-1 sm:gap-2 md:grid-cols-4 md:grid-rows-[repeat(3,minmax(0,1fr))]"
        >
          {images.map((image) => (
            <RevealItem
              key={image.id}
              className={cn(
                "relative h-full min-h-0 overflow-hidden rounded-2xl shadow-[0_4px_14px_rgb(26_26_26_/_0.08)] md:media-frame md:shadow-none",
                aspectClasses[image.aspect],
              )}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 768px) 46vw, 25vw"
              />
            </RevealItem>
          ))}
        </RevealStagger>

        <Reveal delay={0.15} className="shrink-0 pt-2 text-center sm:pt-4">
          <Button
            href={siteConfig.portfolio.cta.href}
            variant="outline"
            className="px-4 py-2 text-[0.62rem] tracking-[0.1em] sm:px-5 sm:py-2.5 sm:text-xs sm:tracking-[0.12em]"
          >
            {siteConfig.portfolio.cta.label}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
