"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  useState,
  type ReactNode,
} from "react";

import {
  defaultCurrency,
  type Currency,
} from "@/lib/currency";

type CurrencyContextValue = {
  currency: Currency;
  exchangeRate: number | null;
  isLoadingRate: boolean;
  setCurrency: (currency: Currency) => void;
};

const CurrencyContext =
  createContext<
    CurrencyContextValue | undefined
  >(undefined);

const CURRENCY_STORAGE_KEY =
  "prostore-currency";

type CurrencyProviderProps = {
  children: ReactNode;
};

function getStoredCurrency(): Currency {
  const storedCurrency =
    window.localStorage.getItem(
      CURRENCY_STORAGE_KEY
    );

  if (
    storedCurrency === "USD" ||
    storedCurrency === "NGN"
  ) {
    return storedCurrency;
  }

  return defaultCurrency;
}

function subscribeToCurrency(
  callback: () => void
) {
  function handleStorage(event: StorageEvent) {
    if (
      event.key === CURRENCY_STORAGE_KEY
    ) {
      callback();
    }
  }

  window.addEventListener(
    "storage",
    handleStorage
  );

  return () => {
    window.removeEventListener(
      "storage",
      handleStorage
    );
  };
}

function getServerCurrency(): Currency {
  return defaultCurrency;
}

export function CurrencyProvider({
  children,
}: CurrencyProviderProps) {
  const currency =
    useSyncExternalStore(
      subscribeToCurrency,
      getStoredCurrency,
      getServerCurrency
    );

  const [
    exchangeRateData,
    setExchangeRateData,
  ] = useState<{
    currency: Currency;
    rate: number;
  }>({
    currency: "USD",
    rate: 1,
  });

  useEffect(() => {
    if (currency === "USD") {
      return;
    }

    let cancelled = false;

    async function loadExchangeRate() {
      try {
        const response = await fetch(
          `/api/exchange-rate?currency=${currency}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch exchange rate."
          );
        }

        const data =
          await response.json();

        if (
          typeof data.rate !== "number" ||
          !Number.isFinite(data.rate) ||
          data.rate <= 0
        ) {
          throw new Error(
            "Invalid exchange rate."
          );
        }

        if (!cancelled) {
          setExchangeRateData({
            currency,
            rate: data.rate,
          });
        }
      } catch (error) {
        console.error(
          "Currency conversion error:",
          error
        );
      }
    }

    loadExchangeRate();

    return () => {
      cancelled = true;
    };
  }, [currency]);

  function setCurrency(
    nextCurrency: Currency
  ) {
    window.localStorage.setItem(
      CURRENCY_STORAGE_KEY,
      nextCurrency
    );

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: CURRENCY_STORAGE_KEY,
        newValue: nextCurrency,
      })
    );
  }

  const isLoadingRate =
    currency !== "USD" &&
    exchangeRateData.currency !== currency;

  const currentExchangeRate =
    currency === "USD"
      ? 1
      : exchangeRateData.currency ===
        currency
        ? exchangeRateData.rate
        : null;

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        exchangeRate:
          currentExchangeRate,
        isLoadingRate,
        setCurrency,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context =
    useContext(CurrencyContext);

  if (!context) {
    throw new Error(
      "useCurrency must be used within CurrencyProvider"
    );
  }

  return context;
}