"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  Pencil,
  AlertTriangle,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import BookCardSkeleton from "@/components/BookCardSkeleton";
import { apiUrl } from "@/lib/api";

type MyBook = {
  id: number;
  title: string;
  author: string;
  category: string;
  description: string;
  coverImage: string;
  copies: number;
  isbn: string;
  rating: number;
};

type ToastType = "success" | "error";

type BookForm = {
  title: string;
  author: string;
  category: string;
  description: string;
  coverImage: string;
  copies: number;
  isbn: string;
  rating: number;
};

const API_URL = apiUrl("/api/books");

const initialForm: BookForm = {
  title: "",
  author: "",
  category: "Fiction",
  description: "",
  coverImage: "",
  copies: 1,
  isbn: "",
  rating: 0,
};

export default function MyBooksPage() {
  const router = useRouter();

  useEffect(() => {
  document.title = "My Books | BookNook";
}, []);

  const { data: session, isPending } = authClient.useSession();

  const [myBooks, setMyBooks] = useState<MyBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MyBook | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<BookForm>(initialForm);

  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace(
        `/login?callbackURL=${encodeURIComponent("/my-books")}`
      );
      return;
    }

    const savedToast = sessionStorage.getItem("booknook-toast");

    if (savedToast) {
      try {
        const parsed = JSON.parse(savedToast);

        if (
          parsed.message &&
          (parsed.type === "success" || parsed.type === "error")
        ) {
          setToast(parsed);
          window.setTimeout(() => setToast(null), 3500);
        }
      } catch {
        // Ignore invalid toast data.
      }

      sessionStorage.removeItem("booknook-toast");
    }

    const fetchMyBooks = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/my-books`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load your books.");
        }

        setMyBooks(result.data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyBooks();
  }, [session, isPending, router]);

  const openEditModal = (book: MyBook) => {
    setForm({
      title: book.title,
      author: book.author,
      category: book.category,
      description: book.description,
      coverImage: book.coverImage,
      copies: book.copies,
      isbn: book.isbn,
      rating: book.rating,
    });

    setEditingId(book.id);
  };

  const handleFormChange = (
    field: keyof BookForm,
    value: string | number
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateBook = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editingId) return;

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/${editingId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          copies: Number(form.copies),
          rating: Number(form.rating),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update book.");
      }

      setMyBooks((previous) =>
        previous.map((book) =>
          book.id === editingId
            ? { ...book, ...form }
            : book
        )
      );

      setEditingId(null);
      setForm(initialForm);
      showToast("Book updated successfully!", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to update book.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (book: MyBook) => {
    setDeleteTarget(book);
  };

  const confirmDeleteBook = async () => {
    if (!deleteTarget) return;

    const id = deleteTarget.id;

    try {
      setDeletingId(id);

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete book.");
      }

      setMyBooks((previous) =>
        previous.filter((book) => book.id !== id)
      );

      setDeleteTarget(null);
      showToast("Book deleted successfully!", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to delete book.",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (isPending || (!session?.user && loading)) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-[#F8F6F0] dark:bg-gray-950">
        <p className="text-gray-600 dark:text-gray-300">
          Checking your session...
        </p>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#F8F6F0] px-4 py-16 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl">
        {toast && (
          <div className="fixed right-5 top-5 z-[100] flex items-center gap-3 rounded-xl bg-white p-4 shadow-xl dark:bg-gray-800">
            {toast.type === "success" ? (
              <CheckCircle className="text-green-500" />
            ) : (
              <XCircle className="text-red-500" />
            )}

            <p className="text-sm text-gray-800 dark:text-white">
              {toast.message}
            </p>

            <button onClick={() => setToast(null)}>
              <X size={18} />
            </button>
          </div>
        )}

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#193B32] dark:text-white">
            My Books
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Manage books you have added to BookNook.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <BookCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-white p-10 text-center dark:bg-gray-800">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
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
              No Books Added Yet
            </h2>

            <p className="mt-3 text-gray-500 dark:text-gray-400">
              You have not added any books yet.
            </p>

            <Link
              href="/add-book"
              className="mt-7 inline-block rounded-full bg-[#193B32] px-7 py-3 font-semibold text-white hover:bg-[#285747]"
            >
              Add Your First Book
            </Link>
          </div>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {myBooks.map((book) => (
              <div
                key={book.id}
                className="overflow-hidden rounded-2xl border border-[#193B32]/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
              >
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="h-64 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center bg-gray-100 dark:bg-gray-700">
                    <BookOpen size={55} className="text-gray-400" />
                  </div>
                )}

                <div className="p-5">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 dark:bg-green-900/40 dark:text-green-300">
                    {book.category}
                  </span>

                  <h2 className="mt-4 line-clamp-1 text-xl font-bold text-gray-900 dark:text-white">
                    {book.title}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    by {book.author}
                  </p>

                  <div className="mt-4 flex justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>Copies: {book.copies}</span>
                    <span>Rating: {book.rating}/5</span>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => openEditModal(book)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#193B32] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#285747]"
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      onClick={() => openDeleteModal(book)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-full border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                    >
                      <Trash2 size={15} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-7 dark:bg-gray-800">
            <AlertTriangle
              size={45}
              className="mx-auto mb-4 text-red-500"
            />

            <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
              Delete Book?
            </h2>

            <p className="mt-3 text-center text-gray-600 dark:text-gray-300">
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.title}</strong>?
            </p>

            <div className="mt-7 flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deletingId !== null}
                className="flex-1 rounded-full border px-5 py-3 dark:border-gray-600 dark:text-white"
              >
                Cancel
              </button>

              <button
                onClick={confirmDeleteBook}
                disabled={deletingId !== null}
                className="flex-1 rounded-full bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deletingId !== null ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {editingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-8">
          <div className="my-auto w-full max-w-2xl rounded-2xl bg-white p-6 dark:bg-gray-800">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Edit Book
              </h2>

              <button
                onClick={() => setEditingId(null)}
                className="text-gray-500 hover:text-red-500"
              >
                <X />
              </button>
            </div>

            <form onSubmit={updateBook} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  required
                  value={form.title}
                  onChange={(e) =>
                    handleFormChange("title", e.target.value)
                  }
                  placeholder="Book Title"
                  className="rounded-xl border p-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />

                <input
                  required
                  value={form.author}
                  onChange={(e) =>
                    handleFormChange("author", e.target.value)
                  }
                  placeholder="Author"
                  className="rounded-xl border p-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />

                <select
                  value={form.category}
                  onChange={(e) =>
                    handleFormChange("category", e.target.value)
                  }
                  className="rounded-xl border p-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {["Fiction", "Science", "History", "Kids", "Others"].map(
                    (category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    )
                  )}
                </select>

                <input
                  value={form.isbn}
                  onChange={(e) =>
                    handleFormChange("isbn", e.target.value)
                  }
                  placeholder="ISBN"
                  className="rounded-xl border p-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />

                <input
                  type="url"
                  value={form.coverImage}
                  onChange={(e) =>
                    handleFormChange("coverImage", e.target.value)
                  }
                  placeholder="Cover Image URL"
                  className="rounded-xl border p-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />

                <input
                  type="number"
                  min="0"
                  value={form.copies}
                  onChange={(e) =>
                    handleFormChange("copies", Number(e.target.value))
                  }
                  placeholder="Available Copies"
                  className="rounded-xl border p-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />

                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={form.rating}
                  onChange={(e) =>
                    handleFormChange("rating", Number(e.target.value))
                  }
                  placeholder="Rating"
                  className="rounded-xl border p-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) =>
                  handleFormChange("description", e.target.value)
                }
                placeholder="Description"
                className="w-full rounded-xl border p-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="flex-1 rounded-full border px-5 py-3 dark:border-gray-600 dark:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-full bg-[#193B32] px-5 py-3 font-semibold text-white hover:bg-[#285747] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}