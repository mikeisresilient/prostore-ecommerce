import {
  BadgeCheck,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

import Container from "@/components/shared/container";

const benefits = [
  {
    icon: ShoppingBag,
    title: "Simple Shopping",
    description:
      "Browse products easily, find what you need, and add items to your cart without unnecessary steps.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Buying",
    description:
      "We are building ProStore with secure authentication, checkout, and order management in mind.",
  },
  {
    icon: BadgeCheck,
    title: "Quality Picks",
    description:
      "Discover products carefully organized to make finding the right option easier.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Why ProStore
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Shopping made simple
          </h2>

          <p className="mt-3 text-muted-foreground">
            Everything you need for a straightforward and
            enjoyable shopping experience.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div
                key={benefit.title}
                className="rounded-2xl border border-border bg-card p-6 sm:p-8"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
                  <Icon
                    aria-hidden="true"
                    className="h-5 w-5"
                  />
                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  {benefit.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}