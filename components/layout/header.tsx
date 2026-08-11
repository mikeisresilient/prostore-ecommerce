import Container from "@/components/shared/container";

import Logo from "./logo";
import NavMenu from "./nav-menu";
import SearchBar from "./search-bar";
import HeaderActions from "./header-actions";
import MobileNav from "./mobile-nav";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <Container className="flex h-16 min-w-0 items-center gap-2 sm:gap-4">
        {/* Logo */}
        <div className="min-w-0 shrink-0">
          <Logo />
        </div>

        {/* Desktop Navigation */}
        <NavMenu />

        {/* Search */}
        <div className="hidden min-w-0 flex-1 justify-center lg:flex">
          <SearchBar />
        </div>

        {/* Right Actions */}
        <div className="ml-auto flex min-w-0 shrink-0 items-center gap-1 sm:gap-2">
          <HeaderActions />

          {/* Mobile Navigation */}
          <div className="shrink-0 lg:hidden">
            <MobileNav />
          </div>
        </div>
      </Container>
    </header>
  );
}