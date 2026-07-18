import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AddProductForm from "./add-product-form";
import DeleteProductButton from "./delete-product-button";
import Link from "next/link";

export default async function AdminProductsPage() {
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

  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      product_images(*)
    `)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#0B1120] p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="mt-2 text-slate-400">Add and manage products</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <AddProductForm />

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-5 text-xl font-bold">Products</h2>

            <div className="space-y-5">
              {products?.map((product) => (
                <div
                  key={product.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="grid grid-cols-3 gap-3">
                    {product.product_images?.map((img: any) => (
                      <img
                        key={img.id}
                        src={img.image_url}
                        alt={img.alt_text || product.title}
                        className="h-24 w-full rounded-xl object-cover"
                      />
                    ))}
                  </div>

                  <h3 className="mt-4 font-semibold">{product.title}</h3>

                  <p className="text-sm text-slate-400">
                    {product.category}
                  </p>

                  <p className="mt-2 text-cyan-400">
                    ₹{product.sale_price}
                    {product.price && (
                      <span className="ml-2 text-sm text-slate-400 line-through">
                        ₹{product.price}
                      </span>
                    )}
                  </p>

                  <p className="text-sm text-slate-400">
                    Stock: {product.stock}
                  </p>

                  <div className="mt-4 flex gap-3">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="rounded-xl bg-yellow-500/20 px-4 py-2 text-sm text-yellow-300 hover:bg-yellow-500/30"
                    >
                      Edit
                    </Link>

                    <DeleteProductButton productId={product.id} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}