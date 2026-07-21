import Link from "next/link";
import {
  CheckCircle2,
  Package,
  ShoppingBag,
} from "lucide-react";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    order?: string;
  }>;
}) {
  const { order } = await searchParams;

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2
            size={50}
            className="text-green-600"
          />
        </div>

        <p className="mt-7 text-sm font-black uppercase tracking-[0.2em] text-[#8549e8]">
          Order confirmed
        </p>

        <h1 className="mt-3 text-3xl font-black text-slate-900">
          Thank you for your order
        </h1>

        <p className="mx-auto mt-4 max-w-md leading-7 text-slate-500">
          Your customized product order has been received. We
          will prepare it carefully and update you when it is
          ready for delivery.
        </p>

        {order && (
          <div className="mt-7 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Order ID
            </p>

            <p className="mt-2 break-all font-black text-slate-800">
              {order}
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href="/dashboard/orders"
            className="flex items-center justify-center gap-2 rounded-xl border border-[#8549e8] px-5 py-3.5 font-black text-[#8549e8]"
          >
            <Package size={18} />
            View orders
          </Link>

          <Link
            href="/shop"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8549e8] to-[#f36a47] px-5 py-3.5 font-black text-white"
          >
            <ShoppingBag size={18} />
            Continue shopping
          </Link>
        </div>
      </div>
    </main>
  );
}