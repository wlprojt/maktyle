import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

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
  let createdLocalOrderId: string | null = null;

  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay keys are not configured." },
        { status: 500 },
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Please log in before making payment." },
        { status: 401 },
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
        { error: "Please complete all required fields." },
        { status: 400 },
      );
    }

    if (!/^[6-9][0-9]{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "Enter a valid 10-digit Indian phone number." },
        { status: 400 },
      );
    }

    if (!/^[0-9]{6}$/.test(postalCode)) {
      return NextResponse.json(
        { error: "Enter a valid 6-digit PIN code." },
        { status: 400 },
      );
    }

    const { data: cartData, error: cartError } = await supabase
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
      console.error("Cart loading error:", cartError);

      return NextResponse.json(
        { error: "Unable to load your cart." },
        { status: 500 },
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
          id: item.id,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unit_price),
          design,
        };
      })
      .filter(
        (
          item,
        ): item is typeof item & {
          design: DesignRecord;
        } =>
          Boolean(item.design) &&
          Number.isFinite(item.quantity) &&
          item.quantity > 0 &&
          Number.isFinite(item.unitPrice) &&
          item.unitPrice >= 0,
      );

    if (!cartItems.length) {
      return NextResponse.json(
        { error: "Your cart is empty." },
        { status: 400 },
      );
    }

    // Always calculate prices on the server.
    const subtotal = cartItems.reduce(
      (total, item) =>
        total + item.unitPrice * item.quantity,
      0,
    );

    const shippingAmount = subtotal >= 499 ? 0 : 49;
    const totalAmount = subtotal + shippingAmount;

    if (totalAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid payment amount." },
        { status: 400 },
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Razorpay expects INR in paise.
    const amountInPaise = Math.round(totalAmount * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `maktyle_${Date.now()}`,
      notes: {
        user_id: user.id,
        customer_name: customerName,
      },
    });

    const { data: localOrder, error: orderError } =
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

          payment_method: "razorpay",
          payment_status: "pending",
          order_status: "payment_pending",

          subtotal,
          shipping_amount: shippingAmount,
          total_amount: totalAmount,

          razorpay_order_id: razorpayOrder.id,
        })
        .select("id")
        .single();

    if (orderError || !localOrder) {
      console.error("Local order creation error:", orderError);

      return NextResponse.json(
        { error: "Unable to create your order." },
        { status: 500 },
      );
    }

    createdLocalOrderId = localOrder.id;

    const orderItems = cartItems.map((item) => ({
      order_id: localOrder.id,
      user_id: user.id,
      design_id: item.design.id,
      product_id: item.design.product_id,
      product_title: item.design.product_title,
      product_image_url: item.design.product_image_url,
      preview_url: item.design.preview_url,
      frame_name: item.design.frame_name,
      design_elements: item.design.design_elements ?? [],
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.unitPrice * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items creation error:", itemsError);

      await supabase
        .from("orders")
        .delete()
        .eq("id", localOrder.id)
        .eq("user_id", user.id);

      return NextResponse.json(
        { error: "Unable to save your order products." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      keyId,
      localOrderId: localOrder.id,
      razorpayOrderId: razorpayOrder.id,
      amount: Number(razorpayOrder.amount),
      currency: razorpayOrder.currency,
      customer: {
        name: customerName,
        email,
        phone,
      },
    });
  } catch (error) {
    console.error("Create Razorpay order error:", error);

    if (createdLocalOrderId) {
      const supabase = await createClient();

      await supabase
        .from("orders")
        .delete()
        .eq("id", createdLocalOrderId);
    }

    return NextResponse.json(
      { error: "Unable to start Razorpay payment." },
      { status: 500 },
    );
  }
}