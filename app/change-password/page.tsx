"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleChangePassword(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (loading) return;

    setMessage("");

    if (!currentPassword) {
      setMessage("Please enter your current password.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Get current logged-in user's email
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user?.email) {
        setMessage("Unable to verify your account.");
        return;
      }

      // Verify current password
      const { error: verifyError } =
        await supabase.auth.signInWithPassword({
          email: userData.user.email,
          password: currentPassword,
        });

      if (verifyError) {
        setMessage("Current password is incorrect.");
        return;
      }

      // Update to new password
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("Password changed successfully!");

      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    } catch (error) {
      console.log(error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-slate-900">
            Change Password
          </h1>

          <p className="mt-2 text-slate-500">
            Create a new password for your account.
          </p>
        </div>

        <form onSubmit={handleChangePassword}>

          {/* CURRENT PASSWORD */}
          <label className="font-semibold text-slate-700">
            Current Password
          </label>

          <div className="relative mt-2">
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="button"
              onClick={() =>
                setShowCurrentPassword(!showCurrentPassword)
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
            >
              {showCurrentPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* NEW PASSWORD */}
          <label className="mt-5 block font-semibold text-slate-700">
            New Password
          </label>

          <div className="relative mt-2">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* CONFIRM PASSWORD */}
          <label className="mt-5 block font-semibold text-slate-700">
            Confirm New Password
          </label>

          <div className="relative mt-2">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* UPDATE BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Updating Password..." : "Update Password"}
          </button>

        </form>

        {message && (
          <p className="mt-5 text-center text-sm font-medium text-slate-600">
            {message}
          </p>
        )}

        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 w-full text-sm font-semibold text-slate-500 hover:text-blue-600"
        >
          ← Back to Dashboard
        </button>
      </div>
    </main>
  );
}