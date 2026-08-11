import Link from "next/link";

import Container from "@/components/shared/container";
import ProductCard from "@/components/shared/product-card";
import { prisma } from "@/lib/prisma";

export default async function FeaturedProducts() {
  const featuredProducts = await prisma.product.findMany({
    where: {
      featured: true,
      isActive: true,
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 4,
  });

  return (
    <section>
      <Container className="py-12 sm:py-16">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Featured
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Featured Products
            </h2>

            <p className="mt-3 max-w-2xl text-muted-foreground">
              Take a look at some of our top picks.
            </p>
          </div>

          <Link
            href="/products"
            className="group inline-flex w-fit items-center text-sm font-semibold transition-colors hover:text-primary"
          >
            View all products
            <span
              aria-hidden="true"
              className="ml-1 transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                category: product.category.name,
                price: Number(product.price),
                rating: product.rating,
                reviews: product.reviews,
                image: product.image,
                stock: product.stock,
              }}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
