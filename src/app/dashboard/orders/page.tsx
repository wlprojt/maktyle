import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Clock3,
  Package,
  Search,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

type SearchParams = Promise<{
  status?: string;
  search?: string;
}>;

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
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function normalizeStatus(value?: string | null) {
  return (value || "pending")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusClass(status?: string | null) {
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

function getStoragePath(value?: string | null) {
  if (!value) return null;

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
  if (!value) return null;

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
    console.error("Order image signing failed:", error);
    return null;
  }

  return data.signedUrl;
}

const statusFilters = [
  { label: "All", value: "all" },
  { label: "Processing", value: "processing" },
  { label: "Printing", value: "printing" },
  { label: "Packed", value: "packed" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/orders");
  }

  const params = await searchParams;
  const selectedStatus = params.status || "all";
  const search = params.search?.trim() || "";

  let query = supabase
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
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (selectedStatus !== "all") {
    query = query.eq("order_status", selectedStatus);
  }

  const { data: ordersData, error } = await query;

  if (error) {
    console.error("Unable to load orders:", error);
  }

  const rawOrders = (ordersData ?? []) as Order[];

  const filteredOrders = search
    ? rawOrders.filter((order) => {
        const term = search.toLowerCase();
        const productTitle =
          order.order_items?.[0]?.product_title?.toLowerCase() || "";

        return (
          order.id.toLowerCase().includes(term) ||
          productTitle.includes(term) ||
          (order.tracking_number || "").toLowerCase().includes(term)
        );
      })
    : rawOrders;

  const orders = await Promise.all(
    filteredOrders.map(async (order) => {
      const firstItem = order.order_items?.[0];

      const [previewUrl, productImageUrl] = await Promise.all([
        createSignedImageUrl(supabase, firstItem?.preview_url),
        createSignedImageUrl(supabase, firstItem?.product_image_url),
      ]);

      return {
        ...order,
        firstItem,
        image: previewUrl || productImageUrl,
        itemCount:
          order.order_items?.reduce(
            (sum, item) => sum + Number(item.quantity || 1),
            0,
          ) || 0,
      };
    }),
  );

  return (
    <main className="min-h-screen bg-[#faf9fc] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-black text-[#8549e8]"
            >
              <ArrowLeft size={17} />
              Back to dashboard
            </Link>

            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              My Orders
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              View purchases, payment details and delivery progress.
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

        <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <form
            action="/dashboard/orders"
            className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="relative w-full lg:max-w-md">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                name="search"
                defaultValue={search}
                placeholder="Search order ID, product or tracking..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-purple-300 focus:bg-white focus:ring-4 focus:ring-purple-100"
              />

              {selectedStatus !== "all" && (
                <input
                  type="hidden"
                  name="status"
                  value={selectedStatus}
                />
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {statusFilters.map((filter) => {
                const active = selectedStatus === filter.value;
                const href =
                  filter.value === "all"
                    ? search
                      ? `/dashboard/orders?search=${encodeURIComponent(search)}`
                      : "/dashboard/orders"
                    : `/dashboard/orders?status=${filter.value}${
                        search
                          ? `&search=${encodeURIComponent(search)}`
                          : ""
                      }`;

                return (
                  <Link
                    key={filter.value}
                    href={href}
                    className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-black transition ${
                      active
                        ? "bg-[#8549e8] text-white shadow-md shadow-purple-100"
                        : "bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-[#8549e8]"
                    }`}
                  >
                    {filter.label}
                  </Link>
                );
              })}
            </div>
          </form>
        </section>

        <section className="mt-6">
          {orders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
              <Package className="mx-auto text-slate-300" size={52} />

              <h2 className="mt-5 text-xl font-black">No orders found</h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Orders matching your current filter or search will appear here.
              </p>

              <Link
                href="/shop"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#8549e8] px-5 py-3 text-sm font-black text-white"
              >
                <ShoppingBag size={17} />
                Browse products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-slate-400">
                          Order ID
                        </p>
                        <p className="mt-1 font-black text-slate-700">
                          #{order.id.slice(0, 8)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-400">
                          Ordered on
                        </p>
                        <p className="mt-1 inline-flex items-center gap-1.5 font-bold text-slate-600">
                          <CalendarDays size={15} />
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-black ring-1 ring-inset ${getStatusClass(
                        order.order_status,
                      )}`}
                    >
                      {normalizeStatus(order.order_status)}
                    </span>
                  </div>

                  <div className="grid gap-5 p-5 md:grid-cols-[80px_minmax(0,1fr)_auto] md:items-center">
                    <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                      {order.image ? (
                        <Image
                          src={order.image}
                          alt={
                            order.firstItem?.product_title ||
                            "Order product"
                          }
                          fill
                          unoptimized
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package size={28} className="text-slate-300" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-black text-slate-800">
                        {order.firstItem?.product_title ||
                          "Personalized product"}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {order.itemCount}{" "}
                        {order.itemCount === 1 ? "item" : "items"}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 size={14} />
                          Payment:{" "}
                          {normalizeStatus(order.payment_status)}
                        </span>

                        {order.tracking_number && (
                          <span className="inline-flex items-center gap-1.5">
                            <Truck size={14} />
                            {order.courier_name || "Courier"} ·{" "}
                            {order.tracking_number}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4 md:block md:border-0 md:pt-0 md:text-right">
                      <div>
                        <p className="text-xs font-semibold text-slate-400">
                          Order total
                        </p>
                        <p className="mt-1 text-xl font-black text-slate-800">
                          {formatCurrency(
                            Number(order.total_amount ?? 0),
                          )}
                        </p>
                      </div>

                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="mt-0 inline-flex items-center gap-1.5 rounded-xl border border-purple-200 px-4 py-2.5 text-sm font-black text-[#8549e8] transition hover:bg-purple-50 md:mt-4"
                      >
                        View details
                        <ChevronRight size={17} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}