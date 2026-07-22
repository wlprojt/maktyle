import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Heart,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type Product = {
  id: string;
  title: string | null;
  slug: string | null;
  price: number | string | null;
  sale_price: number | string | null;
  category: string | null;
  stock: number | null;
  product_images:
    | {
        image_url: string | null;
        is_primary: boolean | null;
        display_order: number | null;
      }[]
    | null;
};

type FavoriteRow = {
  id: string;
  created_at: string | null;
  product_id: string;
  products: Product | Product[] | null;
};

type SearchParams = Promise<{
  search?: string;
}>;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getProduct(favorite: FavoriteRow) {
  if (Array.isArray(favorite.products)) {
    return favorite.products[0] ?? null;
  }

  return favorite.products;
}

function getPrimaryImage(product: Product) {
  const images = product.product_images ?? [];

  const primaryImage = images.find((image) => image.is_primary);
  const sortedImage = [...images].sort(
    (a, b) =>
      Number(a.display_order ?? 0) - Number(b.display_order ?? 0),
  )[0];

  return primaryImage?.image_url || sortedImage?.image_url || null;
}

function getProductHref(product: Product) {
  return product.slug
    ? `/shop/${product.slug}`
    : `/product/${product.id}`;
}

export default async function FavoritesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/favorites");
  }

  const params = await searchParams;
  const search = params.search?.trim().toLowerCase() || "";

  const { data, error } = await supabase
    .from("favorites")
    .select(`
      id,
      created_at,
      product_id,
      products (
        id,
        title,
        slug,
        price,
        sale_price,
        category,
        stock,
        product_images (
          image_url,
          is_primary,
          display_order
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Unable to load favorites:", error);
  }

  const favorites = ((data ?? []) as FavoriteRow[])
    .map((favorite) => ({
      ...favorite,
      product: getProduct(favorite),
    }))
    .filter(
      (
        favorite,
      ): favorite is FavoriteRow & {
        product: Product;
      } => Boolean(favorite.product),
    )
    .filter((favorite) => {
      if (!search) return true;

      return [
        favorite.product.title,
        favorite.product.category,
      ].some((value) => value?.toLowerCase().includes(search));
    });

  return (
    <main className="min-h-screen bg-[#faf9fc] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-black text-[#8549e8]"
            >
              <ArrowLeft size={17} />
              Back to dashboard
            </Link>

            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              My Favorites
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              View your saved products and continue shopping anytime.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8549e8] px-5 py-3 text-sm font-black text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:bg-[#7440d0]"
          >
            <ShoppingBag size={18} />
            Browse products
          </Link>
        </div>

        <section className="mt-7 overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-[#fff3f7] via-white to-[#f8f2ff] p-5 shadow-sm sm:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-pink-100 text-pink-600">
                <Heart size={27} fill="currentColor" />
              </div>

              <div>
                <p className="text-sm font-bold text-pink-600">
                  Saved products
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  {favorites.length}{" "}
                  {favorites.length === 1 ? "favorite" : "favorites"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Products you loved are saved here.
                </p>
              </div>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-pink-200 bg-white px-5 py-3 text-sm font-black text-pink-600 transition hover:bg-pink-50"
            >
              <Sparkles size={18} />
              Discover more
            </Link>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <form
            action="/dashboard/favorites"
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="relative w-full sm:max-w-md">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                name="search"
                defaultValue={params.search || ""}
                placeholder="Search favorite products..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-purple-300 focus:bg-white focus:ring-4 focus:ring-purple-100"
              />
            </div>

            {search && (
              <Link
                href="/dashboard/favorites"
                className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-purple-50 hover:text-[#8549e8]"
              >
                Clear search
              </Link>
            )}
          </form>
        </section>

        <section className="mt-6">
          {favorites.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
              <Heart className="mx-auto text-slate-300" size={54} />

              <h2 className="mt-5 text-xl font-black">
                {search
                  ? "No matching favorites"
                  : "Your favorites list is empty"}
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {search
                  ? "Try searching with another product or category name."
                  : "Tap the heart icon on any product to save it here for later."}
              </p>

              <Link
                href="/shop"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#8549e8] px-5 py-3 text-sm font-black text-white"
              >
                <ShoppingBag size={17} />
                Explore products
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {favorites.map(({ id, product }) => {
                const image = getPrimaryImage(product);
                const currentPrice = Number(
                  product.sale_price ?? product.price ?? 0,
                );
                const originalPrice = Number(product.price ?? 0);
                const hasDiscount =
                  product.sale_price !== null &&
                  currentPrice < originalPrice;

                return (
                  <article
                    key={id}
                    className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl"
                  >
                    <Link
                      href={getProductHref(product)}
                      className="relative block aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-purple-50"
                    >
                      {image ? (
                        <Image
                          src={image}
                          alt={product.title || "Favorite product"}
                          fill
                          unoptimized
                          className="object-contain p-5 transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center">
                          <Package size={42} className="text-slate-300" />
                          <p className="mt-3 text-sm font-bold text-slate-400">
                            Image unavailable
                          </p>
                        </div>
                      )}

                      <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-pink-600 shadow-md">
                        <Heart size={19} fill="currentColor" />
                      </div>

                      {hasDiscount && (
                        <span className="absolute left-4 top-4 rounded-full bg-[#f36a47] px-3 py-1.5 text-xs font-black text-white shadow-sm">
                          Sale
                        </span>
                      )}
                    </Link>

                    <div className="p-5">
                      <p className="text-xs font-bold uppercase tracking-wide text-[#8549e8]">
                        {product.category || "Personalized gift"}
                      </p>

                      <Link href={getProductHref(product)}>
                        <h2 className="mt-2 line-clamp-2 min-h-12 text-lg font-black text-slate-800 transition hover:text-[#8549e8]">
                          {product.title || "Personalized product"}
                        </h2>
                      </Link>

                      <div className="mt-3 flex flex-wrap items-end gap-2">
                        <p className="text-xl font-black text-slate-900">
                          {formatCurrency(currentPrice)}
                        </p>

                        {hasDiscount && (
                          <p className="pb-0.5 text-sm font-semibold text-slate-400 line-through">
                            {formatCurrency(originalPrice)}
                          </p>
                        )}
                      </div>

                      <p
                        className={`mt-2 text-xs font-bold ${
                          Number(product.stock ?? 0) > 0
                            ? "text-emerald-600"
                            : "text-rose-500"
                        }`}
                      >
                        {Number(product.stock ?? 0) > 0
                          ? "In stock"
                          : "Out of stock"}
                      </p>

                      <div className="mt-5 grid grid-cols-[1fr_auto] gap-3">
                        <Link
                          href={getProductHref(product)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8549e8] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#7440d0]"
                        >
                          View product
                          <ChevronRight size={16} />
                        </Link>

                        <button
                          type="button"
                          title="Remove from favorites"
                          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}