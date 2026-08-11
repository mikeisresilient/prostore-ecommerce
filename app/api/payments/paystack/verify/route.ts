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

  try {
    const body = await request.json();

    const reference =
      typeof body.reference === "string"
        ? body.reference.trim()
        : "";

    if (!reference) {
      return NextResponse.json(
        {
          error: "Payment reference is required.",
        },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        paymentReference: reference,
        userId: session.user.id,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          error:
            "Order associated with this payment was not found.",
        },
        { status: 404 }
      );
    }

    /*
     * If the order has already been paid, do not
     * verify it again or deduct stock again.
     */
    if (order.status === "PAID") {
      return NextResponse.json({
        message:
          "Payment has already been verified.",
        paid: true,
        orderId: order.id,
        status: order.status,
      });
    }

    const secretKey =
      process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error(
        "PAYSTACK_SECRET_KEY is not configured."
      );

      return NextResponse.json(
        {
          error:
            "Payment service is not configured.",
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(
        reference
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      console.error(
        "Paystack verification failed:",
        data
      );

      return NextResponse.json(
        {
          error:
            data.message ||
            "Unable to verify payment.",
        },
        { status: 502 }
      );
    }

    const transaction = data.data;

    const expectedAmount = Math.round(
      Number(order.chargedAmount) * 100
    );

    const paidAmount = Number(
      transaction.amount
    );

    const transactionCurrency =
      transaction.currency;

    const transactionStatus =
      transaction.status;

    const transactionReference =
      transaction.reference;

    const expectedCurrency =
      order.chargedCurrency;

    if (
      transactionStatus !== "success" ||
      transactionReference !== reference ||
      paidAmount !== expectedAmount ||
      transactionCurrency !== expectedCurrency
    ) {
      console.error(
        "Payment verification mismatch:",
        {
          transactionStatus,
          transactionReference,
          expectedReference: reference,
          paidAmount,
          expectedAmount,
          transactionCurrency,
          expectedCurrency,
        }
      );

      return NextResponse.json(
        {
          error:
            "Payment verification failed. Transaction details do not match the order.",
          paid: false,
        },
        { status: 400 }
      );
    }

    /*
     * Payment is confirmed by Paystack.
     *
     * Now deduct stock and mark the order as PAID
     * inside one database transaction.
     *
     * If anything fails, the entire transaction
     * rolls back.
     */
    const updatedOrder =
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

        /*
         * Protect against concurrent verification
         * requests for the same order.
         */
        if (currentOrder.status === "PAID") {
          return currentOrder;
        }

        /*
         * Aggregate quantities by product so each
         * product's stock is updated once.
         */
        const quantities = new Map<
          string,
          number
        >();

        for (const item of currentOrder.items) {
          const existing =
            quantities.get(item.productId) ?? 0;

          quantities.set(
            item.productId,
            existing + item.quantity
          );
        }

        /*
         * Deduct stock only when enough stock exists.
         *
         * If the update affects zero rows, the product
         * does not have enough stock.
         */
        for (const [
          productId,
          quantity,
        ] of quantities) {
          const result =
            await tx.product.updateMany({
              where: {
                id: productId,
                stock: {
                  gte: quantity,
                },
              },
              data: {
                stock: {
                  decrement: quantity,
                },
              },
            });

          if (result.count !== 1) {
            throw new Error(
              "One or more products no longer have enough stock."
            );
          }
        }

        /*
         * Mark the order as PAID only after all stock
         * deductions have succeeded.
         *
         * The status condition also prevents a
         * concurrent verification from processing the
         * same order twice.
         */
        const result =
          await tx.order.updateMany({
            where: {
              id: currentOrder.id,
              status: "PENDING",
            },
            data: {
              status: "PAID",
              paidAt: new Date(),
            },
          });

        if (result.count !== 1) {
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
        "Payment verified successfully.",
      paid: true,
      orderId: updatedOrder.id,
      status: updatedOrder.status,
    });
  } catch (error) {
    console.error(
      "Payment verification error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "";

    if (
      message.includes(
        "no longer have enough stock"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Payment was successful, but one or more products are no longer available in the requested quantity. Please contact support.",
          paid: false,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Something went wrong while verifying payment.",
      },
      { status: 500 }
    );
  }
}