import Image from "next/image";
import Link from "next/link";
import {
  Baby,
  BriefcaseBusiness,
  CakeSlice,
  Gift,
  Heart,
  Home,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    occasion?: string;
  }>;
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
  description: string | null;
  category: string | null;
  price: number | string | null;
  sale_price: number | string | null;
  stock: number | null;
  product_images: ProductImage[] | null;
};

const categories = [
  {
    name: "Phone Cases",
    emoji: "📱",
    link: "/shop?category=Phone%20Case",
  },
  {
    name: "Photo Frames",
    emoji: "🌄",
    link: "/shop?category=Photo%20Frame",
  },
  {
    name: "Custom Mugs",
    emoji: "☕",
    link: "/shop?category=Mug",
  },
  {
    name: "LED Lamps",
    emoji: "💡",
    link: "/shop?category=Lamp",
  },
  {
    name: "T-Shirts",
    emoji: "👕",
    link: "/shop?category=Tshirt",
  },
  {
    name: "Water Bottles",
    emoji: "🍾",
    link: "/shop?category=Bottle",
  },
  {
    name: "Keychains",
    emoji: "🔑",
    link: "/shop?category=Keychain",
  },
  {
    name: "Pillows",
    emoji: "🛏️",
    link: "/shop?category=Pillow",
  },
  {
    name: "Name Plate",
    emoji: "🖼️",
    link: "/shop",
  },
  {
    name: "Acrylic Gifts",
    emoji: "🎁",
    link: "/shop",
  },
];

const occasions = [
  {
    name: "Birthday",
    icon: CakeSlice,
    iconClassName: "bg-pink-100 text-pink-600",
  },
  {
    name: "Anniversary",
    icon: Heart,
    iconClassName: "bg-red-100 text-red-600",
  },
  {
    name: "Wedding",
    icon: Gift,
    iconClassName: "bg-purple-100 text-purple-600",
  },
  {
    name: "Baby Shower",
    icon: Baby,
    iconClassName: "bg-sky-100 text-sky-600",
  },
  {
    name: "Festivals",
    icon: Sparkles,
    iconClassName: "bg-amber-100 text-amber-600",
  },
  {
    name: "Corporate Gifts",
    icon: BriefcaseBusiness,
    iconClassName: "bg-slate-100 text-slate-700",
  },
  {
    name: "Housewarming",
    icon: Home,
    iconClassName: "bg-green-100 text-green-700",
  },
];

const popularSearches = [
    {
        name: "Custom Mug",
        link: "/shop?category=Mug",
    },
    {
        name: "Phone Cover",
        link: "/shop?category=Phone%20Case",
    },
    {
        name: "LED Lamp",
        link: "/shop?category=Lamp",
    },
    {
        name: "Photo Frame",
        link: "/shop?category=Photo%20Frame",
    },
    {
        name: "Birthday Gift",
        link: "/shop",
    },
    {
        name: "Anniversary Gift",
        link: "/shop",
    },
    {
        name: "Custom T-Shirt",
        link: "/shop?category=Tshirt",
    },
    {
        name: "Personalized Gift",
        link: "/shop",
    },
];

function escapeSupabaseSearch(value: string) {
  return value.replace(/[%_,()]/g, " ").trim();
}

function getProductImage(product: Product) {
  const images = [...(product.product_images ?? [])].sort(
    (a, b) =>
      Number(Boolean(b.is_primary)) -
        Number(Boolean(a.is_primary)) ||
      Number(a.display_order ?? 0) -
        Number(b.display_order ?? 0),
  );

  return images[0]?.image_url ?? null;
}

