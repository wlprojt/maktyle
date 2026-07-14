"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Gift,
  Heart,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Smile,
  Truck,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [rememberMe, setRememberMe] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
  setGoogleLoading(true);

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    setGoogleLoading(false);
    setError(error.message);
  }
};

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      switch (error.message) {
        case "Invalid login credentials":
          setError("Incorrect email or password.");
          break;

        case "Email not confirmed":
          setError("Please verify your email before signing in.");
          break;

        default:
          setError(error.message);
      }
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#faf9fc]">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left promotional section */}
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#fff7fc] via-[#f3e8ff] to-[#e9d5ff] p-10 lg:flex lg:flex-col xl:p-14">
          {/* Decorative circles */}
          <div className="absolute -right-36 top-16 h-[520px] w-[520px] rounded-full bg-white/25" />
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

          {/* Content */}
          <div className="relative z-10 mt-24 max-w-xl">
            <h1 className="text-5xl font-extrabold leading-tight text-[#111827] xl:text-6xl">
              Personalized Gifts
              <br />
              <span className="bg-gradient-to-r from-[#ec4899] via-[#c84ee8] to-[#6d4df5] bg-clip-text text-transparent">
                Made Just for You
              </span>
            </h1>

            <p className="mt-7 max-w-md text-lg leading-8 text-slate-600">
              Create unique, meaningful gifts for your loved ones.
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

        {/* Login form section */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-[590px] rounded-[34px] border border-slate-100 bg-white p-6 shadow-[0_24px_80px_rgba(63,41,92,0.10)] sm:p-10 xl:p-12">
            {/* Mobile logo */}
            <Link
              href="/"
              className="mb-9 flex items-center justify-center gap-2 lg:hidden"
            >
              <Gift className="text-purple-600" size={32} />

              <span className="text-3xl font-extrabold text-slate-900">
                mak<span className="text-purple-600">tyle</span>
              </span>
            </Link>

            <div>
              <h2 className="text-3xl text-center font-extrabold text-[#111827] sm:text-4xl">
                Welcome Back! 👋
              </h2>

              <p className="mt-3 text-center text-base text-slate-500 sm:text-lg">
                Login to continue your personalized gifting journey
              </p>
            </div>

            {/* Social buttons */}
            <div className="mt-9 space-y-4">
              <button
                type="button"
                disabled={googleLoading}
                onClick={handleGoogleLogin}
                className="flex h-16 w-full items-center justify-center gap-4 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 transition hover:border-purple-300 hover:bg-purple-50"
              >
                {googleLoading ? (
    <>
      <Loader2 className="h-5 w-5 animate-spin" />
      Redirecting...
    </>
  ) : (
    <>
                <svg
    className="h-5 w-5"
    viewBox="0 0 48 48"
    xmlns="http://www.w3.org/2000/svg"
  >

    <path
      fill="#FFC107"
      d="M43.6 20H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-4z"
    />
    <path
      fill="#FF3D00"
      d="M6.3 14.7l6.6 4.8C14.7 15.5 19 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.2 0 10-2 13.5-5.2l-6.2-5.2c-2.1 1.6-4.7 2.4-7.3 2.4-5.3 0-9.8-3.3-11.4-8l-6.5 5C9.4 39.5 16.1 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.6 20H42V20H24v8h11.3c-1.1 3.2-3.4 5.6-6.7 6.8l6.2 5.2C39.5 36.6 44 30.9 44 24c0-1.3-.1-2.7-.4-4z"
    />
  </svg>

                Continue with Google
                </>
  )}
              </button>

              {/* <button
                type="button"
                className="flex h-16 w-full items-center justify-center gap-4 rounded-xl border border-purple-200 bg-white font-semibold text-slate-900 transition hover:bg-purple-50"
              >
                <Mail size={23} className="text-purple-600" />
                Continue with Email OTP
              </button> */}
            </div>

            {/* Divider */}
            <div className="my-8 flex items-center gap-5">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-sm font-medium text-slate-500">or</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Login form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block font-semibold text-slate-800"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={21}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-16 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block font-semibold text-slate-800"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={21}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-16 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-purple-600"
                  >
                    {showPassword ? <EyeOff size={21} /> : <Eye size={21} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(event.target.checked)
                    }
                    className="h-5 w-5 accent-purple-600"
                  />
                  Remember me
                </label>

                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-purple-600 hover:text-purple-700"
                >
                  Forgot Password?
                </Link>
              </div>

              {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-16 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#6845e8] to-[#a83fe0] font-bold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
              Sign In
              <ArrowRight size={21} />
              </>
            )}
      
              </button>
            </form>

            <p className="mt-5 text-center text-slate-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-purple-600 hover:text-purple-700"
              >
                Sign up
              </Link>
            </p>

            {/* Bottom highlights */}
            <div className="mt-10 grid grid-cols-3 gap-3 border-t border-slate-100 pt-8">
              <MiniFeature icon={Gift} text="Unique Designs" />
              <MiniFeature icon={Heart} text="Made with Love" />
              <MiniFeature icon={Smile} text="100K+ Happy Customers" />
            </div>
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