import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { RegionsTicker } from "@/components/sections/RegionsTicker";
import { CatalogCategoriesSection } from "@/components/sections/CatalogCategoriesSection";
import { CatalogProductsSection } from "@/components/sections/CatalogProductsSection";
import { CatalogConditionsSection } from "@/components/sections/CatalogConditionsSection";
import { AboutIntro } from "@/components/sections/AboutIntro";
import { TeamSection } from "@/components/sections/TeamSection";
import { catalogConfig } from "@/config/catalog";
import {
  getCatalogConditions,
  getCatalogPrintRowsByProduct,
  getPublishedCategorySummaries,
  getPublishedPlanImages,
  pickRandomPlanImages,
} from "@/lib/db/portfolio";

export default async function Home() {
  const [categories, planImages, printRowsByProduct, conditionItems] =
    await Promise.all([
      getPublishedCategorySummaries(),
      getPublishedPlanImages(),
      getCatalogPrintRowsByProduct(),
      getCatalogConditions(),
    ]);
  const products = catalogConfig.products.map((product) => {
    const rows = printRowsByProduct[product.id];
    return {
      ...product,
      rows: rows && rows.length > 0 ? rows : product.rows,
    };
  });
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
        <CatalogCategoriesSection categories={categories} />
        <TeamSection />
        <CatalogProductsSection
          products={products}
          imagesByProduct={imagesByProduct}
        />
        <CatalogConditionsSection items={conditionItems} />
        <AboutIntro />
      </main>
      <Footer />
    </>
  );
}
