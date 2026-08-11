"use client";

import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) {
    return <div className="h-8 w-8" aria-hidden="true" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Select theme"
        className="
          inline-flex
          h-8
          w-8
          items-center
          justify-center
          rounded-lg
          transition-colors
          hover:bg-muted
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-ring
        "
      >
        {resolvedTheme === "dark" ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
