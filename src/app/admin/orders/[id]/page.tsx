import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  Mail,
  MapPin,
  Package,
  Phone,
  Printer,
  Truck,
  UserRound,
} from "lucide-react";
import OrderActions from "./order-actions";
import { StatusBadge } from "../orders-client";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type DesignElement = {
  id?: string;
  type?: "image" | "text" | "shape" | "sticker" | string;
  name?: string;
  text?: string;
  src?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  scale?: number;
  color?: string;
  backgroundColor?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  textAlign?: "left" | "center" | "right" | string;
  opacity?: number;
  hidden?: boolean;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
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
    const markerIndex = value.indexOf(marker);

    if (markerIndex !== -1) {
      const objectPath = value.slice(markerIndex + marker.length).split("?")[0];

      return decodeURIComponent(objectPath);
    }
  }

  return null;
}

async function createSignedDesignUrl(
  supabase: Awaited<
    ReturnType<typeof createClient>
  >,
  value?: string | null,
) {
  if (!value) return null;

  /*
   * Base64 or browser blob preview.
   * Blob URLs will not work after page refresh,
   * but base64 values can be displayed directly.
   */
  if (value.startsWith("data:image/")) {
    return value;
  }

  if (value.startsWith("blob:")) {
    console.error(
      "Blob URL cannot be restored after checkout:",
      value,
    );

    return null;
  }

  const storagePath = getStoragePath(value);

  /*
   * Normal external URL.
   */
  if (!storagePath) {
    return value;
  }

  const { data, error } = await supabase.storage
    .from("custom-designs")
    .createSignedUrl(storagePath, 60 * 60);

  if (error) {
    console.error("Preview signing failed:", {
      originalValue: value,
      storagePath,
      error,
    });

    return null;
  }

  return data?.signedUrl ?? null;
}

