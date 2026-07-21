import { createHmac, timingSafeEqual } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

type VerifyBody = {
  localOrderId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
};

function signaturesMatch(
  generatedSignature: string,
  receivedSignature: string,
) {
  const generatedBuffer = Buffer.from(
    generatedSignature,
    "utf8",
  );

  const receivedBuffer = Buffer.from(
    receivedSignature,
    "utf8",
  );

  if (generatedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(
    generatedBuffer,
    receivedBuffer,
  );
}

export async function POST(request: Request) {
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
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized request." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as VerifyBody;

    const localOrderId = body.localOrderId;
    const razorpayOrderId = body.razorpayOrderId;
    const razorpayPaymentId = body.razorpayPaymentId;
    const razorpaySignature = body.razorpaySignature;

    if (
      !localOrderId ||
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      return NextResponse.json(
        { error: "Missing payment verification details." },
        { status: 400 },
      );
    }

    const { data: order, error: orderError } =
      await supabase
        .from("orders")
        .select(`
          id,
          user_id,
          razorpay_order_id,
          payment_status,
          total_amount
        `)
        .eq("id", localOrderId)
        .eq("user_id", user.id)
        .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Order was not found." },
        { status: 404 },
      );
    }

    if (order.payment_status === "paid") {
      return NextResponse.json({
        success: true,
        orderId: order.id,
      });
    }

    /*
     * Use the Razorpay order ID stored on your server,
     * not an untrusted order ID supplied by the browser.
     */
    if (order.razorpay_order_id !== razorpayOrderId) {
      return NextResponse.json(
        { error: "Order verification failed." },
        { status: 400 },
      );
    }

    const generatedSignature = createHmac(
      "sha256",
      keySecret,
    )
      .update(
        `${order.razorpay_order_id}|${razorpayPaymentId}`,
      )
      .digest("hex");

    if (
      !signaturesMatch(
        generatedSignature,
        razorpaySignature,
      )
    ) {
      await supabase
        .from("orders")
        .update({
          payment_status: "verification_failed",
          order_status: "payment_failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id)
        .eq("user_id", user.id);

      return NextResponse.json(
        { error: "Payment signature verification failed." },
        { status: 400 },
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const payment = await razorpay.payments.fetch(
      razorpayPaymentId,
    );

    if (
      payment.order_id !== order.razorpay_order_id ||
      Number(payment.amount) !==
        Math.round(Number(order.total_amount) * 100)
    ) {
      return NextResponse.json(
        { error: "Payment details do not match this order." },
        { status: 400 },
      );
    }

    /*
     * With Razorpay auto-capture enabled, the status should
     * normally be "captured". An "authorized" payment still
     * needs capture before settlement.
     */
    const paymentIsCaptured =
      payment.status === "captured";

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
        payment_status: paymentIsCaptured
          ? "paid"
          : payment.status,
        order_status: paymentIsCaptured
          ? "placed"
          : "payment_processing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Order payment update error:", updateError);

      return NextResponse.json(
        { error: "Payment succeeded, but order update failed." },
        { status: 500 },
      );
    }

    if (!paymentIsCaptured) {
      return NextResponse.json(
        {
          error:
            "Payment is authorized but not captured yet. Check Razorpay capture settings.",
        },
        { status: 409 },
      );
    }

    const { error: clearCartError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    if (clearCartError) {
      console.error("Cart clearing error:", clearCartError);
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Razorpay verification error:", error);

    return NextResponse.json(
      { error: "Unable to verify payment." },
      { status: 500 },
    );
  }
}