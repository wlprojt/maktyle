import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type UpdateOrderBody = {
  orderStatus?: string;
  paymentStatus?: string;
  courierName?: string;
  trackingNumber?: string;
  notes?: string;
};

const allowedOrderStatuses = new Set([
  "payment_pending",
  "placed",
  "processing",
  "printing",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
]);

const allowedPaymentStatuses = new Set([
  "pending",
  "authorized",
  "paid",
  "failed",
  "verification_failed",
  "refunded",
]);

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized request.",
        },
        {
          status: 401,
        },
      );
    }

    const { data: admin } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!admin) {
      return NextResponse.json(
        {
          error:
            "You do not have admin permission.",
        },
        {
          status: 403,
        },
      );
    }

    const body =
      (await request.json()) as UpdateOrderBody;

    const orderStatus =
      body.orderStatus?.trim();

    const paymentStatus =
      body.paymentStatus?.trim();

    if (
      !orderStatus ||
      !allowedOrderStatuses.has(orderStatus)
    ) {
      return NextResponse.json(
        {
          error: "Invalid order status.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !paymentStatus ||
      !allowedPaymentStatuses.has(
        paymentStatus,
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid payment status.",
        },
        {
          status: 400,
        },
      );
    }

    const now = new Date().toISOString();

    const updateData: Record<
      string,
      string | null
    > = {
      order_status: orderStatus,
      payment_status: paymentStatus,
      courier_name:
        body.courierName?.trim() || null,
      tracking_number:
        body.trackingNumber?.trim() || null,
      notes: body.notes?.trim() || null,
      updated_at: now,
    };

    if (orderStatus === "shipped") {
      updateData.shipped_at = now;
    }

    if (orderStatus === "delivered") {
      updateData.delivered_at = now;
    }

    if (orderStatus === "cancelled") {
      updateData.cancelled_at = now;
    }

    const { data: order, error } =
      await supabase
        .from("orders")
        .update(updateData)
        .eq("id", id)
        .select(`
          id,
          order_status,
          payment_status,
          courier_name,
          tracking_number,
          notes,
          shipped_at,
          delivered_at,
          cancelled_at,
          updated_at
        `)
        .single();

    if (error || !order) {
      console.error(
        "Admin order update error:",
        error,
      );

      return NextResponse.json(
        {
          error: "Unable to update order.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(
      "Admin order API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while updating the order.",
      },
      {
        status: 500,
      },
    );
  }
}