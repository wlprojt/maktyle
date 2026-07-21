"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Loader2,
  Lock,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

export type DesignElement = {
  id: string;
  type: "image" | "text" | "shape" | "sticker";
  name: string;
  text?: string;
  src?: string;
  hidden?: boolean;
};

export type CheckoutDesign = {
  id: string;
  product_id: string;
  product_title: string;
  product_category: string | null;
  product_image_url: string | null;

  frame_id: string | null;
  frame_name: string | null;
  frame_price: number;
  frame_config: Record<string, unknown>;

  background_color: string;
  design_elements: DesignElement[];

  preview_url: string | null;

  quantity: number;
  unit_price: number;
  total_price: number;
};

export type CheckoutCartItem = {
  id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
  design: CheckoutDesign | null;
};

type CheckoutForm = {
  customerName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  paymentMethod: "razorpay";
};

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayFailureResponse = {
  error?: {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
    metadata?: {
      order_id?: string;
      payment_id?: string;
    };
  };
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;

  handler: (
    response: RazorpaySuccessResponse,
  ) => void | Promise<void>;

  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };

  notes?: Record<string, string>;

  theme?: {
    color?: string;
  };

  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };

  retry?: {
    enabled: boolean;
    max_count?: number;
  };
};

type RazorpayInstance = {
  open: () => void;

  on: (
    event: "payment.failed",
    handler: (response: RazorpayFailureResponse) => void,
  ) => void;
};

type CreateOrderResponse = {
  success: boolean;
  keyId: string;
  localOrderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  error?: string;
};

type VerifyPaymentResponse = {
  success: boolean;
  orderId: string;
  error?: string;
};

declare global {
  interface Window {
    Razorpay: new (
      options: RazorpayOptions,
    ) => RazorpayInstance;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript =
      document.querySelector<HTMLScriptElement>(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
      );

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        () => resolve(true),
        { once: true },
      );

      existingScript.addEventListener(
        "error",
        () => resolve(false),
        { once: true },
      );

      return;
    }

    const script = document.createElement("script");

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