function getProductPrice(product: Product) {
  const regularPrice = Number(product.price ?? 0);
  const salePrice = Number(product.sale_price ?? 0);

  const hasSale =
    salePrice > 0 &&
    regularPrice > 0 &&
    salePrice < regularPrice;

  return {
    regularPrice,
    salePrice,
    finalPrice: hasSale ? salePrice : regularPrice,
    hasSale,
  };
}

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;

  const query = params.q?.trim() ?? "";
  const selectedCategory = params.category?.trim() ?? "";
  const selectedOccasion = params.occasion?.trim() ?? "";

  const normalizedQuery = query.toLowerCase();

  const filteredCategories = normalizedQuery
    ? categories.filter((category) =>
        category.name.toLowerCase().includes(normalizedQuery),
      )
    : categories;

  const filteredOccasions = normalizedQuery
    ? occasions.filter((occasion) =>
        occasion.name.toLowerCase().includes(normalizedQuery),
      )
    : occasions;

  const supabase = await createClient();

  let productRequest = supabase
    .from("products")
    .select(`
      id,
      title,
      description,
      category,
      price,
      sale_price,
      stock,
      product_images (
        id,
        image_url,
        alt_text,
        display_order,
        is_primary
      )
    `)
    .order("created_at", { ascending: false })
    .limit(24);

  if (query) {
    const safeQuery = escapeSupabaseSearch(query);

    if (safeQuery) {
      productRequest = productRequest.or(
        `title.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%,category.ilike.%${safeQuery}%`,
      );
    }
  }

  if (selectedCategory) {
    productRequest = productRequest.ilike(
      "category",
      `%${selectedCategory}%`,
    );
  }

  /*
    This assumes your products table contains an "occasion" column.

    If your products table does not have an occasion column yet,
    remove this block or add the occasion column in Supabase.
  */
  if (selectedOccasion) {
    productRequest = productRequest.ilike(
      "occasion",
      `%${selectedOccasion}%`,
    );
  }

  const { data, error } = await productRequest;

  if (error) {
    console.error("Search products error:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
  }

  const products = (data ?? []) as Product[];

  const hasActiveSearch =
    Boolean(query) ||
    Boolean(selectedCategory) ||
    Boolean(selectedOccasion);

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-950">
      {/* Search hero */}

      <section className="relative overflow-hidden bg-gradient-to-br from-[#8549e8] via-[#9c51df] to-[#f36a47]">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-orange-200/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
              <Sparkles size={16} />
              Personalized gifts made special
            </span>

            <h1 className="mt-6 text-3xl font-black tracking-tight text-white sm:text-5xl">
              Find the perfect gift
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
              Search personalized products, browse all categories, or
              discover gifts for every special occasion.
            </p>

            <form
              action="/search"
              method="GET"
              className="mx-auto mt-8 flex max-w-3xl items-center rounded-2xl bg-white p-2 shadow-2xl shadow-purple-950/20"
            >
              <div className="flex min-w-0 flex-1 items-center">
                <Search
                  size={22}
                  className="ml-3 shrink-0 text-slate-400"
                />

                <input
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder="Search mugs, phone cases, photo frames..."
                  className="h-12 min-w-0 flex-1 bg-transparent px-4 text-sm text-slate-950 outline-none placeholder:text-slate-400 sm:text-base"
                />
              </div>

              <button
                type="submit"
                className="flex h-12 shrink-0 items-center justify-center rounded-xl bg-[#8549e8] px-5 text-sm font-bold text-white transition hover:bg-[#7338d3] sm:px-8"
              >
                <Search size={18} className="sm:mr-2" />

                <span className="hidden sm:inline">
                  Search
                </span>
              </button>
            </form>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {popularSearches.map((item) => (
                <Link
                  key={item.name}
                  href={item.link}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-white hover:text-[#8549e8]"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Active filters */}

        {hasActiveSearch && (
          <div className="mb-10 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mr-1 text-sm font-bold text-slate-700">
              Active filters:
            </p>

            {query && (
              <span className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-2 text-sm font-semibold text-[#8549e8]">
                Search: {query}
              </span>
            )}

            {selectedCategory && (
              <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-[#f36a47]">
                Category: {selectedCategory}
              </span>
            )}

            {selectedOccasion && (
              <span className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-4 py-2 text-sm font-semibold text-pink-600">
                Occasion: {selectedOccasion}
              </span>
            )}

            <Link
              href="/search"
              className="ml-auto inline-flex items-center gap-1 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <X size={15} />
              Clear
            </Link>
          </div>
        )}

        {/* Search results */}

        {hasActiveSearch && (
          <section className="mb-16">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-[#8549e8]">
                  Search results
                </p>

                <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                  {products.length}{" "}
                  {products.length === 1
                    ? "product found"
                    : "products found"}
                </h2>
              </div>

              <Link
                href="/shop"
                className="text-sm font-bold text-[#8549e8] hover:underline"
              >
                View complete shop →
              </Link>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => {
                  const productImage = getProductImage(product);

                  const {
                    regularPrice,
                    finalPrice,
                    hasSale,
                  } = getProductPrice(product);

                  const discount =
                    hasSale && regularPrice > 0
                      ? Math.round(
                          ((regularPrice - finalPrice) /
                            regularPrice) *
                            100,
                        )
                      : 0;

                  return (
                    <Link
                      key={product.id}
                      href={`/product/${product.id}`}
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl"
                    >
                      <div className="relative aspect-square overflow-hidden bg-slate-100">
                        {productImage ? (
                          <Image
                            src={productImage}
                            alt={product.title}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-5xl">
                            🎁
                          </div>
                        )}

                        {discount > 0 && (
                          <span className="absolute left-3 top-3 rounded-full bg-[#f36a47] px-3 py-1 text-[10px] font-black text-white sm:text-xs">
                            {discount}% OFF
                          </span>
                        )}

                        {product.stock !== null &&
                          product.stock <= 0 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                              <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-slate-900">
                                Out of stock
                              </span>
                            </div>
                          )}
                      </div>

                      <div className="p-4 sm:p-5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#8549e8] sm:text-xs">
                          {product.category ?? "Personalized Gift"}
                        </p>

                        <h3 className="mt-2 line-clamp-2 min-h-10 text-sm font-black text-slate-900 sm:text-base">
                          {product.title}
                        </h3>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <span className="text-base font-black text-slate-950 sm:text-lg">
                            ₹{finalPrice.toLocaleString("en-IN")}
                          </span>

                          {hasSale && (
                            <span className="text-xs text-slate-400 line-through sm:text-sm">
                              ₹{regularPrice.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>

                        <div className="mt-4 flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#8549e8] to-[#f36a47] text-xs font-bold text-white sm:text-sm">
                          View Product
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-purple-50">
                  <Search
                    size={34}
                    className="text-[#8549e8]"
                  />
                </div>

                <h3 className="mt-6 text-xl font-black">
                  No products found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Try a different keyword, browse another category,
                  or remove the current filters.
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/search"
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Clear search
                  </Link>

                  <Link
                    href="/shop"
                    className="rounded-xl bg-[#8549e8] px-5 py-3 text-sm font-bold text-white hover:bg-[#7338d3]"
                  >
                    Browse shop
                  </Link>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Categories */}

        <section className="mb-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-[#f36a47]">
                Explore products
              </p>

              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                All product categories
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Find personalized products for every style.
              </p>
            </div>

            <Link
              href="/shop"
              className="hidden text-sm font-bold text-[#8549e8] hover:underline sm:block"
            >
              View all →
            </Link>
          </div>

          {filteredCategories.length > 0 ? (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
    {filteredCategories.map((category) => (
      <Link
        key={category.name}
        href={category.link}
        className="group rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:border-purple-200 hover:shadow-lg"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-50 to-orange-50 text-4xl transition duration-300 group-hover:scale-110">
          {category.emoji}
        </div>

        <h3 className="mt-4 text-sm font-black text-slate-900 sm:text-base">
          {category.name}
        </h3>

        <p className="mt-2 text-xs font-semibold text-[#8549e8]">
          Explore products
        </p>
      </Link>
    ))}
  </div>
) : (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
    No matching categories found for “{query}”.
  </div>
)}
              
        </section>

        {/* Occasions */}

        <section>
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-wider text-[#8549e8]">
              Celebrate every moment
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Shop by occasion
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Discover meaningful gifts for every celebration.
            </p>
          </div>

          {filteredOccasions.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
              {filteredOccasions.map((occasion) => {
                const Icon = occasion.icon;

                return (
                  <Link
                    key={occasion.name}
                    href={`/shop`}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:border-purple-200 hover:shadow-lg"
                  >
                    <div
                      className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full transition duration-300 group-hover:scale-110 ${occasion.iconClassName}`}
                    >
                      <Icon size={28} />
                    </div>

                    <h3 className="mt-4 text-sm font-black">
                      {occasion.name}
                    </h3>

                    <p className="mt-2 text-xs font-semibold text-slate-400">
                      View gifts
                    </p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
              No matching occasions found for “{query}”.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}