import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  Headphones,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import ProductDetailsClient from "./product-details-client";

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
  created_at: string;
  product_images: ProductImage[] | null;
};

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function getNumber(value: number | string | null) {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function sortProductImages(images: ProductImage[] | null) {
  return [...(images ?? [])].sort(
    (a, b) =>
      Number(Boolean(b.is_primary)) -
        Number(Boolean(a.is_primary)) ||
      (a.display_order ?? 0) - (b.display_order ?? 0)
  );
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("title, description")
    .eq("id", id)
    .maybeSingle();

  if (!product) {
    return {
      title: "Product Not Found | maktyle",
    };
  }

  return {
    title: `${product.title} | maktyle`,
    description:
      product.description ??
      `Customize ${product.title} with your photo, name or special message.`,
  };
}

export default async function ProductDetailsPage({
  params,
}: ProductPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
  data: { user },
} = await supabase.auth.getUser();

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
      created_at,
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

  if (!data) {
    notFound();
  }

  const product = data as Product;
  const images = sortProductImages(product.product_images);

  const price = getNumber(product.price);
  const salePrice = getNumber(product.sale_price);

  const hasSale =
    salePrice > 0 &&
    price > 0 &&
    salePrice < price;

  const finalPrice = hasSale ? salePrice : price;

  const discountPercentage = hasSale
    ? Math.round(((price - salePrice) / price) * 100)
    : 0;

  const { data: relatedData } = await supabase
    .from("products")
    .select(`
      id,
      title,
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
    .eq("category", product.category ?? "")
    .neq("id", product.id)
    .order("created_at", {
      ascending: false,
    })
    .limit(5);

  const relatedProducts = (relatedData ?? []) as Product[];

  let isFavorite = false;

if (user) {
  const { data: favorite } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", product.id)
    .maybeSingle();

  isFavorite = !!favorite;
}

  return (
    <main className="min-h-screen bg-white text-slate-950">
      {/* Breadcrumb */}
      <section className="border-b border-slate-100">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-4 text-sm text-slate-500 sm:px-6 lg:px-8">
          <Link href="/" className="shrink-0 hover:text-[#8549e8]">
            Home
          </Link>

          <ChevronRight size={15} className="shrink-0" />

          <Link
            href="/shop"
            className="shrink-0 hover:text-[#8549e8]"
          >
            Shop
          </Link>

          {product.category && (
            <>
              <ChevronRight size={15} className="shrink-0" />

              <Link
                href={`/shop?category=${encodeURIComponent(
                  product.category
                )}`}
                className="shrink-0 hover:text-[#8549e8]"
              >
                {product.category}
              </Link>
            </>
          )}

          <ChevronRight size={15} className="shrink-0" />

          <span className="truncate font-medium text-slate-900">
            {product.title}
          </span>
        </div>
      </section>

      {/* Product details */}
      <ProductDetailsClient
        product={{
          id: product.id,
          title: product.title,
          description: product.description,
          category: product.category,
          stock: product.stock,
          price,
          salePrice: hasSale ? salePrice : null,
          finalPrice,
          discountPercentage,
          images,
        }}
        isFavorite={isFavorite}
      />

      {/* Benefits */}
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
            <Truck className="shrink-0 text-[#8549e8]" />

            <div>
              <p className="text-sm font-bold">Free Shipping</p>
              <p className="text-xs text-slate-500">
                On orders above ₹599
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
            <ShieldCheck className="shrink-0 text-[#8549e8]" />

            <div>
              <p className="text-sm font-bold">Secure Payment</p>
              <p className="text-xs text-slate-500">
                100% safe checkout
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
            <PackageCheck className="shrink-0 text-[#8549e8]" />

            <div>
              <p className="text-sm font-bold">Premium Quality</p>
              <p className="text-xs text-slate-500">
                Carefully made products
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
            <RotateCcw className="shrink-0 text-[#8549e8]" />

            <div>
              <p className="text-sm font-bold">Easy Support</p>
              <p className="text-xs text-slate-500">
                Help when you need it
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="border-y border-slate-100 bg-slate-50/50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8 lg:py-14">
          <div>
            <h2 className="text-2xl font-black">
              Product description
            </h2>

            <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-base">
              {product.description ??
                `Create a unique ${product.title} using your own photo, name or special message. This personalized gift is carefully made and is perfect for birthdays, anniversaries, weddings and other memorable occasions.`}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "High-quality personalized printing",
                "Made using premium materials",
                "Perfect for gifting occasions",
                "Easy customization process",
                "Carefully packed before shipping",
                "Designed especially for you",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm font-medium text-slate-700"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-[#8549e8]">
                    ✓
                  </span>

                  {item}
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <Headphones size={32} className="text-[#8549e8]" />

            <h3 className="mt-4 text-xl font-black">
              Need help customizing?
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Contact our team for help with photos, text,
              design placement or bulk orders.
            </p>

            <Link
              href="/contact"
              className="mt-6 block rounded-xl bg-gradient-to-r from-[#8549e8] to-[#f36a47] px-5 py-3 text-center text-sm font-bold text-white transition hover:brightness-105"
            >
              Contact Support
            </Link>
          </aside>
        </div>
      </section>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-[#8549e8]">
                More gifts
              </p>

              <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                You may also like
              </h2>
            </div>

            <Link
              href={
                product.category
                  ? `/shop?category=${encodeURIComponent(
                      product.category
                    )}`
                  : "/shop"
              }
              className="text-sm font-bold text-[#8549e8]"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-5">
            {relatedProducts.map((relatedProduct) => {
              const relatedImages = sortProductImages(
                relatedProduct.product_images
              );

              const relatedImage =
                relatedImages[0]?.image_url ?? null;

              const regularPrice = getNumber(
                relatedProduct.price
              );

              const offerPrice = getNumber(
                relatedProduct.sale_price
              );

              const onSale =
                offerPrice > 0 &&
                offerPrice < regularPrice;

              return (
                <article
                  key={relatedProduct.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <Link
                    href={`/product/${relatedProduct.id}`}
                    className="relative block aspect-square bg-slate-50"
                  >
                    {relatedImage ? (
                      <Image
                        src={relatedImage}
                        alt={relatedProduct.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 20vw"
                        className="object-contain p-4 transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-slate-400">
                        No image
                      </div>
                    )}
                  </Link>

                  <div className="p-3 sm:p-4">
                    <Link href={`/product/${relatedProduct.id}`}>
                      <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5">
                        {relatedProduct.title}
                      </h3>
                    </Link>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="font-black text-[#8549e8]">
                        ₹
                        {(onSale
                          ? offerPrice
                          : regularPrice
                        ).toLocaleString("en-IN")}
                      </span>

                      {onSale && (
                        <span className="text-xs text-slate-400 line-through">
                          ₹
                          {regularPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}