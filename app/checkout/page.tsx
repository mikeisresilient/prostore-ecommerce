"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Container from "@/components/shared/container";
import { useCart } from "@/components/providers/cart-provider";
import PaystackPayment from "@/components/shared/paystack-payment";
import CurrencyPrice from "@/components/shared/currency-price";
import { useCurrency } from "@/components/providers/currency-provider";

type PaymentState = {
  orderId: string;
  accessCode: string;
} | null;

export default function CheckoutPage() {
  const { currency } = useCurrency();
  const router = useRouter();
  const { state, dispatch } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [country, setCountry] = useState("Nigeria");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [payment, setPayment] = useState<PaymentState>(null);

  const subtotal: number = state.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const shippingCost: number = 0;
  const total: number = subtotal + shippingCost;

  async function checkStockAvailability() {
    const response = await fetch("/api/products/stock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: state.items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to check product availability.");
    }

    const unavailable = data.stock.filter(
      (item: {
        productId: string;
        name: string;
        stock: number;
        requestedQuantity: number;
        available: boolean;
      }) => !item.available,
    );

    if (data.missingProducts.length > 0) {
      throw new Error(
        "One or more products in your cart are no longer available.",
      );
    }

    if (unavailable.length > 0) {
      const product = unavailable[0];

      if (product.stock === 0) {
        throw new Error(`${product.name} is currently out of stock.`);
      }

      throw new Error(
        `${product.name} only has ${product.stock} ${
          product.stock === 1 ? "unit" : "units"
        } available, but your cart contains ${product.requestedQuantity}.`,
      );
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || payment) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await checkStockAvailability();

      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName,
          customerEmail,
          phone,
          address,
          city,
          state: stateName,
          country,
          currency,
          items: state.items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || "Failed to create your order.");
      }

      const orderId = orderData.order.id;

      const paymentResponse = await fetch("/api/payments/paystack/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(paymentData.error || "Failed to initialize payment.");
      }

      setPayment({
        orderId,
        accessCode: paymentData.accessCode,
      });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePaymentSuccess(reference: string) {
    setError("");

    try {
      const response = await fetch("/api/payments/paystack/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reference,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.paid) {
        throw new Error(data.error || "Payment could not be verified.");
      }

      dispatch({
        type: "CLEAR_CART",
      });

      router.push(`/order-success?orderId=${encodeURIComponent(data.orderId)}`);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Payment verification failed.",
      );
    }
  }

  function handlePaymentError(message: string) {
    setError(message);
  }

  if (state.items.length === 0 && !payment) {
    return (
      <Container className="py-10 sm:py-16">
        <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card px-6 py-16 text-center sm:px-10">
          <h1 className="text-2xl font-bold">Your Cart Is Empty</h1>

          <p className="mt-3 text-muted-foreground">
            Add products to your cart before proceeding to checkout.
          </p>

          <Link
            href="/products"
            className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Browse Products
          </Link>
        </div>
      </Container>
    );
  }

  if (payment) {
    return (
      <Container className="py-10 sm:py-16">
        <div className="mx-auto max-w-xl">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Payment
            </p>

            <h1 className="mt-2 text-3xl font-bold">Complete Your Payment</h1>

            <p className="mt-3 text-muted-foreground">
              Your order has been created and is waiting for payment.
            </p>

            <div className="mt-6 rounded-xl bg-muted p-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Order</span>

                <span className="max-w-55 break-all text-right text-sm font-medium">
                  {payment.orderId}
                </span>
              </div>

              <div className="mt-3 flex justify-between">
                <span className="text-sm text-muted-foreground">Amount</span>

                <span className="text-sm font-semibold">
                  <CurrencyPrice amount={total} />
                </span>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            <div className="mt-6">
              <PaystackPayment
                accessCode={payment.accessCode}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Your payment will be securely processed by Paystack.
            </p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10 sm:py-16">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Checkout
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Complete Your Order
        </h1>

        <p className="mt-3 text-muted-foreground">
          Enter your delivery information to continue.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-8 lg:grid-cols-[1fr_360px]"
      >
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-xl font-semibold">Delivery Information</h2>

          <div className="mt-6 grid gap-5">
            <div>
              <label
                htmlFor="customerName"
                className="mb-2 block text-sm font-medium"
              >
                Full Name
              </label>

              <input
                id="customerName"
                type="text"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                required
                autoComplete="name"
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>

            <div>
              <label
                htmlFor="customerEmail"
                className="mb-2 block text-sm font-medium"
              >
                Email Address
              </label>

              <input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(event) => setCustomerEmail(event.target.value)}
                required
                autoComplete="email"
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium">
                Phone Number
              </label>

              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                required
                autoComplete="tel"
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="mb-2 block text-sm font-medium"
              >
                Delivery Address
              </label>

              <textarea
                id="address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                required
                autoComplete="street-address"
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="city"
                  className="mb-2 block text-sm font-medium"
                >
                  City
                </label>

                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  required
                  autoComplete="address-level2"
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
              </div>

              <div>
                <label
                  htmlFor="state"
                  className="mb-2 block text-sm font-medium"
                >
                  State
                </label>

                <input
                  id="state"
                  type="text"
                  value={stateName}
                  onChange={(event) => setStateName(event.target.value)}
                  required
                  autoComplete="address-level1"
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="country"
                className="mb-2 block text-sm font-medium"
              >
                Country
              </label>

              <input
                id="country"
                type="text"
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                required
                autoComplete="country-name"
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Order Summary</h2>

          <div className="mt-6 space-y-4">
            {state.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 text-sm">
                <div>
                  <p className="font-medium">{item.name}</p>

                  <p className="mt-1 text-muted-foreground">
                    Qty: {item.quantity}
                  </p>
                </div>

                <p className="shrink-0 font-medium">
                  <CurrencyPrice amount={item.price * item.quantity} />
                </p>
              </div>
            ))}
          </div>

          <div className="my-6 border-t border-border" />

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>

              <span className="font-medium">
                <CurrencyPrice amount={subtotal} />
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>

              <span className="font-medium">Free</span>
            </div>

            <div className="flex justify-between border-t border-border pt-4 text-base">
              <span className="font-semibold">Total</span>

              <span className="font-bold">
                <CurrencyPrice amount={total} />
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Preparing Payment..." : "Continue to Payment"}
          </button>

          <Link
            href="/cart"
            className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-lg border border-border px-6 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Back to Cart
          </Link>
        </aside>
      </form>
    </Container>
  );
}
