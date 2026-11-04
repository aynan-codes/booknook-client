"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Footer() {
  const [year, setYear] = useState("2026");

  useEffect(() => {
    setYear(String(new Date().getFullYear()));
  }, []);

  return (
    <footer className="bg-[#193B32] px-5 py-14 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-3">
        {/* Brand */}
        <div>
          <h2 className="text-3xl font-bold">
            Book<span className="text-[#C69C45]">Nook</span>
          </h2>

          <p className="mt-4 max-w-sm leading-7 text-gray-300">
            A little corner for every book lover. Discover stories,
            explore knowledge and enjoy reading.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="mb-4 text-lg font-bold">Quick Links</h3>

          <div className="flex flex-col gap-3 text-gray-300">
            <Link href="/" className="hover:text-[#C69C45]">
              Home
            </Link>

            <Link href="/books" className="hover:text-[#C69C45]">
              All Books
            </Link>

            <Link href="/add-book" className="hover:text-[#C69C45]">
              Add Book
            </Link>

            <Link href="/my-books" className="hover:text-[#C69C45]">
              My Books
            </Link>

            <Link href="/my-borrows" className="hover:text-[#C69C45]">
              My Borrows
            </Link>

            <Link href="/login" className="hover:text-[#C69C45]">
              Login
            </Link>

            <Link href="/register" className="hover:text-[#C69C45]">
              Register
            </Link>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="mb-4 text-lg font-bold">Contact Us</h3>

          <p className="text-gray-300">
            Email: support@booknook.com
          </p>

          <p className="mt-2 text-gray-300">
            Follow us on social media.
          </p>
        </div>
      </div>

      {/* Copyright */}
      <div className="mx-auto mt-12 max-w-7xl border-t border-white/20 pt-6 text-center text-sm text-gray-300">
        © {year} BookNook. All rights reserved.
      </div>
    </footer>
  );
}