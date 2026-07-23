"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type SettingsActionState = {
  success: boolean;
  message: string;
  errors?: {
    fullName?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
};

function validatePhone(value: string) {
  if (!value) {
    return true;
  }

  return /^[0-9+\-\s()]{7,20}$/.test(value);
}

function validatePostalCode(value: string) {
  return /^[0-9A-Za-z\-\s]{4,10}$/.test(value);
}

export async function updateProfile(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const fullName = String(formData.get("fullName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  const errors: SettingsActionState["errors"] = {};

  if (fullName.length < 2) {
    errors.fullName =
      "Your full name must contain at least 2 characters.";
  }

  if (fullName.length > 80) {
    errors.fullName =
      "Your full name cannot exceed 80 characters.";
  }

  if (!validatePhone(phone)) {
    errors.phone = "Enter a valid phone number.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      errors,
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Your session has expired. Please sign in again.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      name: fullName,
      phone,
    },
  });

  if (error) {
    console.error("Unable to update profile:", {
      message: error.message,
      status: error.status,
      code: error.code,
    });

    return {
      success: false,
      message: error.message || "Unable to update your profile.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");

  return {
    success: true,
    message: "Your profile has been updated successfully.",
  };
}

export async function updateAddress(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const addressLine1 = String(
    formData.get("addressLine1") || "",
  ).trim();

  const addressLine2 = String(
    formData.get("addressLine2") || "",
  ).trim();

  const city = String(formData.get("city") || "").trim();
  const state = String(formData.get("state") || "").trim();

  const postalCode = String(
    formData.get("postalCode") || "",
  ).trim();

  const country = String(formData.get("country") || "").trim();

  const errors: SettingsActionState["errors"] = {};

  if (addressLine1.length < 5) {
    errors.addressLine1 =
      "Enter a complete house, street or area address.";
  }

  if (addressLine1.length > 200) {
    errors.addressLine1 =
      "Address line 1 cannot exceed 200 characters.";
  }

  if (addressLine2.length > 150) {
    errors.addressLine2 =
      "Address line 2 cannot exceed 150 characters.";
  }

  if (city.length < 2) {
    errors.city = "Enter a valid city.";
  }

  if (state.length < 2) {
    errors.state = "Enter a valid state.";
  }

  if (!validatePostalCode(postalCode)) {
    errors.postalCode = "Enter a valid postal or PIN code.";
  }

  if (country.length < 2) {
    errors.country = "Enter a valid country.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Please correct the highlighted address fields.",
      errors,
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Your session has expired. Please sign in again.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      address_line_1: addressLine1,
      address_line_2: addressLine2,
      city,
      state,
      postal_code: postalCode,
      country,
    },
  });

  if (error) {
    console.error("Unable to update address:", {
      message: error.message,
      status: error.status,
      code: error.code,
    });

    return {
      success: false,
      message: error.message || "Unable to save your address.",
    };
  }

  revalidatePath("/dashboard/settings");

  return {
    success: true,
    message: "Your delivery address has been saved successfully.",
  };
}