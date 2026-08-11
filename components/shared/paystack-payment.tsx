"use client";

import { useState } from "react";

type PaystackPaymentProps = {
  accessCode: string;
  onSuccess: (reference: string) => void;
  onError: (message: string) => void;
};

export default function PaystackPayment({
  accessCode,
  onSuccess,
  onError,
}: PaystackPaymentProps) {
  const [isPaying, setIsPaying] = useState(false);

  async function handlePayment() {
    if (isPaying) {
      return;
    }

    setIsPaying(true);

    try {
      const { default: PaystackPop } =
        await import("@paystack/inline-js");

      const popup = new PaystackPop();

      popup.resumeTransaction(accessCode, {
        onSuccess: (transaction) => {
          onSuccess(transaction.reference);
        },

        onCancel: () => {
          setIsPaying(false);

          onError("Payment was cancelled.");
        },

        onError: (error) => {
          setIsPaying(false);

          onError(
            error.message ||
              "Paystack could not load the payment."
          );
        },
      });
    } catch (error) {
      console.error(
        "Paystack payment error:",
        error
      );

      setIsPaying(false);

      onError(
        error instanceof Error
          ? error.message
          : "Unable to open Paystack payment."
      );
    }
  }

  return (
    <button
      type="button"
      onClick={handlePayment}
      disabled={isPaying}
      className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPaying
        ? "Opening Payment..."
        : "Pay with Paystack"}
    </button>
  );
}