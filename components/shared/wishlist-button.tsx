"use client";

import { Heart } from "lucide-react";

import { useWishlist } from "@/components/providers/wishlist-provider";
import type { Product } from "@/types";

type WishlistButtonProps = {
  product: Product;
};

export default function WishlistButton({
  product,
}: WishlistButtonProps) {
  const { state, dispatch } = useWishlist();

  const isWishlisted = state.items.some(
    (item) => item.id === product.id
  );

  function handleToggle(
    event: React.MouseEvent<HTMLButtonElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    dispatch({
      type: "TOGGLE_ITEM",
      payload: product,
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={
        isWishlisted
          ? `Remove ${product.name} from wishlist`
          : `Add ${product.name} to wishlist`
      }
      aria-pressed={isWishlisted}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/90 shadow-sm backdrop-blur transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Heart
        aria-hidden="true"
        className={`h-4 w-4 transition-colors ${
          isWishlisted
            ? "fill-current text-destructive"
            : "text-foreground"
        }`}
      />
    </button>
  );
}