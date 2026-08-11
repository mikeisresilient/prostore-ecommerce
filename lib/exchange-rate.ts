import type { Currency } from "@/lib/currency";

const BASE_CURRENCY: Currency = "USD";

type FrankfurterRateResponse = {
  date: string;
  base: string;
  quote: string;
  rate: number;
};

export async function getExchangeRate(
  targetCurrency: Currency
): Promise<number> {
  if (targetCurrency === BASE_CURRENCY) {
    return 1;
  }

  const response = await fetch(
    `https://api.frankfurter.dev/v2/rate/${BASE_CURRENCY}/${targetCurrency}?providers=CBN`,
    {
      next: {
        revalidate: 3600,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${BASE_CURRENCY}/${targetCurrency} exchange rate.`
    );
  }

  const data =
    (await response.json()) as FrankfurterRateResponse;

  if (
    typeof data.rate !== "number" ||
    !Number.isFinite(data.rate) ||
    data.rate <= 0
  ) {
    throw new Error(
      "Invalid exchange rate received."
    );
  }

  return data.rate;
}

export async function convertCurrency(
  amount: number,
  targetCurrency: Currency
): Promise<number> {
  const rate =
    await getExchangeRate(targetCurrency);

  return amount * rate;
}