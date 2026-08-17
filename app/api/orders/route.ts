import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getExchangeRate } from "@/lib/exchange-rate";
import { verifyMobileToken } from "@/lib/mobile-auth";

type OrderRequestItem = {
    productId: string;
    quantity: number;
};

type SupportedCurrency = "USD" | "NGN";

export async function POST(request: Request) {
    const session = await auth();

    let userId = session?.user?.id;

    if (!userId) {
        const authorization =
            request.headers.get("authorization");

        if (authorization?.startsWith("Bearer ")) {
            const token = authorization.slice(7).trim();

            try {
                const mobileUser =
                    await verifyMobileToken(token);

                userId = mobileUser.id;
            } catch (error) {
                console.error(
                    "Mobile authentication error:",
                    error
                );
            }
        }
    }

    if (!userId) {
        return NextResponse.json(
            {
                error:
                    "You must be logged in to place an order.",
            },
            { status: 401 }
        );
    }

    try {
        const body = await request.json();

        const items = body.items as OrderRequestItem[];

        const currency =
            body.currency === "NGN" || body.currency === "USD"
                ? (body.currency as SupportedCurrency)
                : null;

        const customerName =
            typeof body.customerName === "string"
                ? body.customerName.trim()
                : "";

        const customerEmail =
            typeof body.customerEmail === "string"
                ? body.customerEmail.trim().toLowerCase()
                : "";

        const phone =
            typeof body.phone === "string"
                ? body.phone.trim()
                : "";

        const address =
            typeof body.address === "string"
                ? body.address.trim()
                : "";

        const city =
            typeof body.city === "string"
                ? body.city.trim()
                : "";

        const state =
            typeof body.state === "string"
                ? body.state.trim()
                : "";

        const country =
            typeof body.country === "string"
                ? body.country.trim()
                : "";

        if (!currency) {
            return NextResponse.json(
                {
                    error: "Unsupported currency.",
                },
                { status: 400 }
            );
        }

        if (
            !customerName ||
            !customerEmail ||
            !phone ||
            !address ||
            !city ||
            !state ||
            !country
        ) {
            return NextResponse.json(
                {
                    error:
                        "All customer and delivery fields are required.",
                },
                { status: 400 }
            );
        }

        if (
            !Array.isArray(items) ||
            items.length === 0
        ) {
            return NextResponse.json(
                {
                    error: "Your cart is empty.",
                },
                { status: 400 }
            );
        }

        const productIds = items.map(
            (item) => item.productId
        );

        const uniqueProductIds = [
            ...new Set(productIds),
        ];

        const products = await prisma.product.findMany({
            where: {
                id: {
                    in: uniqueProductIds,
                },
            },
        });

        if (
            products.length !== uniqueProductIds.length
        ) {
            return NextResponse.json(
                {
                    error:
                        "One or more products could not be found.",
                },
                { status: 400 }
            );
        }

        const productMap = new Map(
            products.map((product) => [
                product.id,
                product,
            ])
        );

        let subtotal = 0;

        const orderItems = [];

        for (const item of items) {
            const product = productMap.get(
                item.productId
            );

            if (!product) {
                return NextResponse.json(
                    {
                        error: "Product not found.",
                    },
                    { status: 400 }
                );
            }

            if (!product.isActive) {
                return NextResponse.json(
                    {
                        error: `${product.name} is no longer available for purchase.`,
                    },
                    { status: 400 }
                );
            }

            const quantity = Number(item.quantity);

            if (
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {
                return NextResponse.json(
                    {
                        error:
                            "Product quantities must be positive whole numbers.",
                    },
                    { status: 400 }
                );
            }

            if (quantity > product.stock) {
                return NextResponse.json(
                    {
                        error: `${product.name} does not have enough stock.`,
                    },
                    { status: 400 }
                );
            }

            const price = Number(product.price);

            subtotal += price * quantity;

            orderItems.push({
                productId: product.id,
                quantity,
                price: product.price,
            });
        }

        const shippingCost = 0;
        const total = subtotal + shippingCost;

        /*
         * Product prices and order totals are stored
         * using the store's USD base currency.
         *
         * Paystack will currently charge NGN.
         *
         * Therefore, we always obtain the current
         * USD → NGN exchange rate here on the server.
         */
        const exchangeRate =
            await getExchangeRate("NGN");

        const chargedAmount =
            total * exchangeRate;

        const order = await prisma.order.create({
            data: {
                userId,

                customerName,
                customerEmail,
                phone,
                address,
                city,
                state,
                country,

                subtotal,
                shippingCost,
                total,

                currency,

                exchangeRate,

                chargedCurrency: "NGN",

                chargedAmount,

                status: "PENDING",

                items: {
                    create: orderItems,
                },
            },

            include: {
                items: true,
            },
        });

        return NextResponse.json(
            {
                message: "Order created successfully.",

                order: {
                    id: order.id,
                    status: order.status,

                    currency: order.currency,

                    subtotal: Number(
                        order.subtotal
                    ),

                    shippingCost: Number(
                        order.shippingCost
                    ),

                    total: Number(
                        order.total
                    ),

                    exchangeRate: Number(
                        order.exchangeRate
                    ),

                    chargedCurrency:
                        order.chargedCurrency,

                    chargedAmount: Number(
                        order.chargedAmount
                    ),
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error(
            "Order creation error:",
            error
        );

        return NextResponse.json(
            {
                error: "Failed to create order.",
            },
            { status: 500 }
        );
    }
}