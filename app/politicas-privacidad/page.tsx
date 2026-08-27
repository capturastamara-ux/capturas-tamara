import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { privacyConfig } from "@/config/privacy";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `${privacyConfig.title} | ${siteConfig.name}`,
  description: privacyConfig.intro,
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <SiteHeader variant="solid" />
      <main className="bg-surface px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
        <div className="mx-auto max-w-3xl">
          <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted sm:text-xs">
            Legal
          </p>
          <SectionHeading className="mt-3 font-display text-[clamp(2rem,5vw,3.5rem)] italic">
            {privacyConfig.title}
          </SectionHeading>
          <p className="mt-5 text-sm leading-relaxed text-muted sm:text-base">
            {privacyConfig.intro}
          </p>

          <div className="mt-10 space-y-8">
            {privacyConfig.sections.map((section) => (
              <section key={section.title}>
                <h2 className="font-display text-2xl italic text-primary">
                  {section.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
