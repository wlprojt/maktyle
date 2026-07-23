

import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  CircleUserRound,
  Clock3,
  Gift,
  ImageIcon,
  Mail,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Heart,
  Truck,
  UserRound,
  WalletCards,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "@/app/dashboard/logout-button";

type OrderItem = {
  id: string;
  product_title: string | null;
  product_image_url: string | null;
  preview_url: string | null;
};

type Order = {
  id: string;
  total_amount: number | string | null;
  order_status: string | null;
  payment_status: string | null;
  created_at: string;
  order_items: OrderItem[] | null;
};

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
  return (value || "pending").replaceAll("_", " ");
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

async function createSignedPreviewUrl(
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
    console.error("Dashboard preview signing failed:", error);
    return null;
  }

  return data.signedUrl;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "User";

  const avatar =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    "/profile.jpg";

  const [
  { data: ordersData, error: ordersError },
  { count: designCount, error: designsError },
  { count: favoriteCount, error: favoritesError },
] = await Promise.all([
  supabase
    .from("orders")
    .select(`
      id,
      total_amount,
      order_status,
      payment_status,
      created_at,
      order_items (
        id,
        product_title,
        product_image_url,
        preview_url
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false }),

  supabase
    .from("custom_designs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id),

  supabase
    .from("favorites")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id),
]);

  if (ordersError) {
    console.error("Unable to load dashboard orders:", ordersError);
  }

  if (designsError) {
    console.error("Unable to load design count:", designsError);
  }

  const orders = (ordersData ?? []) as Order[];

  const recentOrders = await Promise.all(
    orders.slice(0, 5).map(async (order) => {
      const firstItem = order.order_items?.[0];

      const [previewUrl, productImageUrl] = await Promise.all([
        createSignedPreviewUrl(supabase, firstItem?.preview_url),
        createSignedPreviewUrl(supabase, firstItem?.product_image_url),
      ]);

      return {
        ...order,
        firstItem,
        previewUrl,
        productImageUrl,
      };
    }),
  );

  const totalSpent = orders
    .filter((order) => order.payment_status === "paid")
    .reduce(
      (sum, order) => sum + Number(order.total_amount ?? 0),
      0,
    );

  const activeOrders = orders.filter((order) =>
    [
      "placed",
      "processing",
      "printing",
      "packed",
      "shipped",
    ].includes(order.order_status || ""),
  ).length;

  const stats = [
    {
      title: "Total Orders",
      value: String(orders.length),
      description: "All purchases",
      href: "/dashboard/orders",
      icon: ShoppingBag,
      iconClass: "bg-purple-50 text-purple-600",
    },
    {
      title: "Total Spent",
      value: formatCurrency(totalSpent),
      description: "Paid orders",
      href: "/dashboard/orders",
      icon: WalletCards,
      iconClass: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Active Orders",
      value: String(activeOrders),
      description: "In progress",
      href: "/dashboard/orders",
      icon: Truck,
      iconClass: "bg-blue-50 text-blue-600",
    },
    {
  title: "Favorite Products",
  value: String(favoriteCount ?? 0),
  description: "Your Favorites",
  href: "/dashboard/favorites",
  icon: Heart,
  iconClass: "bg-pink-50 text-pink-600",
}
  ];

  if (favoritesError) {
  console.error("Unable to load favorites count:", favoritesError);
}

  const quickActions = [
    {
      label: "Track Order",
      description: "Check delivery status",
      icon: Package,
      href: "/dashboard/orders",
      iconClass: "bg-purple-50 text-purple-600",
    },
    {
      label: "Create Gift",
      description: "Start a new design",
      icon: Gift,
      href: "/shop",
      iconClass: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "My Designs",
      description: "View saved designs",
      icon: ImageIcon,
      href: "/dashboard/designs",
      iconClass: "bg-blue-50 text-blue-600",
    },
    {
      label: "Edit Profile",
      description: "Update account details",
      icon: UserRound,
      href: "/dashboard/settings",
      iconClass: "bg-pink-50 text-pink-600",
    },
  ];

  

  return (
    <main className="min-h-screen bg-[#faf9fc] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        <section className="relative overflow-hidden rounded-3xl border border-purple-100 bg-gradient-to-br from-[#f8f2ff] via-white to-[#fff5f1] p-5 shadow-sm sm:p-8">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-purple-200/30 blur-3xl" />
          <div className="absolute -bottom-24 right-28 h-64 w-64 rounded-full bg-orange-200/30 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="flex min-w-0 items-center gap-4 sm:gap-5">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-purple-100 shadow-md sm:h-24 sm:w-24">
                <Image
                  src={avatar}
                  alt={`${fullName} profile`}
                  fill
                  priority
                  unoptimized
                  className="object-cover"
                />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-[#8549e8]">
                  Welcome back
                </p>

                <h1 className="mt-1 text-2xl font-black sm:text-4xl">
                  {fullName}
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                  Manage orders, review your designs and create your next
                  personalized gift.
                </p>
              </div>
            </div>

            <div className="flex w-full flex-wrap gap-3 md:w-auto">
              <Link
                href="/shop"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#8549e8] px-5 py-3 text-sm font-black text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:bg-[#7440d0] sm:flex-none"
              >
                <Gift size={18} />
                Create a gift
              </Link>

              <LogoutButton />
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Link
                key={stat.title}
                href={stat.href}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-purple-200 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.iconClass}`}
                  >
                    <Icon size={24} strokeWidth={2} />
                  </div>

                  <ChevronRight
                    size={19}
                    className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#8549e8]"
                  />
                </div>

                <p className="mt-5 text-sm font-semibold text-slate-500">
                  {stat.title}
                </p>

                <p className="mt-1 text-3xl font-black tracking-tight">
                  {stat.value}
                </p>

                <p className="mt-2 text-xs font-medium text-slate-400">
                  {stat.description}
                </p>
              </Link>
            );
          })}
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">Recent orders</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your latest purchases and delivery progress.
                </p>
              </div>

              <Link
                href="/dashboard/orders"
                className="inline-flex shrink-0 items-center gap-1 text-sm font-black text-[#8549e8]"
              >
                View all
                <ChevronRight size={17} />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                <ShoppingBag className="mx-auto text-slate-300" size={44} />

                <h3 className="mt-4 text-lg font-black">
                  No orders yet
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Create your first personalized product and it will appear
                  here.
                </p>

                <Link
                  href="/shop"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#8549e8] px-5 py-3 text-sm font-black text-white"
                >
                  <Gift size={17} />
                  Browse products
                </Link>
              </div>
            ) : (
              <div className="mt-6 divide-y divide-slate-100">
                {recentOrders.map((order) => {
                  const image =
                    order.previewUrl ||
                    order.productImageUrl ||
                    null;

                  return (
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      key={order.id}
                      className="group grid grid-cols-[58px_minmax(0,1fr)] items-start gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[64px_minmax(0,1fr)_auto] sm:items-center sm:gap-4"
                    >
                      <div className="relative h-[58px] w-[58px] overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 sm:h-16 sm:w-16">
                        {image ? (
                          <Image
                            src={image}
                            alt={
                              order.firstItem?.product_title ||
                              "Order preview"
                            }
                            fill
                            unoptimized
                            className="object-contain p-1.5"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package
                              size={24}
                              className="text-slate-300"
                            />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="min-w-0 truncate font-black text-slate-800">
                            {order.firstItem?.product_title ||
                              "Personalized order"}
                          </h3>

                          <ChevronRight
                            size={18}
                            className="mt-0.5 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#8549e8] sm:hidden"
                          />
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          Order #{order.id.slice(0, 8)}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-black capitalize ring-1 ring-inset ${getStatusClass(
                              order.order_status,
                            )}`}
                          >
                            {normalizeStatus(order.order_status)}
                          </span>

                          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                            <Clock3 size={13} />
                            {formatDate(order.created_at)}
                          </span>
                        </div>

                        <p className="mt-2 font-black text-slate-800 sm:hidden">
                          {formatCurrency(Number(order.total_amount ?? 0))}
                        </p>
                      </div>

                      <div className="hidden text-right sm:block">
                        <p className="font-black text-slate-800">
                          {formatCurrency(Number(order.total_amount ?? 0))}
                        </p>

                        <ChevronRight
                          size={19}
                          className="ml-auto mt-2 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#8549e8]"
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-black">Quick actions</h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {quickActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="group flex items-center gap-4 rounded-2xl border border-slate-100 p-3.5 transition hover:border-purple-200 hover:bg-purple-50/40"
                    >
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${action.iconClass}`}
                      >
                        <Icon size={21} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-black text-slate-800">
                          {action.label}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {action.description}
                        </p>
                      </div>

                      <ChevronRight
                        size={18}
                        className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#8549e8]"
                      />
                    </Link>
                  );
                })}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black">
                  Account information
                </h2>

                <Link
                  href="/dashboard/settings"
                  className="text-sm font-black text-[#8549e8]"
                >
                  Edit
                </Link>
              </div>

              <div className="mt-4 divide-y divide-slate-100">
                <AccountInfo
                  icon={CircleUserRound}
                  label="Name"
                  value={fullName}
                />

                <AccountInfo
                  icon={Mail}
                  label="Email"
                  value={user.email ?? "Not available"}
                />

                <AccountInfo
                  icon={Phone}
                  label="Phone"
                  value={
                    user.user_metadata?.phone ||
                    "Not added"
                  }
                />

                <AccountInfo
                  icon={MapPin}
                  label="Address"
                  value="Manage saved addresses"
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function AccountInfo({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CircleUserRound;
  label: string;
  value: string;
}) {
  return (
    <Link
      href="/dashboard/settings"
      className="group flex items-center gap-4 py-4"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
        <Icon size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-black text-slate-700">
          {value}
        </p>
      </div>

      <ChevronRight
        size={18}
        className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#8549e8]"
      />
    </Link>
  );
}