import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const wishlistItems =
      await prisma.wishlistItem.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    const products = wishlistItems.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      category: item.product.category.name,
      price: Number(item.product.price),
      rating: item.product.rating,
      reviews: item.product.reviews,
      image: item.product.image,
    }));

    return NextResponse.json({
      items: products,
    });
  } catch (error) {
    console.error("Wishlist fetch error:", error);

    return NextResponse.json(
      {
        error: "Failed to load wishlist.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const productId =
      typeof body.productId === "string"
        ? body.productId
        : "";

    if (!productId) {
      return NextResponse.json(
        {
          error: "Product ID is required.",
        },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          error: "Product not found.",
        },
        { status: 404 }
      );
    }

    const wishlistItem =
      await prisma.wishlistItem.upsert({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId,
          },
        },
        update: {},
        create: {
          userId: session.user.id,
          productId,
        },
      });

    return NextResponse.json(
      {
        message: "Product added to wishlist.",
        id: wishlistItem.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Wishlist add error:", error);

    return NextResponse.json(
      {
        error: "Failed to add product to wishlist.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const productId =
      typeof body.productId === "string"
        ? body.productId
        : "";

    if (!productId) {
      return NextResponse.json(
        {
          error: "Product ID is required.",
        },
        { status: 400 }
      );
    }

    await prisma.wishlistItem.deleteMany({
      where: {
        userId: session.user.id,
        productId,
      },
    });

    return NextResponse.json({
      message: "Product removed from wishlist.",
    });
  } catch (error) {
    console.error("Wishlist remove error:", error);

    return NextResponse.json(
      {
        error: "Failed to remove product from wishlist.",
      },
      { status: 500 }
    );
  }
}