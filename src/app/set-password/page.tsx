"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LockKeyhole, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

export default function SetPasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    document.title = "Set Password | BookNook";
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password.length < 6) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    try {
      setLoading(true);

      const baseURL =
        process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
        "http://localhost:3000";

      const response = await fetch(
        `${baseURL}/api/auth/set-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            newPassword: password,
          }),
        }
      );

      const responseText = await response.text();

      console.log("Set Password Status:", response.status);
      console.log("Set Password Response:", responseText);

      if (!responseText.trim()) {
        throw new Error(
          `Server returned an empty response. Status: ${response.status}`
        );
      }

      let result: { status?: boolean; message?: string };

      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error("Server returned an invalid response.");
      }

      if (!response.ok || result.status !== true) {
        throw new Error(
          result.message || "Failed to set password."
        );
      }

      showToast("Password set successfully!", "success");

      setPassword("");
      setConfirmPassword("");

      router.push("/profile");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Something went wrong.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F6F0] px-4 py-16 dark:bg-gray-950">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-900 sm:p-10">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-[#193B32] p-4 text-white dark:bg-[#C69C45] dark:text-gray-950">
            <LockKeyhole size={30} />
          </div>
        </div>

        <h1 className="text-center font-serif text-3xl font-bold text-[#193B32] dark:text-white">
          Set Your Password
        </h1>

        <p className="mt-3 text-center text-sm leading-6 text-gray-500 dark:text-gray-400">
          Create a password for your Google account so you can
          also log in using your email and password.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-[#193B32] dark:text-white"
            >
              New Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
                className="w-full rounded-xl border border-gray-200 bg-[#FAF9F6] px-4 py-3 pr-12 text-[#193B32] outline-none transition focus:border-[#C69C45] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-semibold text-[#193B32] dark:text-white"
            >
              Confirm Password
            </label>

            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
                className="w-full rounded-xl border border-gray-200 bg-[#FAF9F6] px-4 py-3 pr-12 text-[#193B32] outline-none transition focus:border-[#C69C45] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#193B32] py-3.5 font-semibold text-white transition hover:bg-[#285748] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#C69C45] dark:text-gray-950"
          >
            {loading ? "Setting Password..." : "Set Password"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <Link
            href="/"
            className="font-semibold text-[#B18A54] hover:underline"
          >
            Back to Home
          </Link>
        </p>
      </div>
    </main>
  );
}