"use client";

import { ShoppingCart } from "lucide-react";

import { useCart } from "@/components/providers/cart-provider";
import type { Product } from "@/types";

type AddToCartButtonProps = {
  product: Product;
};

export default function AddToCartButton({
  product,
}: AddToCartButtonProps) {
  const { dispatch } = useCart();

  const isOutOfStock = product.stock <= 0;

  function handleAddToCart() {
    if (isOutOfStock) {
      return;
    }

    dispatch({
      type: "ADD_ITEM",
      payload: product,
    });
  }

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-primary sm:w-fit"
      >
        <ShoppingCart className="h-5 w-5" />

        {isOutOfStock
          ? "Out of Stock"
          : "Add to Cart"}
      </button>

      {product.stock > 0 && (
        <p className="mt-3 text-sm text-muted-foreground">
          {product.stock}{" "}
          {product.stock === 1
            ? "item"
            : "items"}{" "}
          available
        </p>
      )}
    </div>
  );
}