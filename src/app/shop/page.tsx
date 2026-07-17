import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  Grid2X2,
  Heart,
  KeyRound,
  LampDesk,
  Package,
  Phone,
  Shirt,
  ShoppingBag,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import ShopSelect from "@/components/ShopSelect";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "maktyle | Shop",
  description: "Create personalized phone covers, photo frames, mugs, LED lamps, t-shirts, and unique custom gifts. Design your own gifts online with Maktyle.",
};

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
  price: number | string;
  sale_price: number | string | null;
  category: string | null;
  stock: number | null;
  product_images: ProductImage[] | null;
};

type ShopPageProps = {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    limit?: string;
  }>;
};

const categories = [
  {
    name: "All Products",
    value: "all",
    icon: Grid2X2,
  },
  {
    name: "Photo Frames",
    value: "Photo Frame",
    icon: Package,
  },
  {
    name: "Mugs",
    value: "Mug",
    icon: ShoppingBag,
  },
  {
    name: "LED Lamps",
    value: "Lamp",
    icon: LampDesk,
  },
  {
    name: "Phone Cases",
    value: "Phone Case",
    icon: Phone,
  },
  {
    name: "Pillows",
    value: "Pillow",
    icon: Package,
  },
  {
    name: "T-Shirts",
    value: "Tshirt",
    icon: Shirt,
  },
  {
    name: "Bottles",
    value: "Bottle",
    icon: Package,
  },
  {
    name: "Keychains",
    value: "Keychain",
    icon: KeyRound,
  },
];

function createShopUrl({
  category,
  sort,
  limit,
}: {
  category?: string;
  sort?: string;
  limit?: number;
}) {
  const params = new URLSearchParams();

  if (category && category !== "all") {
    params.set("category", category);
  }

  if (sort && sort !== "latest") {
    params.set("sort", sort);
  }

  if (limit && limit !== 16) {
    params.set("limit", String(limit));
  }

  const query = params.toString();

  return query ? `/shop?${query}` : "/shop";
}

function getProductImage(product: Product) {
  const images = [...(product.product_images ?? [])].sort(
    (a, b) =>
      Number(Boolean(b.is_primary)) -
        Number(Boolean(a.is_primary)) ||
      (a.display_order ?? 0) - (b.display_order ?? 0)
  );

  return images[0]?.image_url ?? null;
}

function hasValidSale(product: Product) {
  const price = Number(product.price);
  const salePrice = Number(product.sale_price);

  return (
    product.sale_price !== null &&
    Number.isFinite(salePrice) &&
    salePrice > 0 &&
    salePrice < price
  );
}

