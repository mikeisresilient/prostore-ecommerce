"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CancelOrderButtonProps = {
  orderId: string;
};

export default function CancelOrderButton({
  orderId,
}: CancelOrderButtonProps) {
  const router = useRouter();

  const [isCancelling, setIsCancelling] =
    useState(false);

  const [error, setError] = useState("");

  async function handleCancel() {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) {
      return;
    }

    setIsCancelling(true);
    setError("");

    try {
      const response = await fetch(
        `/api/orders/${orderId}/cancel`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to cancel order."
        );
      }

      router.refresh();
    } catch (error) {
      console.error(
        "Order cancellation error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to cancel order."
      );

      setIsCancelling(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={handleCancel}
        disabled={isCancelling}
        className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-destructive px-5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isCancelling
          ? "Cancelling..."
          : "Cancel Order"}
      </button>

      {error && (
        <p className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}