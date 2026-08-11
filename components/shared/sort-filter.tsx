"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const sortOptions = [
  {
    label: "Featured",
    value: "featured",
  },
  {
    label: "Price: Low to High",
    value: "price-asc",
  },
  {
    label: "Price: High to Low",
    value: "price-desc",
  },
  {
    label: "Rating: Highest",
    value: "rating-desc",
  },
];

export default function SortFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort =
    searchParams.get("sort") ?? "featured";

  function handleSortChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const params = new URLSearchParams(searchParams.toString());

    const value = event.target.value;

    if (value === "featured") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    const queryString = params.toString();

    router.push(
      queryString
        ? `${pathname}?${queryString}`
        : pathname
    );
  }

  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="sort-products"
        className="whitespace-nowrap text-sm font-medium"
      >
        Sort by
      </label>

      <select
        id="sort-products"
        value={currentSort}
        onChange={handleSortChange}
        className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
      >
        {sortOptions.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}