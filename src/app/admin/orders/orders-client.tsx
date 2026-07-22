"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Box,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Eye,
  Loader2,
  Package,
  PackageCheck,
  PackageOpen,
  Printer,
  RefreshCcw,
  Search,
  ShoppingBag,
  Truck,
  UserRound,
  XCircle,
} from "lucide-react";
import {
  type FormEvent,
  type ReactNode,
  useState,
} from "react";

export type AdminOrderItem = {
  id: string;
  product_title: string;
  product_image_url: string | null;
  preview_url: string | null;
  frame_name: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export type AdminOrder = {
  id: string;
  user_id: string;

  customer_name: string;
  email: string;
  phone: string;

  city: string;
  state: string;
  country: string;

  subtotal: number;
  shipping_amount: number;
  total_amount: number;

  payment_method: string;
  payment_status: string;
  order_status: string;

  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;

  tracking_number: string | null;
  courier_name: string | null;

  created_at: string;
  order_items: AdminOrderItem[];
};

export type OrderStatistics = {
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  pendingPayments: number;
  processing: number;
  printing: number;
  packed: number;
  shipped: number;
  delivered: number;
  cancelled: number;
};

type Props = {
  orders: AdminOrder[];
  statistics: OrderStatistics;
  currentPage: number;
  totalPages: number;
  totalResults: number;
  initialSearch: string;
  initialStatus: string;
  initialPayment: string;
};

const orderStatuses = [
  "all",
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
  "all",
  "pending",
  "paid",
  "authorized",
  "failed",
  "refunded",
  "verification_failed",
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

export default function OrdersClient({
  orders,
  statistics,
  currentPage,
  totalPages,
  totalResults,
  initialSearch,
  initialStatus,
  initialPayment,
}: Props) {
  const router = useRouter();

  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] =
    useState(initialStatus);
  const [payment, setPayment] =
    useState(initialPayment);
  const [loading, setLoading] = useState(false);

  function buildUrl(page = 1) {
    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (status !== "all") {
      params.set("status", status);
    }

    if (payment !== "all") {
      params.set("payment", payment);
    }

    params.set("page", String(page));

    return `/admin/orders?${params.toString()}`;
  }

  function applyFilters(event?: FormEvent) {
    event?.preventDefault();

    setLoading(true);
    router.push(buildUrl(1));

    window.setTimeout(() => {
      setLoading(false);
    }, 500);
  }

  function resetFilters() {
    setSearch("");
    setStatus("all");
    setPayment("all");

    setLoading(true);
    router.push("/admin/orders");

    window.setTimeout(() => {
      setLoading(false);
    }, 500);
  }

  function changePage(page: number) {
    setLoading(true);
    router.push(buildUrl(page));

    window.setTimeout(() => {
      setLoading(false);
    }, 500);
  }

  const statisticCards = [
    {
      title: "Total orders",
      value: statistics.totalOrders,
      icon: <ShoppingBag size={22} />,
    },
    {
      title: "Today's orders",
      value: statistics.todayOrders,
      icon: <CalendarDays size={22} />,
    },
    {
      title: "Paid revenue",
      value: formatCurrency(
        statistics.totalRevenue,
      ),
      icon: <CircleDollarSign size={22} />,
    },
    {
      title: "Pending payment",
      value: statistics.pendingPayments,
      icon: <Clock3 size={22} />,
    },
    {
      title: "Processing",
      value: statistics.processing,
      icon: <PackageOpen size={22} />,
    },
    {
      title: "Printing",
      value: statistics.printing,
      icon: <Printer size={22} />,
    },
    {
      title: "Packed",
      value: statistics.packed,
      icon: <Box size={22} />,
    },
    {
      title: "Shipped",
      value: statistics.shipped,
      icon: <Truck size={22} />,
    },
    {
      title: "Delivered",
      value: statistics.delivered,
      icon: <PackageCheck size={22} />,
    },
    {
      title: "Cancelled",
      value: statistics.cancelled,
      icon: <XCircle size={22} />,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold text-[#8549e8]">
              Maktyle Admin
            </p>

            <h1 className="mt-1 text-3xl font-black text-slate-900">
              Orders
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage payments, customization,
              production and delivery.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.refresh()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:border-[#8549e8] hover:text-[#8549e8]"
          >
            <RefreshCcw size={17} />
            Refresh
          </button>
        </div>

        <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {statisticCards.map((card) => (
            <StatisticCard
              key={card.title}
              title={card.title}
              value={card.value}
              icon={card.icon}
            />
          ))}
        </section>

        <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <form
            onSubmit={applyFilters}
            className="grid gap-4 lg:grid-cols-[1fr_210px_210px_auto_auto]"
          >
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search order ID, name, phone or Razorpay ID"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#8549e8] focus:bg-white focus:ring-4 focus:ring-purple-100"
              />
            </div>

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-[#8549e8]"
            >
              {orderStatuses.map((item) => (
                <option key={item} value={item}>
                  {item === "all"
                    ? "All order statuses"
                    : formatLabel(item)}
                </option>
              ))}
            </select>

            <select
              value={payment}
              onChange={(event) =>
                setPayment(event.target.value)
              }
              className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-[#8549e8]"
            >
              {paymentStatuses.map((item) => (
                <option key={item} value={item}>
                  {item === "all"
                    ? "All payment statuses"
                    : formatLabel(item)}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#8549e8] px-6 text-sm font-black text-white transition hover:bg-[#7440ce] disabled:opacity-60"
            >
              {loading ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Search size={18} />
              )}
              Apply
            </button>

            <button
              type="button"
              onClick={resetFilters}
              className="h-12 rounded-xl border border-slate-200 px-5 text-sm font-black text-slate-600 hover:border-slate-400"
            >
              Reset
            </button>
          </form>
        </section>

        <section className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 sm:px-6">
            <div>
              <h2 className="font-black text-slate-900">
                Order list
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {totalResults} orders found
              </p>
            </div>

            {loading && (
              <Loader2
                size={20}
                className="animate-spin text-[#8549e8]"
              />
            )}
          </div>

          {orders.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
              <Package
                size={48}
                className="text-slate-300"
              />

              <h3 className="mt-4 text-lg font-black text-slate-800">
                No orders found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1200px]">
                  <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-4">
                        Order
                      </th>
                      <th className="px-5 py-4">
                        Customer
                      </th>
                      <th className="px-5 py-4">
                        Products
                      </th>
                      <th className="px-5 py-4">
                        Amount
                      </th>
                      <th className="px-5 py-4">
                        Payment
                      </th>
                      <th className="px-5 py-4">
                        Status
                      </th>
                      <th className="px-5 py-4">
                        Date
                      </th>
                      <th className="px-5 py-4 text-right">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-5">
                          <p className="font-black text-slate-900">
                            #{order.id.slice(0, 8)}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {order.payment_method}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-[#8549e8]">
                              <UserRound size={18} />
                            </div>

                            <div>
                              <p className="font-bold text-slate-800">
                                {order.customer_name}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {order.phone}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-bold text-slate-800">
                            {order.order_items.length}{" "}
                            item
                            {order.order_items.length ===
                            1
                              ? ""
                              : "s"}
                          </p>

                          <p className="mt-1 max-w-48 truncate text-xs text-slate-500">
                            {order.order_items
                              .map(
                                (item) =>
                                  item.product_title,
                              )
                              .join(", ")}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-black text-slate-900">
                            {formatCurrency(
                              order.total_amount,
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <StatusBadge
                            value={
                              order.payment_status
                            }
                            type="payment"
                          />
                        </td>

                        <td className="px-5 py-5">
                          <StatusBadge
                            value={order.order_status}
                            type="order"
                          />
                        </td>

                        <td className="px-5 py-5 text-sm text-slate-500">
                          {formatDate(
                            order.created_at,
                          )}
                        </td>

                        <td className="px-5 py-5 text-right">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:border-[#8549e8] hover:text-[#8549e8]"
                          >
                            <Eye size={16} />
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 lg:hidden">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-black text-slate-900">
                          #{order.id.slice(0, 8)}
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-700">
                          {order.customer_name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(
                            order.created_at,
                          )}
                        </p>
                      </div>

                      <p className="font-black text-[#8549e8]">
                        {formatCurrency(
                          order.total_amount,
                        )}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <StatusBadge
                        value={order.payment_status}
                        type="payment"
                      />

                      <StatusBadge
                        value={order.order_status}
                        type="order"
                      />
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm text-slate-500">
                        {order.order_items.length}{" "}
                        product(s)
                      </p>

                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white"
                      >
                        <Eye size={16} />
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 px-5 py-5 sm:flex-row sm:px-6">
            <p className="text-sm text-slate-500">
              Page {currentPage} of {totalPages}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() =>
                  changePage(currentPage - 1)
                }
                className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-black text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={17} />
                Previous
              </button>

              <button
                type="button"
                disabled={
                  currentPage >= totalPages
                }
                onClick={() =>
                  changePage(currentPage + 1)
                }
                className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-black text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatisticCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-[#8549e8]">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-2xl font-black text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">
        {title}
      </p>
    </div>
  );
}

export function StatusBadge({
  value,
  type,
}: {
  value: string;
  type: "payment" | "order";
}) {
  let classes =
    "border-slate-200 bg-slate-100 text-slate-700";

  if (
    value === "paid" ||
    value === "delivered"
  ) {
    classes =
      "border-green-200 bg-green-50 text-green-700";
  } else if (
    value === "pending" ||
    value === "payment_pending" ||
    value === "placed"
  ) {
    classes =
      "border-amber-200 bg-amber-50 text-amber-700";
  } else if (
    value === "processing" ||
    value === "printing" ||
    value === "authorized"
  ) {
    classes =
      "border-blue-200 bg-blue-50 text-blue-700";
  } else if (
    value === "packed" ||
    value === "shipped"
  ) {
    classes =
      "border-purple-200 bg-purple-50 text-purple-700";
  } else if (
    value === "cancelled" ||
    value === "failed" ||
    value === "verification_failed"
  ) {
    classes =
      "border-red-200 bg-red-50 text-red-700";
  } else if (value === "refunded") {
    classes =
      "border-orange-200 bg-orange-50 text-orange-700";
  }

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${classes}`}
    >
      {formatLabel(value || type)}
    </span>
  );
}