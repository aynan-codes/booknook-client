"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useToast } from "@/components/ToastProvider";
import { authClient } from "@/lib/auth-client";
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

type PageProps = {
  params: Promise<{ id: string }>;
};

type Borrow = {
  bookId: number;
  status: string;
};

export default function BookDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { data: session, isPending } = authClient.useSession();

  const [id, setId] = useState<number | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [alreadyBorrowed, setAlreadyBorrowed] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);

  // Browser tab title
  useEffect(() => {
    document.title = "Book Details | BookNook";
  }, []);

  // Get book ID from route params
  useEffect(() => {
    let active = true;

    params.then((resolvedParams) => {
      if (!active) return;

      const bookId = Number(resolvedParams.id);

      if (!Number.isInteger(bookId) || bookId <= 0) {
        setId(null);
        setLoading(false);
        return;
      }

      setId(bookId);
    });

    return () => {
      active = false;
    };
  }, [params]);

  // Fetch book from MongoDB
  const fetchBook = async (bookId: number) => {
    try {
      const response = await fetch(apiUrl(`/api/books/${bookId}`), {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setBook(null);
        return;
      }

      setBook(result.data);
      setImageError(false);
    } catch (error) {
      console.error("Book fetching error:", error);
      setBook(null);
    } finally {
      setLoading(false);
    }
  };

  // Check whether current user has already borrowed this book
  const checkBorrowStatus = async (bookId: number) => {
    try {
      const response = await fetch(apiUrl("/api/books/my-borrows"), {
        credentials: "include",
        cache: "no-store",
      });

      // Do not redirect to login because the Better Auth
      // session is already checked on the frontend.
      if (response.status === 401) {
        setAlreadyBorrowed(false);
        return;
      }

      const result = await response.json();

      if (response.ok && result.success) {
        const found = result.data.some(
          (borrow: Borrow) =>
            borrow.bookId === bookId && borrow.status === "borrowed"
        );

        setAlreadyBorrowed(found);
      }
    } catch (error) {
      console.error("Borrow status error:", error);
    }
  };

  // Load book after Better Auth session check
  useEffect(() => {
    if (isPending || id === null) {
      return;
    }

    if (!session?.user) {
      router.replace(
        `/login?callbackURL=${encodeURIComponent(`/books/${id}`)}`
      );
      return;
    }

    let active = true;

    const loadPage = async () => {
      setLoading(true);

      await Promise.all([fetchBook(id), checkBorrowStatus(id)]);

      if (!active) return;
    };

    void loadPage();

    return () => {
      active = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, session, isPending, router]);

  // Borrow book
  const handleBorrow = async () => {
    if (!session?.user) {
      router.push(
        `/login?callbackURL=${encodeURIComponent(`/books/${id}`)}`
      );
      return;
    }

    if (!book || book.copies <= 0 || alreadyBorrowed || !id) {
      return;
    }

    try {
      setBorrowing(true);

      const response = await fetch(apiUrl(`/api/books/${id}/borrow`), {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        showToast(
          result.message || "Failed to borrow this book.",
          "error"
        );

        await fetchBook(id);
        await checkBorrowStatus(id);
        return;
      }

      setAlreadyBorrowed(true);

      showToast(
        result.message || "Book borrowed successfully!",
        "success"
      );

      await fetchBook(id);
    } catch (error) {
      console.error("Borrow error:", error);

      showToast(
        "Something went wrong. Please try again.",
        "error"
      );
    } finally {
      setBorrowing(false);
    }
  };

  // Loading skeleton
  if (isPending || loading || id === null) {
    return (
      <main className="min-h-screen animate-pulse bg-[#FAF9F6] px-6 py-12 dark:bg-gray-950">
        <section className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
          <div className="flex h-[480px] items-center justify-center rounded-[2rem] bg-gray-200 dark:bg-gray-800 md:h-[580px]">
            <div className="h-[340px] w-56 rounded-2xl bg-gray-300 dark:bg-gray-700 md:h-[400px] md:w-64" />
          </div>

          <div className="space-y-6">
            <div className="h-8 w-28 rounded-full bg-gray-200 dark:bg-gray-800" />
            <div className="h-12 w-3/4 rounded-lg bg-gray-200 dark:bg-gray-800" />
            <div className="h-5 w-1/2 rounded-lg bg-gray-200 dark:bg-gray-800" />
            <div className="h-5 w-24 rounded-lg bg-gray-200 dark:bg-gray-800" />

            <div className="space-y-3 border-y border-gray-200 py-8 dark:border-gray-800">
              <div className="h-7 w-1/2 rounded-lg bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-full rounded-lg bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-full rounded-lg bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-3/4 rounded-lg bg-gray-200 dark:bg-gray-800" />
            </div>

            <div className="h-32 rounded-2xl bg-gray-200 dark:bg-gray-800" />
            <div className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-800" />
            <div className="h-12 rounded-full bg-gray-200 dark:bg-gray-800" />
          </div>
        </section>
      </main>
    );
  }

  // Book not found
  if (!book) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6] px-6 dark:bg-gray-950">
        <div className="text-center">
          <h1 className="font-serif text-4xl font-semibold text-[#193B32] dark:text-white">
            Book Not Found
          </h1>

          <p className="mt-4 text-[#64736B] dark:text-gray-400">
            Sorry, we could not find this book.
          </p>

          <Link
            href="/books"
            className="mt-7 inline-block rounded-full bg-[#193B32] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:scale-105 hover:bg-[#285748]"
          >
            Back to All Books
          </Link>
        </div>
      </main>
    );
  }

  // Book creator information
  const addedByName = book.addedByName || "Abu Baten";
  const addedByEmail = book.addedByEmail || "sayeem388@gmail.com";

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[#193B32] dark:bg-gray-950 dark:text-white">
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-12 md:grid-cols-2 md:py-20">
        {/* Book Cover */}
        <div className="flex h-[480px] items-center justify-center overflow-hidden rounded-[2rem] border border-[#193B32]/10 bg-[#D9C8B5] p-8 shadow-sm dark:border-gray-700 md:h-[580px]">
          {book.coverImage && !imageError ? (
            <div className="overflow-hidden rounded-2xl border-2 border-[#193B32]/20 shadow-2xl dark:border-[#D5B77B]/40">
              <img
                src={book.coverImage}
                alt={`Cover of ${book.title}`}
                onError={() => setImageError(true)}
                className="block h-auto max-h-[480px] w-auto max-w-full object-contain transition-transform duration-500 hover:scale-105"
              />
            </div>
          ) : (
            <div className="flex h-[340px] w-56 flex-col justify-between overflow-hidden rounded-2xl border-2 border-[#D5B77B]/40 bg-[#193B32] p-7 text-center text-white shadow-2xl md:h-[400px] md:w-64">
              <span className="text-xs tracking-[0.3em] text-[#D5B77B]">
                BOOKNOOK COLLECTION
              </span>

              <span className="font-serif text-3xl font-semibold">
                {book.title}
              </span>

              <span className="text-sm tracking-wider">
                {book.author}
              </span>
            </div>
          )}
        </div>

        {/* Book Information */}
        <div>
          <span className="inline-block rounded-full bg-[#E9EDE7] px-4 py-2 text-xs font-bold text-[#416653] dark:bg-gray-800 dark:text-[#D5B77B]">
            {book.category}
          </span>

          <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight md:text-6xl">
            {book.title}
          </h1>

          <p className="mt-5 text-lg text-[#64736B] dark:text-gray-400">
            By{" "}
            <span className="font-semibold text-[#193B32] dark:text-white">
              {book.author}
            </span>
          </p>

          {/* Rating */}
          <div className="mt-5 flex items-center gap-2">
            <span className="text-xl text-[#C69C45]">★</span>

            <span className="font-semibold">
              {Number(book.rating || 0).toFixed(1)}
            </span>

            <span className="text-sm text-[#64736B] dark:text-gray-400">
              / 5.0
            </span>
          </div>

          {/* Description */}
          <div className="mt-9 border-y border-[#193B32]/10 py-7 dark:border-gray-700">
            <h2 className="font-serif text-2xl font-semibold">
              About This Book
            </h2>

            <p className="mt-4 text-base leading-8 text-[#64736B] dark:text-gray-400">
              {book.description}
            </p>
          </div>

          {/* Added By Information */}
          <div className="mt-7 rounded-2xl border border-[#193B32]/10 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h2 className="font-serif text-xl font-semibold">
              Book Added By
            </h2>

            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#64736B] dark:text-gray-400">
                  Added By
                </p>

                <p className="mt-1 font-semibold text-[#193B32] dark:text-white">
                  {addedByName}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#64736B] dark:text-gray-400">
                  Email
                </p>

                <p className="mt-1 break-all text-sm text-[#64736B] dark:text-gray-300">
                  {addedByEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Available Copies */}
          <div className="mt-7 flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900">
            <div>
              <p className="text-sm text-[#64736B] dark:text-gray-400">
                Available Copies
              </p>

              <p className="mt-2 text-3xl font-bold">
                {book.copies}
              </p>

              <p className="mt-1 text-xs text-[#64736B] dark:text-gray-400">
                Copies Left
              </p>
            </div>

            <span
              className={`rounded-full px-4 py-2 text-xs font-bold ${
                book.copies > 0
                  ? "bg-[#E9EDE7] text-[#416653]"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {book.copies > 0 ? "Available" : "Not Available"}
            </span>
          </div>

          {/* Borrow Button */}
          <button
            type="button"
            onClick={() => setShowBorrowModal(true)}
            disabled={
              book.copies <= 0 ||
              borrowing ||
              alreadyBorrowed
            }
            className="mt-6 w-full rounded-full bg-[#193B32] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:bg-[#285748] hover:shadow-md disabled:cursor-not-allowed disabled:bg-gray-400 dark:bg-[#C69C45] dark:text-gray-950 dark:hover:bg-[#D5B77B]"
          >
            {borrowing
              ? "Borrowing..."
              : alreadyBorrowed
                ? "Already Borrowed ✓"
                : book.copies > 0
                  ? "Borrow This Book →"
                  : "Currently Unavailable"}
          </button>

          <p className="mt-4 text-center text-xs text-[#64736B] dark:text-gray-400">
            Become a member to explore our library.
          </p>

          {/* Back to All Books */}
          <Link
            href="/books"
            className="mt-3 flex w-full items-center justify-center rounded-full border border-[#193B32] px-6 py-3 text-sm font-semibold text-[#193B32] transition-all duration-300 hover:scale-[1.02] hover:bg-[#193B32] hover:text-white dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
          >
            ← Back to All Books
          </Link>
        </div>
      </section>

      {/* Borrow Confirmation Modal */}
      {showBorrowModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl dark:bg-gray-900">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E9EDE7] text-[#416653] dark:bg-gray-800 dark:text-[#D5B77B]">
              📚
            </div>

            <h2 className="text-center text-2xl font-bold text-[#193B32] dark:text-white">
              Borrow This Book?
            </h2>

            <p className="mt-3 text-center text-[#64736B] dark:text-gray-300">
              Are you sure you want to borrow{" "}
              <strong>{book.title}</strong>?
            </p>

            <p className="mt-2 text-center text-xs text-[#64736B] dark:text-gray-400">
              Copies will decrease by 1 after confirmation.
            </p>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={() => setShowBorrowModal(false)}
                disabled={borrowing}
                className="flex-1 rounded-full border border-[#193B32] px-5 py-3 text-sm font-semibold text-[#193B32] transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowBorrowModal(false);
                  handleBorrow();
                }}
                disabled={borrowing}
                className="flex-1 rounded-full bg-[#193B32] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#285748] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#C69C45] dark:text-gray-950 dark:hover:bg-[#D5B77B]"
              >
                {borrowing ? "Borrowing..." : "Confirm Borrow"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}