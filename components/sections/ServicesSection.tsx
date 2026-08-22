import Image from "next/image";
import { services } from "@/config/services";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealItem, RevealStagger } from "@/components/ui/Reveal";

export function ServicesSection() {
  return (
    <section
      id="servicios"
      className="bg-cream px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-36"
    >
      <div className="mx-auto max-w-[1400px]">
        <Reveal className="mb-16 text-center sm:mb-20">
          <SectionHeading className="mb-6 font-display italic">
            {siteConfig.servicesIntro.headline}
          </SectionHeading>
          <p className="whitespace-pre-line font-display text-[clamp(1.25rem,3vw,2rem)] text-primary/80">
            {siteConfig.servicesIntro.subheadline}
          </p>
        </Reveal>

        <RevealStagger
          stagger={0.14}
          className="grid gap-12 lg:grid-cols-3 lg:gap-8"
        >
          {services.map((service, index) => (
            <RevealItem key={service.slug}>
              <article className="group flex h-full flex-col">
                <div className="media-frame relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.imageAlt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
                <div className="flex flex-1 flex-col pt-6">
                  <h3 className="text-xs uppercase tracking-[0.16em] text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </h3>
                  <h4 className="mt-2 font-display text-2xl capitalize text-primary sm:text-3xl">
                    {service.title}
                  </h4>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-muted sm:text-base">
                    {service.description}
                  </p>
                  <div className="mt-6">
                    <Button href={service.cta.href} variant="outline">
                      {service.cta.label}
                    </Button>
                  </div>
                </div>
              </article>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
