import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { liveContentConfig, liveEventPath } from "@/config/live-content";
import { siteConfig } from "@/config/site";
import { getPublishedLiveEvents } from "@/lib/db/portfolio";

export const metadata: Metadata = {
  title: `${liveContentConfig.pageTitle} | ${siteConfig.name}`,
  description: liveContentConfig.pageIntro,
};

export default async function LiveContentPage() {
  const events = await getPublishedLiveEvents();

  return (
    <>
      <SiteHeader variant="solid" />
      <main className="bg-surface">
        <section className="px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
          <div className="mx-auto max-w-[1400px]">
            <Reveal className="mb-8 max-w-2xl sm:mb-10">
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted sm:text-xs">
                {liveContentConfig.eyebrow}
              </p>
              <SectionHeading
                as="h1"
                align="left"
                className="mt-2 font-display text-[clamp(1.75rem,5vw,3.5rem)] italic sm:mt-3"
              >
                {liveContentConfig.pageTitle}
              </SectionHeading>
              <p className="mt-4 text-sm leading-relaxed text-muted sm:mt-5 sm:text-base">
                {liveContentConfig.pageIntro}
              </p>
            </Reveal>

            {events.length === 0 ? (
              <p className="text-sm text-muted">{liveContentConfig.empty}</p>
            ) : (
              <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {events.map((event) => (
                  <li key={event.id}>
                    <article className="flex h-full flex-col border border-catalog/15 bg-background px-6 py-7">
                      <h2 className="font-display text-2xl italic text-catalog-ink">
                        {event.title}
                      </h2>
                      <p className="mt-3 line-clamp-4 flex-1 text-sm leading-relaxed text-muted">
                        {event.description}
                      </p>
                      <Link
                        href={liveEventPath(event.slug)}
                        className="mt-6 inline-flex self-start rounded-full bg-catalog px-5 py-2.5 text-xs uppercase tracking-[0.12em] text-white transition-transform hover:-translate-y-0.5 hover:bg-catalog-ink"
                      >
                        {liveContentConfig.cardCta}
                      </Link>
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
