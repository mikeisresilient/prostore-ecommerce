"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, type FormEvent, useState } from "react";

function SearchBarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(currentQuery);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      router.push("/products");
      return;
    }

    router.push(
      `/products?q=${encodeURIComponent(trimmedQuery)}`
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md"
    >
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />

        <input
          type="search"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Search products..."
          aria-label="Search products"
          className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </div>
    </form>
  );
}

function SearchBarFallback() {
  return (
    <div className="w-full max-w-md">
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />

        <input
          type="search"
          placeholder="Search products..."
          aria-label="Search products"
          className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm outline-none"
        />
      </div>
    </div>
  );
}

export default function SearchBar() {
  return (
    <Suspense fallback={<SearchBarFallback />}>
      <SearchBarContent />
    </Suspense>
  );
}