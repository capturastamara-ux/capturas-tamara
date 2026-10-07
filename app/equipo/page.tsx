import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { TeamSection } from "@/components/sections/TeamSection";
import { siteConfig } from "@/config/site";
import { teamConfig } from "@/config/team";

export const metadata: Metadata = {
  title: `${teamConfig.pageTitle} | ${siteConfig.name}`,
  description: teamConfig.pageIntro,
};

export default function EquipoPage() {
  return (
    <>
      <SiteHeader variant="solid" />
      <main>
        <TeamSection showPageIntro />
      </main>
      <Footer />
    </>
  );
}
