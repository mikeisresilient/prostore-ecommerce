import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

const allowedTransitions: Record<
  OrderStatus,
  OrderStatus[]
> = {
  PENDING: ["CANCELLED"],
  PAID: ["PROCESSING"],
  PROCESSING: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export async function PATCH(
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

    const requestedStatus =
      typeof body.status === "string"
        ? body.status.toUpperCase()
        : "";

    const validStatuses: OrderStatus[] = [
      "PENDING",
      "PAID",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    if (
      !validStatuses.includes(
        requestedStatus as OrderStatus
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid order status.",
        },
        { status: 400 }
      );
    }

    const nextStatus =
      requestedStatus as OrderStatus;

    const order =
      await prisma.order.findUnique({
        where: {
          id,
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

    const currentStatus =
      order.status as OrderStatus;

    /*
     * Do nothing when the requested status
     * is already the current status.
     */
    if (currentStatus === nextStatus) {
      return NextResponse.json({
        message:
          "Order status is already set to this value.",
        order: {
          id: order.id,
          status: order.status,
        },
      });
    }

    const allowedNextStatuses =
      allowedTransitions[currentStatus];

    if (
      !allowedNextStatuses.includes(
        nextStatus
      )
    ) {
      let error =
        `Cannot change order status from ${currentStatus} to ${nextStatus}.`;

      if (currentStatus === "PENDING") {
        error =
          "A pending order can only be cancelled here. Payment verification automatically changes successfully paid orders to PAID.";
      }

      if (currentStatus === "PAID") {
        if (nextStatus === "CANCELLED") {
          error =
            "A paid order cannot be cancelled from the admin status control because a refund has not been processed.";
        } else {
          error =
            "A paid order can only be moved to PROCESSING.";
        }
      }

      if (currentStatus === "PROCESSING") {
        error =
          "A processing order can only be moved to SHIPPED.";
      }

      if (currentStatus === "SHIPPED") {
        error =
          "A shipped order can only be moved to DELIVERED.";
      }

      if (currentStatus === "DELIVERED") {
        error =
          "A delivered order cannot be changed.";
      }

      if (currentStatus === "CANCELLED") {
        error =
          "A cancelled order cannot be changed.";
      }

      return NextResponse.json(
        {
          error,
        },
        { status: 400 }
      );
    }

    /*
     * Status transitions are deliberately handled
     * without changing stock here.
     *
     * Stock is deducted when Paystack payment is
     * successfully verified.
     *
     * Customer cancellation of PAID orders and
     * admin cancellation of PAID orders are not
     * supported until a refund workflow exists.
     */
    const updatedOrder =
      await prisma.order.updateMany({
        where: {
          id,
          status: currentStatus,
        },
        data: {
          status: nextStatus,
        },
      });

    if (updatedOrder.count !== 1) {
      return NextResponse.json(
        {
          error:
            "The order was changed by another request. Please refresh and try again.",
        },
        { status: 409 }
      );
    }

    const finalOrder =
      await prisma.order.findUniqueOrThrow({
        where: {
          id,
        },
      });

    return NextResponse.json({
      message:
        "Order status updated successfully.",
      order: {
        id: finalOrder.id,
        status: finalOrder.status,
      },
    });
  } catch (error) {
    console.error(
      "Order status update error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update order status.",
      },
      { status: 500 }
    );
  }
}