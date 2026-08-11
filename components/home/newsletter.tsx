"use client";

import { FormEvent, useState } from "react";

import Container from "@/components/shared/container";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      return;
    }

    setSubmitted(true);
  }

  return (
    <section className="border-y border-border bg-muted/30 py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-6 text-center sm:p-10 lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Stay updated
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Stay in the loop
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Get updates about new products, collections, and
            special offers.
          </p>

          {submitted ? (
            <div
              className="mx-auto mt-8 max-w-xl rounded-lg border border-border bg-muted p-4 text-sm"
              role="status"
            >
              Thanks for subscribing!
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
            >
              <label
                htmlFor="newsletter-email"
                className="sr-only"
              >
                Email address
              </label>

              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your email"
                autoComplete="email"
                className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
              />

              <button
                type="submit"
                className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}