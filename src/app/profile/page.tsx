"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  UserRound,
  Mail,
  LogOut,
  Pencil,
  Save,
  X,
} from "lucide-react";

import { useToast } from "@/components/ToastProvider";
import { authClient } from "@/lib/auth-client";

export default function ProfilePage() {
  const router = useRouter();

useEffect(() => {
  document.title = "My Profile | BookNook";
}, []);

  const { showToast } = useToast();

  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;

  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
    }
  }, [user]);

  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast("Name is required.", "error");
      return;
    }

    setSaving(true);

    try {
      const { error } = await authClient.updateUser({
        name: name.trim(),
      });

      if (error) {
        throw new Error(error.message || "Profile update failed.");
      }

      setEditing(false);
      showToast("Profile updated successfully!", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Something went wrong.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setEditing(false);
  };

  const handleLogout = async () => {
    try {
      const { error } = await authClient.signOut();

      if (error) {
        showToast("Logout failed. Please try again.", "error");
        return;
      }

      showToast("Logged out successfully!", "success");
      router.push("/");
      router.refresh();
    } catch {
      showToast("Something went wrong during logout.", "error");
    }
  };

  if (isPending) {
    return (
      <main className="flex flex-1 items-center justify-center bg-[#FAF9F6] dark:bg-gray-950">
        <p className="text-gray-600 dark:text-gray-300">
          Loading profile...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex flex-1 items-center justify-center bg-[#FAF9F6] px-5 dark:bg-gray-950">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Please login to view your profile.
          </p>

          <button
            onClick={() => router.push("/login")}
            className="mt-4 rounded-lg bg-[#193B32] px-5 py-2 text-white"
          >
            Go to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-[#FAF9F6] px-5 py-16 dark:bg-gray-950">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-900">
        {/* Profile Header */}
        <div className="mb-7 flex flex-col items-center">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "Profile"}
              className="h-24 w-24 rounded-full border-4 border-[#C69C45] object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#C69C45] bg-[#193B32] text-4xl font-bold text-white dark:bg-[#C69C45] dark:text-gray-950">
              {user.name?.trim().charAt(0).toUpperCase() || "U"}
            </div>
          )}

          <h1 className="mt-4 text-2xl font-bold text-[#193B32] dark:text-white">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your BookNook account
          </p>
        </div>

        {/* Profile Information */}
        <form onSubmit={handleUpdate} className="space-y-5">
          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
              Full Name
            </label>

            <div className="relative">
              <UserRound
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C69C45]"
              />

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!editing}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-gray-800 outline-none transition focus:border-[#C69C45] disabled:cursor-not-allowed disabled:opacity-80 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Your name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
              Email Address
            </label>

            <div className="relative">
              <Mail
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C69C45]"
              />

              <input
                type="email"
                value={user.email || ""}
                disabled
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-gray-800 outline-none disabled:cursor-not-allowed disabled:opacity-80 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Edit Actions */}
          {editing ? (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#193B32] py-3 font-semibold text-white transition hover:bg-[#285747] disabled:opacity-60 dark:bg-[#C69C45] dark:text-gray-950"
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 py-3 font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#193B32] py-3 font-semibold text-white transition hover:bg-[#285747] dark:bg-[#C69C45] dark:text-gray-950"
            >
              <Pencil size={18} />
              Edit Profile
            </button>
          )}
        </form>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </main>
  );
}