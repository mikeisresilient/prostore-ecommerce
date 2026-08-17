import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type ProductRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: ProductRouteProps
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: {
        category: true,
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

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product API error:", error);

    return NextResponse.json(
      {
        error: "Unable to retrieve product.",
      },
      { status: 500 }
    );
  }
}