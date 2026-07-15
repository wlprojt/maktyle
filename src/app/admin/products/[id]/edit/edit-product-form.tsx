"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";

export default function EditProductForm({ product }: { product: any }) {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: product.title || "",
    description: product.description || "",
    price: product.price || "",
    sale_price: product.sale_price || "",
    category: product.category || "",
    stock: product.stock || "",
  });

  const [images, setImages] = useState(
    product.product_images?.length
      ? product.product_images
          .sort((a: any, b: any) => a.display_order - b.display_order)
          .map((img: any) => img.image_url)
      : [""]
  );

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function updateImage(index: number, value: string) {
    const updated = [...images];
    updated[index] = value;
    setImages(updated);
  }

  function addImageField() {
    setImages([...images, ""]);
  }

  function removeImageField(index: number) {
    setImages(images.filter((_: string, i: number) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { error: productError } = await supabase
      .from("products")
      .update({
        title: form.title,
        description: form.description,
        price: Number(form.price),
        sale_price: form.sale_price ? Number(form.sale_price) : null,
        category: form.category,
        stock: Number(form.stock || 0),
      })
      .eq("id", product.id);

    if (productError) {
      setLoading(false);
      setError(productError.message);
      return;
    }

    await supabase.from("product_images").delete().eq("product_id", product.id);

    const cleanImages = images.filter((img: string) => img.trim() !== "");

    if (cleanImages.length > 0) {
      const imageRows = cleanImages.map((image_url: string, index: number) => ({
        product_id: product.id,
        image_url,
        display_order: index + 1,
        is_primary: index === 0,
      }));

      const { error: imageError } = await supabase
        .from("product_images")
        .insert(imageRows);

      if (imageError) {
        setLoading(false);
        setError(imageError.message);
        return;
      }
    }

    setLoading(false);
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          required
          placeholder="Product title"
          value={form.title}
          onChange={handleChange}
          className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none"
        />

        <input
          name="price"
          required
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none"
        />

        <input
          name="sale_price"
          type="number"
          placeholder="Sale price"
          value={form.sale_price}
          onChange={handleChange}
          className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none"
        />

        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none"
        />

        <input
          name="stock"
          type="number"
          placeholder="Stock"
          value={form.stock}
          onChange={handleChange}
          className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none"
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-slate-300">Product Images</label>

            <button
              type="button"
              onClick={addImageField}
              className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
            >
              <Plus size={16} />
              Add Image
            </button>
          </div>

          {images.map((image: string, index: number) => (
            <div key={index} className="space-y-2">
              {image && (
                <img
                  src={image}
                  alt="Product"
                  className="h-32 w-full rounded-xl object-cover"
                />
              )}

              <div className="flex gap-2">
                <input
                  placeholder={`Image URL ${index + 1}`}
                  value={image}
                  onChange={(e) => updateImage(index, e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none"
                />

                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="rounded-xl bg-red-500/10 px-3 text-red-300 hover:bg-red-500/20"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Product"
          )}
        </button>
      </form>
    </div>
  );
}