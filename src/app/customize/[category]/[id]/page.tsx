import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CustomizerClient from "./customizer-client";

type PageProps = {
  params: Promise<{
    category: string;
    id: string;
  }>;
  searchParams: Promise<{
    quantity?: string;
    base?: string;
    color?: string;
  }>;
};

export default async function CustomizePage({
  params,
  searchParams,
}: PageProps) {
  const { category, id } = await params;
  const query = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectUrl =
      `/customize/${encodeURIComponent(category)}/${id}` +
      `?quantity=${encodeURIComponent(query.quantity ?? "1")}` +
      `&base=${encodeURIComponent(query.base ?? "Standard")}` +
      `&color=${encodeURIComponent(query.color ?? "#ffffff")}`;

    redirect(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
  }

  const { data: product, error } = await supabase
    .from("products")
    .select(`
      id,
      title,
      description,
      price,
      sale_price,
      category,
      stock,
      product_images (
        id,
        image_url,
        alt_text,
        display_order,
        is_primary
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Product fetch error:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
  }

  if (!product) {
    notFound();
  }

  const images = [...(product.product_images ?? [])].sort(
    (a, b) =>
      Number(Boolean(b.is_primary)) -
        Number(Boolean(a.is_primary)) ||
      Number(a.display_order ?? 0) -
        Number(b.display_order ?? 0),
  );

  const regularPrice = Number(product.price ?? 0);
  const salePrice = Number(product.sale_price ?? 0);

  const finalPrice =
    salePrice > 0 && salePrice < regularPrice
      ? salePrice
      : regularPrice;

  const requestedQuantity = Number(query.quantity);

  const initialQuantity =
    Number.isFinite(requestedQuantity) && requestedQuantity > 0
      ? Math.floor(requestedQuantity)
      : 1;

  const quantity =
    product.stock !== null
      ? Math.min(initialQuantity, Math.max(1, product.stock))
      : initialQuantity;

  return (
    <CustomizerClient
      product={{
        id: product.id,
        title: product.title,
        description: product.description,
        category: product.category ?? category,
        price: regularPrice,
        finalPrice,
        stock: product.stock,
        previewImage: images[0]?.image_url ?? null,
      }}
      initialQuantity={quantity}
      initialBase={query.base ?? "Standard"}
      initialColor={query.color ?? "#ffffff"}
    />
  );
}