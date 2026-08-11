"use client";

import Link from "next/link";
import { LogIn, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export default function UserButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div
        className="h-9 w-9 animate-pulse rounded-lg bg-muted sm:w-20"
        aria-hidden="true"
      />
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-1">
        {/* Mobile */}
        <Link
          href="/login"
          aria-label="Sign in"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:hidden"
        >
          <LogIn className="h-5 w-5" />
        </Link>

        {/* Desktop */}
        <Link
          href="/login"
          className="hidden rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
        >
          Sign In
        </Link>

        <Link
          href="/register"
          className="hidden rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
        >
          Create Account
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {/* Account */}
      <Link
        href="/account"
        aria-label="My account"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:hidden"
      >
        <User className="h-5 w-5" />
      </Link>

      {/* Desktop account */}
      <Link
        href="/account"
        className="hidden max-w-32 truncate rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
      >
        {session.user.name || session.user.email}
      </Link>

      {/* Desktop sign out */}
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
      >
        Sign Out
      </button>
    </div>
  );
}