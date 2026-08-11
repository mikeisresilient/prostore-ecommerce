"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { navigationLinks } from "@/lib/navigation";
import CurrencySelector from "./currency-selector";

export default function MobileNav() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  function handleNavigation() {
    setOpen(false);
  }

  async function handleSignOut() {
    setOpen(false);
    await signOut({ callbackUrl: "/" });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[min(20rem,calc(100vw-1rem))] p-6"
      >
        <SheetTitle className="mb-6 pr-8">
          ProStore
        </SheetTitle>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={handleNavigation}
              className="block rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="my-5 border-t border-border" />

        {/* Currency */}
        <div className="flex items-center justify-between gap-4 px-3 py-2">
          <span className="text-sm font-medium">
            Currency
          </span>

          <CurrencySelector />
        </div>

        <div className="my-5 border-t border-border" />

        {/* Account */}
        {session?.user ? (
          <div className="flex flex-col gap-2">
            <p className="px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Account
            </p>

            <Link
              href="/account"
              onClick={handleNavigation}
              className="block rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              My Account
            </Link>

            <Link
              href="/orders"
              onClick={handleNavigation}
              className="block rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              My Orders
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full rounded-lg px-3 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Account
            </p>

            <Link
              href="/login"
              onClick={handleNavigation}
              className="block rounded-lg px-3 py-3 text-sm font-semibold transition-colors hover:bg-muted"
            >
              Sign In
            </Link>

            <Link
              href="/register"
              onClick={handleNavigation}
              className="block rounded-lg bg-primary px-3 py-3 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Create Account
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}