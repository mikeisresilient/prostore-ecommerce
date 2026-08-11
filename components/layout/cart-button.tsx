"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { useCart } from "@/components/providers/cart-provider";

export default function CartButton() {
  const { state } = useCart();

  const itemCount = state.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <Link
      href="/cart"
      aria-label={`Shopping cart with ${itemCount} ${
        itemCount === 1 ? "item" : "items"
      }`}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <ShoppingCart className="h-5 w-5" />

      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}