export default async function ShopPage({
  searchParams,
}: ShopPageProps) {
  const params = await searchParams;

  const selectedCategory = params.category ?? "all";
  const selectedSort = params.sort ?? "latest";

  const parsedLimit = Number(params.limit ?? 16);
  const productLimit = [8, 12, 16, 24, 32].includes(parsedLimit)
    ? parsedLimit
    : 16;

  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      `
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
      `,
      {
        count: "exact",
      }
    );

  if (selectedCategory !== "all") {
    query = query.eq("category", selectedCategory);
  }

  if (selectedSort === "price-low") {
    query = query.order("price", {
      ascending: true,
    });
  } else if (selectedSort === "price-high") {
    query = query.order("price", {
      ascending: false,
    });
  } else if (selectedSort === "name") {
    query = query.order("title", {
      ascending: true,
    });
  } else {
    query = query.order("created_at", {
      ascending: false,
    });
  }

  const {
    data,
    error,
    count,
  } = await query.limit(productLimit);

  if (error) {
    console.error("Shop products error:", error);
  }

  const products = (data ?? []) as Product[];
  const totalProducts = count ?? products.length;

  return (
    <main className="min-h-screen bg-white text-slate-950">
      {/* Shop banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#fff7fb] via-[#faf2ff] to-[#fff8fc]">
        <div className="absolute left-[30%] top-12 h-40 w-40 rounded-full bg-purple-200/30 blur-3xl" />
        <div className="absolute right-24 top-10 h-44 w-44 rounded-full bg-pink-200/40 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 md:grid-cols-2 md:px-8 lg:py-16">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#8549e8]">
              Personalized gifts
            </p>

            <h1 className="text-4xl font-black tracking-tight md:text-5xl">
              Shop
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
              Discover personalized gifts made for every special moment.
              Add your photos, names and unique designs.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm">
                Custom designs
              </span>

              <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm">
                Fast delivery
              </span>

              <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm">
                Made with love
              </span>
            </div>
          </div>

          <div className="relative hidden min-h-[230px] md:block">
            <div className="absolute left-0 top-12 h-36 w-36 rotate-[-7deg] overflow-hidden rounded-3xl bg-white p-3 shadow-xl">
              <Image
                src="/wmug.png"
                alt="Custom mug"
                fill
                className="object-contain p-4"
              />
            </div>

            <div className="absolute left-[28%] top-0 h-48 w-48 rotate-[4deg] overflow-hidden rounded-3xl bg-white p-3 shadow-xl">
              <Image
                src="/fframe.png"
                alt="Custom photo frame"
                fill
                className="object-contain p-4"
              />
            </div>

            <div className="absolute right-[5%] top-9 h-44 w-44 rotate-[-3deg] overflow-hidden rounded-3xl bg-white p-3 shadow-xl">
              <Image
                src="/pillow.png"
                alt="Custom pillow"
                fill
                className="object-contain p-4"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Shop content */}
      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-5 text-xl font-black">
                Categories
              </h2>

              <nav className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;

                  const active =
                    selectedCategory === category.value ||
                    (selectedCategory === "all" &&
                      category.value === "all");

                  return (
                    <Link
                      key={category.value}
                      href={createShopUrl({
                        category: category.value,
                        sort: selectedSort,
                        limit: productLimit,
                      })}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                        active
                          ? "bg-purple-100 text-[#8549e8]"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                      }`}
                    >
                      <Icon size={18} />
                      {category.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black">
                Need something special?
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Create a personalized gift using your photo,
                name or custom artwork.
              </p>

              <Link
                href="/contact"
                className="mt-5 block rounded-xl bg-gradient-to-r from-[#8549e8] to-[#f36a47] px-5 py-3 text-center text-sm font-bold text-white"
              >
                Contact Us
              </Link>
            </div>
          </aside>

          {/* Product area */}
          <div>
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <strong className="text-slate-950">
                  {products.length}
                </strong>{" "}
                of{" "}
                <strong className="text-slate-950">
                  {totalProducts}
                </strong>{" "}
                products
              </p>

              <div className="flex flex-wrap gap-3">
                <form action="/shop">
                  {selectedCategory !== "all" && (
                    <input
                      type="hidden"
                      name="category"
                      value={selectedCategory}
                    />
                  )}

                  <input
                    type="hidden"
                    name="limit"
                    value={productLimit}
                  />

                  <div className="relative">
                    <ShopSelect
                        name="sort"
                        defaultValue={selectedSort}
                        className="appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-10 text-sm font-semibold outline-none focus:border-purple-400"
                        >
                        <option value="latest">Sort: Latest</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="name">Name: A–Z</option>
                    </ShopSelect>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                    />
                  </div>
                </form>

                <form action="/shop">
                  {selectedCategory !== "all" && (
                    <input
                      type="hidden"
                      name="category"
                      value={selectedCategory}
                    />
                  )}

                  <input
                    type="hidden"
                    name="sort"
                    value={selectedSort}
                  />

                  <div className="relative">
                    <ShopSelect
                        name="limit"
                        defaultValue={String(productLimit)}
                        className="appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-10 text-sm font-semibold outline-none focus:border-purple-400"
                        >
                        <option value="8">Show: 8</option>
                        <option value="12">Show: 12</option>
                        <option value="16">Show: 16</option>
                        <option value="24">Show: 24</option>
                        <option value="32">Show: 32</option>
                    </ShopSelect>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                    />
                  </div>
                </form>
              </div>
            </div>

            {error ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center">
                <h2 className="text-xl font-bold text-red-700">
                  Products could not be loaded
                </h2>

                <p className="mt-2 text-sm text-red-600">
                  Please check your Supabase connection and RLS
                  policies.
                </p>
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center">
                <ShoppingBag
                  size={42}
                  className="mx-auto text-slate-300"
                />

                <h2 className="mt-4 text-xl font-black">
                  No products found
                </h2>

                <p className="mt-2 text-slate-500">
                  There are currently no products in this category.
                </p>

                <Link
                  href="/shop"
                  className="mt-6 inline-block rounded-xl bg-[#8549e8] px-6 py-3 font-bold text-white"
                >
                  View all products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => {
                  const image = getProductImage(product);
                  const price = Number(product.price);
                  const salePrice = Number(product.sale_price);
                  const onSale = hasValidSale(product);

                  const displayedPrice = onSale
                    ? salePrice
                    : price;

                  const discountPercentage = onSale
                    ? Math.round(
                        ((price - salePrice) / price) * 100
                      )
                    : 0;

                  return (
                    <article
                      key={product.id}
                      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="relative aspect-square overflow-hidden bg-slate-50">
                        <Link
                          href={`/product/${product.id}`}
                          className="block h-full w-full"
                        >
                          {image ? (
                            <Image
                              src={image}
                              alt={product.title}
                              fill
                              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                              className="object-contain p-5 transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm text-slate-400">
                              No image
                            </div>
                          )}
                        </Link>

                        {onSale && (
                          <span className="absolute left-3 top-3 rounded-full bg-[#8549e8] px-3 py-1 text-xs font-bold text-white">
                            {discountPercentage}% off
                          </span>
                        )}

                        <button
                          type="button"
                          aria-label={`Add ${product.title} to wishlist`}
                          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition hover:text-red-500"
                        >
                          <Heart size={19} />
                        </button>

                        {product.stock === 0 && (
                          <div className="absolute inset-x-3 bottom-3 rounded-xl bg-slate-950/80 px-3 py-2 text-center text-xs font-bold text-white backdrop-blur">
                            Out of stock
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#8549e8]">
                          {product.category ?? "Personalized Gift"}
                        </p>

                        <Link href={`/product/${product.id}`}>
                          <h2 className="mt-2 line-clamp-2 min-h-12 font-bold leading-6 transition hover:text-[#8549e8]">
                            {product.title}
                          </h2>
                        </Link>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="text-xl font-black text-[#8549e8]">
                            ₹{displayedPrice.toLocaleString("en-IN")}
                          </span>

                          {onSale && (
                            <span className="text-sm text-slate-400 line-through">
                              ₹{price.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/product/${product.id}`}
                          className={`mt-4 block rounded-xl px-4 py-3 text-center text-sm font-bold text-white transition ${
                            product.stock === 0
                              ? "pointer-events-none bg-slate-300"
                              : "bg-gradient-to-r from-[#8549e8] to-[#f36a47] hover:brightness-105"
                          }`}
                        >
                          {product.stock === 0
                            ? "Out of Stock"
                            : "Customize Now"}
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}