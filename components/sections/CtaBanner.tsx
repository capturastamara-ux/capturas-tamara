import Image from "next/image";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

export function CtaBanner() {
  return (
    <section className="bg-background px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
      <div className="mx-auto grid max-w-[1400px] items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <SectionHeading align="left" className="italic">
            {siteConfig.ctaBanner.headline}
          </SectionHeading>
          <p className="mt-6 text-base leading-relaxed text-muted sm:text-lg">
            {siteConfig.ctaBanner.body}
          </p>
          <div className="mt-8">
            <Button href={siteConfig.ctaBanner.cta.href} variant="filled">
              {siteConfig.ctaBanner.cta.label}
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.12} y={36}>
          <div className="media-frame relative aspect-[4/5] overflow-hidden sm:aspect-[3/4]">
            <Image
              src={siteConfig.ctaBanner.image}
              alt={siteConfig.ctaBanner.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
