import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { RegionsTicker } from "@/components/sections/RegionsTicker";
import { AboutIntro } from "@/components/sections/AboutIntro";
import { PortfolioGallery } from "@/components/sections/PortfolioGallery";
import { getLandingGalleryImages } from "@/lib/db/portfolio";

export const dynamic = "force-dynamic";

export default async function Home() {
  const galleryImages = await getLandingGalleryImages();

  return (
    <>
      <div className="relative">
        <SiteHeader />
        <HeroSection />
      </div>
      <main>
        <RegionsTicker />
        <AboutIntro />
        <PortfolioGallery images={galleryImages} />
      </main>
      <Footer />
    </>
  );
}
