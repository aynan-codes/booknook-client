"use client";

import { useEffect,useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type ToastType = "loading" | "success" | "error";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
  document.title = "Create Account | BookNook";
}, []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [toast, setToast] = useState<{
    type: ToastType;
    message: string;
  } | null>(null);

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });

    if (type !== "loading") {
      setTimeout(() => {
        setToast(null);
      }, 3000);
    }
  };

  // Normal Registration
  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading || googleLoading) return;

    if (password !== confirmPassword) {
      showToast("error", "Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      showToast("error", "Password must be at least 6 characters!");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      showToast("error", "Password must contain an uppercase letter!");
      return;
    }

    if (!/[a-z]/.test(password)) {
      showToast("error", "Password must contain a lowercase letter!");
      return;
    }

    setLoading(true);
    showToast("loading", "Creating your account...");

    try {
      const { error } = await authClient.signUp.email({
        name,
        email,
        password,
        image: photoUrl.trim() || undefined,
        callbackURL: "/",
      });

      if (error) {
        throw new Error(error.message || "Registration failed!");
      }

      showToast(
        "success",
        "Registration successful! Welcome to BookNook."
      );

      sessionStorage.setItem(
        "loginToast",
        "Registration successful! Welcome to BookNook."
      );

      setTimeout(() => {
        router.push("/");
      }, 1800);
    } catch (error) {
      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Something went wrong!"
      );
    } finally {
      setLoading(false);
    }
  };

  // Google Registration
  const handleGoogleRegister = async () => {
    if (loading || googleLoading) return;

    setGoogleLoading(true);
    showToast("loading", "Connecting to Google...");

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      if (error) {
        throw new Error(error.message || "Google registration failed!");
      }
    } catch (error) {
      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Google registration failed. Please try again."
      );

      setGoogleLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#f8f7f2] px-4 py-12">
      {/* Toast Notification */}
      {toast && (
        <div
          role="alert"
          aria-live="polite"
          className={`fixed right-5 top-5 z-[9999] flex items-center gap-3 rounded-xl px-5 py-4 text-white shadow-2xl ${
            toast.type === "success"
              ? "bg-green-600"
              : toast.type === "loading"
                ? "bg-[#173f35]"
                : "bg-red-600"
          }`}
        >
          <span className="text-xl">
            {toast.type === "success"
              ? "✓"
              : toast.type === "loading"
                ? "⏳"
                : "✕"}
          </span>

          <p className="text-sm font-medium">{toast.message}</p>

          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 text-lg"
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}

      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#173f35]">
            Create Account
          </h1>

          <p className="mt-2 text-gray-500">
            Join BookNook and explore your reading journey.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 outline-none focus:border-[#173f35] focus:ring-2 focus:ring-[#173f35]/20"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 outline-none focus:border-[#173f35] focus:ring-2 focus:ring-[#173f35]/20"
            />
          </div>

          {/* Photo URL */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Photo URL
            </label>

            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 outline-none focus:border-[#173f35] focus:ring-2 focus:ring-[#173f35]/20"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-gray-800 outline-none focus:border-[#173f35] focus:ring-2 focus:ring-[#173f35]/20"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                aria-pressed={showPassword}
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer text-gray-500 transition hover:text-[#173f35]"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-gray-800 outline-none focus:border-[#173f35] focus:ring-2 focus:ring-[#173f35]/20"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((previous) => !previous)
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                aria-pressed={showConfirmPassword}
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer text-gray-500 transition hover:text-[#173f35]"
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full rounded-lg bg-[#173f35] py-3 font-semibold text-white transition hover:bg-[#245b4c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-gray-400">OR</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Google Sign Up */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={loading || googleLoading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {/* Google Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="h-5 w-5 shrink-0"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.9 6.1-15Z"
              />
              <path
                fill="#34A853"
                d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5.1c-1.8 1.2-4.1 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.2A20 20 0 0 0 24 44Z"
              />
              <path
                fill="#FBBC05"
                d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.2H5.8a20 20 0 0 0 0 17.6l6.8-5.2Z"
              />
              <path
                fill="#EA4335"
                d="M24 12.1c3 0 5.7 1 7.8 3.1l5.8-5.8A19.4 19.4 0 0 0 24 4 20 20 0 0 0 5.8 15.2l6.8 5.2c1.6-4.8 6.1-8.3 11.4-8.3Z"
              />
            </svg>

            <span>
              {googleLoading
                ? "Connecting to Google..."
                : "Sign up with Google"}
            </span>
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#173f35] hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}