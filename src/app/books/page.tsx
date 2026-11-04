"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

import BookCover from "@/components/BookCover";
import BookCardSkeleton from "@/components/BookCardSkeleton";
import { authClient } from "@/lib/auth-client";
import { apiUrl } from "@/lib/api";

const API_URL = apiUrl("/api/books");

const categories = [
  "All",
  "Fiction",
  "Science",
  "History",
  "Kids",
  "Others",
] as const;

type Category = (typeof categories)[number];

type Book = {
  id: number;
  title: string;
  author: string;
  category: string;
  rating: number;
  description: string;
  isbn: string;
  coverImage?: string;
  copies: number;
};

type SortOption =
  | "default"
  | "title-asc"
  | "title-desc"
  | "rating-desc"
  | "rating-asc";

export default function BooksPage() {
  const router = useRouter();

  useEffect(() => {
    document.title = "All Books | BookNook";
  }, []);

  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("All");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch books");
        }

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          setBooks(result.data);
        } else {
          throw new Error("Invalid books data received");
        }
      } catch (err) {
        console.error("Books fetching error:", err);
        setError("Could not load books. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Normalize category values before comparing
  const normalizeCategory = (value: string) => {
    return value.trim().toLowerCase();
  };

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = books.filter((book) => {
      const matchesSearch =
        (book.title || "").toLowerCase().includes(normalizedSearch) ||
        (book.author || "").toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        category === "All" ||
        normalizeCategory(book.category || "") ===
          normalizeCategory(category);

      return matchesSearch && matchesCategory;
    });

    switch (sortBy) {
      case "title-asc":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;

      case "title-desc":
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;

      case "rating-desc":
        filtered.sort((a, b) => b.rating - a.rating);
        break;

      case "rating-asc":
        filtered.sort((a, b) => a.rating - b.rating);
        break;

      default:
        break;
    }

    return filtered;
  }, [books, search, category, sortBy]);

  // Login required before opening book details
  const handleExplore = async (bookId: string | number) => {
    const callbackURL = `/books/${bookId}`;

    try {
      const { data: session, error } = await authClient.getSession();

      if (error || !session?.user) {
        router.push(
          `/login?callbackURL=${encodeURIComponent(callbackURL)}`
        );
        return;
      }

      router.push(callbackURL);
    } catch (err) {
      console.error("Session verification error:", err);

      router.push(
        `/login?callbackURL=${encodeURIComponent(callbackURL)}`
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[#193B32] dark:bg-[#101C19] dark:text-white">
      {/* Header */}
      <section className="mx-auto max-w-7xl px-6 pb-12 pt-16">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#B18A54]">
          Discover your next favorite
        </p>

        <h1 className="mt-4 font-serif text-5xl font-semibold md:text-6xl">
          Explore Our{" "}
          <span className="italic text-[#B18A54]">Library.</span>
        </h1>

        <p className="mt-5 max-w-xl leading-7 text-[#64736B] dark:text-gray-400">
          Explore fascinating stories, discover new ideas and find
          something wonderful to read.
        </p>

        {/* Search */}
        <div className="mt-10">
          <input
            type="text"
            placeholder="Search by book title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-[#193B32]/15 bg-white px-6 py-4 text-[#193B32] outline-none transition focus:border-[#B18A54] dark:border-gray-700 dark:bg-gray-900 dark:text-white md:max-w-xl"
          />
        </div>

        {/* Category Filters */}
        <div className="mt-7 flex flex-wrap gap-3">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
              className={`rounded-full px-6 py-3 text-sm font-semibold transition ${
                category === item
                  ? "bg-[#193B32] text-white dark:bg-[#C69C45] dark:text-[#101C19]"
                  : "border border-[#193B32]/15 bg-white hover:border-[#B18A54] dark:border-gray-700 dark:bg-gray-900"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {/* Books Section */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold">
              {category === "All" ? "All Books" : category}
            </h2>

            <p className="mt-1 text-sm text-[#64736B] dark:text-gray-400">
              {loading
                ? "Loading books..."
                : `${filteredBooks.length} books found`}
            </p>
          </div>

          {/* Sorting */}
          <div className="relative w-full sm:w-64">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as SortOption)
              }
              aria-label="Sort books"
              className="w-full cursor-pointer appearance-none rounded-full border border-[#193B32]/15 bg-white px-5 py-3 pr-12 text-sm font-semibold text-[#193B32] outline-none transition hover:border-[#B18A54] focus:border-[#B18A54] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="default">Default Order</option>
              <option value="title-asc">Title: A → Z</option>
              <option value="title-desc">Title: Z → A</option>
              <option value="rating-desc">Rating: High → Low</option>
              <option value="rating-asc">Rating: Low → High</option>
            </select>

            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[#B18A54]"
            />
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <BookCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-white py-20 text-center dark:bg-gray-900">
            <h3 className="font-serif text-2xl font-semibold">
              Something Went Wrong
            </h3>

            <p className="mt-3 text-sm text-red-500">{error}</p>
          </div>
        ) : filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.map((book) => (
              <article
                key={book.id}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#193B32]/15 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#B18A54] hover:shadow-xl dark:border-gray-700 dark:bg-[#172722]"
              >
                <div className="overflow-hidden rounded-xl bg-[#F5F1E9] dark:bg-[#22352E]">
                  <BookCover
                    title={book.title}
                    author={book.author}
                    isbn={book.isbn}
                    coverImage={book.coverImage}
                  />
                </div>

                <div className="mt-5 flex flex-1 items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#B18A54]">
                      {book.category}
                    </p>

                    <h3 className="mt-2 line-clamp-1 text-lg font-semibold">
                      {book.title}
                    </h3>

                    <p className="mt-1 truncate text-sm text-[#64736B] dark:text-gray-400">
                      {book.author}
                    </p>

                    <p className="mt-2 text-sm text-[#B18A54]">
                      ⭐ {book.rating}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleExplore(book.id)}
                    className="group/btn relative flex shrink-0 items-center gap-2 overflow-hidden rounded-full border border-[#B18A54]/50 bg-[#FAF9F6] px-5 py-3 text-sm font-bold text-[#193B32] shadow-sm transition-all duration-300 hover:border-[#193B32] hover:bg-[#193B32] hover:text-white dark:bg-[#22352E] dark:text-[#D5B77B] dark:hover:bg-[#C69C45] dark:hover:text-[#101C19]"
                  >
                    <span>Explore</span>

                    <span className="text-lg transition-transform duration-300 group-hover/btn:translate-x-1">
                      ↗
                    </span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white py-20 text-center dark:bg-gray-900">
            <h3 className="font-serif text-2xl font-semibold">
              No Books Found
            </h3>

            <p className="mt-3 text-sm text-[#64736B] dark:text-gray-400">
              Try searching with a different title or category.
            </p>

            <button
              type="button"
              onClick={() => {
                setCategory("All");
                setSearch("");
                setSortBy("default");
              }}
              className="mt-5 rounded-full bg-[#193B32] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#B18A54]"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}