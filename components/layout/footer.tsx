import Link from "next/link";

import Container from "@/components/shared/container";

const shoppingLinks = [
  {
    label: "All Products",
    href: "/products",
  },
  {
    label: "Electronics",
    href: "/products?category=electronics",
  },
  {
    label: "Fashion",
    href: "/products?category=fashion",
  },
];

const accountLinks = [
  {
    label: "Cart",
    href: "/cart",
  },
  {
    label: "Sign In",
    href: "/login",
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center text-lg font-bold tracking-tight"
            >
              ProStore
            </Link>

            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              A modern ecommerce experience designed to make
              discovering and shopping for products simple.
            </p>
          </div>

          {/* Shopping */}
          <div>
            <h2 className="text-sm font-semibold">
              Shopping
            </h2>

            <ul className="mt-4 space-y-3">
              {shoppingLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h2 className="text-sm font-semibold">
              Account
            </h2>

            <ul className="mt-4 space-y-3">
              {accountLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} ProStore. All rights
            reserved.
          </p>

          <div className="flex items-center gap-4">
            <Link
              href="/products"
              className="transition-colors hover:text-foreground"
            >
              Products
            </Link>

            <Link
              href="/cart"
              className="transition-colors hover:text-foreground"
            >
              Cart
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}