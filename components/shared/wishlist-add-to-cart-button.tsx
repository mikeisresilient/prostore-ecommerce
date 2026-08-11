"use client";

import { ShoppingCart } from "lucide-react";

import { useCart } from "@/components/providers/cart-provider";
import { useWishlist } from "@/components/providers/wishlist-provider";
import type { Product } from "@/types";

type WishlistAddToCartButtonProps = {
  product: Product;
};

export default function WishlistAddToCartButton({
  product,
}: WishlistAddToCartButtonProps) {
  const { dispatch: cartDispatch } = useCart();
  const { dispatch: wishlistDispatch } = useWishlist();

  function handleMoveToCart() {
    cartDispatch({
      type: "ADD_ITEM",
      payload: product,
    });

    wishlistDispatch({
      type: "REMOVE_ITEM",
      payload: product.id,
    });
  }

  return (
    <button
      type="button"
      onClick={handleMoveToCart}
      className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <ShoppingCart
        aria-hidden="true"
        className="h-4 w-4"
      />

      Move to Cart
    </button>
  );
}