"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import { useWishlist } from "@/components/providers/wishlist-provider";

export default function WishlistButton() {
  const { state } = useWishlist();

  const itemCount = state.items.length;

  return (
    <Link
      href="/wishlist"
      aria-label={`Wishlist with ${itemCount} ${
        itemCount === 1 ? "item" : "items"
      }`}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Heart
        aria-hidden="true"
        className={`h-5 w-5 transition-colors ${
          itemCount > 0
            ? "fill-current text-destructive"
            : "text-foreground"
        }`}
      />

      {itemCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground"
        >
          {itemCount}
        </span>
      )}
    </Link>
  );
}