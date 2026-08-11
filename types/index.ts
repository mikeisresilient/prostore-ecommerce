export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  stock: number;
};

export type CartItem = Product & {
  quantity: number;
};