export default function CheckoutClient({
  initialCart,
  userEmail,
}: {
  initialCart: CheckoutCartItem[];
  userEmail: string;
}) {
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState<CheckoutForm>({
    customerName: "",
    email: userEmail,
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    paymentMethod: "razorpay",
  });

  const validCart = useMemo(
    () => initialCart.filter((item) => item.design),
    [initialCart],
  );

  const subtotal = useMemo(
    () =>
      validCart.reduce(
        (total, item) =>
          total +
          Number(item.unit_price) *
            Number(item.quantity),
        0,
      ),
    [validCart],
  );

  const shippingAmount = subtotal >= 499 ? 0 : 49;
  const totalAmount = subtotal + shippingAmount;

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function validateForm() {
    if (!form.customerName.trim()) {
      return "Enter your full name.";
    }

    if (!/^[6-9][0-9]{9}$/.test(form.phone.trim())) {
      return "Enter a valid 10-digit Indian phone number.";
    }

    if (!form.email.trim()) {
      return "Enter your email address.";
    }

    if (!form.addressLine1.trim()) {
      return "Enter your delivery address.";
    }

    if (!form.city.trim()) {
      return "Enter your city.";
    }

    if (!form.state.trim()) {
      return "Enter your state.";
    }

    if (!/^[0-9]{6}$/.test(form.postalCode.trim())) {
      return "Enter a valid 6-digit PIN code.";
    }

    if (!validCart.length) {
      return "Your cart is empty.";
    }

    if (totalAmount <= 0) {
      return "The order amount is invalid.";
    }

    return null;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const scriptLoaded =
        await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error(
          "Unable to load Razorpay. Check your internet connection and try again.",
        );
      }

      const createOrderResponse = await fetch(
        "/api/razorpay/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerName: form.customerName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            addressLine1:
              form.addressLine1.trim(),
            addressLine2:
              form.addressLine2.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            postalCode: form.postalCode.trim(),
            country: form.country.trim(),
          }),
        },
      );

      const createOrderResult =
        (await createOrderResponse.json()) as CreateOrderResponse;

      if (!createOrderResponse.ok) {
        throw new Error(
          createOrderResult.error ??
            "Unable to create the payment order.",
        );
      }

      if (
        !createOrderResult.keyId ||
        !createOrderResult.localOrderId ||
        !createOrderResult.razorpayOrderId
      ) {
        throw new Error(
          "Invalid payment order response.",
        );
      }

      const options: RazorpayOptions = {
        key: createOrderResult.keyId,
        amount: Number(createOrderResult.amount),
        currency:
          createOrderResult.currency ?? "INR",
        name: "Maktyle",
        description: "Customized gift order",
        order_id:
          createOrderResult.razorpayOrderId,

        prefill: {
          name: createOrderResult.customer.name,
          email: createOrderResult.customer.email,
          contact: createOrderResult.customer.phone,
        },

        notes: {
          local_order_id:
            createOrderResult.localOrderId,
        },

        theme: {
          color: "#8549e8",
        },

        retry: {
          enabled: true,
          max_count: 2,
        },

        modal: {
          escape: true,
          backdropclose: false,

          ondismiss: () => {
            setSubmitting(false);
          },
        },

        handler: async (
          paymentResponse: RazorpaySuccessResponse,
        ) => {
          try {
            const verifyResponse = await fetch(
              "/api/razorpay/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify({
                  localOrderId:
                    createOrderResult.localOrderId,

                  razorpayOrderId:
                    paymentResponse.razorpay_order_id,

                  razorpayPaymentId:
                    paymentResponse.razorpay_payment_id,

                  razorpaySignature:
                    paymentResponse.razorpay_signature,
                }),
              },
            );

            const verifyResult =
              (await verifyResponse.json()) as VerifyPaymentResponse;

            if (!verifyResponse.ok) {
              throw new Error(
                verifyResult.error ??
                  "Payment verification failed.",
              );
            }

            router.push(
              `/order-success?order=${verifyResult.orderId}`,
            );

            router.refresh();
          } catch (error) {
            setErrorMessage(
              error instanceof Error
                ? error.message
                : "Payment verification failed.",
            );

            setSubmitting(false);
          }
        },
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        (response: RazorpayFailureResponse) => {
          setErrorMessage(
            response.error?.description ??
              response.error?.reason ??
              "Payment failed. Please try again.",
          );

          setSubmitting(false);
        },
      );

      razorpay.open();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to start payment.",
      );

      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-[#8549e8]"
          >
            <ArrowLeft size={17} />
            Return to cart
          </Link>

          <h1 className="mt-4 text-3xl font-black text-slate-900 sm:text-4xl">
            Checkout
          </h1>

          <p className="mt-2 text-slate-500">
            Complete your delivery details and pay
            securely.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-8 lg:grid-cols-[1fr_390px]"
        >
          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-100 text-[#8549e8]">
                  <MapPin size={22} />
                </div>

                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    Delivery information
                  </h2>

                  <p className="text-sm text-slate-500">
                    Enter the address where we should
                    deliver your order.
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <InputField
                  label="Full name"
                  name="customerName"
                  value={form.customerName}
                  onChange={handleChange}
                  placeholder="Ricky Vishwas"
                  autoComplete="name"
                  required
                />

                <InputField
                  label="Phone number"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  inputMode="numeric"
                  pattern="[6-9][0-9]{9}"
                  maxLength={10}
                  autoComplete="tel"
                  required
                />

                <div className="sm:col-span-2">
                  <InputField
                    label="Email address"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <InputField
                    label="Address"
                    name="addressLine1"
                    value={form.addressLine1}
                    onChange={handleChange}
                    placeholder="House number, street and locality"
                    autoComplete="street-address"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <InputField
                    label="Apartment, landmark or additional address"
                    name="addressLine2"
                    value={form.addressLine2}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </div>

                <InputField
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Jabalpur"
                  autoComplete="address-level2"
                  required
                />

                <InputField
                  label="State"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="Madhya Pradesh"
                  autoComplete="address-level1"
                  required
                />

                <InputField
                  label="PIN code"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  placeholder="482001"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  autoComplete="postal-code"
                  required
                />

                <div>
                  <label
                    htmlFor="country"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Country
                  </label>

                  <select
                    id="country"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    required
                    autoComplete="country-name"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition focus:border-[#8549e8] focus:ring-4 focus:ring-purple-100"
                  >
                    <option value="India">
                      India
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-[#f36a47]">
                  <CreditCard size={22} />
                </div>

                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    Payment method
                  </h2>

                  <p className="text-sm text-slate-500">
                    Complete your payment securely with
                    Razorpay.
                  </p>
                </div>
              </div>

              <label className="mt-6 flex cursor-pointer items-start gap-4 rounded-2xl border-2 border-[#8549e8] bg-purple-50 p-5">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={
                    form.paymentMethod === "razorpay"
                  }
                  readOnly
                  className="mt-1 h-4 w-4 accent-[#8549e8]"
                />

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-900">
                        Razorpay secure payment
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Pay using UPI, debit card,
                        credit card, net banking or
                        supported wallets.
                      </p>
                    </div>

                    <Check
                      size={19}
                      className="mt-0.5 shrink-0 text-[#8549e8]"
                    />
                  </div>

                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-semibold text-slate-500 shadow-sm">
                    <Lock size={14} />
                    Secure payment powered by Razorpay
                  </div>
                </div>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FeatureCard
                icon={<Lock size={20} />}
                title="Secure checkout"
                description="Your payment and delivery details are protected."
              />

              <FeatureCard
                icon={<Package size={20} />}
                title="Careful packing"
                description="Customized products are packed safely."
              />

              <FeatureCard
                icon={<Truck size={20} />}
                title="Tracked delivery"
                description="Receive updates about your order."
              />
            </div>
          </section>

          <aside>
            <div className="sticky top-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-[#8549e8]" />

                <h2 className="text-xl font-black text-slate-900">
                  Order summary
                </h2>
              </div>

              <div className="mt-6 max-h-[390px] space-y-4 overflow-y-auto pr-1">
                {validCart.map((item) => {
                  const design = item.design;

                  if (!design) return null;

                  const itemTotal =
                    Number(item.unit_price) *
                    Number(item.quantity);

                  return (
                    <div
                      key={item.id}
                      className="flex gap-3 border-b border-slate-100 pb-4"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        {design.preview_url ? (
                          <Image
                            src={design.preview_url}
                            alt={design.product_title}
                            fill
                            unoptimized
                            sizes="80px"
                            className="object-contain p-1"
                          />
                        ) : design.product_image_url ? (
                          <Image
                            src={
                              design.product_image_url
                            }
                            alt={design.product_title}
                            fill
                            unoptimized
                            sizes="80px"
                            className="object-contain p-1"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package className="text-slate-300" />
                          </div>
                        )}

                        <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-black text-white">
                          {item.quantity}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-black text-slate-800">
                          {design.product_title}
                        </p>

                        {design.frame_name && (
                          <p className="mt-1 text-xs text-slate-500">
                            Frame: {design.frame_name}
                          </p>
                        )}

                        <p className="mt-2 text-sm font-black text-[#8549e8]">
                          ₹
                          {itemTotal.toLocaleString(
                            "en-IN",
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 space-y-3">
                <SummaryRow
                  label="Subtotal"
                  value={`₹${subtotal.toLocaleString(
                    "en-IN",
                  )}`}
                />

                <SummaryRow
                  label="Shipping"
                  value={
                    shippingAmount === 0
                      ? "Free"
                      : `₹${shippingAmount.toLocaleString(
                          "en-IN",
                        )}`
                  }
                />

                {shippingAmount > 0 &&
                  subtotal < 499 && (
                    <p className="rounded-xl bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700">
                      Add ₹
                      {(
                        499 - subtotal
                      ).toLocaleString("en-IN")}{" "}
                      more for free delivery.
                    </p>
                  )}

                <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                  <span className="text-lg font-black text-slate-900">
                    Total
                  </span>

                  <span className="text-2xl font-black text-[#8549e8]">
                    ₹
                    {totalAmount.toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-600"
                >
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  submitting || validCart.length === 0
                }
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8549e8] to-[#f36a47] px-5 py-4 font-black text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />
                    Opening payment...
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    Pay ₹
                    {totalAmount.toLocaleString(
                      "en-IN",
                    )}
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
                <Lock size={13} />
                Your payment is encrypted and secure
              </div>

              <p className="mt-3 text-center text-xs leading-5 text-slate-400">
                By completing payment, you agree to our
                terms, privacy and refund policies.
              </p>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}

type InputFieldProps = {
  label: string;
  name: keyof CheckoutForm;
  value: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
  autoComplete?: string;

  inputMode?:
    | "text"
    | "numeric"
    | "tel"
    | "email"
    | "decimal"
    | "search"
    | "url";

  pattern?: string;

  onChange: (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >,
  ) => void;
};

function InputField({
  label,
  name,
  value,
  placeholder,
  type = "text",
  required,
  inputMode,
  pattern,
  maxLength,
  autoComplete,
  onChange,
}: InputFieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-bold text-slate-700"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        inputMode={inputMode}
        pattern={pattern}
        maxLength={maxLength}
        autoComplete={autoComplete}
        onChange={onChange}
        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#8549e8] focus:ring-4 focus:ring-purple-100"
      />
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">
        {label}
      </span>

      <span className="font-bold text-slate-800">
        {value}
      </span>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-[#8549e8]">
        {icon}
      </div>

      <p className="mt-3 text-sm font-black text-slate-800">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}