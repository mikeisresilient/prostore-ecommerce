import Image from "next/image";
import { Star } from "lucide-react";

import type { Product } from "@/types";
import AddToCartButton from "@/components/shared/add-to-cart-button";
import CurrencyPrice from "@/components/shared/currency-price";

type ProductDetailsProps = {
  product: Product;
};

export default function ProductDetails({
  product,
}: ProductDetailsProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
        <Image
          src={product.image}
          alt={product.name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {/* Product Information */}
      <div className="flex flex-col justify-center">
        <p className="text-sm font-medium text-muted-foreground">
          {product.category}
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {product.name}
        </h1>

        {/* Rating */}
        <div className="mt-4 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 fill-current text-yellow-500" />

            <span className="font-medium">
              {product.rating}
            </span>
          </div>

          <span className="text-sm text-muted-foreground">
            ({product.reviews} reviews)
          </span>
        </div>

        {/* Price */}
        <p className="mt-6 text-3xl font-bold">
          <CurrencyPrice amount={product.price} />
        </p>

        {/* Description */}
        <p className="mt-6 max-w-xl leading-7 text-muted-foreground">
          Experience quality and thoughtful design with the{" "}
          {product.name}. Carefully selected for customers who value
          performance, style, and reliability.
        </p>

        {/* Add to Cart */}
      <AddToCartButton product={product} />
      </div>
    </div>
  );
}