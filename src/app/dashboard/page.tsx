

import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  CircleUserRound,
  Gift,
  Heart,
  MapPin,
  Package,
  RefreshCw,
  ShoppingBag,
  Tag,
  UserRound,
  WalletCards,
  Phone,
  Mail,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "./logout-button";



const stats = [
  {
    title: "Total Orders",
    value: "24",
    linkText: "View all orders",
    href: "/dashboard/orders",
    icon: ShoppingBag,
    iconClass: "bg-purple-50 text-purple-600",
  },
  {
    title: "Total Spent",
    value: "₹18,560",
    linkText: "View transactions",
    href: "/dashboard/payments",
    icon: WalletCards,
    iconClass: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Wishlist Items",
    value: "12",
    linkText: "View wishlist",
    href: "/dashboard/wishlist",
    icon: Heart,
    iconClass: "bg-pink-50 text-pink-500",
  },
  {
    title: "Available Offers",
    value: "5",
    linkText: "View offers",
    href: "/offers",
    icon: Tag,
    iconClass: "bg-blue-50 text-blue-600",
  },
];

const orders = [
  {
    id: "#MT12345",
    title: "Custom Photo Mug",
    image: "/dashboard/mug.png",
    status: "Delivered",
    statusClass: "bg-emerald-50 text-emerald-600",
    date: "12 Jul, 2026",
    price: "₹599",
  },
  {
    id: "#MT12344",
    title: "Personalized LED Frame",
    image: "/dashboard/frame.png",
    status: "Shipped",
    statusClass: "bg-blue-50 text-blue-600",
    date: "10 Jul, 2026",
    price: "₹899",
  },
  {
    id: "#MT12343",
    title: "Custom Name Mobile Cover",
    image: "/dashboard/cover.png",
    status: "Processing",
    statusClass: "bg-orange-50 text-orange-500",
    date: "08 Jul, 2026",
    price: "₹449",
  },
  {
    id: "#MT12342",
    title: "Printed T-Shirt",
    image: "/dashboard/tshirt.png",
    status: "Delivered",
    statusClass: "bg-emerald-50 text-emerald-600",
    date: "05 Jul, 2026",
    price: "₹699",
  },
];

