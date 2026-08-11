import Link from "next/link";
import { redirect } from "next/navigation";

import Container from "@/components/shared/container";
import CurrencyPrice from "@/components/shared/currency-price";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return (
    <Container>
      <div className="py-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Your Orders
        </h1>

        <p className="mt-3 text-muted-foreground">
          View your order history and payment status.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="text-xl font-semibold">No orders yet</h2>

          <p className="mt-2 text-muted-foreground">
            You haven&apos;t placed any orders yet.
          </p>

          <Link
            href="/products"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4 pb-12">
          {orders.map((order) => {
            const itemCount = order.items.reduce(
              (total, item) => total + item.quantity,
              0,
            );

            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-muted"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Order</p>

                    <p className="mt-1 font-semibold">#{order.id}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
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
                </div>

                <div className="mt-6 grid gap-4 border-t border-border pt-5 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>

                    <p className="mt-1 font-medium">
                      {new Intl.DateTimeFormat("en-NG", {
                        dateStyle: "medium",
                      }).format(order.createdAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Items</p>

                    <p className="mt-1 font-medium">{itemCount}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>

                    <CurrencyPrice
                      amount={Number(order.total)}
                      className="mt-1 font-semibold"
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Container>
  );
}
