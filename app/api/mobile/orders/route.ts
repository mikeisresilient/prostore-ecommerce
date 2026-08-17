import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyMobileToken } from "@/lib/mobile-auth";

export async function GET(request: Request) {
  try {
    const authorization =
      request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: "You must be logged in.",
        },
        { status: 401 },
      );
    }

    const token = authorization
      .slice(7)
      .trim();

    if (!token) {
      return NextResponse.json(
        {
          error: "Invalid authentication token.",
        },
        { status: 401 },
      );
    }

    let user;

    try {
      user = await verifyMobileToken(token);
    } catch (error) {
      console.error(
        "Mobile orders authentication error:",
        error,
      );

      return NextResponse.json(
        {
          error: "Invalid or expired authentication token.",
        },
        { status: 401 },
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
      },

      orderBy: {
        createdAt: "desc",
      },

      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      orders: orders.map((order) => ({
        id: order.id,
        status: order.status,

        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        total: Number(order.total),

        currency: order.currency,

        exchangeRate: order.exchangeRate
          ? Number(order.exchangeRate)
          : null,

        chargedCurrency:
          order.chargedCurrency,

        chargedAmount:
          order.chargedAmount
            ? Number(order.chargedAmount)
            : null,

        customerName:
          order.customerName,

        customerEmail:
          order.customerEmail,

        phone: order.phone,

        address: order.address,
        city: order.city,
        state: order.state,
        country: order.country,

        paymentReference:
          order.paymentReference,

        paidAt: order.paidAt
          ? order.paidAt.toISOString()
          : null,

        createdAt:
          order.createdAt.toISOString(),

        updatedAt:
          order.updatedAt.toISOString(),

        items: order.items.map(
          (item) => ({
            id: item.id,
            productId:
              item.productId,

            quantity:
              item.quantity,

            price:
              Number(item.price),

            product:
              item.product,
          }),
        ),
      })),
    });
  } catch (error) {
    console.error(
      "Mobile orders error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to load your orders.",
      },
      { status: 500 },
    );
  }
}