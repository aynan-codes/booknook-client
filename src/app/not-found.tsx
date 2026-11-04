import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[75vh] items-center justify-center bg-white px-6 py-16 text-center dark:bg-[#111827]">
      <div className="mx-auto max-w-lg">
        <p className="mb-4 text-8xl font-extrabold tracking-tight text-[#C69C45] sm:text-9xl">
          404
        </p>

        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
          Page Not Found
        </h1>

        <p className="mb-8 text-base leading-7 text-gray-600 dark:text-gray-300">
          Oops! The page you are looking for does not exist or may have been
          moved. Let&apos;s get you back to your bookshelf.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-[#C69C45] px-7 py-3 font-semibold text-white transition hover:bg-[#ad8435] focus:outline-none focus:ring-2 focus:ring-[#C69C45] focus:ring-offset-2 dark:focus:ring-offset-[#111827]"
        >
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}