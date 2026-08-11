import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type StockRequestItem = {
  productId: string;
  quantity: number;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const items: StockRequestItem[] =
      Array.isArray(body.items)
        ? body.items.filter(
            (item: unknown): item is StockRequestItem =>
              typeof item === "object" &&
              item !== null &&
              "productId" in item &&
              "quantity" in item &&
              typeof item.productId === "string" &&
              typeof item.quantity === "number"
          )
        : [];

    if (items.length === 0) {
      return NextResponse.json(
        {
          error: "No valid products provided.",
        },
        { status: 400 }
      );
    }

    const productIds: string[] = [
      ...new Set(
        items
          .map((item) => item.productId.trim())
          .filter(
            (id): id is string => id.length > 0
          )
      ),
    ];

    if (productIds.length === 0) {
      return NextResponse.json(
        {
          error: "No valid products provided.",
        },
        { status: 400 }
      );
    }

    const products =
      await prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
        select: {
          id: true,
          name: true,
          stock: true,
        },
      });

    const stock = products.map(
      (product) => {
        const requestedItem = items.find(
          (item) =>
            item.productId === product.id
        );

        const requestedQuantity =
          requestedItem?.quantity ?? 0;

        return {
          productId: product.id,
          name: product.name,
          stock: product.stock,
          requestedQuantity:
            Number.isInteger(
              requestedQuantity
            ) && requestedQuantity > 0
              ? requestedQuantity
              : 0,
          available:
            Number.isInteger(
              requestedQuantity
            ) &&
            requestedQuantity > 0 &&
            requestedQuantity <=
              product.stock,
        };
      }
    );

    const foundProductIds = new Set(
      products.map((product) => product.id)
    );

    const missingProducts =
      productIds.filter(
        (productId) =>
          !foundProductIds.has(productId)
      );

    return NextResponse.json({
      stock,
      missingProducts,
    });
  } catch (error) {
    console.error(
      "Stock check error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to check product stock.",
      },
      { status: 500 }
    );
  }
}