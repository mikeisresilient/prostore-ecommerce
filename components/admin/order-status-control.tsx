"use client";

import { useState } from "react";

type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

type OrderStatusControlProps = {
  orderId: string;
  initialStatus: OrderStatus;
};

const allowedTransitions: Record<
  OrderStatus,
  OrderStatus[]
> = {
  PENDING: ["CANCELLED"],
  PAID: ["PROCESSING"],
  PROCESSING: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export default function OrderStatusControl({
  orderId,
  initialStatus,
}: OrderStatusControlProps) {
  const [status, setStatus] =
    useState(initialStatus);

  const [isUpdating, setIsUpdating] =
    useState(false);

  const [error, setError] =
    useState("");

  const availableStatuses = [
    status,
    ...allowedTransitions[status],
  ];

  async function handleChange(
    nextStatus: OrderStatus
  ) {
    if (nextStatus === status) {
      return;
    }

    setError("");
    setIsUpdating(true);

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update order status."
        );
      }

      setStatus(data.order.status);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update order status."
      );
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="mb-6 border-b border-border pb-6">
      <h2 className="text-lg font-semibold">
        Order Status
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        Update the current status of this order.
      </p>

      <select
        value={status}
        onChange={(event) =>
          handleChange(
            event.target.value as OrderStatus
          )
        }
        disabled={
          isUpdating ||
          availableStatuses.length === 1
        }
        className="mt-5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {availableStatuses.map(
          (orderStatus) => (
            <option
              key={orderStatus}
              value={orderStatus}
            >
              {orderStatus}
            </option>
          )
        )}
      </select>

      {availableStatuses.length === 1 && (
        <p className="mt-3 text-sm text-muted-foreground">
          This order has reached its final status.
        </p>
      )}

      {isUpdating && (
        <p className="mt-3 text-sm text-muted-foreground">
          Updating status...
        </p>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}