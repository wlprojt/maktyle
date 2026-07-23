import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ReceiptText,
} from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import PrintInvoiceButton from "./print-invoice-button";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type OrderItem = {
  id: string;
  product_title?: string | null;
  product_image_url?: string | null;
  preview_url?: string | null;
  quantity?: number | null;
  unit_price?: number | string | null;
};

type Order = {
  id: string;
  user_id: string;

  total_amount?: number | string | null;
  subtotal?: number | string | null;
  shipping_amount?: number | string | null;
  discount_amount?: number | string | null;
  tax_amount?: number | string | null;

  order_status?: string | null;
  payment_status?: string | null;
  payment_method?: string | null;
  payment_id?: string | null;

  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;

  shipping_name?: string | null;
  shipping_phone?: string | null;
  shipping_address_line_1?: string | null;
  shipping_address_line_2?: string | null;
  shipping_city?: string | null;
  shipping_state?: string | null;
  shipping_postal_code?: string | null;
  shipping_country?: string | null;

  created_at?: string | null;
  order_items?: OrderItem[] | null;
};

function toNumber(value?: number | string | null) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function formatCurrency(value?: number | string | null) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(toNumber(value));
}

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

function createInvoiceNumber(order: Order) {
  const date = order.created_at
    ? new Date(order.created_at)
    : new Date();

  const year = Number.isNaN(date.getTime())
    ? new Date().getFullYear()
    : date.getFullYear();

  return `MKT-${year}-${order.id.slice(0, 8).toUpperCase()}`;
}

function getStoragePath(value?: string | null) {
  if (!value) {
    return null;
  }

  if (
    !value.startsWith("http://") &&
    !value.startsWith("https://")
  ) {
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
        value
          .slice(index + marker.length)
          .split("?")[0],
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
    console.error("Unable to sign invoice image:", {
      message: error.message,
      name: error.name,
    });

    return null;
  }

  return data.signedUrl;
}

