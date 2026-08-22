import "dotenv/config";
import { getPublishedCategories } from "../lib/db/portfolio";
import { prisma } from "../lib/db/prisma";

async function main() {
  const categories = await getPublishedCategories();
  for (const category of categories) {
    console.log(`Category: ${category.title} (${category.slug})`);
    for (const subcategory of category.subcategories) {
      console.log(`  Subcategory: ${subcategory.title} (${subcategory.slug})`);
      for (const plan of subcategory.plans) {
        console.log(`    Plan: ${plan.title} (${plan.slug})`);
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
