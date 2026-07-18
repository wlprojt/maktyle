import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type ProductImage = {
  id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number | null;
  is_primary: boolean | null;
};

type Product = {
  id: string;
  title: string;
  description: string | null;
  price: number | string;
  sale_price: number | string | null;
  category: string | null;
  stock: number | null;
  product_images: ProductImage[] | null;
};

export default async function PhotoFrames() {
  const supabase = await createClient();

  const { data, error } = await supabase
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
    .ilike("category", "Photo Frame")
    .order("created_at", { ascending: false })
    .limit(4);

  if (error) {
    console.error("Photo frame fetch error:", error);

    return (
      <section className="bg-[#faf8ff] px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-600">
            Unable to load photo frames.
          </div>
        </div>
      </section>
    );
  }

  const products = (data ?? []) as Product[];

  return (
    <section className="bg-[#faf8ff] px-5 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 flex items-end justify-between gap-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">
              Personalized Collection
            </p>

            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Custom Photo Frames
            </h2>

            <p className="mt-3 text-slate-500">
              Turn your favorite memories into beautiful personalized frames.
            </p>
          </div>

          <Link
            href="/shop?category=Photo%20Frame"
            className="hidden items-center gap-2 font-semibold text-purple-600 transition hover:text-purple-700 sm:flex"
          >
            View All
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Empty state */}
        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-purple-200 bg-white p-12 text-center">
            <h3 className="text-xl font-bold text-slate-900">
              No photo frames available
            </h3>

            <p className="mt-2 text-slate-500">
              Add products with the category “Photo Frames” from the admin
              panel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {products.map((product) => {
              const images = [...(product.product_images ?? [])].sort(
                (a, b) =>
                  Number(Boolean(b.is_primary)) -
                    Number(Boolean(a.is_primary)) ||
                  (a.display_order ?? 0) - (b.display_order ?? 0)
              );

              const primaryImage = images[0]?.image_url;
              const price = Number(product.price);

              const salePrice =
                product.sale_price !== null
                  ? Number(product.sale_price)
                  : null;

              const hasDiscount =
                salePrice !== null &&
                Number.isFinite(salePrice) &&
                salePrice < price;

              return (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:rounded-3xl"
                >
                  <Link href={`/product/${product.id}`}>
                  <div className="relative aspect-square overflow-hidden bg-[#f5f2f8]">
                    {primaryImage ? (
                      <Image
                        src={primaryImage}
                        alt={images[0]?.alt_text || product.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-contain p-4 transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-center text-sm text-slate-400">
                        No image
                      </div>
                    )}

                    <button
                      type="button"
                      aria-label={`Add ${product.title} to wishlist`}
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-md transition hover:text-pink-500"
                    >
                      <Heart size={17} />
                    </button>

                    {hasDiscount && (
                      <span className="absolute left-3 top-3 rounded-full bg-purple-600 px-3 py-1 text-xs font-bold text-white">
                        Sale
                      </span>
                    )}

                    {Number(product.stock ?? 0) <= 0 && (
                      <div className="absolute inset-x-0 bottom-0 bg-slate-900/75 py-2 text-center text-xs font-semibold text-white">
                        Out of stock
                      </div>
                    )}
                  </div>

                  
                  <div className="p-4 sm:p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                      {product.category}
                    </p>

                    <h3 className="mt-2 line-clamp-2 min-h-[48px] font-bold text-slate-900">
                      {product.title}
                    </h3>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-lg font-extrabold text-purple-600 sm:text-xl">
                        ₹{hasDiscount ? salePrice : price}
                      </span>

                      {hasDiscount && (
                        <span className="text-sm text-slate-400 line-through">
                          ₹{price}
                        </span>
                      )}
                    </div>

                    <div
                      // href="#"
                      className={`mt-4 block rounded-xl py-3 text-center text-sm font-bold transition ${
                        Number(product.stock ?? 0) > 0
                          ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:brightness-110"
                          : "pointer-events-none bg-slate-200 text-slate-500"
                      }`}
                    >
                      {Number(product.stock ?? 0) > 0
                        ? "Customize Now"
                        : "Out of Stock"}
                    </div>
                  </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}

        <Link
          href="/shop?category=Photo%20Frame"
          className="mt-8 flex items-center justify-center gap-2 rounded-xl border border-purple-200 bg-white py-3 font-semibold text-purple-600 sm:hidden"
        >
          View All Photo Frames
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}