export default async function AdminInvoicePage({
  params,
}: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?redirect=/admin/orders/${id}/invoice`,
    );
  }

  /*
   * Verify that the logged-in user is an administrator.
   */
  const { data: admin, error: adminError } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError) {
    console.error("Unable to verify administrator:", {
      message: adminError.message,
      details: adminError.details,
      hint: adminError.hint,
      code: adminError.code,
    });
  }

  if (!admin) {
    redirect("/dashboard");
  }

  /*
   * Do not add `.eq("user_id", user.id)` here.
   * An administrator must be able to access every order.
   */
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
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
    .maybeSingle();

  if (error) {
    console.error("Unable to load admin invoice:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
  }

  if (!data) {
    notFound();
  }

  const order = data as Order;

  const items = await Promise.all(
    (order.order_items ?? []).map(async (item) => ({
      ...item,
      imageUrl: await createSignedImageUrl(
        supabase,
        item.preview_url || item.product_image_url,
      ),
    })),
  );

  const calculatedSubtotal = items.reduce(
    (total, item) => {
      const quantity = Math.max(
        1,
        toNumber(item.quantity),
      );

      return (
        total +
        toNumber(item.unit_price) * quantity
      );
    },
    0,
  );

  const subtotal =
    order.subtotal !== null &&
    order.subtotal !== undefined
      ? toNumber(order.subtotal)
      : calculatedSubtotal;

  const shipping = toNumber(order.shipping_amount);
  const discount = toNumber(order.discount_amount);
  const tax = toNumber(order.tax_amount);

  const total =
    order.total_amount !== null &&
    order.total_amount !== undefined
      ? toNumber(order.total_amount)
      : subtotal + shipping + tax - discount;

  const customerName =
    order.customer_name ||
    order.shipping_name ||
    "Maktyle Customer";

  const customerEmail =
    order.customer_email || "";

  const customerPhone =
    order.customer_phone ||
    order.shipping_phone ||
    "";

  const invoiceNumber = createInvoiceNumber(order);

  return (
    <main className="min-h-screen bg-slate-100 py-6 text-slate-900 sm:py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-5 flex flex-col gap-3 print:hidden sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={`/admin/orders/${order.id}`}
            className="inline-flex items-center gap-2 text-sm font-black text-[#8549e8] transition hover:text-[#7440d0]"
          >
            <ArrowLeft size={17} />
            Back to order
          </Link>

          <PrintInvoiceButton
            invoiceNumber={invoiceNumber}
          />
        </div>

        <article
          id="invoice"
          className="overflow-hidden rounded-3xl bg-white shadow-xl print:rounded-none print:shadow-none"
        >
          <header className="border-b border-slate-200 p-6 sm:p-10">
            <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-start">
              <div>
                <div className="inline-flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8549e8] to-[#f36a47] text-white">
                    <ReceiptText size={24} />
                  </div>

                  <div>
                    <h1 className="text-3xl font-black tracking-tight text-[#8549e8]">
                      maktyle
                    </h1>

                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                      Personalized gifts
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-1 text-sm leading-6 text-slate-500">
                  <p className="font-black text-slate-800">
                    Maktyle
                  </p>
                  <p>Jabalpur, Madhya Pradesh</p>
                  <p>India</p>
                  <p>support@maktyle.com</p>
                </div>
              </div>

              <div className="sm:text-right">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#f36a47]">
                  Tax Invoice
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-900">
                  {invoiceNumber}
                </h2>

                <dl className="mt-5 space-y-2 text-sm">
                  <div className="flex gap-5 sm:justify-end">
                    <dt className="font-semibold text-slate-400">
                      Invoice date
                    </dt>

                    <dd className="font-black text-slate-700">
                      {formatDate(order.created_at)}
                    </dd>
                  </div>

                  <div className="flex gap-5 sm:justify-end">
                    <dt className="font-semibold text-slate-400">
                      Order ID
                    </dt>

                    <dd className="font-black text-slate-700">
                      #{order.id
                        .slice(0, 8)
                        .toUpperCase()}
                    </dd>
                  </div>

                  <div className="flex gap-5 sm:justify-end">
                    <dt className="font-semibold text-slate-400">
                      Order status
                    </dt>

                    <dd className="font-black capitalize text-slate-700">
                      {order.order_status || "Pending"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </header>

          <section className="grid gap-6 border-b border-slate-200 p-6 sm:grid-cols-2 sm:p-10">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                Bill to
              </p>

              <div className="mt-4 space-y-1 text-sm leading-6 text-slate-600">
                <p className="text-base font-black text-slate-900">
                  {customerName}
                </p>

                {customerEmail && <p>{customerEmail}</p>}
                {customerPhone && <p>{customerPhone}</p>}
              </div>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                Ship to
              </p>

              <div className="mt-4 space-y-1 text-sm leading-6 text-slate-600">
                <p className="font-black text-slate-900">
                  {order.shipping_name || customerName}
                </p>

                {order.shipping_address_line_1 ? (
                  <>
                    <p>
                      {order.shipping_address_line_1}
                    </p>

                    {order.shipping_address_line_2 && (
                      <p>
                        {order.shipping_address_line_2}
                      </p>
                    )}

                    <p>
                      {[
                        order.shipping_city,
                        order.shipping_state,
                        order.shipping_postal_code,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>

                    <p>
                      {order.shipping_country || "India"}
                    </p>
                  </>
                ) : (
                  <p className="text-slate-400">
                    Delivery address unavailable
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="p-6 sm:p-10">
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="hidden grid-cols-[minmax(0,1fr)_100px_130px_130px] gap-4 bg-slate-50 px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-500 sm:grid">
                <p>Item</p>
                <p className="text-center">Quantity</p>
                <p className="text-right">Price</p>
                <p className="text-right">Amount</p>
              </div>

              <div className="divide-y divide-slate-200">
                {items.map((item) => {
                  const quantity = Math.max(
                    1,
                    toNumber(item.quantity),
                  );

                  const price = toNumber(item.unit_price);
                  const amount = price * quantity;

                  return (
                    <div
                      key={item.id}
                      className="grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_100px_130px_130px] sm:items-center"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={
                                item.product_title ||
                                "Ordered item"
                              }
                              fill
                              unoptimized
                              sizes="64px"
                              className="object-contain p-1"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <ReceiptText
                                size={22}
                                className="text-slate-300"
                              />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="font-black text-slate-900">
                            {item.product_title ||
                              "Personalized product"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Item #
                            {item.id
                              .slice(0, 8)
                              .toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between text-sm sm:block sm:text-center">
                        <span className="font-semibold text-slate-400 sm:hidden">
                          Quantity
                        </span>

                        <span className="font-black text-slate-700">
                          {quantity}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm sm:block sm:text-right">
                        <span className="font-semibold text-slate-400 sm:hidden">
                          Price
                        </span>

                        <span className="font-bold text-slate-700">
                          {formatCurrency(price)}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm sm:block sm:text-right">
                        <span className="font-semibold text-slate-400 sm:hidden">
                          Amount
                        </span>

                        <span className="font-black text-slate-900">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <dl className="w-full max-w-sm space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="font-semibold text-slate-500">
                    Subtotal
                  </dt>

                  <dd className="font-black text-slate-800">
                    {formatCurrency(subtotal)}
                  </dd>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <dt className="font-semibold">
                      Discount
                    </dt>

                    <dd className="font-black">
                      -{formatCurrency(discount)}
                    </dd>
                  </div>
                )}

                <div className="flex justify-between">
                  <dt className="font-semibold text-slate-500">
                    Shipping
                  </dt>

                  <dd className="font-black text-slate-800">
                    {shipping > 0
                      ? formatCurrency(shipping)
                      : "Free"}
                  </dd>
                </div>

                {tax > 0 && (
                  <div className="flex justify-between">
                    <dt className="font-semibold text-slate-500">
                      Tax
                    </dt>

                    <dd className="font-black text-slate-800">
                      {formatCurrency(tax)}
                    </dd>
                  </div>
                )}

                <div className="flex justify-between border-t border-slate-200 pt-4">
                  <dt className="text-lg font-black">
                    Total
                  </dt>

                  <dd className="text-xl font-black text-[#8549e8]">
                    {formatCurrency(total)}
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="grid gap-5 border-t border-slate-200 bg-slate-50 p-6 text-sm sm:grid-cols-3 sm:p-10">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                Payment method
              </p>

              <p className="mt-2 font-black capitalize text-slate-800">
                {order.payment_method ||
                  "Not available"}
              </p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                Payment status
              </p>

              <p
                className={`mt-2 font-black capitalize ${
                  order.payment_status === "paid"
                    ? "text-emerald-600"
                    : "text-amber-600"
                }`}
              >
                {order.payment_status || "Pending"}
              </p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                Transaction ID
              </p>

              <p className="mt-2 break-all font-black text-slate-800">
                {order.payment_id || "Not available"}
              </p>
            </div>
          </section>

          <footer className="border-t border-slate-200 p-6 text-center sm:p-8">
            <p className="font-black text-slate-800">
              Thank you for shopping with Maktyle.
            </p>

            <p className="mt-2 text-xs text-slate-400">
              This invoice was generated electronically.
            </p>
          </footer>
        </article>
      </div>
    </main>
  );
}