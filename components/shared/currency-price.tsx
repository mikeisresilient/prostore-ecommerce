"use client";

import { formatCurrency } from "@/lib/format-currency";
import { useCurrency } from "@/components/providers/currency-provider";

type CurrencyPriceProps = {
  amount: number;
  className?: string;
};

export default function CurrencyPrice({
  amount,
  className,
}: CurrencyPriceProps) {
  const {
    currency,
    exchangeRate,
    isLoadingRate,
  } = useCurrency();

  if (currency === "USD") {
    return (
      <span className={className}>
        {formatCurrency(amount, "USD")}
      </span>
    );
  }

  if (
    isLoadingRate ||
    exchangeRate === null
  ) {
    return (
      <span className={className}>
        ...
      </span>
    );
  }

  return (
    <span className={className}>
      {formatCurrency(
        amount * exchangeRate,
        currency
      )}
    </span>
  );
}