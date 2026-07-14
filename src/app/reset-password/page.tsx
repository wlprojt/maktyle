"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Gift,
  Loader2,
  LockKeyhole,
  CheckCircle2,
} from "lucide-react";

export default function ResetPasswordPage() {
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
  }

  return (
    <main className="min-h-screen bg-[#faf9fc] flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-lg rounded-[32px] bg-white border border-slate-100 p-8 shadow-[0_24px_80px_rgba(63,41,92,0.10)]">

        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-100">
            <Gift size={40} className="text-purple-600" />
          </div>
        </div>

        <h1 className="mt-6 text-center text-[#111827] text-4xl font-extrabold">
          Reset Password
        </h1>

        <p className="mt-3 text-center text-slate-500">
          Choose a new password for your Maktyle account.
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5">
            <div className="flex items-center gap-3 text-green-700">
              <CheckCircle2 size={24} />
              <span className="font-semibold">
                Password updated successfully!
              </span>
            </div>

            <Link
              href="/login"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700"
            >
              Go to Login
              <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {!success && (
          <form onSubmit={handleReset} className="mt-8 space-y-6">

            {/* Password */}
            <div>
              <label className="mb-2 block text-slate-800 font-semibold">
                New Password
              </label>

              <div className="relative">

                <LockKeyhole
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  autoComplete="new-password"
                  className="h-16 w-full rounded-xl text-slate-900 border border-slate-200 pl-12 pr-12 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600"
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
              <label className="mb-2 block text-slate-800 font-semibold">
                Confirm Password
              </label>

              <div className="relative">

                <LockKeyhole
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                  autoComplete="new-password"
                  className="h-16 w-full rounded-xl text-slate-900 border border-slate-200 pl-12 pr-12 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600"
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
              className="flex h-16 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#6845e8] to-[#a83fe0] font-bold text-white transition hover:scale-[1.02] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  Update Password
                  <ArrowRight size={20} />
                </>
              )}
            </button>

          </form>
        )}

        {!success && (
          <p className="mt-8 text-center text-slate-600">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-bold text-purple-600 hover:text-purple-700"
            >
              Login
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}