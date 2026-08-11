import CartButton from "./cart-button";
import ThemeToggle from "./theme-toggle";
import UserButton from "./user-button";
import WishlistButton from "./wishlist-button";
import CurrencySelector from "./currency-selector";

export default function HeaderActions() {
  return (
    <div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-2">
      <div className="hidden sm:block">
        <CurrencySelector />
      </div>

      <ThemeToggle />
      <WishlistButton />
      <CartButton />
      <UserButton />
    </div>
  );
}