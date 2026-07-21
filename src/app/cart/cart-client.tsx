"use client";

import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

export type DesignElement = {
  id: string;
  type: "image" | "text" | "shape" | "sticker";
  name: string;
  text?: string;
  src?: string;
  hidden?: boolean;
};

export type Design = {
  id: string;
  product_id: string;
  product_title: string;
  product_category: string | null;
  product_image_url: string | null;

  frame_id: string | null;
  frame_name: string | null;
  frame_price: number;
  frame_config: Record<string, unknown>;

  background_color: string;
  design_elements: DesignElement[];

  preview_url: string | null;

  quantity: number;
  unit_price: number;
  total_price: number;
};

export type CartItem = {
  id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
  design: Design | null;
};

export default function CartClient({
  initialCart,
}: {
  initialCart: CartItem[];
}) {
  const [cart, setCart] = useState(initialCart);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total + Number(item.unit_price) * item.quantity,
        0,
      ),
    [cart],
  );

  async function updateQuantity(
    cartItem: CartItem,
    newQuantity: number,
  ) {
    const safeQuantity = Math.max(1, newQuantity);

    setUpdatingId(cartItem.id);

    try {
      const supabase = createClient();

      const { error: cartError } = await supabase
        .from("cart_items")
        .update({
          quantity: safeQuantity,
        })
        .eq("id", cartItem.id);

      if (cartError) {
        throw cartError;
      }

      if (cartItem.design) {
        const { error: designError } = await supabase
          .from("custom_designs")
          .update({
            quantity: safeQuantity,
            total_price:
              Number(cartItem.unit_price) * safeQuantity,
            updated_at: new Date().toISOString(),
          })
          .eq("id", cartItem.design.id);

        if (designError) {
          throw designError;
        }
      }

      setCart((previous) =>
        previous.map((item) =>
          item.id === cartItem.id
            ? {
                ...item,
                quantity: safeQuantity,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error(error);
      alert("Unable to update quantity.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function removeItem(cartItem: CartItem) {
    setUpdatingId(cartItem.id);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", cartItem.id);

      if (error) {
        throw error;
      }

      setCart((previous) =>
        previous.filter((item) => item.id !== cartItem.id),
      );
    } catch (error) {
      console.error(error);
      alert("Unable to remove this item.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (!cart.length) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-purple-100">
            <ShoppingBag
              size={36}
              className="text-[#8549e8]"
            />
          </div>

          <h1 className="mt-5 text-2xl text-gray-700 font-black">
            Your cart is empty
          </h1>

          <Link
            href="/shop"
            className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-[#8549e8] to-[#f36a47] px-6 py-3 font-bold text-white"
          >
            Continue shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_360px]">
        <section className="space-y-5">
          <div>
            <h1 className="text-3xl text-gray-900 font-black">
              Your Cart
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {cart.length} customized product
              {cart.length === 1 ? "" : "s"}
            </p>
          </div>

          {cart.map((item) => {
            const design = item.design;

            if (!design) return null;

            const visibleImages =
              design.design_elements?.filter(
                (element) =>
                  element.type === "image" &&
                  !element.hidden,
              ) ?? [];

            const visibleTexts =
              design.design_elements?.filter(
                (element) =>
                  element.type === "text" &&
                  !element.hidden,
              ) ?? [];

            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="grid gap-5 p-5 sm:grid-cols-[220px_1fr]">
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
                    {design.preview_url ? (
                      <Image
                        src={design.preview_url}
                        alt={`${design.product_title} preview`}
                        fill
                        unoptimized
                        className="object-contain p-3"
                      />
                    ) : design.product_image_url ? (
                      <Image
                        src={design.product_image_url}
                        alt={design.product_title}
                        fill
                        unoptimized
                        className="object-contain p-3"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ShoppingBag className="text-slate-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#8549e8]">
                          {design.product_category}
                        </p>

                        <h2 className="mt-1 text-xl text-gray-700 font-black">
                          {design.product_title}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Frame: {design.frame_name}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={updatingId === item.id}
                        onClick={() => removeItem(item)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 text-red-500 disabled:opacity-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs font-bold text-slate-500">
                          Custom text
                        </p>

                        {visibleTexts.length ? (
                          <div className="mt-2 text-gray-700 space-y-1">
                            {visibleTexts.map((element) => (
                              <p
                                key={element.id}
                                className="truncate text-sm font-semibold"
                              >
                                {element.text}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-slate-400">
                            No text added
                          </p>
                        )}
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs font-bold text-slate-500">
                          Uploaded images
                        </p>

                        <div className="mt-2 flex gap-2 overflow-x-auto">
                          {visibleImages.map((element) =>
                            element.src ? (
                              <div
                                key={element.id}
                                className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-white"
                              >
                                <Image
                                  src={element.src}
                                  alt={element.name}
                                  fill
                                  unoptimized
                                  className="object-cover"
                                />
                              </div>
                            ) : null,
                          )}

                          {!visibleImages.length && (
                            <p className="text-sm text-slate-400">
                              No image added
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-5">
                      <div>
                        <p className="text-xs font-bold text-slate-500">
                          Quantity
                        </p>

                        <div className="mt-2 flex items-center rounded-xl border">
                          <button
                            type="button"
                            disabled={
                              item.quantity <= 1 ||
                              updatingId === item.id
                            }
                            onClick={() =>
                              updateQuantity(
                                item,
                                item.quantity - 1,
                              )
                            }
                            className="flex h-10 w-10 items-center text-gray-700 justify-center disabled:opacity-30"
                          >
                            <Minus size={16} />
                          </button>

                          <span className="min-w-10 text-center text-gray-700 font-black">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            disabled={updatingId === item.id}
                            onClick={() =>
                              updateQuantity(
                                item,
                                item.quantity + 1,
                              )
                            }
                            className="flex h-10 w-10 items-center text-gray-700 justify-center disabled:opacity-30"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-slate-500">
                          ₹
                          {Number(
                            item.unit_price,
                          ).toLocaleString("en-IN")}{" "}
                          × {item.quantity}
                        </p>

                        <p className="text-xl font-black text-[#8549e8]">
                          ₹
                          {(
                            Number(item.unit_price) *
                            item.quantity
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <aside>
          <div className="sticky top-6 rounded-3xl text-gray-700 border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">
              Order Summary
            </h2>

            <div className="mt-6 flex justify-between border-b pb-4">
              <span className="text-slate-500">
                Subtotal
              </span>

              <strong>
                ₹{subtotal.toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="mt-4 flex justify-between">
              <span className="text-lg font-black">
                Total
              </span>

              <span className="text-2xl font-black text-[#8549e8]">
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>

            <Link
              href="/checkout"
              className="mt-6 flex w-full justify-center rounded-xl bg-gradient-to-r from-[#8549e8] to-[#f36a47] px-5 py-3.5 font-black text-white"
            >
              Proceed to checkout
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}