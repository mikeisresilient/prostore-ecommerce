"use client";

import Link from "next/link";

import Container from "@/components/shared/container";
import { useCart } from "@/components/providers/cart-provider";
import CartItem from "@/components/shared/cart-item";
import CurrencyPrice from "@/components/shared/currency-price";

export default function CartPage() {
  const { state } = useCart();

  const subtotal = state.items.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0,
  );

  if (state.items.length === 0) {
    return (
      <Container>
        <div className="py-16 text-center">
          <h1 className="text-3xl font-bold">
            Your Cart Is Empty
          </h1>

          <p className="mt-4 text-muted-foreground">
            You haven&apos;t added any products to
            your cart yet.
          </p>

          <Link
            href="/products"
            className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Continue Shopping
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-10">
        <h1 className="text-3xl font-bold">
          Shopping Cart
        </h1>

        <p className="mt-3 text-muted-foreground">
          Review your items before checkout.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Cart Items */}
        <div className="rounded-xl border border-border">
          {state.items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
            />
          ))}
        </div>

        {/* Order Summary */}
        <div className="h-fit rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold">
            Order Summary
          </h2>

          <div className="mt-6 flex items-center justify-between">
            <span className="text-muted-foreground">
              Subtotal
            </span>

            <CurrencyPrice
              amount={subtotal}
              className="font-semibold"
            />
          </div>

          <Link
            href="/checkout"
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Checkout
          </Link>
        </div>
      </div>
    </Container>
  );
}