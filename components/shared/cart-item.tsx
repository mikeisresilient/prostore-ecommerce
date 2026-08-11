"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { useCart } from "@/components/providers/cart-provider";
import type { CartItem as CartItemType } from "@/types";
import CurrencyPrice from "@/components/shared/currency-price";

type CartItemProps = {
  item: CartItemType;
};

export default function CartItem({ item }: CartItemProps) {
  const { dispatch } = useCart();

  function increaseQuantity() {
    dispatch({
      type: "INCREASE_QUANTITY",
      payload: item.id,
    });
  }

  function decreaseQuantity() {
    dispatch({
      type: "DECREASE_QUANTITY",
      payload: item.id,
    });
  }

  function removeItem() {
    dispatch({
      type: "REMOVE_ITEM",
      payload: item.id,
    });
  }

  const maximumQuantityReached = item.quantity >= item.stock;

  return (
    <div className="flex gap-4 p-6">
      <Link
        href={`/products/${item.slug}`}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-28 sm:w-28"
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 96px, 112px"
          className="object-cover"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={`/products/${item.slug}`}
          className="font-semibold transition-colors hover:text-primary"
        >
          {item.name}
        </Link>

        <p className="mt-1 text-sm text-muted-foreground">{item.category}</p>

        <p className="mt-2 font-semibold">
          <CurrencyPrice amount={item.price * item.quantity} />
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-lg border border-border">
            <button
              type="button"
              onClick={decreaseQuantity}
              aria-label={`Decrease quantity of ${item.name}`}
              className="inline-flex h-9 w-9 items-center justify-center transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Minus className="h-4 w-4" />
            </button>

            <input
              type="number"
              min={1}
              max={item.stock}
              value={item.quantity}
              onChange={(event) => {
                const value = Number(event.target.value);

                if (!Number.isInteger(value)) {
                  return;
                }

                dispatch({
                  type: "SET_QUANTITY",
                  payload: {
                    id: item.id,
                    quantity: value,
                  },
                });
              }}
              aria-label={`Quantity of ${item.name}`}
              className="h-9 w-14 border-x border-border bg-transparent px-1 text-center text-sm font-medium outline-none focus:ring-2 focus:ring-ring/30"
            />

            <button
              type="button"
              onClick={increaseQuantity}
              disabled={maximumQuantityReached}
              aria-label={
                maximumQuantityReached
                  ? `Maximum available quantity reached for ${item.name}`
                  : `Increase quantity of ${item.name}`
              }
              className="inline-flex h-9 w-9 items-center justify-center transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={removeItem}
            className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-destructive transition-colors hover:bg-destructive/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </button>
        </div>

        {item.stock > 0 && maximumQuantityReached && (
          <p className="mt-2 text-xs text-muted-foreground">
            Maximum available quantity reached
          </p>
        )}

        {item.stock === 0 && (
          <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
            This product is currently out of stock.
          </p>
        )}
      </div>
    </div>
  );
}
