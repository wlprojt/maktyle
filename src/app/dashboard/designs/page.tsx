import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Edit3,
  ImageIcon,
  Download,
  Package,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { deleteDesign } from "@/app/actions/designs";
import DeleteDesignButton from "./DeleteDesignButton";

type SearchParams = Promise<{
  search?: string;
}>;

type DesignRow = {
  id: string;
  user_id?: string | null;
  title?: string | null;
  name?: string | null;
  product_id?: string | null;
  product_title?: string | null;
  model?: string | null;
  brand?: string | null;
  preview_url?: string | null;
  preview_path?: string | null;
  thumbnail_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
};

type DesignWithPreview = DesignRow & {
  previewImage: string | null;
  displayTitle: string;
};

function formatDate(value?: string | null) {
  if (!value) {
    return "Recently saved";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently saved";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getStoragePath(value?: string | null) {
  if (!value) {
    return null;
  }

  if (!value.startsWith("http://") && !value.startsWith("https://")) {
    return value.replace(/^\/+/, "");
  }

  const markers = [
    "/storage/v1/object/public/custom-designs/",
    "/storage/v1/object/sign/custom-designs/",
    "/storage/v1/object/authenticated/custom-designs/",
  ];

  for (const marker of markers) {
    const index = value.indexOf(marker);

    if (index !== -1) {
      return decodeURIComponent(
        value.slice(index + marker.length).split("?")[0],
      );
    }
  }

  return null;
}

async function createSignedPreviewUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  value?: string | null,
) {
  if (!value) {
    return null;
  }

  if (value.startsWith("data:image/")) {
    return value;
  }

  const storagePath = getStoragePath(value);

  if (!storagePath) {
    return value;
  }

  const { data, error } = await supabase.storage
    .from("custom-designs")
    .createSignedUrl(storagePath, 60 * 60);

  if (error) {
    console.error("Unable to sign design preview:", {
      message: error.message,
      name: error.name,
    });

    return null;
  }

  return data.signedUrl;
}

function getDesignTitle(design: DesignRow) {
  return (
    design.title ||
    design.name ||
    design.product_title ||
    [design.brand, design.model].filter(Boolean).join(" ") ||
    "Untitled design"
  );
}

function getEditHref(design: DesignRow) {
  const params = new URLSearchParams({
    designId: design.id,
  });

  if (design.product_id) {
    params.set("productId", design.product_id);
  }

  return `/customize?${params.toString()}`;
}

