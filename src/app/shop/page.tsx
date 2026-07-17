import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "maktyle | Shop",
  description:
    "Create personalized phone covers, photo frames, mugs, LED lamps, T-shirts and unique custom gifts with Maktyle.",
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

// type ShopPageProps = {
//   searchParams: Promise<{
//     category?: string;
//     sort?: string;
//     limit?: string;
//   }>;
// };

type ShopPageProps = {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    limit?: string;
    page?: string;
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

function getPrice(product: Product) {
  const price = Number(product.price);

  return Number.isFinite(price) ? price : 0;
}

function getSalePrice(product: Product) {
  if (product.sale_price === null) {
    return null;
  }

  const salePrice = Number(product.sale_price);

  return Number.isFinite(salePrice) ? salePrice : null;
}

function hasValidSale(product: Product) {
  const price = getPrice(product);
  const salePrice = getSalePrice(product);

  return (
    salePrice !== null &&
    salePrice > 0 &&
    price > 0 &&
    salePrice < price
  );
}



export default async function ShopPage({
  searchParams,
}: ShopPageProps) {
  const params = await searchParams;

  const selectedCategory = params.category ?? "all";
  const selectedSort = params.sort ?? "latest";

//   const parsedLimit = Number(params.limit ?? 16);

//   const productLimit = [8, 12, 16, 24, 32].includes(parsedLimit)
//     ? parsedLimit
//     : 16;

  const supabase = await createClient();

  const currentPage = Math.max(
  1,
  Number(params.page ?? 1)
);

const createPageUrl = (page: number) => {
  const params = new URLSearchParams();

  if (selectedCategory !== "all") {
    params.set("category", selectedCategory);
  }

  if (selectedSort !== "latest") {
    params.set("sort", selectedSort);
  }

  if (productLimit !== 16) {
    params.set("limit", String(productLimit));
  }

  params.set("page", String(page));

  return `/shop?${params.toString()}`;
};

const parsedLimit = Number(params.limit ?? 16);

const productLimit = [8, 12, 16, 24, 32].includes(parsedLimit)
  ? parsedLimit
  : 16;

const from = (currentPage - 1) * productLimit;
const to = from + productLimit - 1;

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
  } = await query.range(from, to);

  if (error) {
    console.error("Shop products error:", error);
  }

  const products = (data ?? []) as Product[];
//   const totalProducts = count ?? products.length;

  const totalProducts = count ?? 0;

const totalPages = Math.ceil(
  totalProducts / productLimit
);

  return (
    <main className="min-h-screen bg-white text-slate-950">
      {/* Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#fff7fb] via-[#faf2ff] to-[#fff8fc]">
        <div className="absolute left-10 top-10 h-32 w-32 rounded-full bg-purple-200/30 blur-3xl" />
        <div className="absolute right-5 top-5 h-32 w-32 rounded-full bg-pink-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-9 sm:px-6 md:grid md:grid-cols-2 md:items-center md:gap-10 md:px-8 md:py-14">
          <div className="text-center md:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8549e8] sm:text-sm">
              Personalized gifts
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
              Shop
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base md:mx-0 md:mt-5 md:text-lg">
              Discover personalized gifts made for every special
              moment. Add your photos, names and unique designs.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
              {[
                "Custom designs",
                "Fast delivery",
                "Made with love",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-white px-3 py-2 text-xs font-semibold shadow-sm sm:text-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto mt-8 h-[190px] w-full max-w-[380px] md:mt-0 md:h-[230px]">
            <div className="absolute left-2 top-10 h-28 w-28 -rotate-6 overflow-hidden rounded-2xl bg-white shadow-lg sm:h-32 sm:w-32">
              <Image
                src="/wmug.png"
                alt="Personalized custom mug"
                fill
                sizes="128px"
                className="object-contain p-3"
              />
            </div>

            <div className="absolute left-1/2 top-0 h-36 w-36 -translate-x-1/2 rotate-3 overflow-hidden rounded-2xl bg-white shadow-xl sm:h-40 sm:w-40">
              <Image
                src="/fframe.png"
                alt="Personalized photo frame"
                fill
                sizes="160px"
                className="object-contain p-3"
              />
            </div>

            <div className="absolute right-2 top-10 h-28 w-28 rotate-6 overflow-hidden rounded-2xl bg-white shadow-lg sm:h-32 sm:w-32">
              <Image
                src="/pillow.png"
                alt="Personalized custom pillow"
                fill
                sizes="128px"
                className="object-contain p-3"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main shop content */}
      <section className="mx-auto max-w-7xl px-3 py-7 sm:px-5 sm:py-10 md:px-8 lg:py-14">
        {/* Mobile categories */}
        <div className="mb-6 lg:hidden">
          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
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
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition ${
                    active
                      ? "border-[#8549e8] bg-[#8549e8] text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-purple-300 hover:text-[#8549e8]"
                  }`}
                >
                  <Icon size={15} />
                  {category.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Desktop sidebar */}
          <aside className="hidden space-y-6 lg:block">
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
                Create a personalized gift using your photo, name
                or custom artwork.
              </p>

              <Link
                href="/contact"
                className="mt-5 block rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-3 text-center text-sm font-bold text-white transition hover:brightness-105"
              >
                Contact Us
              </Link>
            </div>
          </aside>

          {/* Products */}
          <div className="min-w-0">
            {/* Product area */}
          
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

            {/* Error state */}
            {error ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center sm:p-10">
                <h2 className="text-xl font-bold text-red-700">
                  Products could not be loaded
                </h2>

                <p className="mt-2 text-sm text-red-600">
                  Please check your Supabase connection and
                  product read policies.
                </p>
              </div>
            ) : products.length === 0 ? (
              /* Empty state */
              <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center sm:p-12">
                <ShoppingBag
                  size={42}
                  className="mx-auto text-slate-300"
                />

                <h2 className="mt-4 text-xl font-black">
                  No products found
                </h2>

                <p className="mt-2 text-sm text-slate-500 sm:text-base">
                  There are currently no products in this
                  category.
                </p>

                <Link
                  href="/shop"
                  className="mt-6 inline-block rounded-xl bg-[#8549e8] px-6 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
                >
                  View all products
                </Link>
              </div>
            ) : (
              /* Product grid */
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => {
                  const image = getProductImage(product);
                  const price = getPrice(product);
                  const salePrice = getSalePrice(product);
                  const onSale = hasValidSale(product);

                  const displayedPrice =
                    onSale && salePrice !== null
                      ? salePrice
                      : price;

                  const discountPercentage =
                    onSale && salePrice !== null
                      ? Math.round(
                          ((price - salePrice) / price) * 100
                        )
                      : 0;

                  const isOutOfStock =
                    product.stock !== null &&
                    product.stock <= 0;

                  return (
                    <article
                      key={product.id}
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:rounded-3xl"
                    >
                      <div className="relative aspect-square overflow-hidden bg-slate-50">
                        <Link
                          href={`/product/${product.id}`}
                          className="block h-full w-full"
                        >
                          {image ? (
                            <Image
                              src={image}
                              alt={
                                product.product_images?.find(
                                  (item) =>
                                    item.image_url === image
                                )?.alt_text ||
                                product.title
                              }
                              fill
                              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                              className="object-contain p-3 transition duration-500 group-hover:scale-105 sm:p-5"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center px-3 text-center text-xs text-slate-400">
                              No product image
                            </div>
                          )}
                        </Link>

                        {onSale && (
                          <span className="absolute left-2 top-2 rounded-full bg-[#8549e8] px-2 py-1 text-[10px] font-bold text-white sm:left-3 sm:top-3 sm:px-3 sm:text-xs">
                            {discountPercentage}% off
                          </span>
                        )}

                        <button
                          type="button"
                          aria-label={`Add ${product.title} to wishlist`}
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition hover:text-red-500 sm:right-3 sm:top-3 sm:h-10 sm:w-10"
                        >
                          <Heart size={16} />
                        </button>

                        {isOutOfStock && (
                          <div className="absolute inset-x-2 bottom-2 rounded-lg bg-slate-950/80 px-2 py-1.5 text-center text-[10px] font-bold text-white backdrop-blur sm:inset-x-3 sm:bottom-3 sm:text-xs">
                            Out of stock
                          </div>
                        )}
                      </div>

                      <div className="p-3 sm:p-4">
                        <p className="truncate text-[10px] font-bold uppercase tracking-wide text-[#8549e8] sm:text-xs">
                          {product.category ??
                            "Personalized Gift"}
                        </p>

                        <Link href={`/product/${product.id}`}>
                          <h2 className="mt-1 line-clamp-2 min-h-10 text-sm font-bold leading-5 transition hover:text-[#8549e8] sm:mt-2 sm:min-h-12 sm:text-base sm:leading-6">
                            {product.title}
                          </h2>
                        </Link>

                        <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:mt-3 sm:gap-2">
                          <span className="text-base font-black text-[#8549e8] sm:text-xl">
                            ₹
                            {displayedPrice.toLocaleString(
                              "en-IN"
                            )}
                          </span>

                          {onSale && (
                            <span className="text-[11px] text-slate-400 line-through sm:text-sm">
                              ₹{price.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/product/${product.id}`}
                          aria-disabled={isOutOfStock}
                          className={`mt-3 block rounded-lg py-2.5 text-center text-xs font-bold text-white transition sm:mt-4 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm ${
                            isOutOfStock
                              ? "pointer-events-none bg-slate-300"
                              : "bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:brightness-110"
                          }`}
                        >
                          {isOutOfStock
                            ? "Out of Stock"
                            : "Customize Now"}
                        </Link>
                      </div>
                    </article>
                  );
                })}

                {totalPages > 1 && (
  <div className="mt-12 w-full flex items-center justify-center gap-2">
    <Link
      href={
        currentPage > 1
          ? createPageUrl(currentPage - 1)
          : "#"
      }
      className={`rounded-xl border px-4 py-3 font-semibold ${
        currentPage === 1
          ? "pointer-events-none bg-slate-100 text-slate-400"
          : "bg-white hover:border-purple-600 hover:text-purple-600"
      }`}
    >
      ← Previous
    </Link>

    {Array.from(
      { length: totalPages },
      (_, index) => index + 1
    ).map((page) => (
      <Link
        key={page}
        href={createPageUrl(page)}
        className={`flex h-11 w-11 items-center px-4 py-3 justify-center rounded-xl border font-bold transition ${
          currentPage === page
            ? "border-purple-600 bg-purple-600 text-white"
            : "bg-white hover:border-purple-600 hover:text-purple-600"
        }`}
      >
        {page}
      </Link>
    ))}

    <Link
      href={
        currentPage < totalPages
          ? createPageUrl(currentPage + 1)
          : "#"
      }
      className={`rounded-xl border px-4 py-3 font-semibold ${
        currentPage === totalPages
          ? "pointer-events-none bg-slate-100 text-slate-400"
          : "bg-white hover:border-purple-600 hover:text-purple-600"
      }`}
    >
      Next →
    </Link>
  </div>
)}

              </div>
              
            )}
          </div>
        </div>
      </section>
    </main>
  );
}