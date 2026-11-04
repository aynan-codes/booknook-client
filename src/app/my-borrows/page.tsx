"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, CalendarDays } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import BookCardSkeleton from "@/components/BookCardSkeleton";
import { useToast } from "@/components/ToastProvider";
import { apiUrl } from "@/lib/api";

type Book = {
  id: number;
  title: string;
  author: string;
  category: string;
  description: string;
  coverImage: string;
  copies: number;
  isbn: string;
};

type Borrow = {
  _id: string;
  bookId: number;
  bookTitle: string;
  borrowedAt: string;
  status: "borrowed" | "returned";
};

type MyBorrowBook = {
  book: Book;
  borrowId: string;
  borrowedAt: string;
};

type SortOption =
  | "default"
  | "title-asc"
  | "title-desc"
  | "newest"
  | "oldest";

const API_URL = apiUrl("/api/books");

export default function MyBorrowsPage() {
  const router = useRouter();

useEffect(() => {
  document.title = "My Borrows | BookNook";
}, []);

  const { data: session, isPending } = authClient.useSession();

  const [myBooks, setMyBooks] = useState<MyBorrowBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  const { showToast } = useToast();

  const fetchMyBorrows = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const borrowResponse = await fetch(`${API_URL}/my-borrows`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const borrowResult = await borrowResponse.json();

      if (!borrowResponse.ok || !borrowResult.success) {
        throw new Error(
          borrowResult.message || "Failed to load borrowed books."
        );
      }

      const booksResponse = await fetch(API_URL, {
        method: "GET",
        cache: "no-store",
      });

      const booksResult = await booksResponse.json();

      if (!booksResponse.ok || !booksResult.success) {
        throw new Error(booksResult.message || "Failed to load books.");
      }

      const borrows: Borrow[] = borrowResult.data || [];
      const books: Book[] = booksResult.data || [];

      const joinedBooks: MyBorrowBook[] = borrows
        .map((borrow) => {
          const book = books.find(
            (item) => item.id === borrow.bookId
          );

          if (!book) return null;

          return {
            book,
            borrowId: borrow._id,
            borrowedAt: borrow.borrowedAt,
          };
        })
        .filter((item): item is MyBorrowBook => item !== null);

      setMyBooks(joinedBooks);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      setError("Please log in to see your borrowed books.");
      setLoading(false);

      router.replace(
        `/login?callbackURL=${encodeURIComponent("/my-borrows")}`
      );

      return;
    }

    fetchMyBorrows();
  }, [session, isPending, router, fetchMyBorrows]);

  const sortedBooks = useMemo(() => {
    const books = [...myBooks];

    switch (sortBy) {
      case "title-asc":
        return books.sort((a, b) =>
          a.book.title.localeCompare(b.book.title)
        );

      case "title-desc":
        return books.sort((a, b) =>
          b.book.title.localeCompare(a.book.title)
        );

      case "newest":
        return books.sort(
          (a, b) =>
            new Date(b.borrowedAt).getTime() -
            new Date(a.borrowedAt).getTime()
        );

      case "oldest":
        return books.sort(
          (a, b) =>
            new Date(a.borrowedAt).getTime() -
            new Date(b.borrowedAt).getTime()
        );

      default:
        return books;
    }
  }, [myBooks, sortBy]);

  const handleReturn = async (borrowId: string) => {
    if (!session?.user) {
      router.push(
        `/login?callbackURL=${encodeURIComponent("/my-borrows")}`
      );
      return;
    }

    try {
      setReturningId(borrowId);

      const response = await fetch(
        `${API_URL}/return/${borrowId}`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to return book.");
      }

      showToast("Book returned successfully!", "success");

      await fetchMyBorrows();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to return book.",
        "error"
      );
    } finally {
      setReturningId(null);
    }
  };

  if (loading || isPending) {
    return (
      <section className="min-h-screen bg-[#F8F6F0] px-4 py-16 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <div className="h-10 w-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />

            <div className="mt-3 h-5 w-80 max-w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </div>

          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <BookCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#F8F6F0] px-4 py-16 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#193B32] dark:text-white">
            My Borrows
          </h1>

          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Manage the books you have borrowed.
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl bg-white p-10 text-center dark:bg-gray-800">
            <p className="text-red-500">{error}</p>

            <button
              onClick={fetchMyBorrows}
              className="mt-5 rounded-full bg-[#193B32] px-6 py-3 text-white"
            >
              Try Again
            </button>
          </div>
        ) : myBooks.length === 0 ? (
          <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm dark:bg-gray-800">
            <BookOpen
              size={55}
              className="mx-auto mb-5 text-[#193B32] dark:text-green-400"
            />

            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              No Borrowed Books
            </h2>

            <p className="mt-3 text-gray-500 dark:text-gray-400">
              You have not borrowed any books yet.
            </p>

            <Link
              href="/books"
              className="mt-7 inline-block rounded-full bg-[#193B32] px-7 py-3 font-semibold text-white hover:bg-[#285747]"
            >
              Explore Books
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <h2 className="text-2xl font-bold text-[#193B32] dark:text-white">
                Your Borrowed Books
              </h2>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as SortOption)
                }
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="default">Default</option>
                <option value="title-asc">Title: A to Z</option>
                <option value="title-desc">Title: Z to A</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedBooks.map((item) => (
                <div
                  key={item.borrowId}
                  className="overflow-hidden rounded-2xl border border-[#193B32]/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                >
                  {item.book.coverImage ? (
                    <img
                      src={item.book.coverImage}
                      alt={item.book.title}
                      className="h-64 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-64 items-center justify-center bg-gray-100 dark:bg-gray-700">
                      <BookOpen
                        size={55}
                        className="text-gray-400"
                      />
                    </div>
                  )}

                  <div className="p-5">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 dark:bg-green-900/40 dark:text-green-300">
                      {item.book.category}
                    </span>

                    <h3 className="mt-4 line-clamp-1 text-xl font-bold text-gray-900 dark:text-white">
                      {item.book.title}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      by {item.book.author}
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <CalendarDays size={16} />

                      <span>
                        Borrowed:{" "}
                        {new Date(item.borrowedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-4">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                        Currently Borrowed
                      </span>
                    </div>

                    <button
                      onClick={() => handleReturn(item.borrowId)}
                      disabled={returningId === item.borrowId}
                      className="mt-5 w-full rounded-full bg-[#193B32] px-5 py-3 font-semibold text-white transition hover:bg-[#285747] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {returningId === item.borrowId
                        ? "Returning..."
                        : "Return Book"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}