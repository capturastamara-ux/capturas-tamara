import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

export function AboutIntro() {
  return (
    <section
      id="nosotros"
      className="bg-surface px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-36"
    >
      <Reveal className="mx-auto max-w-[900px] text-center">
        <SectionHeading className="text-[clamp(1.5rem,3.5vw,2.75rem)] leading-snug">
          {siteConfig.about.headline}
        </SectionHeading>
        <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {siteConfig.about.body}
        </p>
        <div className="mt-10">
          <Button href={siteConfig.about.cta.href} variant="outline">
            {siteConfig.about.cta.label}
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
