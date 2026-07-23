import Link from "next/link";
import {
  ArrowLeft,
  AtSign,
  CalendarDays,
  Mail,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import SettingsForm from "./settings-form";

function formatDate(value?: string | null) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/settings");
  }

  const metadata = user.user_metadata ?? {};

  const fullName =
    metadata.full_name ||
    metadata.name ||
    metadata.display_name ||
    "";

  const phone =
    metadata.phone ||
    metadata.phone_number ||
    user.phone ||
    "";

    const addressLine1 = metadata.address_line_1 || "";
const addressLine2 = metadata.address_line_2 || "";
const city = metadata.city || "";
const state = metadata.state || "";
const postalCode = metadata.postal_code || "";
const country = metadata.country || "India";

  const avatarUrl =
    metadata.avatar_url ||
    metadata.picture ||
    "";

  const provider =
    user.app_metadata?.provider || "email";

  return (
    <main className="min-h-screen bg-[#faf9fc] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        {/* Header */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-black text-[#8549e8] transition hover:text-[#7440d0]"
          >
            <ArrowLeft size={17} />
            Back to dashboard
          </Link>

          <div className="mt-4 flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-[#8549e8]">
              <Settings size={27} />
            </div>

            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Account Settings
              </h1>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Manage your profile information and account security.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* Account summary */}
          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={fullName || "User"}
                    className="h-24 w-24 rounded-full border-4 border-purple-100 object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#8549e8] to-[#f36a47] text-3xl font-black text-white">
                    {(fullName || user.email || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <h2 className="mt-4 text-xl font-black text-slate-900">
                  {fullName || "Maktyle Customer"}
                </h2>

                <p className="mt-1 break-all text-sm text-slate-500">
                  {user.email}
                </p>

                <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700 ring-1 ring-inset ring-emerald-200">
                  <ShieldCheck size={14} />
                  Active account
                </span>
              </div>

              <div className="mt-6 space-y-4 border-t border-slate-100 pt-6">
                <div className="flex items-start gap-3">
                  <Mail
                    size={17}
                    className="mt-0.5 shrink-0 text-[#8549e8]"
                  />

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-400">
                      Email
                    </p>

                    <p className="mt-1 break-all text-sm font-bold text-slate-700">
                      {user.email || "Not available"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AtSign
                    size={17}
                    className="mt-0.5 shrink-0 text-[#8549e8]"
                  />

                  <div>
                    <p className="text-xs font-semibold text-slate-400">
                      Sign-in method
                    </p>

                    <p className="mt-1 text-sm font-bold capitalize text-slate-700">
                      {provider}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CalendarDays
                    size={17}
                    className="mt-0.5 shrink-0 text-[#8549e8]"
                  />

                  <div>
                    <p className="text-xs font-semibold text-slate-400">
                      Member since
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {formatDate(user.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-orange-100 bg-gradient-to-br from-[#fff7f3] to-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-[#f36a47]">
                <ShieldCheck size={22} />
              </div>

              <h2 className="mt-4 font-black text-slate-900">
                Account security
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Use a strong password that you do not use on other
                websites.
              </p>
            </section>
          </aside>

          {/* Settings forms */}
          <SettingsForm
  initialFullName={fullName}
  initialPhone={phone}
  initialAddressLine1={addressLine1}
  initialAddressLine2={addressLine2}
  initialCity={city}
  initialState={state}
  initialPostalCode={postalCode}
  initialCountry={country}
  email={user.email || ""}
/>
        </div>
      </div>
    </main>
  );
}