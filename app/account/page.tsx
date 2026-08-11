import Link from "next/link";
import { redirect } from "next/navigation";

import Container from "@/components/shared/container";
import { auth } from "@/auth";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <Container className="py-10 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Account
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome, {session.user.name || "Customer"}
          </h1>

          <p className="mt-3 text-muted-foreground">
            Manage your ProStore account, orders, and
            wishlist.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/account"
            className="rounded-2xl border border-primary bg-primary/5 p-6 transition-colors hover:bg-primary/10"
          >
            <p className="text-sm text-muted-foreground">
              Account
            </p>

            <h2 className="mt-2 text-lg font-semibold">
              Overview
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              View your account information.
            </p>
          </Link>

          <Link
            href="/orders"
            className="rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-muted"
          >
            <p className="text-sm text-muted-foreground">
              Shopping
            </p>

            <h2 className="mt-2 text-lg font-semibold">
              Your Orders
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              View your order history and status.
            </p>
          </Link>

          <Link
            href="/wishlist"
            className="rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-muted"
          >
            <p className="text-sm text-muted-foreground">
              Saved
            </p>

            <h2 className="mt-2 text-lg font-semibold">
              Wishlist
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              View products you have saved.
            </p>
          </Link>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold">
            Account Details
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">
                Name
              </p>

              <p className="mt-2 font-semibold">
                {session.user.name || "Not provided"}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">
                Email
              </p>

              <p className="mt-2 break-all font-semibold">
                {session.user.email}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">
                Account role
              </p>

              <p className="mt-2 font-semibold capitalize">
                {session.user.role.toLowerCase()}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">
                Account status
              </p>

              <p className="mt-2 font-semibold text-green-600 dark:text-green-400">
                Active
              </p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}