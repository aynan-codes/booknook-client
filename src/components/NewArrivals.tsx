"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import BookCardSkeleton from "@/components/BookCardSkeleton";
import { apiUrl } from "@/lib/api";

type Book = {
  id: number;
  title: string;
  author: string;
  category: string;
  rating: number;
  description: string;
  isbn: string;
  coverImage: string;
  copies: number;
  addedByName?: string;
  addedByEmail?: string;
};

export default function NewArrivals() {
  const router = useRouter();

  const [newArrivalBooks, setNewArrivalBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch latest books from MongoDB
  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          apiUrl("/api/books"),
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (response.ok && result.success) {
          // Show latest 6 books
          setNewArrivalBooks(result.data.slice(0, 6));
        } else {
          setNewArrivalBooks([]);
        }
      } catch (error) {
        console.error("New arrivals fetching error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  // Better Auth login check
  const handleExplore = async (bookId: number) => {
    try {
      const { data: session } = await authClient.getSession();

      if (!session?.user) {
        router.push(
          `/login?callbackURL=${encodeURIComponent(`/books/${bookId}`)}`
        );
        return;
      }

      router.push(`/books/${bookId}`);
    } catch (error) {
      console.error("Authentication check failed:", error);

      router.push(
        `/login?callbackURL=${encodeURIComponent(`/books/${bookId}`)}`
      );
    }
  };

  return (
    <section className="bg-[#FAF9F6] px-5 py-20 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl">

        {/* Section Heading */}
        <div className="mb-12 text-center">
          <p className="mb-2 font-semibold uppercase tracking-widest text-[#C69C45]">
            Recently Added
          </p>

          <h2 className="text-3xl font-bold text-[#193B32] dark:text-white md:text-4xl">
            New Arrivals
          </h2>

          <p className="mt-3 text-gray-500 dark:text-gray-400">
            Discover the latest additions to our collection.
          </p>
        </div>

        {/* Skeleton Loading */}
        {loading && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <BookCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Books Grid */}
        {!loading && newArrivalBooks.length > 0 && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {newArrivalBooks.map((book) => (
              <div
                key={book.id}
                className="book-card group overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#B18A54] hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
              >
                {/* Book Cover */}
                <div className="flex justify-center overflow-hidden rounded-xl bg-[#F3F0E8] p-5 dark:bg-gray-800">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={`Cover of ${book.title}`}
                      loading="lazy"
                      className="h-56 w-40 rounded-lg object-cover shadow-lg transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-56 w-40 items-center justify-center rounded-lg bg-[#193B32] p-4 text-center font-serif text-lg font-bold text-white shadow-lg">
                      {book.title}
                    </div>
                  )}
                </div>

                {/* Book Information */}
                <div className="pt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#C69C45]">
                      ★ {(book.rating || 0).toFixed(1)}
                    </span>

                    <span className="text-xs text-gray-400">
                      New Arrival
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#193B32] dark:text-white">
                    {book.title}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    By {book.author}
                  </p>

                  {/* Explore Button */}
                  <div className="mt-5">
                    <button
                      onClick={() => handleExplore(book.id)}
                      className="group/btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full border border-[#B18A54]/50 bg-[#FAF9F6] px-5 py-3 text-sm font-bold text-[#193B32] shadow-sm transition-all duration-300 hover:border-[#193B32] hover:bg-[#193B32] hover:text-white hover:shadow-md dark:bg-[#22352E] dark:text-[#D5B77B] dark:hover:bg-[#C69C45] dark:hover:text-[#101C19]"
                    >
                      <span>Explore</span>

                      <span className="text-lg transition-transform duration-300 group-hover/btn:translate-x-1">
                        ↗
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Books */}
        {!loading && newArrivalBooks.length === 0 && (
          <p className="py-10 text-center text-gray-500 dark:text-gray-400">
            No new arrivals available yet.
          </p>
        )}

        {/* Explore More Books */}
        <div className="mt-12 text-center">
          <Link
            href="/books"
            className="inline-flex items-center gap-2 rounded-full bg-[#193B32] px-8 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-[#285747] hover:shadow-lg dark:bg-[#C69C45] dark:text-[#101C19] dark:hover:bg-[#D5B77B]"
          >
            Explore More Books
            <span className="text-lg">↗</span>
          </Link>
        </div>

      </div>
    </section>
  );
}