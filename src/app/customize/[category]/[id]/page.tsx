import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CustomizerClient from "./customizer-client";

type PageProps = {
  params: Promise<{
    category: string;
    id: string;
  }>;
};

export default async function CustomizePage({ params }: PageProps) {
  const { category, id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
      redirect("/login?redirect=/dashboard");
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
    console.error("Product fetch error:", error);
  }

  if (!product) {
    notFound();
  }

  const images = [...(product.product_images ?? [])].sort(
    (a, b) =>
      Number(Boolean(b.is_primary)) -
        Number(Boolean(a.is_primary)) ||
      Number(a.display_order ?? 0) -
        Number(b.display_order ?? 0)
  );

  const regularPrice = Number(product.price ?? 0);
  const salePrice = Number(product.sale_price ?? 0);

  const finalPrice =
    salePrice > 0 && salePrice < regularPrice
      ? salePrice
      : regularPrice;

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
    />
  );
}