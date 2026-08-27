"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

export function ContactSection() {
  const [detailsLength, setDetailsLength] = useState(0);

  return (
    <section
      id="contacto"
      className="bg-surface px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-36"
    >
      <div className="mx-auto max-w-[1400px]">
        <Reveal className="mb-12 text-center sm:mb-16">
          <SectionHeading>{siteConfig.contact.headline}</SectionHeading>
        </Reveal>

        <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <Reveal>
          <form
            className="grid gap-5 sm:grid-cols-2"
            onSubmit={(e) => e.preventDefault()}
          >
            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-xs uppercase tracking-[0.12em] text-muted">
                Nombre completo *
              </span>
              <input
                type="text"
                required
                className="border-b border-primary/20 bg-transparent py-3 text-sm outline-none transition-colors focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.12em] text-muted">
                Correo electrónico *
              </span>
              <input
                type="email"
                required
                className="border-b border-primary/20 bg-transparent py-3 text-sm outline-none transition-colors focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.12em] text-muted">
                Número de contacto *
              </span>
              <input
                type="tel"
                required
                className="border-b border-primary/20 bg-transparent py-3 text-sm outline-none transition-colors focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.12em] text-muted">
                País del evento *
              </span>
              <input
                type="text"
                required
                className="border-b border-primary/20 bg-transparent py-3 text-sm outline-none transition-colors focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.12em] text-muted">
                Tipo de evento *
              </span>
              <select
                required
                className="border-b border-primary/20 bg-transparent py-3 text-sm outline-none transition-colors focus:border-primary"
                defaultValue=""
              >
                <option value="" disabled>
                  Seleccionar
                </option>
                {siteConfig.contact.eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-xs uppercase tracking-[0.12em] text-muted">
                Fecha estimada del evento *
              </span>
              <input
                type="date"
                required
                className="border-b border-primary/20 bg-transparent py-3 text-sm outline-none transition-colors focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-xs uppercase tracking-[0.12em] text-muted">
                Detalles (Inspiración & visión) *{" "}
                <span className="normal-case tracking-normal text-primary/40">
                  {detailsLength} / 180
                </span>
              </span>
              <textarea
                required
                maxLength={180}
                rows={4}
                onChange={(e) => setDetailsLength(e.target.value.length)}
                className="resize-none border-b border-primary/20 bg-transparent py-3 text-sm outline-none transition-colors focus:border-primary"
              />
            </label>

            <label className="flex items-start gap-3 sm:col-span-2">
              <input type="checkbox" required className="mt-1 accent-primary" />
              <span className="text-xs leading-relaxed text-muted">
                {siteConfig.contact.privacyPrefix}{" "}
                <Link
                  href={siteConfig.footer.privacyHref}
                  className="underline decoration-primary/30 underline-offset-2 hover:text-primary"
                >
                  {siteConfig.footer.privacyLabel}
                </Link>{" "}
                {siteConfig.contact.privacySuffix}
              </span>
            </label>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full border border-primary bg-primary px-8 py-3 text-xs uppercase tracking-[0.12em] text-white transition-all hover:-translate-y-0.5 hover:bg-primary/90 sm:text-sm"
              >
                {siteConfig.contact.submitLabel}
              </button>
            </div>
          </form>
          </Reveal>

          <Reveal delay={0.12} y={36}>
            <div className="media-frame relative aspect-[3/4] overflow-hidden">
              <Image
                src={siteConfig.contact.image}
                alt={siteConfig.contact.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
