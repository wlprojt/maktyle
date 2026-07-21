import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CheckoutClient, {
  type CheckoutCartItem,
  type CheckoutDesign,
} from "./checkout-client";

type SupabaseCartItem = {
  id: string;
  quantity: number | string;
  unit_price: number | string;
  created_at: string;
  design: CheckoutDesign[] | CheckoutDesign | null;
};

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
      const objectPath = value
        .slice(markerIndex + marker.length)
        .split("?")[0];

      return decodeURIComponent(objectPath);
    }
  }

  return null;
}

export default async function CheckoutPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/checkout");
  }

  const { data, error } = await supabase
    .from("cart_items")
    .select(`
      id,
      quantity,
      unit_price,
      created_at,
      design:custom_designs (
        id,
        product_id,
        product_title,
        product_category,
        product_image_url,
        frame_id,
        frame_name,
        frame_price,
        frame_config,
        background_color,
        design_elements,
        preview_url,
        quantity,
        unit_price,
        total_price
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("Checkout loading error:", error);
  }

  const normalizedCart: CheckoutCartItem[] = (
    (data ?? []) as unknown as SupabaseCartItem[]
  ).map((item) => {
    const design = Array.isArray(item.design)
      ? item.design[0] ?? null
      : item.design;

    return {
      id: item.id,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      created_at: item.created_at,
      design: design
        ? {
            ...design,
            frame_price: Number(design.frame_price),
            quantity: Number(design.quantity),
            unit_price: Number(design.unit_price),
            total_price: Number(design.total_price),
            design_elements: Array.isArray(design.design_elements)
              ? design.design_elements
              : [],
          }
        : null,
    };
  });

  const cartItems = await Promise.all(
    normalizedCart.map(async (item) => {
      if (!item.design?.preview_url) {
        return item;
      }

      const previewPath = getStoragePath(item.design.preview_url);

      if (!previewPath) {
        return item;
      }

      const { data: signedData, error: signedError } =
        await supabase.storage
          .from("custom-designs")
          .createSignedUrl(previewPath, 60 * 60);

      if (signedError) {
        console.error(
          "Checkout signed preview error:",
          signedError,
        );

        return {
          ...item,
          design: {
            ...item.design,
            preview_url: null,
          },
        };
      }

      return {
        ...item,
        design: {
          ...item.design,
          preview_url: signedData.signedUrl,
        },
      };
    }),
  );

  if (!cartItems.length) {
    redirect("/cart");
  }

  return (
    <CheckoutClient
      initialCart={cartItems}
      userEmail={user.email ?? ""}
    />
  );
}