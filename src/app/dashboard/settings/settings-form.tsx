"use client";

import {
  Building2,
  CheckCircle2,
  Globe2,
  Home,
  Loader2,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Save,
  UserRound,
} from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import {
  updateAddress,
  updateProfile,
  type SettingsActionState,
} from "@/app/actions/settings";

const initialActionState: SettingsActionState = {
  success: false,
  message: "",
};

type SettingsFormProps = {
  initialFullName: string;
  initialPhone: string;
  initialAddressLine1: string;
  initialAddressLine2: string;
  initialCity: string;
  initialState: string;
  initialPostalCode: string;
  initialCountry: string;
  email: string;
};

function ActionMessage({
  state,
  visible,
}: {
  state: SettingsActionState;
  visible: boolean;
}) {
  if (!visible || !state.message) {
    return null;
  }

  return (
    <div
      className={`mt-6 flex items-start gap-3 rounded-2xl border px-4 py-3 ${
        state.success
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-rose-200 bg-rose-50 text-rose-700"
      }`}
    >
      {state.success && (
        <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
      )}

      <p className="text-sm font-bold">{state.message}</p>
    </div>
  );
}

export default function SettingsForm({
  initialFullName,
  initialPhone,
  initialAddressLine1,
  initialAddressLine2,
  initialCity,
  initialState,
  initialPostalCode,
  initialCountry,
  email,
}: SettingsFormProps) {
  const [profileState, profileAction, profilePending] =
    useActionState(updateProfile, initialActionState);

  const [addressState, addressAction, addressPending] =
    useActionState(updateAddress, initialActionState);

  const [profileMessageVisible, setProfileMessageVisible] =
    useState(false);

  const [addressMessageVisible, setAddressMessageVisible] =
    useState(false);

  useEffect(() => {
    if (!profileState.message) {
      return;
    }

    setProfileMessageVisible(true);

    const timeout = window.setTimeout(() => {
      setProfileMessageVisible(false);
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [profileState]);

  useEffect(() => {
    if (!addressState.message) {
      return;
    }

    setAddressMessageVisible(true);

    const timeout = window.setTimeout(() => {
      setAddressMessageVisible(false);
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [addressState]);

  return (
    <div className="space-y-6">
      {/* Personal information */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-[#8549e8]">
            <UserRound size={23} />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900">
              Personal information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update your name and contact information.
            </p>
          </div>
        </div>

        <ActionMessage
          state={profileState}
          visible={profileMessageVisible}
        />

        <form action={profileAction} className="mt-7 space-y-5">
          <div>
            <label
              htmlFor="fullName"
              className="text-sm font-black text-slate-700"
            >
              Full name
            </label>

            <div className="relative mt-2">
              <UserRound
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="fullName"
                name="fullName"
                type="text"
                defaultValue={initialFullName}
                placeholder="Enter your full name"
                required
                minLength={2}
                maxLength={80}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-purple-300 focus:bg-white focus:ring-4 focus:ring-purple-100"
              />
            </div>

            {profileState.errors?.fullName && (
              <p className="mt-2 text-xs font-bold text-rose-600">
                {profileState.errors.fullName}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="text-sm font-black text-slate-700"
            >
              Phone number
            </label>

            <div className="relative mt-2">
              <Phone
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={initialPhone}
                placeholder="Enter your phone number"
                maxLength={20}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-purple-300 focus:bg-white focus:ring-4 focus:ring-purple-100"
              />
            </div>

            {profileState.errors?.phone && (
              <p className="mt-2 text-xs font-bold text-rose-600">
                {profileState.errors.phone}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="text-sm font-black text-slate-700"
            >
              Email address
            </label>

            <div className="relative mt-2">
              <Mail
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="email"
                type="email"
                value={email}
                readOnly
                className="h-12 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 pl-11 pr-4 text-sm font-semibold text-slate-500 outline-none"
              />
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              Your email address is used for sign-in and order updates.
            </p>
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-5">
            <button
              type="submit"
              disabled={profilePending}
              className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl bg-[#8549e8] px-5 py-3 text-sm font-black text-white transition hover:bg-[#7440d0] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {profilePending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save changes
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Address information */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-[#f36a47]">
            <Home size={23} />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900">
              Delivery address
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Save your address for faster checkout and delivery.
            </p>
          </div>
        </div>

        <ActionMessage
          state={addressState}
          visible={addressMessageVisible}
        />

        <form action={addressAction} className="mt-7 space-y-5">
          <div>
            <label
              htmlFor="addressLine1"
              className="text-sm font-black text-slate-700"
            >
              Address line 1
            </label>

            <div className="relative mt-2">
              <MapPin
                size={18}
                className="pointer-events-none absolute left-4 top-4 text-slate-400"
              />

              <textarea
                id="addressLine1"
                name="addressLine1"
                defaultValue={initialAddressLine1}
                placeholder="House number, building, street or area"
                required
                rows={3}
                maxLength={200}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-purple-300 focus:bg-white focus:ring-4 focus:ring-purple-100"
              />
            </div>

            {addressState.errors?.addressLine1 && (
              <p className="mt-2 text-xs font-bold text-rose-600">
                {addressState.errors.addressLine1}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="addressLine2"
              className="text-sm font-black text-slate-700"
            >
              Address line 2{" "}
              <span className="font-semibold text-slate-400">
                (optional)
              </span>
            </label>

            <div className="relative mt-2">
              <Building2
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="addressLine2"
                name="addressLine2"
                type="text"
                defaultValue={initialAddressLine2}
                placeholder="Apartment, floor or landmark"
                maxLength={150}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-purple-300 focus:bg-white focus:ring-4 focus:ring-purple-100"
              />
            </div>

            {addressState.errors?.addressLine2 && (
              <p className="mt-2 text-xs font-bold text-rose-600">
                {addressState.errors.addressLine2}
              </p>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="city"
                className="text-sm font-black text-slate-700"
              >
                City
              </label>

              <div className="relative mt-2">
                <Building2
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="city"
                  name="city"
                  type="text"
                  defaultValue={initialCity}
                  placeholder="Enter city"
                  required
                  maxLength={80}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-purple-300 focus:bg-white focus:ring-4 focus:ring-purple-100"
                />
              </div>

              {addressState.errors?.city && (
                <p className="mt-2 text-xs font-bold text-rose-600">
                  {addressState.errors.city}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="state"
                className="text-sm font-black text-slate-700"
              >
                State
              </label>

              <div className="relative mt-2">
                <Navigation
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="state"
                  name="state"
                  type="text"
                  defaultValue={initialState}
                  placeholder="Enter state"
                  required
                  maxLength={80}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-purple-300 focus:bg-white focus:ring-4 focus:ring-purple-100"
                />
              </div>

              {addressState.errors?.state && (
                <p className="mt-2 text-xs font-bold text-rose-600">
                  {addressState.errors.state}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="postalCode"
                className="text-sm font-black text-slate-700"
              >
                Postal code
              </label>

              <div className="relative mt-2">
                <MapPin
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  inputMode="numeric"
                  defaultValue={initialPostalCode}
                  placeholder="Enter PIN code"
                  required
                  maxLength={10}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-purple-300 focus:bg-white focus:ring-4 focus:ring-purple-100"
                />
              </div>

              {addressState.errors?.postalCode && (
                <p className="mt-2 text-xs font-bold text-rose-600">
                  {addressState.errors.postalCode}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="country"
                className="text-sm font-black text-slate-700"
              >
                Country
              </label>

              <div className="relative mt-2">
                <Globe2
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="country"
                  name="country"
                  type="text"
                  defaultValue={initialCountry}
                  placeholder="Enter country"
                  required
                  maxLength={80}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-purple-300 focus:bg-white focus:ring-4 focus:ring-purple-100"
                />
              </div>

              {addressState.errors?.country && (
                <p className="mt-2 text-xs font-bold text-rose-600">
                  {addressState.errors.country}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
            <p className="text-sm font-black text-orange-800">
              Delivery information
            </p>

            <p className="mt-1 text-xs leading-5 text-orange-700">
              Make sure the address and postal code are correct before
              placing an order.
            </p>
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-5">
            <button
              type="submit"
              disabled={addressPending}
              className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl bg-[#f36a47] px-5 py-3 text-sm font-black text-white transition hover:bg-[#df5b3b] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {addressPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save address
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}