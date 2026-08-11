"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type SubmitEvent } from "react";

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  featured: boolean;
  isActive: boolean;
  categoryId: string;
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();

  const productId = typeof params.id === "string" ? params.id : "";

  const [product, setProduct] = useState<Product | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [stock, setStock] = useState("0");
  const [categoryId, setCategoryId] = useState("");
  const [featured, setFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!productId) {
      return;
    }

    async function loadData() {
      try {
        const [productResponse, categoryResponse] = await Promise.all([
          fetch(`/api/admin/products/${productId}`),
          fetch("/api/admin/categories"),
        ]);

        const productData = await productResponse.json();

        const categoryData = await categoryResponse.json();

        if (!productResponse.ok) {
          throw new Error(productData.error || "Failed to load product.");
        }

        if (!categoryResponse.ok) {
          throw new Error(categoryData.error || "Failed to load categories.");
        }

        const loadedProduct = productData.product as Product;

        setProduct(loadedProduct);

        setName(loadedProduct.name);
        setSlug(loadedProduct.slug);
        setDescription(loadedProduct.description);
        setPrice(String(loadedProduct.price));
        setImage(loadedProduct.image);
        setStock(String(loadedProduct.stock));
        setCategoryId(loadedProduct.categoryId);
        setFeatured(loadedProduct.featured);
        setIsActive(loadedProduct.isActive);

        setCategories(categoryData.categories);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load product.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [productId]);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          slug,
          description,
          price: Number(price),
          image,
          stock: Number(stock),
          categoryId,
          featured,
          isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update product.");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update product.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-8">
          <h1 className="text-xl font-semibold">Unable to load product</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {error || "The requested product could not be found."}
          </p>

          <Link
            href="/admin/products"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/admin/products"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← Back to Products
        </Link>

        <h1 className="mt-4 text-3xl font-bold tracking-tight">Edit Product</h1>

        <p className="mt-2 text-muted-foreground">
          Update product information, pricing, category, and inventory.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8"
      >
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="text-sm font-medium">
              Product Name
            </label>

            <input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div>
            <label htmlFor="slug" className="text-sm font-medium">
              Slug
            </label>

            <input
              id="slug"
              value={slug}
              onChange={(event) => setSlug(event.target.value.toLowerCase())}
              required
              className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div>
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>

            <select
              id="category"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              required
              className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            >
              <option value="">Select category</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="price" className="text-sm font-medium">
              Base Price (USD)
            </label>

            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
              className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div>
            <label htmlFor="stock" className="text-sm font-medium">
              Stock
            </label>

            <input
              id="stock"
              type="number"
              min="0"
              step="1"
              value={stock}
              onChange={(event) => setStock(event.target.value)}
              required
              className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="image" className="text-sm font-medium">
              Image URL
            </label>

            <input
              id="image"
              type="url"
              value={image}
              onChange={(event) => setImage(event.target.value)}
              required
              className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              rows={5}
              className="mt-2 w-full resize-y rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div className="space-y-4 sm:col-span-2">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={featured}
                onChange={(event) => setFeatured(event.target.checked)}
                className="h-4 w-4 rounded border-border"
              />

              <span className="text-sm font-medium">Feature this product</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                className="h-4 w-4 rounded border-border"
              />

              <div>
                <span className="text-sm font-medium">Product is active</span>

                <p className="text-xs text-muted-foreground">
                  Inactive products will not be available for purchase.
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <Link
            href="/admin/products"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-6 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