export default async function AdminOrderDetailsPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/admin/orders/${id}`);
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) {
    redirect("/dashboard");
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      user_id,
      customer_name,
      email,
      phone,
      address_line_1,
      address_line_2,
      city,
      state,
      postal_code,
      country,

      payment_method,
      payment_status,
      order_status,

      subtotal,
      shipping_amount,
      total_amount,

      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,

      courier_name,
      tracking_number,
      notes,

      created_at,
      updated_at,
      shipped_at,
      delivered_at,
      cancelled_at,

      order_items (
        id,
        design_id,
        product_id,
        product_title,
        product_image_url,
        preview_url,
        frame_name,
        design_elements,
        quantity,
        unit_price,
        total_price,
        created_at
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error || !order) {
    notFound();
  }

  const signedItems = await Promise.all(
  (order.order_items ?? []).map(async (item) => {
    let savedPreviewValue: string | null =
      item.preview_url ?? null;

    /*
     * Older orders may not have preview_url copied into order_items.
     * Load it from custom_designs using design_id.
     */
    if (!savedPreviewValue && item.design_id) {
      const {
        data: savedDesign,
        error: designError,
      } = await supabase
        .from("custom_designs")
        .select("preview_url")
        .eq("id", item.design_id)
        .maybeSingle();

      if (designError) {
        console.error(
          "Unable to load custom design:",
          item.design_id,
          designError,
        );
      }

      savedPreviewValue =
        savedDesign?.preview_url ?? null;
    }

    const previewUrl =
      await createSignedDesignUrl(
        supabase,
        savedPreviewValue,
      );

    const rawElements = Array.isArray(
      item.design_elements,
    )
      ? (item.design_elements as DesignElement[])
      : [];

    const designElements = await Promise.all(
      rawElements.map(async (element) => {
        if (
          element.type !== "image" ||
          !element.src
        ) {
          return element;
        }

        const signedSource =
          await createSignedDesignUrl(
            supabase,
            element.src,
          );

        return {
          ...element,
          src: signedSource ?? element.src,
        };
      }),
    );

    return {
      ...item,
      preview_url: previewUrl,
      quantity: Number(item.quantity ?? 1),
      unit_price: Number(item.unit_price ?? 0),
      total_price: Number(item.total_price ?? 0),
      design_elements: designElements,
    };
  }),
);

  const subtotal = Number(order.subtotal ?? 0);
  const shipping = Number(order.shipping_amount ?? 0);
  const total = Number(order.total_amount ?? 0);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 text-sm font-black text-slate-500 hover:text-[#8549e8]"
            >
              <ArrowLeft size={17} />
              Back to orders
            </Link>

            <h1 className="mt-4 text-3xl font-black text-slate-900">
              Order #{order.id.slice(0, 8)}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>

          <Link
            href={`/admin/orders/${order.id}/invoice`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm hover:border-[#8549e8] hover:text-[#8549e8]"
          >
            <Printer size={18} />
            Print invoice
          </Link>
        </div>

        <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_380px]">
          <section className="space-y-7">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <Package className="text-[#8549e8]" />

                <h2 className="text-xl font-black text-slate-900">
                  Ordered products
                </h2>
              </div>

              <div className="mt-6 space-y-6">
                {signedItems.map((item) => (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white"
                  >
                    <div className="border-b border-slate-200 p-5 sm:p-6">
                      <div className="flex flex-col gap-5 sm:flex-row">
                        <div className="relative h-56 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 sm:h-52 sm:w-52 sm:shrink-0">
                          {item.preview_url ? (
                            <Image
                              src={item.preview_url}
                              alt={`${item.product_title} customer preview`}
                              fill
                              unoptimized
                              sizes="208px"
                              className="object-contain p-2"
                            />
                          ) : item.product_image_url ? (
                            <Image
                              src={item.product_image_url}
                              alt={item.product_title}
                              fill
                              unoptimized
                              sizes="208px"
                              className="object-contain p-2"
                            />
                          ) : (
                            <div className="flex h-full flex-col items-center justify-center text-slate-400">
                              <Package size={36} />
                              <p className="mt-2 text-xs font-bold">
                                Preview unavailable
                              </p>
                            </div>
                          )}

                          <span className="absolute left-3 top-3 rounded-full bg-slate-900 px-3 py-1 text-xs font-black text-white">
                            Final preview
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-xl font-black text-slate-900">
                            {item.product_title}
                          </h3>

                          {item.frame_name && (
                            <p className="mt-2 text-sm text-slate-500">
                              Frame:{" "}
                              <span className="font-black text-slate-700">
                                {item.frame_name}
                              </span>
                            </p>
                          )}

                          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                            <InformationBox
                              label="Quantity"
                              value={String(item.quantity)}
                            />
                            <InformationBox
                              label="Unit price"
                              value={formatCurrency(item.unit_price)}
                            />
                            <InformationBox
                              label="Item total"
                              value={formatCurrency(item.total_price)}
                            />
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <InformationBox
                              label="Uploaded images"
                              value={String(
                                item.design_elements.filter(
                                  (element) =>
                                    element.type === "image" && !element.hidden,
                                ).length,
                              )}
                            />
                            <InformationBox
                              label="Custom text"
                              value={String(
                                item.design_elements.filter(
                                  (element) =>
                                    element.type === "text" && !element.hidden,
                                ).length,
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h4 className="text-lg font-black text-slate-900">
                            Customer design details
                          </h4>
                          <p className="mt-1 text-sm text-slate-500">
                            Uploaded images and custom text used by the
                            customer.
                          </p>
                        </div>

                        <span className="rounded-full bg-purple-100 px-3 py-1.5 text-xs font-black text-[#8549e8]">
                          {item.design_elements.length} elements
                        </span>
                      </div>

                      {item.design_elements.length === 0 ? (
                        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                          <p className="font-bold text-slate-500">
                            No design elements were saved for this product.
                          </p>
                        </div>
                      ) : (
                        <div className="mt-6 grid gap-5 xl:grid-cols-2">
                          {item.design_elements.map((element, index) => (
                            <DesignElementCard
                              key={element.id ?? index}
                              element={element}
                              index={index}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-7 md:grid-cols-2">
              <InformationCard
                icon={<UserRound size={21} />}
                title="Customer information"
              >
                <InformationLine
                  icon={<UserRound size={16} />}
                  label="Name"
                  value={order.customer_name}
                />

                <InformationLine
                  icon={<Mail size={16} />}
                  label="Email"
                  value={order.email}
                />

                <InformationLine
                  icon={<Phone size={16} />}
                  label="Phone"
                  value={order.phone}
                />
              </InformationCard>

              <InformationCard
                icon={<MapPin size={21} />}
                title="Delivery address"
              >
                <p className="text-sm leading-7 text-slate-600">
                  {order.address_line_1}
                  <br />
                  {order.address_line_2 && (
                    <>
                      {order.address_line_2}
                      <br />
                    </>
                  )}
                  {order.city}, {order.state}
                  <br />
                  {order.postal_code}
                  <br />
                  {order.country}
                </p>
              </InformationCard>
            </div>

            <InformationCard
              icon={<CreditCard size={21} />}
              title="Payment information"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <InformationBox
                  label="Payment method"
                  value={order.payment_method}
                />

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Payment status
                  </p>

                  <div className="mt-2">
                    <StatusBadge value={order.payment_status} type="payment" />
                  </div>
                </div>

                <InformationBox
                  label="Razorpay order ID"
                  value={order.razorpay_order_id ?? "Not available"}
                />

                <InformationBox
                  label="Razorpay payment ID"
                  value={order.razorpay_payment_id ?? "Not available"}
                />
              </div>
            </InformationCard>

            <InformationCard
              icon={<Truck size={21} />}
              title="Delivery information"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <InformationBox
                  label="Courier"
                  value={order.courier_name ?? "Not assigned"}
                />

                <InformationBox
                  label="Tracking number"
                  value={order.tracking_number ?? "Not assigned"}
                />

                <InformationBox
                  label="Shipped"
                  value={formatDate(order.shipped_at)}
                />

                <InformationBox
                  label="Delivered"
                  value={formatDate(order.delivered_at)}
                />
              </div>
            </InformationCard>
          </section>

          <aside className="space-y-7">
            <OrderActions
              orderId={order.id}
              initialOrderStatus={order.order_status}
              initialPaymentStatus={order.payment_status}
              initialCourierName={order.courier_name ?? ""}
              initialTrackingNumber={order.tracking_number ?? ""}
              initialNotes={order.notes ?? ""}
            />

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black text-slate-900">
                Order summary
              </h2>

              <div className="mt-5 space-y-3">
                <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />

                <SummaryRow
                  label="Shipping"
                  value={shipping === 0 ? "Free" : formatCurrency(shipping)}
                />

                <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                  <p className="font-black text-slate-900">Total</p>

                  <p className="text-2xl font-black text-[#8549e8]">
                    {formatCurrency(total)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black text-slate-900">
                Order timeline
              </h2>

              <div className="mt-5 space-y-5">
                <TimelineItem
                  label="Order created"
                  value={formatDate(order.created_at)}
                  completed
                />

                <TimelineItem
                  label="Payment"
                  value={order.payment_status}
                  completed={order.payment_status === "paid"}
                />

                <TimelineItem
                  label="Processing"
                  value={order.order_status}
                  completed={[
                    "processing",
                    "printing",
                    "packed",
                    "shipped",
                    "delivered",
                  ].includes(order.order_status)}
                />

                <TimelineItem
                  label="Shipped"
                  value={formatDate(order.shipped_at)}
                  completed={Boolean(order.shipped_at)}
                />

                <TimelineItem
                  label="Delivered"
                  value={formatDate(order.delivered_at)}
                  completed={Boolean(order.delivered_at)}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function DesignElementCard({
  element,
  index,
}: {
  element: DesignElement;
  index: number;
}) {
  const isHidden = element.hidden === true;

  if (element.type === "image") {
    return (
      <div
        className={`rounded-2xl border border-slate-200 p-4 ${
          isHidden ? "bg-slate-100 opacity-60" : "bg-slate-50"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-black text-slate-900">
              {element.name || `Customer image ${index + 1}`}
            </p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-purple-600">
              Uploaded image
            </p>
          </div>

          {isHidden && (
            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-black text-slate-600">
              Hidden
            </span>
          )}
        </div>

        <div className="relative mt-4 h-64 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {element.src ? (
            <Image
              src={element.src}
              alt={element.name || "Customer uploaded design"}
              fill
              unoptimized
              sizes="500px"
              className="object-contain p-3"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm font-bold text-slate-400">
                Image unavailable
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <ElementValue
            label="X position"
            value={formatElementNumber(element.x)}
          />
          <ElementValue
            label="Y position"
            value={formatElementNumber(element.y)}
          />
          <ElementValue
            label="Width"
            value={formatElementNumber(element.width)}
          />
          <ElementValue
            label="Height"
            value={formatElementNumber(element.height)}
          />
          <ElementValue
            label="Rotation"
            value={
              element.rotation !== undefined ? `${element.rotation}°` : "—"
            }
          />
          <ElementValue
            label="Scale"
            value={formatElementNumber(element.scale)}
          />
        </div>
      </div>
    );
  }

  if (element.type === "text") {
    const displayText = element.text?.trim() || "Empty text";

    return (
      <div
        className={`rounded-2xl border border-slate-200 p-4 ${
          isHidden ? "bg-slate-100 opacity-60" : "bg-slate-50"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-black text-slate-900">
              {element.name || `Custom text ${index + 1}`}
            </p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-orange-600">
              Text element
            </p>
          </div>

          {isHidden && (
            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-black text-slate-600">
              Hidden
            </span>
          )}
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Customer text
          </p>
          <p
            className="break-words"
            style={{
              color: element.color || "#111827",
              fontFamily: element.fontFamily || "inherit",
              fontSize: `${Math.min(Number(element.fontSize || 28), 48)}px`,
              fontWeight: element.fontWeight || 700,
              textAlign:
                element.textAlign === "center" || element.textAlign === "right"
                  ? element.textAlign
                  : "left",
            }}
          >
            {displayText}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <ElementValue label="Font" value={element.fontFamily || "Default"} />
          <ElementValue
            label="Font size"
            value={
              element.fontSize !== undefined ? `${element.fontSize}px` : "—"
            }
          />
          <ElementValue
            label="Font weight"
            value={String(element.fontWeight || "Normal")}
          />
          <ElementValue
            label="Text color"
            value={element.color || "—"}
            color={element.color}
          />
          <ElementValue
            label="X position"
            value={formatElementNumber(element.x)}
          />
          <ElementValue
            label="Y position"
            value={formatElementNumber(element.y)}
          />
          <ElementValue
            label="Width"
            value={formatElementNumber(element.width)}
          />
          <ElementValue
            label="Height"
            value={formatElementNumber(element.height)}
          />
          <ElementValue
            label="Rotation"
            value={
              element.rotation !== undefined ? `${element.rotation}°` : "—"
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div>
        <p className="font-black text-slate-900">
          {element.name || `${element.type || "Design"} ${index + 1}`}
        </p>
        <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">
          {element.type || "Unknown element"}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <ElementValue
          label="X position"
          value={formatElementNumber(element.x)}
        />
        <ElementValue
          label="Y position"
          value={formatElementNumber(element.y)}
        />
        <ElementValue
          label="Width"
          value={formatElementNumber(element.width)}
        />
        <ElementValue
          label="Height"
          value={formatElementNumber(element.height)}
        />
        <ElementValue
          label="Color"
          value={element.color || element.backgroundColor || "—"}
          color={element.color || element.backgroundColor}
        />
        <ElementValue
          label="Rotation"
          value={element.rotation !== undefined ? `${element.rotation}°` : "—"}
        />
      </div>
    </div>
  );
}

function formatElementNumber(value?: number) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return "—";
  }

  return Number(value).toFixed(1);
}

function ElementValue({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <div className="mt-1 flex items-center gap-2">
        {color && (
          <span
            className="h-4 w-4 shrink-0 rounded-full border border-slate-300"
            style={{ backgroundColor: color }}
          />
        )}
        <p className="break-all text-xs font-black text-slate-700">{value}</p>
      </div>
    </div>
  );
}

function InformationCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="text-[#8549e8]">{icon}</div>

        <h2 className="text-lg font-black text-slate-900">{title}</h2>
      </div>

      <div className="mt-5">{children}</div>
    </div>
  );
}

function InformationLine({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="mb-4 flex gap-3 last:mb-0">
      <div className="mt-0.5 text-slate-400">{icon}</div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-all text-sm font-bold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

function InformationBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-all text-sm font-black text-slate-700">
        {value}
      </p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>

      <span className="font-bold text-slate-800">{value}</span>
    </div>
  );
}

function TimelineItem({
  label,
  value,
  completed,
}: {
  label: string;
  value: string;
  completed: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div
        className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
          completed ? "bg-green-500" : "bg-slate-200"
        }`}
      />

      <div>
        <p className="text-sm font-black text-slate-800">{label}</p>

        <p className="mt-1 text-xs capitalize text-slate-500">
          {value.replaceAll("_", " ")}
        </p>
      </div>
    </div>
  );
}