"use client";

import { Suspense } from "react";
import Link from "next/link";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import "swiper/css/pagination";

const slides = [
  {
    title: "Discover Your Next Favorite Book",
    description: "Explore thousands of stories and find your next adventure.",
    image:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1600",
  },
  {
    title: "A World of Knowledge Awaits",
    description: "Read, learn and explore something new every day.",
    image:
      "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=1600",
  },
  {
    title: "Every Book Opens a New World",
    description: "Your next great reading experience starts here.",
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1600",
  },
];

function HeroSliderSlides() {
  return (
    <Swiper
      className="hero-swiper h-full"
      modules={[Autoplay, Navigation, Pagination]}
      slidesPerView={1}
      loop
      autoplay={{ delay: 4000, disableOnInteraction: false }}
      navigation
      pagination={{ clickable: true }}
    >
      {slides.map((slide, index) => (
        <SwiperSlide key={index}>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          />

          <div className="absolute inset-0 bg-black/55" />

          <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 pb-10 text-center text-white">
            <h1 className="mb-5 max-w-3xl text-4xl font-bold md:text-6xl">
              {slide.title}
            </h1>

            <p className="mb-8 max-w-xl text-lg text-gray-200">
              {slide.description}
            </p>

            <Link
              href="/books"
              className="rounded-lg bg-[#C69C45] px-8 py-3 font-semibold text-gray-950 transition hover:bg-white"
            >
              Browse Books
            </Link>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default function HeroSlider() {
  return (
    <section className="relative h-[500px] overflow-hidden bg-gray-900">
      {/* Swiper evaluates `new Date()` at module scope, which Next.js
          prerendering treats as an unstable value — stream the slides in. */}
      <Suspense fallback={<div className="h-full w-full bg-gray-900" />}>
        <HeroSliderSlides />
      </Suspense>
    </section>
  );
}
