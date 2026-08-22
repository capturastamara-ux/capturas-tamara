import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { RegionsTicker } from "@/components/sections/RegionsTicker";
import { CatalogCategoriesSection } from "@/components/sections/CatalogCategoriesSection";
import { CatalogProductsSection } from "@/components/sections/CatalogProductsSection";
import { CatalogConditionsSection } from "@/components/sections/CatalogConditionsSection";
import { AboutIntro } from "@/components/sections/AboutIntro";
import { catalogConfig } from "@/config/catalog";
import {
  getPublishedCategories,
  getPublishedPlanImages,
  pickRandomPlanImages,
} from "@/lib/db/portfolio";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [categories, planImages] = await Promise.all([
    getPublishedCategories(),
    getPublishedPlanImages(),
  ]);
  const imagesByProduct = Object.fromEntries(
    catalogConfig.products.map((product) => [
      product.id,
      product.hero
        ? []
        : pickRandomPlanImages(planImages, 3, product.images),
    ]),
  );

  return (
    <>
      <div className="relative">
        <SiteHeader />
        <HeroSection />
      </div>
      <main>
        <RegionsTicker />
        <CatalogCategoriesSection
          categories={categories.map((category) => ({
            slug: category.slug,
            title: category.title,
            coverUrl: category.coverUrl,
          }))}
        />
        <CatalogProductsSection imagesByProduct={imagesByProduct} />
        <CatalogConditionsSection />
        <AboutIntro />
      </main>
      <Footer />
    </>
  );
}
