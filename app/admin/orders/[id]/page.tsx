import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import Container from "@/components/shared/container";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import OrderStatusControl from "@/components/admin/order-status-control";

type OrderDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminOrderDetailsPage({
  params,
}: OrderDetailsPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: {
      id,
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

  const subtotal = Number(order.subtotal);
  const shippingCost = Number(order.shippingCost);
  const total = Number(order.total);

  const chargedAmount =
    order.chargedAmount !== null ? Number(order.chargedAmount) : null;

  return (
    <Container>
      <div className="py-10">
        <Link
          href="/admin/orders"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← Back to Orders
        </Link>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Order #{order.id.slice(-8)}
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Placed{" "}
              {new Date(order.createdAt).toLocaleString("en-NG", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>

          <span
            className={
              order.status === "PAID"
                ? "inline-flex w-fit rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-400"
                : order.status === "PENDING"
                  ? "inline-flex w-fit rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400"
                  : order.status === "CANCELLED"
                    ? "inline-flex w-fit rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-400"
                    : "inline-flex w-fit rounded-full bg-muted px-4 py-2 text-sm font-semibold"
            }
          >
            {order.status}
          </span>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Customer Information</h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>

                  <p className="mt-1 font-medium">{order.customerName}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Email</p>

                  <p className="mt-1 break-all font-medium">
                    {order.customerEmail}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>

                  <p className="mt-1 font-medium">{order.phone}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Delivery Address</h2>

              <div className="mt-5 text-sm leading-6">
                <p>{order.address}</p>
                <p>
                  {order.city}, {order.state}
                </p>
                <p>{order.country}</p>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Items</h2>

              <div className="mt-5 divide-y divide-border">
                {order.items.map((item) => {
                  const itemPrice = Number(item.price);

                  const itemTotal = itemPrice * item.quantity;

                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 py-5 first:pt-0 last:pb-0"
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{item.product.name}</p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          Unit price: ${itemPrice.toFixed(2)}
                        </p>
                      </div>

                      <p className="font-semibold">${itemTotal.toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Payment Information</h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Charged Currency
                  </p>

                  <p className="mt-1 font-semibold">{order.chargedCurrency}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Charged Amount
                  </p>

                  <p className="mt-1 font-semibold">
                    {chargedAmount !== null
                      ? order.chargedCurrency === "NGN"
                        ? `₦${chargedAmount.toLocaleString("en-NG", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        : `$${chargedAmount.toFixed(2)}`
                      : "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Exchange Rate</p>

                  <p className="mt-1 font-semibold">
                    {order.exchangeRate
                      ? `1 USD = ₦${Number(order.exchangeRate).toLocaleString(
                          "en-NG",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}`
                      : "Not available"}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">
                    Payment Reference
                  </p>

                  <p className="mt-1 break-all font-mono text-sm">
                    {order.paymentReference || "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Paid At</p>

                  <p className="mt-1 font-medium">
                    {order.paidAt
                      ? new Date(order.paidAt).toLocaleString("en-NG", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "Not paid"}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-card p-6">
            <OrderStatusControl
              orderId={order.id}
              initialStatus={order.status}
            />
            <h2 className="text-lg font-semibold">Order Summary</h2>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>

                <span className="font-medium">${subtotal.toFixed(2)} USD</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Shipping</span>

                <span className="font-medium">
                  ${shippingCost.toFixed(2)} USD
                </span>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Store Total</span>

                  <span className="text-xl font-bold">
                    ${total.toFixed(2)} USD
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  Customer Charged
                </p>

                <p className="mt-1 text-xl font-bold">
                  {chargedAmount !== null
                    ? order.chargedCurrency === "NGN"
                      ? `₦${chargedAmount.toLocaleString("en-NG", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : `$${chargedAmount.toFixed(2)}`
                    : "Not available"}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {order.chargedCurrency}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Exchange Rate
                </span>

                <span className="text-sm font-medium">
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

            <div className="mt-6 rounded-lg bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">Order ID</p>

              <p className="mt-1 break-all font-mono text-xs">{order.id}</p>
            </div>
          </aside>
        </div>
      </div>
    </Container>
  );
}
