"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type CategoryFilterProps = {
  categories: string[];
};

export default function CategoryFilter({
  categories,
}: CategoryFilterProps) {
  const searchParams = useSearchParams();

  const currentCategory =
    searchParams.get("category") ?? "";

  const currentQuery = searchParams.get("q") ?? "";

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <CategoryLink
        label="All"
        value=""
        currentCategory={currentCategory}
        currentQuery={currentQuery}
      />

      {categories.map((category) => (
        <CategoryLink
          key={category}
          label={category}
          value={category.toLowerCase()}
          currentCategory={currentCategory}
          currentQuery={currentQuery}
        />
      ))}
    </div>
  );
}

type CategoryLinkProps = {
  label: string;
  value: string;
  currentCategory: string;
  currentQuery: string;
};

function CategoryLink({
  label,
  value,
  currentCategory,
  currentQuery,
}: CategoryLinkProps) {
  const isActive =
    value === ""
      ? currentCategory === ""
      : currentCategory === value;

  const params = new URLSearchParams();

  if (currentQuery) {
    params.set("q", currentQuery);
  }

  if (value) {
    params.set("category", value);
  }

  const queryString = params.toString();

  const href = queryString
    ? `/products?${queryString}`
    : "/products";

  return (
    <Link
      href={href}
      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background hover:bg-muted"
      }`}
    >
      {label}
    </Link>
  );
}