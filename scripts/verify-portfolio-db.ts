import "dotenv/config";
import { getPublishedCategories } from "../lib/db/portfolio";
import { prisma } from "../lib/db/prisma";

async function main() {
  const categories = await getPublishedCategories();
  for (const category of categories) {
    console.log(`Category: ${category.title} (${category.slug})`);
    for (const plan of category.plans) {
      console.log(`  Plan: ${plan.title} (${plan.slug})`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
