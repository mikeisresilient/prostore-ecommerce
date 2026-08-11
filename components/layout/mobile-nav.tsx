"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { navigationLinks } from "@/lib/navigation";

export default function MobileNav() {
  return (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger
          className="
            inline-flex
            h-8
            w-8
            items-center
            justify-center
            rounded-lg
            hover:bg-muted
            transition-colors
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-ring
          "
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>

        <SheetContent side="left" className="w-72">
          <SheetTitle className="mb-6">
            ProStore
          </SheetTitle>

          <nav className="flex flex-col gap-2">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="
                  rounded-lg
                  px-3
                  py-2
                  text-sm
                  font-medium
                  transition-colors
                  hover:bg-muted
                "
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}