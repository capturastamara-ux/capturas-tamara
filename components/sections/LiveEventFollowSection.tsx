import Image from "next/image";
import { LiveEventPhotoStrip } from "@/components/sections/LiveEventPhotoStrip";
import { liveContentConfig } from "@/config/live-content";
import { siteConfig } from "@/config/site";

function InstagramIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-8 3.999 3.999 0 010 8zm6.406-11.845a1.44 1.44 0 11-2.881 0 1.44 1.44 0 012.881 0z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

type LiveEventFollowSectionProps = {
  images?: ReadonlyArray<{ id: string; url: string }>;
  eventTitle?: string;
};

export function LiveEventFollowSection({
  images = [],
  eventTitle = "",
}: Readonly<LiveEventFollowSectionProps>) {
  const { instagram, services } = liveContentConfig;
  const hasPhotos = images.length > 0;

  return (
    <>
      <section className="bg-cream px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
        <div className="mx-auto max-w-3xl space-y-6">
          {hasPhotos && (
            <LiveEventPhotoStrip images={images} title={eventTitle} />
          )}

          <div className="rounded-[1.75rem] border border-catalog-ink/10 bg-white/50 px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-catalog-ink/15 text-catalog-ink">
                  <InstagramIcon />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-catalog-ink sm:text-sm">
                    {instagram.heading}
                  </p>
                  <p className="mt-1 text-sm text-catalog-ink/70">
                    {instagram.body}
                  </p>
                </div>
              </div>
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-catalog-ink px-5 py-3 text-xs uppercase tracking-[0.12em] text-white transition-transform hover:-translate-y-0.5 sm:w-auto"
              >
                <InstagramIcon />
                {instagram.buttonLabel}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <Image
          src={services.image}
          alt={services.imageAlt}
          fill
          quality={80}
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="relative mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] italic leading-tight text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.35)]">
              {services.heading}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.35)] sm:text-base">
              {services.body}
            </p>
          </div>
          <a
            href={services.href}
            className="inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-xs uppercase tracking-[0.12em] text-catalog-ink transition-transform hover:-translate-y-0.5"
          >
            <CalendarIcon />
            {services.buttonLabel}
          </a>
        </div>
      </section>
    </>
  );
}
