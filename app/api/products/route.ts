import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Products API error:", error);

    return NextResponse.json(
      {
        error: "Unable to retrieve products.",
      },
      { status: 500 }
    );
  }
}