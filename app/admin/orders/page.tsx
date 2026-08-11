import Link from "next/link";
import { redirect } from "next/navigation";

import Container from "@/components/shared/container";
import CurrencyPrice from "@/components/shared/currency-price";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminOrdersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      items: true,
    },
  });

  return (
    <Container>
      <div className="py-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Orders
          </h1>

          <p className="mt-3 text-muted-foreground">
            View and manage customer orders, payments, and order status.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-border bg-card p-8 text-center">
            <h2 className="text-xl font-semibold">No orders yet</h2>

            <p className="mt-2 text-muted-foreground">
              Customer orders will appear here after they are placed.
            </p>
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Order</th>

                    <th className="px-6 py-4 font-semibold">Customer</th>

                    <th className="px-6 py-4 font-semibold">Amount</th>

                    <th className="px-6 py-4 font-semibold">Items</th>

                    <th className="px-6 py-4 font-semibold">Status</th>

                    <th className="px-6 py-4 font-semibold">Date</th>

                    <th className="px-6 py-4 text-right font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {orders.map((order) => {
                    const chargedAmount =
                      order.chargedAmount !== null
                        ? Number(order.chargedAmount)
                        : Number(order.total);

                    const chargedCurrency =
                      order.chargedCurrency || order.currency || "NGN";

                    return (
                      <tr
                        key={order.id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold">#{order.id.slice(-8)}</p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {order.id}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-medium">{order.customerName}</p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {order.customerEmail}
                          </p>
                        </td>

                        <td className="px-6 py-4 font-medium">
                          {chargedCurrency === "NGN" ? (
                            <span>
                              ₦
                              {chargedAmount.toLocaleString("en-NG", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          ) : (
                            <CurrencyPrice amount={chargedAmount} />
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {order.items.reduce(
                            (total, item) => total + item.quantity,
                            0,
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={
                              order.status === "PAID"
                                ? "rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-400"
                                : order.status === "PENDING"
                                  ? "rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400"
                                  : order.status === "PROCESSING"
                                    ? "rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                                    : order.status === "SHIPPED"
                                      ? "rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-400"
                                      : order.status === "DELIVERED"
                                        ? "rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-400"
                                        : order.status === "CANCELLED"
                                          ? "rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-400"
                                          : "rounded-full bg-muted px-3 py-1 text-xs font-semibold"
                            }
                          >
                            {order.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-NG",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
