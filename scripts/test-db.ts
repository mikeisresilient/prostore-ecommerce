import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const products = await prisma.product.findMany({
    include: {
      category: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  console.log("\nCATEGORIES:");
  console.table(
    categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
    }))
  );

  console.log("\nPRODUCTS:");
  console.table(
    products.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price.toString(),
      category: product.category.name,
      stock: product.stock,
      featured: product.featured,
    }))
  );
}

main()
  .catch((error) => {
    console.error("Database test failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });