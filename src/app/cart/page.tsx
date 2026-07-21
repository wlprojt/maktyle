import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CartClient, {
  type CartItem,
  type Design,
  type DesignElement,
} from "./cart-client";

type SupabaseCartItem = {
  id: string;
  quantity: number | string;
  unit_price: number | string;
  created_at: string;
  design: Design[] | Design | null;
};

/**
 * Converts a stored Supabase Storage URL into its object path.
 *
 * Example:
 * https://project.supabase.co/storage/v1/object/public/custom-designs/user/design/preview.png
 *
 * Becomes:
 * user/design/preview.png
 */
function getCustomDesignStoragePath(value?: string | null) {
  if (!value) return null;

  // Already stored as a path
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

export default async function CartPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/cart");
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
    console.error("Cart loading error:", error);

    return <CartClient initialCart={[]} />;
  }

  const normalizedCartItems: CartItem[] = (
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

  const cartItemsWithSignedUrls: CartItem[] = await Promise.all(
    normalizedCartItems.map(async (item) => {
      if (!item.design) {
        return item;
      }

      const design = item.design;

      /*
       * Generate signed preview URL
       */
      let signedPreviewUrl = design.preview_url;

      const previewPath = getCustomDesignStoragePath(
        design.preview_url,
      );

      if (previewPath) {
        const { data: signedPreview, error: signedPreviewError } =
          await supabase.storage
            .from("custom-designs")
            .createSignedUrl(previewPath, 60 * 60);

        if (signedPreviewError) {
          console.error(
            "Preview signed URL error:",
            previewPath,
            signedPreviewError,
          );

          signedPreviewUrl = null;
        } else {
          signedPreviewUrl = signedPreview.signedUrl;
        }
      }

      /*
       * Generate signed URLs for uploaded design images
       */
      const signedDesignElements: DesignElement[] =
        await Promise.all(
          design.design_elements.map(async (element) => {
            if (
              element.type !== "image" ||
              !element.src
            ) {
              return element;
            }

            const imagePath = getCustomDesignStoragePath(
              element.src,
            );

            // Keep external/public images unchanged
            if (!imagePath) {
              return element;
            }

            const { data: signedImage, error: signedImageError } =
              await supabase.storage
                .from("custom-designs")
                .createSignedUrl(imagePath, 60 * 60);

            if (signedImageError) {
              console.error(
                "Design image signed URL error:",
                imagePath,
                signedImageError,
              );

              return {
                ...element,
                src: undefined,
              };
            }

            return {
              ...element,
              src: signedImage.signedUrl,
            };
          }),
        );

      return {
        ...item,
        design: {
          ...design,
          preview_url: signedPreviewUrl,
          design_elements: signedDesignElements,
        },
      };
    }),
  );

  return (
    <CartClient
      initialCart={cartItemsWithSignedUrls}
    />
  );
}