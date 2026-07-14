"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  ArrowRight,
  Gift,
  Loader2,
  Mail,
  ShieldCheck,
  LockKeyhole,
  Truck
} from "lucide-react";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(
      "Password reset email sent. Please check your inbox."
    );
  }

  return (
    <main className="min-h-screen bg-[#faf9fc]">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Left */}
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#fff7fc] via-[#f3e8ff] to-[#e9d5ff] p-10 lg:flex lg:flex-col xl:p-14">

          <div className="absolute -right-36 top-16 h-[520px] w-[520px] rounded-full bg-white/20" />
          <div className="absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full bg-purple-300/20 blur-3xl" />

          {/* Logo */}
          <Link href="/" className="relative z-10 flex items-center gap-3">
            <Gift className="text-[#c64ed8]" size={43} strokeWidth={2.2} />

            <div>
              <div className="text-4xl font-extrabold tracking-tight text-[#111827]">
                mak
                <span className="bg-gradient-to-r from-[#ec4899] to-[#7c3aed] bg-clip-text text-transparent">
                  tyle
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-600">
                Create. Personalize. Gift Happiness.
              </p>
            </div>
          </Link>

          <div className="relative z-10 mt-24">
            <h1 className="text-5xl font-extrabold leading-tight text-slate-900">
              Forgot your
              <br />

              <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Password?
              </span>
            </h1>

            <p className="mt-6 max-w-md text-lg text-slate-600">
              No worries. Enter your email address and we'll send you a secure
              password reset link.
            </p>
          </div>

          {/* Product image */}
           <div className="relative z-10 mt-auto flex min-h-[350px] items-end justify-center">
                <Image
                    src="/auth.png"
                    alt="Personalized gifts"
                    width={720}
                    height={720}
                    priority
                    className="h-auto w-full max-w-[650px] my-5 object-contain drop-shadow-[0_15px_20px_rgba(0,0,0,0.6)]"
                />
            </div>

          {/* Features */}
          <div className="relative z-10 mt-5 grid grid-cols-3 rounded-3xl border border-white/50 bg-white/45 px-5 py-6 backdrop-blur-md">
            <LeftFeature
              icon={ShieldCheck}
              title="Premium Quality"
              text="Finest Materials"
            />

            <LeftFeature
              icon={LockKeyhole}
              title="Secure Checkout"
              text="100% Safe Payment"
            />

            <LeftFeature
              icon={Truck}
              title="Fast Delivery"
              text="Pan India Delivery"
              hideBorder
            />
          </div>
        </section>

        {/* Right */}
        <section className="flex items-center justify-center px-5 py-10">

          <div className="w-full max-w-[520px] rounded-[32px] border border-slate-100 bg-white p-8 shadow-[0_24px_80px_rgba(63,41,92,0.10)]">

            <Link
              href="/login"
              className="mb-8 inline-flex items-center gap-2 font-semibold text-purple-600"
            >
              <ArrowLeft size={18} />
              Back to Login
            </Link>

            <h2 className="text-4xl text-[#111827] font-extrabold">
              Reset Password
            </h2>

            <p className="mt-3 text-slate-500">
              Enter your registered email address below.
            </p>

            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-600">
                {success}
              </div>
            )}

            <form
              onSubmit={handleReset}
              className="mt-8 space-y-6"
            >
              <div>

                <label className="mb-2 block text-slate-800 font-semibold">
                  Email Address
                </label>

                <div className="relative">

                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={20}
                  />

                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="h-16 w-full rounded-xl text-slate-900 border border-slate-200 pl-12 pr-4 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                  />

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
                    Sending...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

            </form>

            <div className="mt-8 rounded-xl bg-purple-50 p-5">
              <h3 className="font-bold text-purple-700">
                Didn't receive the email?
              </h3>

              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li>Check your Spam or Junk folder.</li>
                <li>Ensure you entered the correct email address.</li>
                <li>Wait a few minutes before requesting another email.</li>
              </ul>
            </div>

            <p className="mt-8 text-center text-slate-600">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-bold text-purple-600"
              >
                Login
              </Link>
            </p>

          </div>

        </section>

      </div>
    </main>
  );
}

type FeatureIcon = React.ComponentType<{
  size?: number;
  className?: string;
  strokeWidth?: number;
}>;

function LeftFeature({
  icon: Icon,
  title,
  text,
  hideBorder = false,
}: {
  icon: FeatureIcon;
  title: string;
  text: string;
  hideBorder?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-3 ${
        hideBorder ? "" : "border-r border-purple-200/60"
      }`}
    >
      <Icon
        size={24}
        strokeWidth={1.8}
        className="shrink-0 text-purple-600"
      />

      <div>
        <p className="text-xs font-bold text-slate-900 xl:text-sm">{title}</p>
        <p className="mt-1 text-[11px] text-slate-500 xl:text-xs">{text}</p>
      </div>
    </div>
  );
}

function MiniFeature({
  icon: Icon,
  text,
}: {
  icon: FeatureIcon;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <Icon size={26} strokeWidth={1.8} className="text-purple-600" />
      <p className="text-xs leading-5 text-slate-600">{text}</p>
    </div>
  );
}