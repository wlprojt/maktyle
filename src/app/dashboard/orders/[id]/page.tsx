import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  ExternalLink,
  Hash,
  ImageIcon,
  Package,
  Printer,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type OrderItem = {
  id: string;
  product_title: string | null;
  product_image_url: string | null;
  preview_url: string | null;
  quantity: number | null;
  unit_price: number | string | null;
};

type Order = {
  id: string;
  total_amount: number | string | null;
  order_status: string | null;
  payment_status: string | null;
  payment_method: string | null;
  created_at: string;
  tracking_number: string | null;
  courier_name: string | null;
  order_items: OrderItem[] | null;
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type OrderItemWithImage = OrderItem & {
  signedPreviewUrl: string | null;
  signedProductImageUrl: string | null;
  displayImage: string | null;
};

const orderSteps = [
  {
    value: "processing",
    label: "Processing",
    description: "Your order has been received.",
    icon: Clock3,
  },
  {
    value: "printing",
    label: "Printing",
    description: "Your personalized product is being prepared.",
    icon: Printer,
  },
  {
    value: "packed",
    label: "Packed",
    description: "Your order has been packed.",
    icon: Package,
  },
  {
    value: "shipped",
    label: "Shipped",
    description: "Your order is on the way.",
    icon: Truck,
  },
  {
    value: "delivered",
    label: "Delivered",
    description: "Your order has been delivered.",
    icon: CheckCircle2,
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function normalizeStatus(value?: string | null) {
  return (value || "pending")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getOrderStatusClass(status?: string | null) {
  switch ((status || "").toLowerCase()) {
    case "delivered":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";

    case "shipped":
      return "bg-blue-50 text-blue-700 ring-blue-200";

    case "packed":
      return "bg-cyan-50 text-cyan-700 ring-cyan-200";

    case "printing":
    case "processing":
      return "bg-orange-50 text-orange-700 ring-orange-200";

    case "cancelled":
      return "bg-rose-50 text-rose-700 ring-rose-200";

    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
}

function getPaymentStatusClass(status?: string | null) {
  switch ((status || "").toLowerCase()) {
    case "paid":
    case "completed":
    case "success":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";

    case "failed":
    case "cancelled":
      return "bg-rose-50 text-rose-700 ring-rose-200";

    case "refunded":
      return "bg-blue-50 text-blue-700 ring-blue-200";

    default:
      return "bg-amber-50 text-amber-700 ring-amber-200";
  }
}

function getStoragePath(value?: string | null) {
  if (!value) {
    return null;
  }

  if (!value.startsWith("http://") && !value.startsWith("https://")) {
    return value.replace(/^\/+/, "");
  }

  const markers = [
    "/storage/v1/object/public/custom-designs/",
    "/storage/v1/object/sign/custom-designs/",
    "/storage/v1/object/authenticated/custom-designs/",
  ];

  for (const marker of markers) {
    const index = value.indexOf(marker);

    if (index !== -1) {
      return decodeURIComponent(
        value.slice(index + marker.length).split("?")[0],
      );
    }
  }

  return null;
}

async function createSignedImageUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  value?: string | null,
) {
  if (!value) {
    return null;
  }

  if (value.startsWith("data:image/")) {
    return value;
  }

  const storagePath = getStoragePath(value);

  if (!storagePath) {
    return value;
  }

  const { data, error } = await supabase.storage
    .from("custom-designs")
    .createSignedUrl(storagePath, 60 * 60);

  if (error) {
    console.error("Order image signing failed:", {
      message: error.message,
      name: error.name,
    });

    return null;
  }

  return data.signedUrl;
}

function getCurrentStepIndex(status?: string | null) {
  const normalizedStatus = (status || "processing").toLowerCase();

  if (normalizedStatus === "pending") {
    return 0;
  }

  return orderSteps.findIndex((step) => step.value === normalizedStatus);
}

export default async function OrderDetailsPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?redirect=${encodeURIComponent(`/dashboard/orders/${id}`)}`,
    );
  }

  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      total_amount,
      order_status,
      payment_status,
      payment_method,
      created_at,
      tracking_number,
      courier_name,
      order_items (
        id,
        product_title,
        product_image_url,
        preview_url,
        quantity,
        unit_price
      )
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Unable to load order:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw new Error("Unable to load this order.");
  }

  if (!data) {
    notFound();
  }

  const order = data as Order;

  const items: OrderItemWithImage[] = await Promise.all(
    (order.order_items ?? []).map(async (item) => {
      const [signedPreviewUrl, signedProductImageUrl] = await Promise.all([
        createSignedImageUrl(supabase, item.preview_url),
        createSignedImageUrl(supabase, item.product_image_url),
      ]);

      return {
        ...item,
        signedPreviewUrl,
        signedProductImageUrl,
        displayImage: signedPreviewUrl || signedProductImageUrl,
      };
    }),
  );

  const totalItems = items.reduce(
    (total, item) => total + Number(item.quantity ?? 1),
    0,
  );

  const calculatedSubtotal = items.reduce((total, item) => {
    const quantity = Number(item.quantity ?? 1);
    const price = Number(item.unit_price ?? 0);

    return total + quantity * price;
  }, 0);

  const totalAmount = Number(order.total_amount ?? calculatedSubtotal);
  const currentStepIndex = getCurrentStepIndex(order.order_status);
  const isCancelled =
    (order.order_status || "").toLowerCase() === "cancelled";

  return (
    <main className="min-h-screen bg-[#faf9fc] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        {/* Page header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center gap-2 text-sm font-black text-[#8549e8] transition hover:text-[#7440d0]"
            >
              <ArrowLeft size={17} />
              Back to orders
            </Link>

            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Order Details
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              View your products, payment information and delivery progress.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8549e8] px-5 py-3 text-sm font-black text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:bg-[#7440d0]"
          >
            <ShoppingBag size={18} />
            Continue shopping
          </Link>
        </div>

        {/* Order summary header */}
        <section className="mt-7 overflow-hidden rounded-3xl border border-purple-100 bg-gradient-to-br from-[#f8f2ff] via-white to-[#fff4f0] shadow-sm">
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex rounded-full px-3 py-1.5 text-xs font-black ring-1 ring-inset ${getOrderStatusClass(
                    order.order_status,
                  )}`}
                >
                  {normalizeStatus(order.order_status)}
                </span>

                <span
                  className={`inline-flex rounded-full px-3 py-1.5 text-xs font-black ring-1 ring-inset ${getPaymentStatusClass(
                    order.payment_status,
                  )}`}
                >
                  Payment: {normalizeStatus(order.payment_status)}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-x-8 gap-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Order ID
                  </p>

                  <p className="mt-1 inline-flex items-center gap-2 font-black text-slate-800">
                    <Hash size={16} className="text-[#8549e8]" />
                    {order.id}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Ordered on
                  </p>

                  <p className="mt-1 inline-flex items-center gap-2 font-bold text-slate-700">
                    <CalendarDays size={16} className="text-[#8549e8]" />
                    {formatDateTime(order.created_at)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Items
                  </p>

                  <p className="mt-1 font-bold text-slate-700">
                    {totalItems} {totalItems === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white bg-white/90 px-6 py-5 shadow-sm lg:min-w-56 lg:text-right">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Order total
              </p>

              <p className="mt-2 text-3xl font-black text-slate-900">
                {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            {/* Tracking timeline */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    Order progress
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Track the current status of your order.
                  </p>
                </div>

                {isCancelled ? (
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                    <XCircle size={23} />
                  </div>
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-100 text-[#8549e8]">
                    <Truck size={23} />
                  </div>
                )}
              </div>

              {isCancelled ? (
                <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5">
                  <div className="flex items-start gap-3">
                    <XCircle
                      size={22}
                      className="mt-0.5 shrink-0 text-rose-600"
                    />

                    <div>
                      <p className="font-black text-rose-700">
                        This order was cancelled
                      </p>

                      <p className="mt-1 text-sm leading-6 text-rose-600">
                        The order will not continue through printing or
                        delivery.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-7">
                  {orderSteps.map((step, index) => {
                    const Icon = step.icon;
                    const complete = index < currentStepIndex;
                    const active = index === currentStepIndex;
                    const reached = complete || active;
                    const isLast = index === orderSteps.length - 1;

                    return (
                      <div
                        key={step.value}
                        className="relative flex gap-4"
                      >
                        {!isLast && (
                          <div
                            className={`absolute left-[21px] top-11 h-[calc(100%-18px)] w-0.5 ${
                              complete
                                ? "bg-[#8549e8]"
                                : "bg-slate-200"
                            }`}
                          />
                        )}

                        <div
                          className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 ${
                            reached
                              ? "border-[#8549e8] bg-[#8549e8] text-white"
                              : "border-slate-200 bg-white text-slate-400"
                          }`}
                        >
                          {complete ? (
                            <Check size={20} strokeWidth={3} />
                          ) : (
                            <Icon size={19} />
                          )}
                        </div>

                        <div className={`pb-8 ${isLast ? "pb-0" : ""}`}>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3
                              className={`font-black ${
                                reached
                                  ? "text-slate-900"
                                  : "text-slate-400"
                              }`}
                            >
                              {step.label}
                            </h3>

                            {active && (
                              <span className="rounded-full bg-purple-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#8549e8]">
                                Current
                              </span>
                            )}
                          </div>

                          <p
                            className={`mt-1 text-sm ${
                              reached
                                ? "text-slate-500"
                                : "text-slate-400"
                            }`}
                          >
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Ordered products */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Ordered products
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review the products included in this order.
                </p>
              </div>

              {items.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 px-5 py-12 text-center">
                  <Package
                    size={42}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-4 font-black text-slate-700">
                    No order items found
                  </p>
                </div>
              ) : (
                <div className="mt-6 divide-y divide-slate-100">
                  {items.map((item) => {
                    const quantity = Number(item.quantity ?? 1);
                    const unitPrice = Number(item.unit_price ?? 0);
                    const itemTotal = quantity * unitPrice;

                    return (
                      <article
                        key={item.id}
                        className="grid gap-4 py-5 first:pt-0 last:pb-0 sm:grid-cols-[100px_minmax(0,1fr)_auto] sm:items-center"
                      >
                        <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-purple-50">
                          {item.displayImage ? (
                            <Image
                              src={item.displayImage}
                              alt={
                                item.product_title || "Order product"
                              }
                              fill
                              unoptimized
                              sizes="96px"
                              className="object-contain p-2"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <ImageIcon
                                size={30}
                                className="text-slate-300"
                              />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-lg font-black text-slate-800">
                            {item.product_title ||
                              "Personalized product"}
                          </h3>

                          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
                            <span>
                              Quantity:{" "}
                              <strong className="text-slate-700">
                                {quantity}
                              </strong>
                            </span>

                            <span>
                              Unit price:{" "}
                              <strong className="text-slate-700">
                                {formatCurrency(unitPrice)}
                              </strong>
                            </span>
                          </div>

                          {item.signedPreviewUrl && (
                            <a
                              href={item.signedPreviewUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-3 inline-flex items-center gap-1.5 text-sm font-black text-[#8549e8] transition hover:text-[#7440d0]"
                            >
                              View custom design
                              <ExternalLink size={15} />
                            </a>
                          )}
                        </div>

                        <div className="sm:text-right">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                            Item total
                          </p>

                          <p className="mt-1 text-xl font-black text-slate-900">
                            {formatCurrency(itemTotal)}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            {/* Payment details */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-100 text-[#8549e8]">
                  <CreditCard size={22} />
                </div>

                <div>
                  <h2 className="font-black text-slate-900">
                    Payment details
                  </h2>

                  <p className="text-xs text-slate-500">
                    Payment summary
                  </p>
                </div>
              </div>

              <dl className="mt-6 space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500">Payment method</dt>

                  <dd className="font-black text-slate-800">
                    {normalizeStatus(
                      order.payment_method || "online",
                    )}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500">Payment status</dt>

                  <dd>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ring-1 ring-inset ${getPaymentStatusClass(
                        order.payment_status,
                      )}`}
                    >
                      {normalizeStatus(order.payment_status)}
                    </span>
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500">Subtotal</dt>

                  <dd className="font-bold text-slate-700">
                    {formatCurrency(calculatedSubtotal)}
                  </dd>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-end justify-between gap-4">
                    <dt className="font-black text-slate-900">
                      Total paid
                    </dt>

                    <dd className="text-2xl font-black text-slate-900">
                      {formatCurrency(totalAmount)}
                    </dd>
                  </div>
                </div>
              </dl>
            </section>

            {/* Delivery details */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                  <Truck size={22} />
                </div>

                <div>
                  <h2 className="font-black text-slate-900">
                    Delivery details
                  </h2>

                  <p className="text-xs text-slate-500">
                    Courier and tracking
                  </p>
                </div>
              </div>

              <dl className="mt-6 space-y-4 text-sm">
                <div>
                  <dt className="text-slate-500">Courier</dt>

                  <dd className="mt-1 font-black text-slate-800">
                    {order.courier_name || "Not assigned yet"}
                  </dd>
                </div>

                <div>
                  <dt className="text-slate-500">Tracking number</dt>

                  <dd className="mt-1 break-all font-black text-slate-800">
                    {order.tracking_number || "Not available yet"}
                  </dd>
                </div>

                <div>
                  <dt className="text-slate-500">Order date</dt>

                  <dd className="mt-1 inline-flex items-center gap-2 font-bold text-slate-700">
                    <CalendarDays size={15} />
                    {formatDate(order.created_at)}
                  </dd>
                </div>
              </dl>

              {order.tracking_number && (
                <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-sm font-bold leading-6 text-blue-700">
                    Use this tracking number on the courier website to
                    check the latest delivery update.
                  </p>
                </div>
              )}
            </section>

            {/* Help */}
            <section className="rounded-3xl border border-orange-100 bg-gradient-to-br from-[#fff7f3] to-white p-5 shadow-sm sm:p-6">
              <h2 className="font-black text-slate-900">
                Need help with your order?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Contact support and include your order ID so the team can
                assist you quickly.
              </p>

              <Link
                href="/contact"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#f36a47] px-4 py-3 text-sm font-black text-white transition hover:bg-[#df5b3b]"
              >
                Contact support
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}