const quickActions = [
  {
    label: "Track Order",
    icon: Package,
    href: "/track-order",
    iconClass: "bg-purple-50 text-purple-600",
  },
  {
    label: "Reorder",
    icon: RefreshCw,
    href: "/dashboard/orders",
    iconClass: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Edit Profile",
    icon: UserRound,
    href: "/dashboard/settings",
    iconClass: "bg-blue-50 text-blue-600",
  },
  {
    label: "Add Address",
    icon: MapPin,
    href: "/dashboard/addresses",
    iconClass: "bg-pink-50 text-pink-500",
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fullName =
  user!.user_metadata?.full_name ||
  user!.user_metadata?.name ||
  user!.email?.split("@")[0] ||
  "User";

const avatar =
  user!.user_metadata?.avatar_url ||
  user!.user_metadata?.picture ||
  "/profile.jpg";

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#fcfbfe] text-slate-900">
      <div className="flex mx-auto max-w-7xl px-5 lg:px-8 min-h-screen">
        

        

        {/* Content */}
        <div className="min-w-0 flex-1">
          

          <div className="p-4 md:p-7">
            {/* Welcome banner */}
            <section className="relative overflow-hidden rounded-2xl border border-purple-100 bg-gradient-to-r from-[#f7f2ff] via-[#fbf8ff] to-[#f4efff] px-5 py-6 sm:px-7">
              <div className="relative z-10 flex items-center gap-5">
                
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-purple-100">
                  <Image
                    src={avatar}
                    alt="Profile"
                    fill
                    priority
                    className="object-cover"
                  />
                </div>

                <div>
                  <h1 className="text-2xl font-extrabold sm:text-3xl">
                    {fullName}
                  </h1>

                  <p className="mt-2 text-sm text-slate-600 sm:text-base">
                    Welcome back! Manage your orders, track deliveries, and create personalized gifts.
                  </p>
                  <LogoutButton />
                </div>
              </div>

              <div className="absolute bottom-[-35px] right-8 hidden items-end gap-3 md:flex">
                <Gift className="h-32 w-32 text-purple-500" />
                <Gift className="h-24 w-24 text-pink-400" />
              </div>
            </section>

            {/* Stats */}
            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <article
                    key={stat.title}
                    className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${stat.iconClass}`}
                      >
                        <Icon size={27} strokeWidth={1.9} />
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">{stat.title}</p>
                        <p className="mt-2 text-3xl font-extrabold">
                          {stat.value}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={stat.href}
                      className="mt-6 flex items-center gap-2 text-sm font-semibold text-purple-600"
                    >
                      {stat.linkText}
                      <ChevronRight size={16} />
                    </Link>
                  </article>
                );
              })}
            </section>

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.9fr)_minmax(320px,1fr)]">
              {/* Recent orders */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-extrabold">Recent Orders</h2>

                  <Link
                    href="/dashboard/orders"
                    className="flex items-center gap-2 text-sm font-semibold text-purple-600"
                  >
                    View all orders
                    <ChevronRight size={17} />
                  </Link>
                </div>

                <div className="mt-5 divide-y divide-slate-100">
                  {orders.map((order) => (
                    <Link
                      href={`/dashboard/orders/${order.id.replace("#", "")}`}
                      key={order.id}
                      className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-4 py-4 transition hover:bg-slate-50 sm:grid-cols-[56px_minmax(0,1fr)_130px_95px_auto]"
                    >
                      <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-slate-100">
                        <Image
                          src={order.image}
                          alt={order.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">{order.title}</h3>
                        <p className="mt-1 text-xs text-slate-500">
                          Order ID: {order.id}
                        </p>
                      </div>

                      <div className="hidden sm:block">
                        <span
                          className={`inline-flex rounded-md px-3 py-1 text-xs font-semibold ${order.statusClass}`}
                        >
                          {order.status}
                        </span>
                        <p className="mt-2 text-xs text-slate-500">
                          {order.date}
                        </p>
                      </div>

                      <p className="hidden text-right font-bold sm:block">
                        {order.price}
                      </p>

                      <ChevronRight size={19} className="text-slate-500" />
                    </Link>
                  ))}
                </div>
              </section>

              <div className="space-y-6">
                {/* Quick actions */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h2 className="text-xl font-extrabold">Quick Actions</h2>

                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-4">
                    {quickActions.map((action) => {
                      const Icon = action.icon;

                      return (
                        <Link
                          key={action.label}
                          href={action.href}
                          className="flex flex-col items-center rounded-xl border border-slate-100 p-3 text-center transition hover:-translate-y-1 hover:border-purple-200 hover:shadow-md"
                        >
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-full ${action.iconClass}`}
                          >
                            <Icon size={23} />
                          </div>

                          <span className="mt-3 text-xs font-medium text-slate-600">
                            {action.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </section>

                {/* Account information */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h2 className="text-xl font-extrabold">
                    Account Information
                  </h2>

                  <div className="mt-4 divide-y divide-slate-100">
                    <AccountInfo
                      icon={CircleUserRound}
                      label="Name"
                      value={fullName}
                    />

                    <AccountInfo
                      icon={Mail}
                      label="Email"
                      value={user.email ?? ""}
                    />

                    <AccountInfo
                      icon={Phone}
                      label="Phone"
                      value={user.user_metadata?.phone ?? "Not Added"}
                    />
                  </div>
                </section>
              </div>
            </div>
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
      className="flex items-center gap-4 py-4 transition hover:bg-slate-50"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600">
        <Icon size={21} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 truncate text-sm font-semibold">{value}</p>
      </div>

      <ChevronRight size={18} className="text-slate-500" />
    </Link>
  );
}