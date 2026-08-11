import Container from "@/components/shared/container";
import ProductCard from "@/components/shared/product-card";
import SearchForm from "@/components/shared/search-form";
import CategoryFilter from "@/components/shared/category-filter";
import SortFilter from "@/components/shared/sort-filter";
import { prisma } from "@/lib/prisma";

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
  }>;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const { q, category, sort } = await searchParams;

  const query = q?.trim().toLowerCase() ?? "";
  const selectedCategory = category?.trim().toLowerCase() ?? "";

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        category: true,
      },
    }),

    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = query
      ? [product.name, product.category.name]
          .join(" ")
          .toLowerCase()
          .includes(query)
      : true;

    const matchesCategory = selectedCategory
      ? product.category.name.toLowerCase() === selectedCategory
      : true;

    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts];

  switch (sort) {
    case "price-asc":
      sortedProducts.sort((a, b) => Number(a.price) - Number(b.price));
      break;

    case "price-desc":
      sortedProducts.sort((a, b) => Number(b.price) - Number(a.price));
      break;

    case "rating-desc":
      sortedProducts.sort((a, b) => b.rating - a.rating);
      break;

    default:
      break;
  }

  return (
    <Container className="py-12 sm:py-16">
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Our collection
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          All Products
        </h1>

        <p className="mt-3 max-w-2xl text-muted-foreground">
          Browse our complete collection of quality products.
        </p>

        <div className="mt-6 space-y-4">
          <div className="max-w-xl">
            <SearchForm />
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CategoryFilter
              categories={categories.map((category) => category.name)}
            />

            <SortFilter />
          </div>
        </div>
      </div>

      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                category: product.category.name,
                price: Number(product.price),
                rating: product.rating,
                reviews: product.reviews,
                image: product.image,
                stock: product.stock,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <h2 className="text-xl font-semibold">No products found</h2>

          <p className="mt-2 text-muted-foreground">
            Try searching for a different product or category.
          </p>
        </div>
      )}
    </Container>
  );
}
