import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        error:
          "You must be logged in to make a payment.",
      },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const orderId =
      typeof body.orderId === "string"
        ? body.orderId.trim()
        : "";

    if (!orderId) {
      return NextResponse.json(
        {
          error: "Order ID is required.",
        },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
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

    if (order.status !== "PENDING") {
      return NextResponse.json(
        {
          error:
            "This order is no longer available for payment.",
        },
        { status: 400 }
      );
    }

    if (!order.chargedAmount) {
      return NextResponse.json(
        {
          error:
            "This order does not have a valid payment amount.",
        },
        { status: 400 }
      );
    }

    if (order.chargedCurrency !== "NGN") {
      return NextResponse.json(
        {
          error:
            "This order cannot currently be processed by Paystack.",
        },
        { status: 400 }
      );
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

    const amountInKobo = Math.round(
      Number(order.chargedAmount) * 100
    );

    if (amountInKobo <= 0) {
      return NextResponse.json(
        {
          error:
            "Order payment amount must be greater than zero.",
        },
        { status: 400 }
      );
    }

    const reference =
      `PROSTORE-${order.id}-${Date.now()}`;

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: order.customerEmail,
          amount: String(amountInKobo),
          currency: order.chargedCurrency,
          reference,
          metadata: {
            orderId: order.id,
            userId: session.user.id,
            currency: order.currency,
            chargedCurrency:
              order.chargedCurrency,
            exchangeRate:
              order.exchangeRate
                ? Number(order.exchangeRate)
                : null,
            chargedAmount:
              Number(order.chargedAmount),
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      console.error(
        "Paystack initialization failed:",
        data
      );

      return NextResponse.json(
        {
          error:
            data.message ||
            "Unable to initialize payment.",
        },
        { status: 502 }
      );
    }

    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        paymentReference:
          data.data.reference,
      },
    });

    return NextResponse.json({
      authorizationUrl:
        data.data.authorization_url,

      accessCode:
        data.data.access_code,

      reference:
        data.data.reference,

      amount:
        Number(order.chargedAmount),

      currency:
        order.chargedCurrency,
    });
  } catch (error) {
    console.error(
      "Paystack initialization error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while initializing payment.",
      },
      { status: 500 }
    );
  }
}