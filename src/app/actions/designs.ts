"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function deleteDesign(designId: string): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/designs");
  }

  const { data: design, error: designError } = await supabase
    .from("custom_designs")
    .select("*")
    .eq("id", designId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (designError) {
    console.error("Unable to find design:", {
      message: designError.message,
      details: designError.details,
      hint: designError.hint,
      code: designError.code,
    });

    throw new Error("Unable to delete this design.");
  }

  if (!design) {
    return;
  }

  /*
   * Deletes all files inside:
   * <user-id>/<design-id>/
   */
  const designFolder = `${user.id}/${designId}`;

  const { data: rootFiles, error: rootListError } =
    await supabase.storage
      .from("custom-designs")
      .list(designFolder, {
        limit: 100,
      });

  if (rootListError) {
    console.error("Unable to list design files:", {
      message: rootListError.message,
      name: rootListError.name,
    });
  }

  const filesToDelete: string[] = [];

  for (const item of rootFiles ?? []) {
    /*
     * Storage folders usually have a null metadata value.
     */
    if (item.metadata) {
      filesToDelete.push(`${designFolder}/${item.name}`);
      continue;
    }

    const nestedFolder = `${designFolder}/${item.name}`;

    const { data: nestedFiles, error: nestedError } =
      await supabase.storage
        .from("custom-designs")
        .list(nestedFolder, {
          limit: 100,
        });

    if (nestedError) {
      console.error("Unable to list nested design files:", {
        message: nestedError.message,
        name: nestedError.name,
      });

      continue;
    }

    for (const nestedItem of nestedFiles ?? []) {
      if (nestedItem.metadata) {
        filesToDelete.push(
          `${nestedFolder}/${nestedItem.name}`,
        );
      }
    }
  }

  if (filesToDelete.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("custom-designs")
      .remove(filesToDelete);

    if (storageError) {
      console.error("Unable to delete design files:", {
        message: storageError.message,
        name: storageError.name,
      });
    }
  }

  const { error: deleteError } = await supabase
    .from("custom_designs")
    .delete()
    .eq("id", designId)
    .eq("user_id", user.id);

  if (deleteError) {
    console.error("Unable to delete design:", {
      message: deleteError.message,
      details: deleteError.details,
      hint: deleteError.hint,
      code: deleteError.code,
    });

    throw new Error("Unable to delete this design.");
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/designs");
}