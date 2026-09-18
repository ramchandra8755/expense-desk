"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";

const RECOVERY_KEY = "expenseDeskRecoveryActive";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [recoveryReady, setRecoveryReady] = useState(false);
  const [checkingRecovery, setCheckingRecovery] = useState(true);
  const [resetUsed, setResetUsed] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkRecoverySession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      const recoveryActive =
        sessionStorage.getItem(RECOVERY_KEY) === "true";

      if (session && recoveryActive) {
        setRecoveryReady(true);
      }

      setCheckingRecovery(false);
    }

    checkRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY" && session) {
        sessionStorage.setItem(RECOVERY_KEY, "true");
        setRecoveryReady(true);
        setCheckingRecovery(false);
      }

      if (event === "SIGNED_OUT") {
        setRecoveryReady(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading || resetUsed || !recoveryReady) return;

    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      // Prevent this reset page from being used again
      setResetUsed(true);

      // Remove recovery flag
      sessionStorage.removeItem(RECOVERY_KEY);

      // End the recovery session
      await supabase.auth.signOut({
        scope: "local",
      });

      setPassword("");
      setConfirmPassword("");

      setMessage(
        "Password updated successfully! This reset link can no longer be used."
      );

      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch (error) {
      console.log(error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingRecovery) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="rounded-2xl bg-white px-6 py-5 text-center shadow-2xl">
          <p className="font-semibold text-slate-700">
            Verifying reset link...
          </p>
        </div>
      </main>
    );
  }

  if (!recoveryReady || resetUsed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">

          <h1 className="text-3xl font-black text-slate-900">
            Reset Link Expired
          </h1>

          <p className="mt-3 text-slate-500">
            This password reset link is invalid, expired, or has already
            been used.
          </p>

          <button
            onClick={() => router.replace("/forgot-password")}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            Request New Reset Link
          </button>

          <button
            onClick={() => router.replace("/login")}
            className="mt-4 w-full text-sm font-semibold text-slate-500 hover:text-blue-600"
          >
            ← Back to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-slate-900">
            Reset Password
          </h1>

          <p className="mt-2 text-slate-500">
            Create a new password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* NEW PASSWORD */}
          <label className="font-semibold text-slate-700">
            New Password
          </label>

          <div className="relative mt-2">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
              disabled={resetUsed}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={resetUsed}
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
              disabled={resetUsed}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              disabled={resetUsed}
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
            disabled={loading || resetUsed}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Updating Password..."
              : resetUsed
              ? "Reset Link Used"
              : "Update Password"}
          </button>

        </form>

        {message && (
          <p className="mt-5 text-center text-sm font-medium text-slate-600">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}