import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

const categories = [
  {
    name: "Electronics",
    slug: "electronics",
    description: "Modern electronics and smart devices.",
  },
  {
    name: "Fashion",
    slug: "fashion",
    description: "Everyday fashion and accessories.",
  },
  {
    name: "Fitness",
    slug: "fitness",
    description: "Products for an active lifestyle.",
  },
  {
    name: "Home & Living",
    slug: "home-living",
    description:
      "Useful products for your home and everyday life.",
  },
  {
    name: "Beauty",
    slug: "beauty",
    description: "Beauty and personal care products.",
  },
];

const products = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    slug: "premium-wireless-headphones",
    description:
      "Premium wireless headphones with a comfortable design and immersive sound.",
    price: 129.99,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    category: "Electronics",
    stock: 25,
    featured: true,
    rating: 4.8,
    reviews: 124,
  },
  {
    id: "2",
    name: "Minimalist Smart Watch",
    slug: "minimalist-smart-watch",
    description:
      "A minimalist smart watch designed to keep you connected throughout your day.",
    price: 89.99,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    category: "Electronics",
    stock: 30,
    featured: true,
    rating: 4.6,
    reviews: 89,
  },
  {
    id: "3",
    name: "Classic Leather Backpack",
    slug: "classic-leather-backpack",
    description:
      "A classic leather backpack combining practical storage with timeless style.",
    price: 74.99,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    category: "Fashion",
    stock: 18,
    featured: false,
    rating: 4.7,
    reviews: 56,
  },
  {
    id: "4",
    name: "Modern Running Shoes",
    slug: "modern-running-shoes",
    description:
      "Comfortable modern running shoes designed for everyday training and activity.",
    price: 94.99,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    category: "Fitness",
    stock: 22,
    featured: true,
    rating: 4.9,
    reviews: 203,
  },
  {
    id: "5",
    name: "Everyday Ceramic Mug Set",
    slug: "everyday-ceramic-mug-set",
    description:
      "A stylish ceramic mug set made for everyday coffee, tea, and other drinks.",
    price: 34.99,
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=80",
    category: "Home & Living",
    stock: 40,
    featured: false,
    rating: 4.5,
    reviews: 42,
  },
  {
    id: "6",
    name: "Premium Skincare Set",
    slug: "premium-skincare-set",
    description:
      "A premium skincare set for a simple and refreshing personal care routine.",
    price: 59.99,
    image:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=80",
    category: "Beauty",
    stock: 20,
    featured: true,
    rating: 4.8,
    reviews: 77,
  },
];

async function main() {
  console.log("Starting ProStore database seed...");

  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        slug: category.slug,
      },
      update: {
        name: category.name,
        description: category.description,
      },
      create: category,
    });
  }

  for (const product of products) {
    const category = await prisma.category.findUnique({
      where: {
        name: product.category,
      },
    });

    if (!category) {
      throw new Error(
        `Category "${product.category}" not found.`
      );
    }

    await prisma.product.upsert({
      where: {
        id: product.id,
      },

      update: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        image: product.image,
        stock: product.stock,
        featured: product.featured,
        rating: product.rating,
        reviews: product.reviews,
        categoryId: category.id,
      },

      create: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        image: product.image,
        stock: product.stock,
        featured: product.featured,
        rating: product.rating,
        reviews: product.reviews,
        categoryId: category.id,
      },
    });
  }

  console.log(
    `Seeded ${categories.length} categories and ${products.length} products.`
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });