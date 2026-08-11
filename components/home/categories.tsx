import Link from "next/link";

import Container from "@/components/shared/container";
import { prisma } from "@/lib/prisma";

export default async function Categories() {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <section>
      <Container className="py-12 sm:py-16">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Browse
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Shop by Category
          </h2>

          <p className="mt-3 max-w-2xl text-muted-foreground">
            Explore products by category and find something
            that fits your needs.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${encodeURIComponent(
                category.name.toLowerCase()
              )}`}
              className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-muted sm:p-8"
            >
              <div className="flex min-h-36 flex-col justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Explore
                  </p>

                  <h3 className="mt-2 text-2xl font-semibold">
                    {category.name}
                  </h3>
                </div>

                <span className="mt-8 text-sm font-medium transition-transform group-hover:translate-x-1">
                  Shop now →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}