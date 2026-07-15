"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

export default function DeleteProductButton({
  productId,
}: {
  productId: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function deleteProduct() {
    const confirmDelete = confirm("Are you sure you want to delete this product?");

    if (!confirmDelete) return;

    setLoading(true);

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.refresh();
  }

  return (
    <button
      onClick={deleteProduct}
      disabled={loading}
      className="flex items-center gap-2 rounded-xl bg-red-500/20 px-4 py-2 text-sm text-red-300 hover:bg-red-500/30 disabled:opacity-50"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
      Delete
    </button>
  );
}