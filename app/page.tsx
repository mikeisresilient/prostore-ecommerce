import Categories from "@/components/home/categories";
import FeaturedProducts from "@/components/home/featured-products";
import Hero from "@/components/home/hero";
import WhyChooseUs from "@/components/home/why-choose-us";
import Newsletter from "@/components/home/newsletter";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <WhyChooseUs />
      <Newsletter />
    </>
  );
}