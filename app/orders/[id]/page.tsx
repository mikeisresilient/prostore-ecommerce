import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import Container from "@/components/shared/container";
import CurrencyPrice from "@/components/shared/currency-price";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CancelOrderButton from "@/components/orders/cancel-order-button";

type OrderDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderDetailsPage({
  params,
}: OrderDetailsPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <Container className="py-10 sm:py-16">
      <Link
        href="/orders"
        className="text-sm font-medium text-primary hover:underline"
      >
        ← Back to Orders
      </Link>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Order</p>

          <h1 className="mt-1 break-all text-2xl font-bold tracking-tight sm:text-3xl">
            #{order.id}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {new Intl.DateTimeFormat("en-NG", {
              dateStyle: "long",
              timeStyle: "short",
            }).format(order.createdAt)}
          </p>
        </div>

        <span
          className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${
            order.status === "PAID"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : order.status === "PENDING"
                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                : order.status === "PROCESSING"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : order.status === "SHIPPED"
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                    : order.status === "DELIVERED"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : order.status === "CANCELLED"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-muted text-muted-foreground"
          }`}
        >
          {order.status}
        </span>
      </div>

      <div className="mt-8 grid gap-8 pb-12 lg:grid-cols-[1fr_360px]">
        {/* Order Items */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border p-6">
            <h2 className="text-lg font-semibold">Items</h2>
          </div>

          <div className="divide-y divide-border">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 p-6">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">{item.product.name}</h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Quantity: {item.quantity}
                  </p>

                  <CurrencyPrice
                    amount={Number(item.price)}
                    className="mt-2 text-sm font-medium"
                  />
                </div>

                <CurrencyPrice
                  amount={Number(item.price) * item.quantity}
                  className="shrink-0 font-semibold"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="h-fit rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Order Summary</h2>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>

                <span className="font-medium">
                  ${Number(order.subtotal).toFixed(2)} USD
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Shipping</span>

                <span className="font-medium">
                  ${Number(order.shippingCost).toFixed(2)} USD
                </span>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Store Total</span>

                  <span className="text-lg font-bold">
                    ${Number(order.total).toFixed(2)} USD
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Amount Charged</p>

                <p className="mt-1 text-xl font-bold">
                  {order.chargedAmount !== null
                    ? order.chargedCurrency === "NGN"
                      ? `₦${Number(order.chargedAmount).toLocaleString(
                          "en-NG",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}`
                      : `$${Number(order.chargedAmount).toFixed(2)}`
                    : "Not available"}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {order.chargedCurrency}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">
                  Exchange Rate
                </span>

                <span className="text-right text-sm font-medium">
                  {order.exchangeRate
                    ? `1 USD = ₦${Number(order.exchangeRate).toLocaleString(
                        "en-NG",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      )}`
                    : "Not available"}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Delivery Information</h2>

            <div className="mt-5 space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Name</p>

                <p className="mt-1 font-medium">{order.customerName}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Email</p>

                <p className="mt-1 break-all font-medium">
                  {order.customerEmail}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground">Phone</p>

                <p className="mt-1 font-medium">{order.phone}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Address</p>

                <p className="mt-1 font-medium">{order.address}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Location</p>

                <p className="mt-1 font-medium">
                  {order.city}, {order.state}, {order.country}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Payment Information</h2>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Payment Status</span>

                <span
                  className={
                    order.status === "PAID" ||
                    order.status === "PROCESSING" ||
                    order.status === "SHIPPED" ||
                    order.status === "DELIVERED"
                      ? "font-semibold text-green-600 dark:text-green-400"
                      : order.status === "CANCELLED"
                        ? "font-semibold text-red-600 dark:text-red-400"
                        : "font-semibold text-yellow-600 dark:text-yellow-400"
                  }
                >
                  {order.status === "PENDING"
                    ? "Pending"
                    : order.status === "CANCELLED"
                      ? "Cancelled"
                      : "Paid"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Currency</span>

                <span className="font-medium">{order.currency}</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Charged Currency</span>

                <span className="font-medium">{order.chargedCurrency}</span>
              </div>

              {order.paymentReference && (
                <div>
                  <p className="text-muted-foreground">Payment Reference</p>

                  <p className="mt-1 break-all font-medium">
                    {order.paymentReference}
                  </p>
                </div>
              )}

              {order.paidAt && (
                <div>
                  <p className="text-muted-foreground">Paid At</p>

                  <p className="mt-1 font-medium">
                    {new Intl.DateTimeFormat("en-NG", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(order.paidAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
          {(order.status === "PENDING" || order.status === "PAID") && (
            <CancelOrderButton orderId={order.id} />
          )}
        </div>
      </div>
    </Container>
  );
}
