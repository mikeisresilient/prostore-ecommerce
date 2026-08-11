import { NextResponse } from "next/server";

import type { Currency } from "@/lib/currency";
import { getExchangeRate } from "@/lib/exchange-rate";

export async function GET(request: Request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const currency =
      searchParams.get("currency");

    if (
      currency !== "USD" &&
      currency !== "NGN"
    ) {
      return NextResponse.json(
        {
          error: "Unsupported currency.",
        },
        { status: 400 }
      );
    }

    const rate = await getExchangeRate(
      currency as Currency
    );

    return NextResponse.json({
      baseCurrency: "USD",
      currency,
      rate,
    });
  } catch (error) {
    console.error(
      "Exchange rate error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to retrieve exchange rate.",
      },
      { status: 500 }
    );
  }
}