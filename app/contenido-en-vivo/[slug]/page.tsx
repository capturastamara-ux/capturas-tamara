import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { LiveEventFollowSection } from "@/components/sections/LiveEventFollowSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { liveContentConfig } from "@/config/live-content";
import { siteConfig } from "@/config/site";
import { getPublishedLiveEventBySlug } from "@/lib/db/portfolio";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublishedLiveEventBySlug(slug);

  if (!event) {
    return { title: `${liveContentConfig.pageTitle} | ${siteConfig.name}` };
  }

  return {
    title: `${event.title} | ${liveContentConfig.pageTitle} | ${siteConfig.name}`,
    description: event.description ?? liveContentConfig.pageIntro,
  };
}

export default async function LiveEventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getPublishedLiveEventBySlug(slug);
  if (!event) notFound();

  return (
    <>
      <SiteHeader variant="solid" />
      <main className="bg-surface">
        <section className="px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
          <div className="mx-auto max-w-3xl">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted sm:text-xs">
              {liveContentConfig.eyebrow}
            </p>
            <SectionHeading
              as="h1"
              align="left"
              className="mt-2 font-display text-[clamp(1.75rem,5vw,3.5rem)] italic sm:mt-3"
            >
              {event.title}
            </SectionHeading>
            {event.description ? (
              <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-muted sm:text-base">
                {event.description}
              </p>
            ) : null}
            <a
              href={event.buttonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex rounded-full bg-catalog px-6 py-3 text-xs uppercase tracking-[0.12em] text-white transition-transform hover:-translate-y-0.5 hover:bg-catalog-ink"
            >
              {event.buttonLabel}
            </a>
          </div>
        </section>
        <LiveEventFollowSection
          images={event.images}
          eventTitle={event.title}
        />
      </main>
      <Footer />
    </>
  );
}
