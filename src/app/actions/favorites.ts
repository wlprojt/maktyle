"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FavoriteActionState = {
  success: boolean;
  isFavorite: boolean;
  message: string;
};

export async function toggleFavorite(
  productId: string,
): Promise<FavoriteActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?redirect=${encodeURIComponent(`/product/${productId}`)}`,
    );
  }

  const { data: existingFavorite, error: findError } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (findError) {
    console.error("Unable to check favorite:", findError);

    return {
      success: false,
      isFavorite: false,
      message: "Unable to update favorite.",
    };
  }

  if (existingFavorite) {
    const { error: deleteError } = await supabase
      .from("favorites")
      .delete()
      .eq("id", existingFavorite.id)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Unable to remove favorite:", deleteError);

      return {
        success: false,
        isFavorite: true,
        message: "Unable to remove favorite.",
      };
    }

    revalidatePath("/shop");
    revalidatePath("/dashboard/favorites");
    revalidatePath(`/product/${productId}`);

    return {
      success: true,
      isFavorite: false,
      message: "Removed from favorites.",
    };
  }

  const { error: insertError } = await supabase.from("favorites").insert({
    user_id: user.id,
    product_id: productId,
  });

  if (insertError) {
    console.error("Unable to add favorite:", insertError);

    return {
      success: false,
      isFavorite: false,
      message: "Unable to add favorite.",
    };
  }

  revalidatePath("/shop");
  revalidatePath("/dashboard/favorites");
  revalidatePath(`/product/${productId}`);

  return {
    success: true,
    isFavorite: true,
    message: "Added to favorites.",
  };
}

export async function removeFavorite(
  favoriteId: string,
): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/favorites");
  }

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("id", favoriteId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Unable to remove favorite:", error);
    throw new Error("Unable to remove favorite.");
  }

  revalidatePath("/dashboard/favorites");
  revalidatePath("/shop");
}