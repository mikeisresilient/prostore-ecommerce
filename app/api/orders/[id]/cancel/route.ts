import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
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

  try {
    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          error: "Order not found.",
        },
        { status: 404 }
      );
    }

    if (
      order.status !== "PENDING" &&
      order.status !== "PAID"
    ) {
      return NextResponse.json(
        {
          error:
            "This order can no longer be cancelled.",
        },
        { status: 400 }
      );
    }

    const cancelledOrder =
      await prisma.$transaction(async (tx) => {
        const currentOrder =
          await tx.order.findUnique({
            where: {
              id: order.id,
            },
            include: {
              items: true,
            },
          });

        if (!currentOrder) {
          throw new Error(
            "Order no longer exists."
          );
        }

        if (
          currentOrder.status !== "PENDING" &&
          currentOrder.status !== "PAID"
        ) {
          throw new Error(
            "Order can no longer be cancelled."
          );
        }

        /*
         * Stock was deducted only after payment
         * was successfully verified.
         *
         * Therefore, restore stock only for
         * PAID orders.
         */
        if (currentOrder.status === "PAID") {
          const quantities = new Map<
            string,
            number
          >();

          for (const item of currentOrder.items) {
            const existing =
              quantities.get(
                item.productId
              ) ?? 0;

            quantities.set(
              item.productId,
              existing + item.quantity
            );
          }

          for (const [
            productId,
            quantity,
          ] of quantities) {
            await tx.product.update({
              where: {
                id: productId,
              },
              data: {
                stock: {
                  increment: quantity,
                },
              },
            });
          }
        }

        const updatedOrder =
          await tx.order.updateMany({
            where: {
              id: currentOrder.id,
              status: currentOrder.status,
            },
            data: {
              status: "CANCELLED",
            },
          });

        if (updatedOrder.count !== 1) {
          throw new Error(
            "Order has already been processed."
          );
        }

        return tx.order.findUniqueOrThrow({
          where: {
            id: currentOrder.id,
          },
        });
      });

    return NextResponse.json({
      message:
        "Order cancelled successfully.",
      order: {
        id: cancelledOrder.id,
        status: cancelledOrder.status,
      },
    });
  } catch (error) {
    console.error(
      "Order cancellation error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "";

    if (
      message.includes(
        "can no longer be cancelled"
      )
    ) {
      return NextResponse.json(
        {
          error: message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Failed to cancel order.",
      },
      { status: 500 }
    );
  }
}