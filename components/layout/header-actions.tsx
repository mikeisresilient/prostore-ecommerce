import CartButton from "./cart-button";
import ThemeToggle from "./theme-toggle";
import UserButton from "./user-button";
import WishlistButton from "./wishlist-button";
import CurrencySelector from "./currency-selector";

export default function HeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <CurrencySelector />
      <ThemeToggle />
      <WishlistButton />
      <CartButton />
      <UserButton />
    </div>
  );
}