"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function UserButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div
        className="h-9 w-20 animate-pulse rounded-lg bg-muted"
        aria-hidden="true"
      />
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-1">
        <Link
          href="/login"
          className="
            rounded-lg
            px-3
            py-2
            text-sm
            font-medium
            transition-colors
            hover:bg-muted
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-ring
          "
        >
          Sign In
        </Link>

        <Link
          href="/register"
          className="
            hidden
            rounded-lg
            bg-primary
            px-3
            py-2
            text-sm
            font-medium
            text-primary-foreground
            transition-colors
            hover:bg-primary/90
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-ring
            sm:inline-flex
          "
        >
          Create Account
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        href="/account"
        className="
          max-w-32
          truncate
          rounded-lg
          px-3
          py-2
          text-sm
          font-medium
          transition-colors
          hover:bg-muted
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-ring
        "
      >
        {session.user.name || session.user.email}
      </Link>

      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="
          rounded-lg
          px-3
          py-2
          text-sm
          font-medium
          text-muted-foreground
          transition-colors
          hover:bg-muted
          hover:text-foreground
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-ring
        "
      >
        Sign Out
      </button>
    </div>
  );
}