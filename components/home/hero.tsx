import Link from "next/link";

import Container from "@/components/shared/container";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-muted/30">
      <Container className="flex min-h-[520px] items-center py-16 sm:min-h-[600px] sm:py-20 lg:min-h-[640px]">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Welcome to ProStore
          </p>

          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Shop smarter.
            <span className="block text-muted-foreground">
              Live better.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Discover quality products carefully selected for
            everyday life, work, and everything in between.
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              href="/products"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Shop Products
            </Link>

            <Link
              href="/products?sort=featured"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background px-6 text-sm font-semibold transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Explore Collection
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}