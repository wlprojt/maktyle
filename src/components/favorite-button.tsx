"use client";

import { Heart, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toggleFavorite } from "@/app/actions/favorites";

type FavoriteButtonProps = {
  productId: string;
  initialIsFavorite?: boolean;
  showText?: boolean;
  className?: string;
};

export default function FavoriteButton({
  productId,
  initialIsFavorite = false,
  showText = false,
  className = "",
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, startTransition] = useTransition();

  function handleFavorite() {
    startTransition(async () => {
      const result = await toggleFavorite(productId);

      if (result.success) {
        setIsFavorite(result.isFavorite);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleFavorite}
      disabled={isPending}
      aria-label={
        isFavorite ? "Remove from favorites" : "Add to favorites"
      }
      className={`inline-flex items-center justify-center gap-2 rounded-full border px-2 py-2 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
        isFavorite
          ? "border-pink-200 bg-pink-50 text-pink-600"
          : "border-slate-200 bg-white text-slate-700 hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600"
      } ${className}`}
    >
      {isPending ? (
        <Loader2 size={29} className="animate-spin" />
      ) : (
        <Heart
          size={29}
          fill={isFavorite ? "currentColor" : "none"}
        />
      )}

      {showText && (
        <span>{isFavorite ? "Favorited" : "Add to favorites"}</span>
      )}
    </button>
  );
}