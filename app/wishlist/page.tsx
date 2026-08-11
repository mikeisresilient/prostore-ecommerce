"use client";

import Link from "next/link";

import Container from "@/components/shared/container";
import ProductCard from "@/components/shared/product-card";
import { useWishlist } from "@/components/providers/wishlist-provider";
import WishlistAddToCartButton from "@/components/shared/wishlist-add-to-cart-button";
import { Heart } from "lucide-react";

export default function WishlistPage() {
  const { state } = useWishlist();

  return (
    <Container className="py-12 sm:py-16">
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Saved
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Your Wishlist
        </h1>

        <p className="mt-3 text-muted-foreground">
          Products you want to keep an eye on.
        </p>
      </div>

      {state.items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center sm:px-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Heart
              aria-hidden="true"
              className="h-6 w-6 text-muted-foreground"
            />
          </div>

          <h2 className="mt-5 text-xl font-semibold">Your wishlist is empty</h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Save products you love by clicking the heart icon. They&apos;ll be
            waiting for you here.
          </p>

          <Link
            href="/products"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {state.items.map((product) => (
            <div key={product.id}>
              <ProductCard product={product} />

              <WishlistAddToCartButton product={product} />
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
