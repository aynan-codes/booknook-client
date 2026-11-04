"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import { BookPlus, CheckCircle, XCircle, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { apiUrl } from "@/lib/api";

type ToastType = "success" | "error";

export default function AddBookPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    document.title = "Add Book | BookNook";
  }, []);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "Fiction",
    isbn: "",
    description: "",
    coverImage: "",
    copies: 1,
    rating: 4.8,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3500);
  };

  // Upload the selected cover image file to ImgBB and store the URL.
  const handleCoverUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    // Reset the input so the same file can be re-selected if needed.
    e.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file.", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be 5 MB or smaller.", "error");
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

    if (!apiKey) {
      showToast("Image upload is not configured.", "error");
      return;
    }

    try {
      setUploadingImage(true);

      const body = new FormData();
      body.append("image", file);

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${apiKey}`,
        {
          method: "POST",
          body,
        }
      );

      const result = await response.json();

      const uploadedUrl: string | undefined =
        result?.data?.display_url || result?.data?.url;

      if (!response.ok || !uploadedUrl) {
        throw new Error(
          result?.error?.message || "Image upload failed. Please try again."
        );
      }

      setFormData((prev) => ({
        ...prev,
        coverImage: uploadedUrl,
      }));

      showToast("Image uploaded successfully!", "success");
    } catch (error) {
      console.error("Image upload error:", error);

      showToast(
        error instanceof Error
          ? error.message
          : "Image upload failed. Please try again.",
        "error"
      );
    } finally {
      setUploadingImage(false);
    }
  };

  // Redirect only after Better Auth finishes checking the session.
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace(
        `/login?callbackURL=${encodeURIComponent("/add-book")}`
      );
    }
  }, [isPending, session, router]);

  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "copies" || name === "rating"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isPending) {
      showToast("Please wait, checking authentication...", "error");
      return;
    }

    if (!session?.user) {
      showToast("Your session has expired. Please login again.", "error");
      router.push(
        `/login?callbackURL=${encodeURIComponent("/add-book")}`
      );
      return;
    }

    if (
      !formData.title.trim() ||
      !formData.author.trim() ||
      !formData.description.trim()
    ) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    if (!Number.isInteger(formData.copies) || formData.copies < 1) {
      showToast("Copies must be at least 1.", "error");
      return;
    }

    if (formData.rating < 0 || formData.rating > 5) {
      showToast("Rating must be between 0 and 5.", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(apiUrl("/api/books"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to add book.");
      }

      sessionStorage.setItem(
        "booknook-toast",
        JSON.stringify({
          message: "Book added successfully!",
          type: "success",
        })
      );

      router.push("/my-books");
    } catch (error) {
      console.error("Add book error:", error);

      showToast(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPending) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-[#F8F6F0] dark:bg-gray-950">
        <p className="text-gray-600 dark:text-gray-300">
          Checking authentication...
        </p>
      </section>
    );
  }

  if (!session?.user) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-[#F8F6F0] dark:bg-gray-950">
        <p className="text-gray-600 dark:text-gray-300">
          Redirecting to login...
        </p>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#F8F6F0] px-4 py-16 dark:bg-gray-950">
      {toast && (
        <div
          role="alert"
          className={`fixed right-5 top-5 z-50 flex max-w-sm items-center gap-3 rounded-xl px-5 py-4 text-white shadow-xl ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle size={22} />
          ) : (
            <XCircle size={22} />
          )}

          <p className="flex-1 text-sm font-medium">{toast.message}</p>

          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Close notification"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#193B32] text-[#D5B77B]">
            <BookPlus size={30} />
          </div>

          <h1 className="font-serif text-4xl font-bold text-[#193B32] dark:text-white">
            Add a New Book
          </h1>

          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Add a new book to your collection.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl bg-white p-6 shadow-lg dark:bg-gray-900 md:p-10"
        >
          <div>
            <label
              htmlFor="title"
              className="mb-2 block font-medium dark:text-white"
            >
              Book Title
            </label>

            <input
              id="title"
              required
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter book title"
              className="w-full rounded-xl border p-3 outline-none focus:border-[#193B32] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="author"
              className="mb-2 block font-medium dark:text-white"
            >
              Author
            </label>

            <input
              id="author"
              required
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="Enter author name"
              className="w-full rounded-xl border p-3 outline-none focus:border-[#193B32] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="category"
                className="mb-2 block font-medium dark:text-white"
              >
                Category
              </label>

              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-xl border p-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option>Fiction</option>
                <option>Science</option>
                <option>History</option>
                <option>Kids</option>
                <option>Others</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="isbn"
                className="mb-2 block font-medium dark:text-white"
              >
                ISBN
              </label>

              <input
                id="isbn"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                placeholder="Enter ISBN"
                className="w-full rounded-xl border p-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="rating"
              className="mb-2 block font-medium dark:text-white"
            >
              Rating (0–5)
            </label>

            <input
              id="rating"
              required
              type="number"
              name="rating"
              min="0"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={handleChange}
              className="w-full rounded-xl border p-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Cover Image Upload */}
          <div>
            <label
              htmlFor="coverImageFile"
              className="mb-2 block font-medium dark:text-white"
            >
              Cover Image
            </label>

            <input
              id="coverImageFile"
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              disabled={uploadingImage}
              className="w-full cursor-pointer rounded-xl border p-3 text-sm text-gray-600 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#193B32] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white dark:file:bg-[#C69C45] dark:file:text-gray-950"
            />

            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              JPG, PNG, WEBP up to 5 MB — or paste a URL below.
            </p>

            {uploadingImage && (
              <p className="mt-2 text-sm font-medium text-[#193B32] dark:text-[#D5B77B]">
                Uploading image...
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="coverImage"
              className="mb-2 block font-medium dark:text-white"
            >
              Cover Image URL
            </label>

            <input
              id="coverImage"
              name="coverImage"
              type="url"
              value={formData.coverImage}
              onChange={handleChange}
              placeholder="https://example.com/book.jpg"
              className="w-full rounded-xl border p-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block font-medium dark:text-white"
            >
              Description
            </label>

            <textarea
              id="description"
              required
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Write a short description..."
              className="w-full rounded-xl border p-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="copies"
              className="mb-2 block font-medium dark:text-white"
            >
              Available Copies
            </label>

            <input
              id="copies"
              required
              type="number"
              min="1"
              step="1"
              name="copies"
              value={formData.copies}
              onChange={handleChange}
              className="w-full rounded-xl border p-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isPending || uploadingImage}
            className="w-full rounded-full bg-[#193B32] px-6 py-4 font-semibold text-white transition hover:bg-[#285748] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#C69C45] dark:text-gray-950"
          >
            {isSubmitting
              ? "Adding Book..."
              : uploadingImage
                ? "Uploading Image..."
                : "Add Book"}
          </button>
        </form>
      </div>
    </section>
  );
}
