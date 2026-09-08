"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, WalletCards } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>
 ) => {
  e.preventDefault();

  if (loading) return;

  setErrorMessage("");

  if (!email || !password) {
    setErrorMessage("Please enter email and password");
    return;
  }

  setLoading(true);

  try {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      setErrorMessage("Invalid email or password");
      return;
    }

    if (data.session) {
      router.replace("/dashboard");
    }
  } catch (error) {
    console.log("Login error:", error);
    setErrorMessage("Login failed. Please try again.");
  } finally {
    setLoading(false);
  }
 };


  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 px-4 py-10">
      <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/20 bg-white/95 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
            <WalletCards size={28} />
          </div>

          <p className="mb-2 text-sm font-bold tracking-[0.18em] text-blue-600">
            EXPENSEDESK
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Welcome Back
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Login to continue managing your expenses.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4">
         
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 pr-12 text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500 transition hover:text-blue-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mt-2 w-full rounded-xl px-4 py-3.5 font-bold text-white shadow-lg transition duration-200 ${
              loading
                ? "cursor-not-allowed bg-slate-400 opacity-70"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/25 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="mt-3 text-right">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          
          {errorMessage && (
          <p className="mt-3 text-center text-sm font-semibold text-red-600">
          {errorMessage}
          </p>
         )}
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
         Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-bold text-blue-600 transition hover:text-blue-700"
          >
            signup
          </Link>
        </p>
      </div>
    </main>
  );
}