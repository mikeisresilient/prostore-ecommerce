"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

import Container from "@/components/shared/container";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const registered = searchParams.get("registered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError(
          "Invalid email or password. Please try again."
        );
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError(
        "Something went wrong while signing in."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            ProStore
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Welcome back
          </h1>

          <p className="mt-3 text-sm text-muted-foreground">
            Sign in to your ProStore account.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          {registered && (
            <div className="mb-5 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
              Account created successfully. You can
              now sign in.
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                required
                disabled={loading}
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Your password"
                autoComplete="current-password"
                required
                disabled={loading}
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-foreground transition-colors hover:text-primary"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </Container>
  );
}

function LoginFallback() {
  return (
    <Container className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <div className="w-full max-w-md text-center">
        Loading...
      </div>
    </Container>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}