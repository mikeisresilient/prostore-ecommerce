import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

import type { Product } from "@/types";
import WishlistButton from "@/components/shared/wishlist-button";
import CurrencyPrice from "@/components/shared/currency-price";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden rounded-xl">
        <Link
          href={`/products/${product.slug}`}
          className="block h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
            className="object-cover"
          />
        </Link>

        {/* Wishlist */}
        <div className="absolute right-3 top-3 z-10">
          <WishlistButton product={product} />
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4">
        <p className="text-xs font-medium text-muted-foreground">
          {product.category}
        </p>

        <Link
          href={`/products/${product.slug}`}
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-1">
          <Star className="h-4 w-4 shrink-0 fill-current text-yellow-500" />

          <span className="text-sm font-medium">{product.rating}</span>

          <span className="text-xs text-muted-foreground">
            ({product.reviews})
          </span>
        </div>

        <p className="mt-3 text-lg font-bold">
          <CurrencyPrice amount={product.price} />
        </p>
      </div>
    </article>
  );
}
