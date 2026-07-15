import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import EditProductForm from "./edit-product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: admin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .single();

  if (!admin) redirect("/");

  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      product_images(*)
    `)
    .eq("id", id)
    .single();

  if (!product) redirect("/admin/products");

  return (
    <main className="min-h-screen bg-[#0B1120] p-6 text-white">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="mt-2 text-slate-400">Update product details and images</p>

        <div className="mt-8">
          <EditProductForm product={product} />
        </div>
      </div>
    </main>
  );
}