import Link from "next/link";
import { PackageX } from "lucide-react";

export default function ProductNotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="text-center">
        <PackageX
          size={60}
          className="mx-auto text-slate-300"
        />

        <h1 className="mt-5 text-3xl font-black">
          Product not found
        </h1>

        <p className="mt-3 text-slate-500">
          This product may have been removed or is no longer
          available.
        </p>

        <Link
          href="/shop"
          className="mt-7 inline-block rounded-xl bg-gradient-to-r from-[#8549e8] to-[#f36a47] px-6 py-3 font-bold text-white"
        >
          Back to Shop
        </Link>
      </div>
    </main>
  );
}