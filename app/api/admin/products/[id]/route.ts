import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        error: "You must be logged in.",
      },
      { status: 401 }
    );
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      {
        error: "You are not authorized.",
      },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;

    const product =
      await prisma.product.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          price: true,
          image: true,
          stock: true,
          featured: true,
          isActive: true,
          categoryId: true,
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

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: Number(product.price),
        image: product.image,
        stock: product.stock,
        featured: product.featured,
        isActive: product.isActive,
        categoryId: product.categoryId,
      },
    });
  } catch (error) {
    console.error(
      "Product fetch error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to load product.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: RouteContext
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        error: "You must be logged in.",
      },
      { status: 401 }
    );
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      {
        error: "You are not authorized.",
      },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const slug =
      typeof body.slug === "string"
        ? body.slug.trim().toLowerCase()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const image =
      typeof body.image === "string"
        ? body.image.trim()
        : "";

    const categoryId =
      typeof body.categoryId === "string"
        ? body.categoryId.trim()
        : "";

    const price = Number(body.price);
    const stock = Number(body.stock);
    const featured = body.featured === true;
    const isActive =
      body.isActive !== false;

    if (
      !name ||
      !slug ||
      !description ||
      !image ||
      !categoryId
    ) {
      return NextResponse.json(
        {
          error:
            "All required product fields must be provided.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Price must be a valid non-negative number.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Stock must be a valid whole number.",
        },
        { status: 400 }
      );
    }

    const product =
      await prisma.product.findUnique({
        where: {
          id,
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

    const category =
      await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      });

    if (!category) {
      return NextResponse.json(
        {
          error:
            "Selected category was not found.",
        },
        { status: 400 }
      );
    }

    const duplicate =
      await prisma.product.findFirst({
        where: {
          OR: [
            {
              slug,
            },
            {
              name,
            },
          ],
          NOT: {
            id,
          },
        },
      });

    if (duplicate) {
      return NextResponse.json(
        {
          error:
            duplicate.slug === slug
              ? "Another product already uses this slug."
              : "Another product already uses this name.",
        },
        { status: 409 }
      );
    }

    const updatedProduct =
      await prisma.product.update({
        where: {
          id,
        },
        data: {
          name,
          slug,
          description,
          price,
          image,
          stock,
          featured,
          isActive,
          categoryId,
        },
        include: {
          category: true,
        },
      });

    return NextResponse.json({
      message:
        "Product updated successfully.",
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        slug: updatedProduct.slug,
        price: Number(
          updatedProduct.price
        ),
        stock: updatedProduct.stock,
        featured: updatedProduct.featured,
        isActive: updatedProduct.isActive,
        category:
          updatedProduct.category.name,
      },
    });
  } catch (error) {
    console.error(
      "Product update error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to update product.",
      },
      { status: 500 }
    );
  }
}