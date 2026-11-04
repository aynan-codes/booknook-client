"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  UserRound,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const [dark, setDark] = useState(false);
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const router = useRouter();
  const { showToast } = useToast();

  const { data: session, isPending } = authClient.useSession();

  const user = session?.user ?? null;
  const authChecked = !isPending;

  // Load saved theme.
  useEffect(() => {
    const savedTheme = localStorage.getItem("booknook-theme");

    const isDark = savedTheme === "dark";

    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);

    setThemeLoaded(true);
  }, []);

  // Apply theme whenever it changes.
  useEffect(() => {
    if (!themeLoaded) return;

    document.documentElement.classList.toggle("dark", dark);

    localStorage.setItem(
      "booknook-theme",
      dark ? "dark" : "light"
    );
  }, [dark, themeLoaded]);

  // Reset avatar error when the user's photo changes.
  useEffect(() => {
    setAvatarError(false);
  }, [user?.image]);

  const toggleTheme = () => {
    setDark((prev) => !prev);
  };

  const publicLinks = [
    { name: "Home", href: "/" },
    { name: "All Books", href: "/books" },
  ];

  const privateLinks = [
    { name: "Add Book", href: "/add-book" },
    { name: "My Books", href: "/my-books" },
    { name: "My Borrows", href: "/my-borrows" },
  ];

  const navLinks = user
    ? [...publicLinks, ...privateLinks]
    : publicLinks;

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      const { error } = await authClient.signOut();

      if (error) {
        showToast("Logout failed. Please try again.", "error");
        return;
      }

      closeMenus();

      showToast("Logged out successfully!", "success");

      router.push("/");
      router.refresh();
    } catch {
      showToast("Something went wrong during logout.", "error");
    }
  };

  const getInitial = () => {
    return user?.name?.trim().charAt(0).toUpperCase() || "U";
  };

  // Reusable theme button.
  const ThemeButton = ({ mobile = false }: { mobile?: boolean }) => (
    <button
      type="button"
      onClick={toggleTheme}
      className={`flex items-center justify-center rounded-full border transition-all duration-300 hover:scale-105 ${
        mobile ? "p-2" : "p-2.5"
      } border-gray-300 bg-white text-[#193B32] hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-[#F5C96A] dark:hover:bg-gray-700`}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? (
        <Sun size={20} />
      ) : (
        <Moon size={20} />
      )}
    </button>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-[#FAF9F6]/95 backdrop-blur-md dark:border-gray-700 dark:bg-gray-950/95">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenus}
          className="text-2xl font-bold text-[#193B32] dark:text-white"
        >
          Book<span className="text-[#C69C45]">Nook</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 lg:flex">
          {authChecked &&
            navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-medium text-gray-700 transition hover:text-[#C69C45] dark:text-gray-200"
              >
                {link.name}
              </Link>
            ))}
        </div>

        {/* Desktop Right Buttons */}
        <div className="hidden items-center gap-3 lg:flex">
          <ThemeButton />

          {authChecked && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[#C69C45] bg-[#193B32] text-sm font-bold text-white shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md dark:bg-[#C69C45] dark:text-gray-950"
                aria-label="Open profile menu"
                aria-expanded={profileMenuOpen}
              >
                {user?.image && !avatarError ? (
                  <img
                    src={user.image}
                    alt={user.name || "Account"}
                    onError={() => setAvatarError(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitial()
                )}
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-3 w-52 rounded-xl border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                  <Link
                    href="/profile"
                    onClick={closeMenus}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 transition hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"
                  >
                    <UserRound size={18} />
                    My Profile
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-red-600 transition hover:bg-red-50 dark:hover:bg-gray-800"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            authChecked && (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-4 py-2 font-medium text-[#193B32] transition hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="rounded-lg bg-[#193B32] px-5 py-2 font-medium text-white transition hover:bg-[#285747] dark:bg-[#C69C45] dark:text-gray-950"
                >
                  Register
                </Link>
              </>
            )
          )}
        </div>

        {/* Mobile Buttons */}
        <div className="flex items-center gap-3 lg:hidden">
          <ThemeButton mobile />

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="rounded-lg p-2 text-[#193B32] transition hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X size={26} />
            ) : (
              <Menu size={26} />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-[#FAF9F6] px-5 py-5 dark:border-gray-700 dark:bg-gray-950 lg:hidden">
          <div className="flex flex-col gap-1">
            {authChecked &&
              navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenus}
                  className="rounded-lg px-4 py-3 font-medium text-gray-700 transition hover:bg-[#193B32] hover:text-white dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  {link.name}
                </Link>
              ))}
          </div>

          {authChecked && (
            <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
              {user ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 px-4 py-2">
                    <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[#C69C45] bg-[#193B32] text-sm font-bold text-white dark:bg-[#C69C45] dark:text-gray-950">
                      {user?.image && !avatarError ? (
                        <img
                          src={user.image}
                          alt={user.name || "Account"}
                          onError={() => setAvatarError(true)}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        getInitial()
                      )}
                    </span>

                    <span className="font-medium text-gray-700 dark:text-white">
                      {user.name || "My Account"}
                    </span>
                  </div>

                  <Link
                    href="/profile"
                    onClick={closeMenus}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"
                  >
                    <UserRound size={20} />
                    My Profile
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-left font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-gray-800"
                  >
                    <LogOut size={20} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/login"
                    onClick={closeMenus}
                    className="rounded-lg border border-[#193B32] py-3 text-center font-semibold text-[#193B32] transition hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    onClick={closeMenus}
                    className="rounded-lg bg-[#193B32] py-3 text-center font-semibold text-white transition hover:bg-[#285747] dark:bg-[#C69C45] dark:text-gray-950"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}