"use client";

import {
  currencies,
  type Currency,
} from "@/lib/currency";

import { useCurrency } from "@/components/providers/currency-provider";

export default function CurrencySelector() {
  const {
    currency,
    setCurrency,
  } = useCurrency();

  function handleChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    setCurrency(
      event.target.value as Currency
    );
  }

  return (
    <select
      value={currency}
      onChange={handleChange}
      aria-label="Select currency"
      className="h-9 rounded-lg border border-border bg-background px-2 text-sm font-medium outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
    >
      {Object.entries(currencies).map(
        ([code, config]) => (
          <option
            key={code}
            value={code}
          >
            {config.symbol} {code}
          </option>
        )
      )}
    </select>
  );
}