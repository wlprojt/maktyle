import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type CheckoutBody = {
  customerName?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  paymentMethod?: "cod";
};

type DesignRecord = {
  id: string;
  product_id: string;
  product_title: string;
  product_image_url: string | null;
  preview_url: string | null;
  frame_name: string | null;
  design_elements: unknown;
};

type CartRecord = {
  id: string;
  quantity: number | string;
  unit_price: number | string;
  design: DesignRecord[] | DesignRecord | null;
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "You must be logged in to place an order.",
        },
        {
          status: 401,
        },
      );
    }

    const body = (await request.json()) as CheckoutBody;

    const customerName = body.customerName?.trim();
    const email = body.email?.trim();
    const phone = body.phone?.trim();
    const addressLine1 = body.addressLine1?.trim();
    const addressLine2 = body.addressLine2?.trim() || null;
    const city = body.city?.trim();
    const state = body.state?.trim();
    const postalCode = body.postalCode?.trim();
    const country = body.country?.trim() || "India";

    if (
      !customerName ||
      !email ||
      !phone ||
      !addressLine1 ||
      !city ||
      !state ||
      !postalCode
    ) {
      return NextResponse.json(
        {
          error: "Please complete all required delivery fields.",
        },
        {
          status: 400,
        },
      );
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return NextResponse.json(
        {
          error: "Enter a valid 10-digit phone number.",
        },
        {
          status: 400,
        },
      );
    }

    if (!/^[0-9]{6}$/.test(postalCode)) {
      return NextResponse.json(
        {
          error: "Enter a valid 6-digit PIN code.",
        },
        {
          status: 400,
        },
      );
    }

    const { data: cartData, error: cartError } =
      await supabase
        .from("cart_items")
        .select(`
          id,
          quantity,
          unit_price,
          design:custom_designs (
            id,
            product_id,
            product_title,
            product_image_url,
            preview_url,
            frame_name,
            design_elements
          )
        `)
        .eq("user_id", user.id);

    if (cartError) {
      console.error("Checkout cart error:", cartError);

      return NextResponse.json(
        {
          error: "Unable to load your cart.",
        },
        {
          status: 500,
        },
      );
    }

    const cartItems = (
      (cartData ?? []) as unknown as CartRecord[]
    )
      .map((item) => {
        const design = Array.isArray(item.design)
          ? item.design[0] ?? null
          : item.design;

        return {
          ...item,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          design,
        };
      })
      .filter(
        (
          item,
        ): item is typeof item & {
          design: DesignRecord;
        } => Boolean(item.design),
      );

    if (!cartItems.length) {
      return NextResponse.json(
        {
          error: "Your cart is empty.",
        },
        {
          status: 400,
        },
      );
    }

    const subtotal = cartItems.reduce(
      (total, item) =>
        total + item.unit_price * item.quantity,
      0,
    );

    const shippingAmount = subtotal >= 499 ? 0 : 49;
    const totalAmount = subtotal + shippingAmount;

    const { data: order, error: orderError } =
      await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          customer_name: customerName,
          email,
          phone,
          address_line_1: addressLine1,
          address_line_2: addressLine2,
          city,
          state,
          postal_code: postalCode,
          country,
          payment_method: "cod",
          payment_status: "pending",
          order_status: "placed",
          subtotal,
          shipping_amount: shippingAmount,
          total_amount: totalAmount,
        })
        .select("id")
        .single();

    if (orderError || !order) {
      console.error("Order creation error:", orderError);

      return NextResponse.json(
        {
          error: "Unable to create your order.",
        },
        {
          status: 500,
        },
      );
    }

    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      user_id: user.id,
      design_id: item.design.id,
      product_id: item.design.product_id,
      product_title: item.design.product_title,
      product_image_url: item.design.product_image_url,
      preview_url: item.design.preview_url,
      frame_name: item.design.frame_name,
      design_elements: item.design.design_elements ?? [],
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.unit_price * item.quantity,
    }));

    const { error: itemError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemError) {
      console.error("Order items error:", itemError);

      await supabase
        .from("orders")
        .delete()
        .eq("id", order.id)
        .eq("user_id", user.id);

      return NextResponse.json(
        {
          error: "Unable to save the customized products.",
        },
        {
          status: 500,
        },
      );
    }

    const cartIds = cartItems.map((item) => item.id);

    const { error: clearCartError } = await supabase
      .from("cart_items")
      .delete()
      .in("id", cartIds)
      .eq("user_id", user.id);

    if (clearCartError) {
      console.error(
        "Cart clearing error:",
        clearCartError,
      );
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Checkout API error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while placing your order.",
      },
      {
        status: 500,
      },
    );
  }
}