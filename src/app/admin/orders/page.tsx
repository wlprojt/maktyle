import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OrdersClient, {
  type AdminOrder,
  type OrderStatistics,
} from "./orders-client";

type PageProps = {
  searchParams: Promise<{
    search?: string;
    status?: string;
    payment?: string;
    page?: string;
  }>;
};

const PAGE_SIZE = 10;

async function checkAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin/orders");
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) {
    redirect("/dashboard");
  }

  return {
    supabase,
    user,
  };
}

export default async function AdminOrdersPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const search = params.search?.trim() ?? "";
  const status = params.status ?? "all";
  const payment = params.payment ?? "all";

  const requestedPage = Number(params.page ?? "1");

  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { supabase } = await checkAdmin();

  let query = supabase
    .from("orders")
    .select(
      `
        id,
        user_id,
        customer_name,
        email,
        phone,
        city,
        state,
        country,
        subtotal,
        shipping_amount,
        total_amount,
        payment_method,
        payment_status,
        order_status,
        razorpay_order_id,
        razorpay_payment_id,
        tracking_number,
        courier_name,
        created_at,
        order_items (
          id,
          product_title,
          product_image_url,
          preview_url,
          frame_name,
          quantity,
          unit_price,
          total_price
        )
      `,
      {
        count: "exact",
      },
    )
    .order("created_at", {
      ascending: false,
    });

  if (status !== "all") {
    query = query.eq("order_status", status);
  }

  if (payment !== "all") {
    query = query.eq("payment_status", payment);
  }

  if (search) {
    query = query.or(
      [
        `id.ilike.%${search}%`,
        `customer_name.ilike.%${search}%`,
        `email.ilike.%${search}%`,
        `phone.ilike.%${search}%`,
        `razorpay_order_id.ilike.%${search}%`,
        `razorpay_payment_id.ilike.%${search}%`,
      ].join(","),
    );
  }

  const {
    data: orderData,
    error: ordersError,
    count,
  } = await query.range(from, to);

  if (ordersError) {
    console.error("Admin orders loading error:", ordersError);
  }

  const { data: allOrdersData, error: statisticsError } =
    await supabase
      .from("orders")
      .select(
        `
          id,
          total_amount,
          payment_status,
          order_status,
          created_at
        `,
      );

  if (statisticsError) {
    console.error(
      "Admin order statistics error:",
      statisticsError,
    );
  }

  const allOrders = allOrdersData ?? [];

  const today = new Date();
  const todayDate = today.toISOString().slice(0, 10);

  const statistics: OrderStatistics = {
    totalOrders: allOrders.length,

    todayOrders: allOrders.filter(
      (order) =>
        order.created_at?.slice(0, 10) === todayDate,
    ).length,

    totalRevenue: allOrders
      .filter((order) => order.payment_status === "paid")
      .reduce(
        (total, order) =>
          total + Number(order.total_amount ?? 0),
        0,
      ),

    pendingPayments: allOrders.filter(
      (order) => order.payment_status === "pending",
    ).length,

    processing: allOrders.filter(
      (order) => order.order_status === "processing",
    ).length,

    printing: allOrders.filter(
      (order) => order.order_status === "printing",
    ).length,

    packed: allOrders.filter(
      (order) => order.order_status === "packed",
    ).length,

    shipped: allOrders.filter(
      (order) => order.order_status === "shipped",
    ).length,

    delivered: allOrders.filter(
      (order) => order.order_status === "delivered",
    ).length,

    cancelled: allOrders.filter(
      (order) => order.order_status === "cancelled",
    ).length,
  };

  const normalizedOrders: AdminOrder[] = (
    orderData ?? []
  ).map((order) => ({
    id: order.id,
    user_id: order.user_id,
    customer_name: order.customer_name,
    email: order.email,
    phone: order.phone,
    city: order.city,
    state: order.state,
    country: order.country,

    subtotal: Number(order.subtotal ?? 0),
    shipping_amount: Number(
      order.shipping_amount ?? 0,
    ),
    total_amount: Number(order.total_amount ?? 0),

    payment_method: order.payment_method,
    payment_status: order.payment_status,
    order_status: order.order_status,

    razorpay_order_id: order.razorpay_order_id,
    razorpay_payment_id: order.razorpay_payment_id,

    tracking_number: order.tracking_number,
    courier_name: order.courier_name,

    created_at: order.created_at,

    order_items: (order.order_items ?? []).map(
      (item) => ({
        id: item.id,
        product_title: item.product_title,
        product_image_url: item.product_image_url,
        preview_url: item.preview_url,
        frame_name: item.frame_name,
        quantity: Number(item.quantity ?? 1),
        unit_price: Number(item.unit_price ?? 0),
        total_price: Number(item.total_price ?? 0),
      }),
    ),
  }));

  const totalPages = Math.max(
    1,
    Math.ceil((count ?? 0) / PAGE_SIZE),
  );

  return (
    <OrdersClient
      orders={normalizedOrders}
      statistics={statistics}
      currentPage={currentPage}
      totalPages={totalPages}
      totalResults={count ?? 0}
      initialSearch={search}
      initialStatus={status}
      initialPayment={payment}
    />
  );
}