import type { Metadata } from "next";
import { Geist } from "next/font/google";

import "@/assets/styles/globals.css";

import { cn } from "@/lib/utils";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import { WishlistProvider } from "@/components/providers/wishlist-provider";
import SessionProviderWrapper from "@/components/providers/session-provider";
import { CurrencyProvider } from "@/components/providers/currency-provider";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "ProStore",
    template: "%s | ProStore",
  },
  description: "A modern ecommerce store built with Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", geist.variable)}
    >
      <body>
        <ThemeProvider>
          <CurrencyProvider>
            <SessionProviderWrapper>
              <CartProvider>
                <WishlistProvider>
                  <div className="flex min-h-screen flex-col">
                    <Header />

                    <main className="flex-1">{children}</main>

                    <Footer />
                  </div>
                </WishlistProvider>
              </CartProvider>
            </SessionProviderWrapper>
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
