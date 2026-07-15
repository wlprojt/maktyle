"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";

export default function AddProductForm() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    sale_price: "",
    category: "",
    stock: "",
  });

  const [images, setImages] = useState([""]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
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
    setImages(images.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        title: form.title,
        description: form.description,
        price: Number(form.price),
        sale_price: form.sale_price ? Number(form.sale_price) : null,
        category: form.category,
        stock: Number(form.stock || 0),
      })
      .select("id")
      .single();

    if (productError) {
      setLoading(false);
      setError(productError.message);
      return;
    }

    const cleanImages = images.filter((img) => img.trim() !== "");

    if (cleanImages.length > 0) {
      const imageRows = cleanImages.map((image_url, index) => ({
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
    setMessage("Product added successfully.");

    setForm({
      title: "",
      description: "",
      price: "",
      sale_price: "",
      category: "",
      stock: "",
    });

    setImages([""]);

    router.refresh();
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h2 className="mb-5 text-xl font-bold">Add Product</h2>

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

          {images.map((image, index) => (
            <div key={index} className="flex gap-2">
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
          ))}
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-xl bg-green-500/10 p-3 text-sm text-green-300">
            {message}
          </div>
        )}

        <button
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Adding...
            </>
          ) : (
            "Add Product"
          )}
        </button>
      </form>
    </div>
  );
}