"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type CartRow = {
  quantity: number | null;
};

export default function CartCount() {
  const [count, setCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    async function loadCartCount() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (mounted) setCount(0);
        return;
      }

      const { data, error } = await supabase
        .from("cart_items")
        .select("quantity")
        .eq("user_id", user.id);

      if (error) {
        console.error("Failed to load cart count:", error.message);

        if (mounted) setCount(0);
        return;
      }

      const total = ((data ?? []) as CartRow[]).reduce(
        (sum, item) => sum + Number(item.quantity ?? 1),
        0,
      );

      if (mounted) {
        setCount(total);
      }
    }

    loadCartCount();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  return (
    <Link
      href="/cart"
      aria-label={`Shopping cart with ${count} items`}
      className="relative rounded-full p-2 transition hover:bg-purple-50 hover:text-[#8549e8]"
    >
      <ShoppingCart size={26} strokeWidth={2} />

      {count > 0 && (
        <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#8549e8] px-1 text-[10px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}