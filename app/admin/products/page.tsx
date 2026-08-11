import Link from "next/link";
import { redirect } from "next/navigation";

import Container from "@/components/shared/container";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CurrencyPrice from "@/components/shared/currency-price";
import Image from "next/image";

export default async function AdminProductsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      category: true,
    },
  });

  return (
    <Container>
      <div className="py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Products
            </h1>

            <p className="mt-3 text-muted-foreground">
              Manage your store products and inventory.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Add Product
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="text-xl font-semibold">No products yet</h2>

          <p className="mt-2 text-muted-foreground">
            Add your first product to start building your catalog.
          </p>

          <Link
            href="/admin/products/new"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Add Product
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Product</th>

                  <th className="px-6 py-4 font-semibold">Category</th>

                  <th className="px-6 py-4 font-semibold">Price</th>

                  <th className="px-6 py-4 font-semibold">Stock</th>

                  <th className="px-6 py-4 font-semibold">Featured</th>

                  <th className="px-6 py-4 font-semibold">Status</th>

                  <th className="px-6 py-4 text-right font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {product.name}
                          </p>

                          <p className="truncate text-xs text-muted-foreground">
                            {product.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">{product.category.name}</td>

                    <td className="px-6 py-4 font-medium">
                      <CurrencyPrice amount={Number(product.price)} />
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={
                          product.stock === 0
                            ? "font-semibold text-red-600 dark:text-red-400"
                            : product.stock <= 5
                              ? "font-semibold text-yellow-600 dark:text-yellow-400"
                              : "font-medium"
                        }
                      >
                        {product.stock}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {product.isActive ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-400">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Container>
  );
}
