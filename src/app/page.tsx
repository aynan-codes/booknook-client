import type { Metadata } from "next";

import HeroSlider from "@/components/HeroSlider";
import NewArrivals from "@/components/NewArrivals";
import Categories from "@/components/Categories";
import ReaderReviews from "@/components/ReaderReviews";

export const metadata: Metadata = {
  title: "Home | BookNook",
};

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <HeroSlider />
      <NewArrivals />
      <Categories />
      <ReaderReviews />
    </main>
  );
}