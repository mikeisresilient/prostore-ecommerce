import {
  currencies,
  defaultCurrency,
  type Currency,
} from "@/lib/currency";

export function formatCurrency(
  amount: number,
  currency: Currency = defaultCurrency
): string {
  const config = currencies[currency];

  return new Intl.NumberFormat(
    config.locale,
    {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(amount);
}