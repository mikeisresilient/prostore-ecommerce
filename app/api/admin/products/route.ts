import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
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

    const featured =
      body.featured === true;
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
            "Price must be a valid positive number.",
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

    const category =
      await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      });

    if (!category) {
      return NextResponse.json(
        {
          error: "Selected category was not found.",
        },
        { status: 400 }
      );
    }

    const existingProduct =
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
        },
      });

    if (existingProduct) {
      return NextResponse.json(
        {
          error:
            existingProduct.slug === slug
              ? "A product with this slug already exists."
              : "A product with this name already exists.",
        },
        { status: 409 }
      );
    }

    const product =
      await prisma.product.create({
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

    return NextResponse.json(
      {
        message: "Product created successfully.",
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: Number(product.price),
          stock: product.stock,
          featured: product.featured,
          isActive: product.isActive,
          category: product.category.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Product creation error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to create product.",
      },
      { status: 500 }
    );
  }
}