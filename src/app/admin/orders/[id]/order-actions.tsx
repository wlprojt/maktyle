"use client";

import {
  CheckCircle2,
  Loader2,
  Save,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useState,
} from "react";

type Props = {
  orderId: string;
  initialOrderStatus: string;
  initialPaymentStatus: string;
  initialCourierName: string;
  initialTrackingNumber: string;
  initialNotes: string;
};

const orderStatuses = [
  "payment_pending",
  "placed",
  "processing",
  "printing",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
];

const paymentStatuses = [
  "pending",
  "authorized",
  "paid",
  "failed",
  "verification_failed",
  "refunded",
];

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

export default function OrderActions({
  orderId,
  initialOrderStatus,
  initialPaymentStatus,
  initialCourierName,
  initialTrackingNumber,
  initialNotes,
}: Props) {
  const router = useRouter();

  const [orderStatus, setOrderStatus] =
    useState(initialOrderStatus);

  const [paymentStatus, setPaymentStatus] =
    useState(initialPaymentStatus);

  const [courierName, setCourierName] =
    useState(initialCourierName);

  const [trackingNumber, setTrackingNumber] =
    useState(initialTrackingNumber);

  const [notes, setNotes] =
    useState(initialNotes);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderStatus,
            paymentStatus,
            courierName: courierName.trim(),
            trackingNumber:
              trackingNumber.trim(),
            notes: notes.trim(),
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Unable to update order.",
        );
      }

      setMessage("Order updated successfully.");

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update order.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-black text-slate-900">
        Update order
      </h2>

      <div className="mt-5 space-y-5">
        <FormField label="Order status">
          <select
            value={orderStatus}
            onChange={(event) =>
              setOrderStatus(event.target.value)
            }
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-[#8549e8]"
          >
            {orderStatuses.map((status) => (
              <option
                key={status}
                value={status}
              >
                {formatLabel(status)}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Payment status">
          <select
            value={paymentStatus}
            onChange={(event) =>
              setPaymentStatus(
                event.target.value,
              )
            }
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-[#8549e8]"
          >
            {paymentStatuses.map((status) => (
              <option
                key={status}
                value={status}
              >
                {formatLabel(status)}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Courier name">
          <input
            value={courierName}
            onChange={(event) =>
              setCourierName(event.target.value)
            }
            placeholder="Delhivery, Blue Dart, DTDC"
            className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none focus:border-[#8549e8]"
          />
        </FormField>

        <FormField label="Tracking number">
          <input
            value={trackingNumber}
            onChange={(event) =>
              setTrackingNumber(
                event.target.value,
              )
            }
            placeholder="Enter shipment tracking number"
            className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none focus:border-[#8549e8]"
          />
        </FormField>

        <FormField label="Admin notes">
          <textarea
            value={notes}
            onChange={(event) =>
              setNotes(event.target.value)
            }
            rows={5}
            placeholder="Printing instructions, customer request or internal notes"
            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#8549e8]"
          />
        </FormField>
      </div>

      {message && (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-700">
          <CheckCircle2 size={17} />
          {message}
        </div>
      )}

      {errorMessage && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-600">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8549e8] to-[#f36a47] px-5 py-3.5 font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? (
          <>
            <Loader2
              size={18}
              className="animate-spin"
            />
            Saving...
          </>
        ) : (
          <>
            <Save size={18} />
            Save changes
          </>
        )}
      </button>
    </form>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </label>

      {children}
    </div>
  );
}