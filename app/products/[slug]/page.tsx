import { notFound } from "next/navigation";

import Container from "@/components/shared/container";
import ProductDetails from "@/components/shared/product-details";
import { prisma } from "@/lib/prisma";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: {
      slug,
      isActive: true,
    },
    include: {
      category: true,
    },
  });

  if (!product) {
    notFound();
  }

  const productForUI = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category.name,
    price: Number(product.price),
    rating: product.rating,
    reviews: product.reviews,
    image: product.image,
    stock: product.stock,
  };

  return (
    <Container className="py-10 sm:py-16">
      <ProductDetails product={productForUI} />
    </Container>
  );
}
