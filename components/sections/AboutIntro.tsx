import { siteConfig } from "@/config/site";
import { CatalogBand } from "@/components/sections/catalog-ui";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

export function AboutIntro() {
  return (
    <CatalogBand
      id="nosotros"
      className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12"
    >
      <Reveal className="mx-auto max-w-[820px] text-center">
        <SectionHeading className="text-[clamp(1.5rem,3.5vw,2.45rem)] leading-snug text-white">
          {siteConfig.about.headline}
        </SectionHeading>
        <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
          {siteConfig.about.body}
        </p>
        <div className="mt-10">
          <Button
            href={siteConfig.about.cta.href}
            variant="outline"
            className="border-white/35 text-white hover:border-catalog-gold hover:bg-catalog-gold hover:text-catalog-ink"
          >
            {siteConfig.about.cta.label}
          </Button>
        </div>
      </Reveal>
    </CatalogBand>
  );
}
