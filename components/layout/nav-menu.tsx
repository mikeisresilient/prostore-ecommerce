import Link from "next/link";
import { navigationLinks } from "@/lib/navigation";

export default function NavMenu() {
  return (
    <nav
      aria-label="Main Navigation"
      className="hidden items-center gap-8 lg:flex"
    >
      {navigationLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-sm font-medium transition-colors duration-200 hover:text-primary"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}