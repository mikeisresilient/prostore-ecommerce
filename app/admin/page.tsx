import Link from "next/link";
import { redirect } from "next/navigation";

import Container from "@/components/shared/container";
import CurrencyPrice from "@/components/shared/currency-price";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const [
    productCount,
    orderCount,
    customerCount,
    paidOrders,
    pendingOrders,
  ] = await Promise.all([
    prisma.product.count(),

    prisma.order.count(),

    prisma.user.count({
      where: {
        role: "CUSTOMER",
      },
    }),

    prisma.order.count({
      where: {
        status: "PAID",
      },
    }),

    prisma.order.count({
      where: {
        status: "PENDING",
      },
    }),
  ]);

  const salesResult =
    await prisma.order.aggregate({
      where: {
        status: {
          in: [
            "PAID",
            "PROCESSING",
            "SHIPPED",
            "DELIVERED",
          ],
        },
      },
      _sum: {
        total: true,
      },
    });

  const totalSales = Number(
    salesResult._sum.total ?? 0
  );

  return (
    <Container>
      <div className="py-10">
        <p className="text-sm font-medium text-muted-foreground">
          Administration
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Admin Dashboard
        </h1>

        <p className="mt-3 text-muted-foreground">
          Manage your ProStore store, products,
          orders, and customers.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Products
          </p>

          <p className="mt-2 text-3xl font-bold">
            {productCount}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Orders
          </p>

          <p className="mt-2 text-3xl font-bold">
            {orderCount}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Customers
          </p>

          <p className="mt-2 text-3xl font-bold">
            {customerCount}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Sales
          </p>

          <div className="mt-2 text-3xl font-bold">
            <CurrencyPrice
              amount={totalSales}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/products"
          className="rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-muted"
        >
          <h2 className="text-lg font-semibold">
            Manage Products
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Add products, update prices, manage
            inventory, and remove products.
          </p>
        </Link>

        <Link
          href="/admin/orders"
          className="rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-muted"
        >
          <h2 className="text-lg font-semibold">
            Manage Orders
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            View customer orders and update their
            status.
          </p>
        </Link>

        <Link
          href="/admin/categories"
          className="rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-muted"
        >
          <h2 className="text-lg font-semibold">
            Manage Categories
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Create, edit, and manage product
            categories.
          </p>
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">
            Order Status
          </h2>

          <div className="mt-4 flex gap-6">
            <div>
              <p className="text-sm text-muted-foreground">
                Paid
              </p>

              <p className="mt-1 text-2xl font-bold">
                {paidOrders}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Pending
              </p>

              <p className="mt-1 text-2xl font-bold">
                {pendingOrders}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}