"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Check,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Upload,
} from "lucide-react";
import {
  ChangeEvent,
  useMemo,
  useState,
} from "react";
import { getCustomizeUrl } from "@/lib/get-customize-url";
import FavoriteButton from "@/components/favorite-button";

type ProductImage = {
  id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number | null;
  is_primary: boolean | null;
};

type ProductDetailsClientProps = {
  product: {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    stock: number | null;
    price: number;
    salePrice: number | null;
    finalPrice: number;
    discountPercentage: number;
    images: ProductImage[];
  };
  isFavorite: boolean;
};

const baseOptions = [
  {
    name: "Wooden",
    extraPrice: 0,
  },
  {
    name: "Black",
    extraPrice: 100,
  },
  {
    name: "White",
    extraPrice: 100,
  },
];

const colorOptions = [
  {
    name: "Warm White",
    description: "Recommended",
  },
  {
    name: "White",
    description: "Bright",
  },
  {
    name: "Multi Color",
    description: "RGB",
  },
];

export default function ProductDetailsClient({
  product,isFavorite
}: ProductDetailsClientProps) {
  const [selectedImage, setSelectedImage] = useState(
    product.images[0]?.image_url ?? ""
  );

  const [uploadedPhoto, setUploadedPhoto] = useState<
    string | null
  >(null);

  const [selectedBase, setSelectedBase] =
    useState("Wooden");

  const [selectedColor, setSelectedColor] =
    useState("Warm White");

  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);

  const isOutOfStock =
    product.stock !== null && product.stock <= 0;

  const selectedBaseOption = baseOptions.find(
    (option) => option.name === selectedBase
  );

  const unitPrice =
    product.finalPrice +
    (selectedBaseOption?.extraPrice ?? 0);

  const totalPrice = unitPrice * quantity;

  const previewImages = useMemo(() => {
    const images = product.images.map(
      (image) => image.image_url
    );

    if (uploadedPhoto) {
      return [uploadedPhoto, ...images];
    }

    return images;
  }, [product.images, uploadedPhoto]);

  function handlePhotoUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be smaller than 10MB.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setUploadedPhoto(imageUrl);
    setSelectedImage(imageUrl);
  }

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increaseQuantity() {
    if (
      product.stock !== null &&
      quantity >= product.stock
    ) {
      return;
    }

    setQuantity((current) => current + 1);
  }

  function addToCart() {
    const cartItem = {
      productId: product.id,
      title: product.title,
      quantity,
      base: selectedBase,
      color: selectedColor,
      price: unitPrice,
    };

    console.log("Add to cart:", cartItem);

    alert("Product added to cart.");
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        {/* Images */}
        <div className="grid gap-4 sm:grid-cols-[88px_1fr]">
          <div className="scrollbar-hide order-2 flex gap-3 overflow-x-auto sm:order-1 sm:flex-col sm:overflow-visible">
            {previewImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setSelectedImage(image)}
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-slate-50 transition sm:h-20 sm:w-full ${
                  selectedImage === image
                    ? "border-[#8549e8] ring-2 ring-purple-100"
                    : "border-slate-200 hover:border-purple-300"
                }`}
              >
                <Image
                  src={image}
                  alt={`${product.title} image ${index + 1}`}
                  fill
                  sizes="80px"
                  unoptimized={image.startsWith("blob:")}
                  className="object-contain p-1"
                />
              </button>
            ))}
          </div>

          <div className="order-1 sm:order-2">
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-slate-50">
              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt={product.title}
                  fill
                  priority
                  unoptimized={selectedImage.startsWith(
                    "blob:"
                  )}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain p-4 sm:p-8"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  No product image
                </div>
              )}

              {product.discountPercentage > 0 && (
                <span className="absolute left-4 top-4 rounded-full bg-[#8549e8] px-3 py-1.5 text-xs font-bold text-white">
                  {product.discountPercentage}% OFF
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Information */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8549e8]">
            {product.category ?? "Personalized Gift"}
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            {product.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex text-amber-400">
              ★★★★★
            </div>

            <span className="text-sm text-slate-500">
              4.8 · 512 reviews
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-3xl font-black text-[#8549e8]">
              ₹{product.finalPrice.toLocaleString("en-IN")}
            </span>

            {product.salePrice !== null && (
              <span className="text-lg text-slate-400 line-through">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
            )}

            {product.discountPercentage > 0 && (
              <span className="rounded-full bg-pink-100 px-3 py-1 text-sm font-bold text-pink-600">
                {product.discountPercentage}% OFF
              </span>
            )}
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Inclusive of all taxes
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {[
              "Premium Quality",
              "Fast Delivery",
              "Easy Support",
            ].map((item) => (
              <span
                key={item}
                className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700"
              >
                <Check size={14} className="text-[#8549e8]" />
                {item}
              </span>
            ))}
          </div>

          {/* Quantity */}
          <div className="mt-7">
            <p className="text-sm font-bold">Quantity</p>

            <div className="mt-3 inline-flex items-center overflow-hidden rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                className="flex h-11 w-11 items-center justify-center transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
              >
                <Minus size={17} />
              </button>

              <span className="flex h-11 min-w-12 items-center justify-center border-x border-slate-200 font-bold">
                {quantity}
              </span>

              <button
                type="button"
                onClick={increaseQuantity}
                disabled={
                  product.stock !== null &&
                  quantity >= product.stock
                }
                className="flex h-11 w-11 items-center justify-center transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
              >
                <Plus size={17} />
              </button>
            </div>

            {product.stock !== null && product.stock > 0 && (
              <span className="ml-3 text-xs text-slate-500">
                {product.stock} available
              </span>
            )}
          </div>

          {/* Total */}
          <div className="mt-7 flex items-center justify-between rounded-2xl bg-slate-50 p-4">
            <span className="text-sm font-semibold text-slate-600">
              Total price
            </span>

            <span className="text-2xl font-black text-[#8549e8]">
              ₹{totalPrice.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Buttons */}
          <div className="mt-5 grid gap-3">
            <Link
  href={getCustomizeUrl(product, {
    quantity,
    base: selectedBase,
    color: selectedColor,
  })}
  className={`rounded-xl bg-gradient-to-r from-[#8549e8] to-[#f36a47] px-5 py-4 text-center text-sm font-bold text-white transition hover:brightness-105 ${
    isOutOfStock
      ? "pointer-events-none opacity-50"
      : ""
  }`}
>
  {isOutOfStock
    ? "Out of Stock"
    : "Customize & Preview"}
</Link>

            {/* <button
              type="button"
              onClick={addToCart}
              disabled={isOutOfStock}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#8549e8] px-5 py-4 text-sm font-bold text-[#8549e8] transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
            >
              <ShoppingCart size={19} />

              Add to Cart
            </button> */}

            <FavoriteButton
  productId={product.id}
  initialIsFavorite={isFavorite}
  showText
  className="w-full justify-center rounded-xl py-3"
/>
          </div>
        </div>
      </div>
    </section>
  );
}