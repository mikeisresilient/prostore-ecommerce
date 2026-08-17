import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyMobileToken } from "@/lib/mobile-auth";

async function getMobileUser(request: Request) {
  const authorization =
    request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization
    .slice(7)
    .trim();

  if (!token) {
    return null;
  }

  try {
    return await verifyMobileToken(token);
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const user = await getMobileUser(request);

  if (!user) {
    return NextResponse.json(
      {
        error:
          "Invalid or expired authentication token.",
      },
      { status: 401 },
    );
  }

  try {
    const wishlistItems =
      await prisma.wishlistItem.findMany({
        where: {
          userId: user.id,
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

    const items = wishlistItems.map(
      (item) => ({
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        category:
          item.product.category.name,
        price: Number(
          item.product.price,
        ),
        rating: item.product.rating,
        reviews: item.product.reviews,
        image: item.product.image,
        stock: item.product.stock,
        isActive:
          item.product.isActive,
      }),
    );

    return NextResponse.json({
      items,
    });
  } catch (error) {
    console.error(
      "Mobile wishlist fetch error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to load wishlist.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const user = await getMobileUser(request);

  if (!user) {
    return NextResponse.json(
      {
        error:
          "Invalid or expired authentication token.",
      },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();

    const productId =
      typeof body.productId === "string"
        ? body.productId.trim()
        : "";

    if (!productId) {
      return NextResponse.json(
        {
          error:
            "Product ID is required.",
        },
        { status: 400 },
      );
    }

    const product =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

    if (!product) {
      return NextResponse.json(
        {
          error:
            "Product not found.",
        },
        { status: 404 },
      );
    }

    const wishlistItem =
      await prisma.wishlistItem.upsert({
        where: {
          userId_productId: {
            userId: user.id,
            productId,
          },
        },
        update: {},
        create: {
          userId: user.id,
          productId,
        },
      });

    return NextResponse.json(
      {
        message:
          "Product added to wishlist.",
        id: wishlistItem.id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Mobile wishlist add error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to add product to wishlist.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
) {
  const user = await getMobileUser(request);

  if (!user) {
    return NextResponse.json(
      {
        error:
          "Invalid or expired authentication token.",
      },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();

    const productId =
      typeof body.productId === "string"
        ? body.productId.trim()
        : "";

    if (!productId) {
      return NextResponse.json(
        {
          error:
            "Product ID is required.",
        },
        { status: 400 },
      );
    }

    await prisma.wishlistItem.deleteMany({
      where: {
        userId: user.id,
        productId,
      },
    });

    return NextResponse.json({
      message:
        "Product removed from wishlist.",
    });
  } catch (error) {
    console.error(
      "Mobile wishlist remove error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to remove product from wishlist.",
      },
      { status: 500 },
    );
  }
}