export default async function DesignsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/designs");
  }

  const params = await searchParams;
  const rawSearch = params.search?.trim() ?? "";
  const search = rawSearch.toLowerCase();

  /*
   * select("*") keeps this page compatible with slightly different
   * custom_designs table structures.
   */
  const { data, error } = await supabase
    .from("custom_designs")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", {
      ascending: false,
      nullsFirst: false,
    });

  if (error) {
    console.error("Unable to load designs:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
  }

  const rawDesigns = (data ?? []) as DesignRow[];

  const designsWithPreviews: DesignWithPreview[] = await Promise.all(
    rawDesigns.map(async (design) => {
      const storedPreview =
        design.preview_path ||
        design.preview_url ||
        design.thumbnail_url ||
        `${user.id}/${design.id}/preview.png`;

      const previewImage = await createSignedPreviewUrl(
        supabase,
        storedPreview,
      );

      return {
        ...design,
        previewImage,
        displayTitle: getDesignTitle(design),
      };
    }),
  );

  const designs = designsWithPreviews.filter((design) => {
    if (!search) {
      return true;
    }

    const values = [
      design.displayTitle,
      design.product_title,
      design.brand,
      design.model,
      design.id,
    ];

    return values.some((value) =>
      String(value ?? "")
        .toLowerCase()
        .includes(search),
    );
  });

  return (
    <main className="min-h-screen bg-[#faf9fc] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-black text-[#8549e8] transition hover:text-[#7440d0]"
            >
              <ArrowLeft size={17} />
              Back to dashboard
            </Link>

            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              My Designs
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              View, edit and manage your personalized product designs.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8549e8] px-5 py-3 text-sm font-black text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:bg-[#7440d0]"
          >
            <Plus size={18} />
            Create new design
          </Link>
        </div>

        {/* Summary */}
        <section className="mt-7 overflow-hidden rounded-3xl border border-purple-100 bg-gradient-to-br from-[#f8f2ff] via-white to-[#fff4f0] p-5 shadow-sm sm:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-[#8549e8]">
                <Sparkles size={27} />
              </div>

              <div>
                <p className="text-sm font-bold text-[#8549e8]">
                  Saved creations
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  {designsWithPreviews.length}{" "}
                  {designsWithPreviews.length === 1
                    ? "design"
                    : "designs"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your personalized creations are stored securely.
                </p>
              </div>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-200 bg-white px-5 py-3 text-sm font-black text-[#8549e8] transition hover:bg-purple-50"
            >
              <Package size={18} />
              Choose a product
            </Link>
          </div>
        </section>

        {/* Search */}
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <form
            action="/dashboard/designs"
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
                defaultValue={rawSearch}
                placeholder="Search your designs..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-purple-300 focus:bg-white focus:ring-4 focus:ring-purple-100"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-[#8549e8] px-5 py-3 text-sm font-black text-white transition hover:bg-[#7440d0]"
              >
                Search
              </button>

              {search && (
                <Link
                  href="/dashboard/designs"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-600 transition hover:bg-purple-50 hover:text-[#8549e8]"
                >
                  Clear
                </Link>
              )}
            </div>
          </form>
        </section>

        {/* Error */}
        {error && (
          <section className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4">
            <p className="font-black text-rose-700">
              Unable to load your designs
            </p>

            <p className="mt-1 text-sm text-rose-600">
              Please refresh the page or try again later.
            </p>
          </section>
        )}

        {/* Designs */}
        <section className="mt-6">
          {!error && designs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-50 text-purple-300">
                <ImageIcon size={42} />
              </div>

              <h2 className="mt-5 text-xl font-black">
                {search
                  ? "No matching designs"
                  : "You haven't created any designs yet"}
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {search
                  ? "Try searching with another design, product, brand or model name."
                  : "Choose a product and use the customizer to create your first personalized gift."}
              </p>

              <Link
                href="/shop"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#8549e8] px-5 py-3 text-sm font-black text-white transition hover:bg-[#7440d0]"
              >
                <Plus size={17} />
                Create your first design
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {designs.map((design) => {
                const updatedDate =
                  design.updated_at || design.created_at;

                return (
                  <article
                    key={design.id}
                    className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl"
                  >
                    <div
                      // href={`/dashboard/designs/${design.id}`}
                      className="relative block aspect-[4/5] overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50 to-orange-50"
                    >
                      {design.previewImage ? (
                        <Image
                          src={design.previewImage}
                          alt={design.displayTitle}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-contain p-5 transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm">
                            <ImageIcon size={32} />
                          </div>

                          <p className="mt-4 text-sm font-bold text-slate-400">
                            Preview unavailable
                          </p>
                        </div>
                      )}

                      <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-[#8549e8] shadow-sm backdrop-blur">
                        Saved design
                      </span>
                    </div>

                    <div className="p-5">
                      <p className="text-xs font-bold uppercase tracking-wide text-[#8549e8]">
                        {design.product_title ||
                          design.model ||
                          "Personalized product"}
                      </p>

                      {/* <Link href={`/dashboard/designs/${design.id}`}> */}
                        <h2 className="mt-2 line-clamp-2 min-h-12 text-lg font-black text-slate-800 transition hover:text-[#8549e8]">
                          {design.displayTitle}
                        </h2>
                      {/* </Link> */}

                      <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <CalendarDays size={15} />
                        Updated {formatDate(updatedDate)}
                      </div>

                      <p className="mt-2 truncate text-xs text-slate-400">
                        Design #{design.id.slice(0, 8)}
                      </p>

                      <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
  {design.previewImage ? (
    <a
      href={design.previewImage}
      download={`${design.displayTitle
        .replace(/[^a-zA-Z0-9-_ ]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase()}-${design.id.slice(0, 8)}.png`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8549e8] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#7440d0]"
    >
      <Download size={17} />
      Download
    </a>
  ) : (
    <button
      type="button"
      disabled
      className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-black text-slate-400"
    >
      <Download size={17} />
      Unavailable
    </button>
  )}

  <DeleteDesignButton
  action={deleteDesign.bind(null, design.id)}
/>
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