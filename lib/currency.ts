export type Currency = "USD" | "NGN";

export const currencies: Record<
  Currency,
  {
    label: string;
    symbol: string;
    locale: string;
  }
> = {
  USD: {
    label: "US Dollar",
    symbol: "$",
    locale: "en-US",
  },

  NGN: {
    label: "Nigerian Naira",
    symbol: "₦",
    locale: "en-NG",
  },
};

export const defaultCurrency: Currency = "USD";