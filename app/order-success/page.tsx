import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import Container from "@/components/shared/container";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type OrderSuccessPageProps = {
  searchParams: Promise<{
    orderId?: string;
  }>;
};

export default async function OrderSuccessPage({
  searchParams,
}: OrderSuccessPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { orderId } = await searchParams;

  if (!orderId) {
    notFound();
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: session.user.id,
    },
  });

  if (!order) {
    notFound();
  }

  const isPaid =
    order.status === "PAID" ||
    order.status === "PROCESSING" ||
    order.status === "SHIPPED" ||
    order.status === "DELIVERED";

  const chargedAmount =
    order.chargedAmount !== null
      ? Number(order.chargedAmount)
      : null;

  return (
    <Container className="py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        {isPaid ? (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <span className="text-3xl font-bold">
                ✓
              </span>
            </div>

            <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
              Payment Successful
            </h1>

            <p className="mt-3 text-muted-foreground">
              Thank you for your order. Your payment
              has been successfully verified and your
              order has been placed.
            </p>

            <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-left">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">
                  Order ID
                </span>

                <span className="break-all text-right text-sm font-semibold">
                  #{order.id}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">
                  Status
                </span>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {order.status}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">
                  Amount Paid
                </span>

                <span className="text-right font-bold">
                  {chargedAmount !== null
                    ? order.chargedCurrency ===
                      "NGN"
                      ? `₦${chargedAmount.toLocaleString(
                          "en-NG",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}`
                      : `$${chargedAmount.toFixed(
                          2
                        )}`
                    : "Not available"}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">
                  Currency
                </span>

                <span className="font-medium">
                  {order.chargedCurrency}
                </span>
              </div>

              {order.paymentReference && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground">
                    Payment Reference
                  </p>

                  <p className="mt-1 break-all font-mono text-xs">
                    {order.paymentReference}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href={`/orders/${order.id}`}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                View Order
              </Link>

              <Link
                href="/products"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-6 text-sm font-semibold transition-colors hover:bg-muted"
              >
                Continue Shopping
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
              <span className="text-2xl font-bold">
                !
              </span>
            </div>

            <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
              Payment Pending
            </h1>

            <p className="mt-3 text-muted-foreground">
              Your order has been created, but the
              payment has not been confirmed yet.
            </p>

            <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-left">
              <p className="text-sm text-muted-foreground">
                Order ID
              </p>

              <p className="mt-1 break-all font-semibold">
                #{order.id}
              </p>

              <p className="mt-5 text-sm text-muted-foreground">
                Current Status
              </p>

              <p className="mt-1 font-semibold">
                {order.status}
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href={`/orders/${order.id}`}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                View Order
              </Link>

              <Link
                href="/products"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-6 text-sm font-semibold transition-colors hover:bg-muted"
              >
                Continue Shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </Container>
  );
}