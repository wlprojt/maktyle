export type ProductCategory =
  | "Phone Case"
  | "Tshirt"
  | "Photo Frame"
  | "Mug"
  | "Lamp"
  | "Bottle"
  | "Pillow"
  | "Keychain";

export function getCustomizeUrl(
  product: {
    id: string;
    category: string | null;
  },
  options?: {
    quantity?: number;
    base?: string;
    color?: string;
  }
) {
  const category = product.category?.trim().toLowerCase();

  let path = `/customize/${product.id}`;

  switch (category) {
    case "phone case":
      path = `/customize/phone-case/${product.id}`;
      break;

    case "tshirt":
    case "t-shirt":
      path = `/customize/tshirt/${product.id}`;
      break;

    case "photo frame":
    case "frame":
      path = `/customize/photo-frame/${product.id}`;
      break;

    case "mug":
      path = `/customize/mug/${product.id}`;
      break;

    case "lamp":
      path = `/customize/lamp/${product.id}`;
      break;

    case "bottle":
      path = `/customize/bottle/${product.id}`;
      break;

    case "pillow":
      path = `/customize/pillow/${product.id}`;
      break;

    case "keychain":
      path = `/customize/keychain/${product.id}`;
      break;
  }

  const params = new URLSearchParams();

  if (options?.quantity)
    params.set("quantity", String(options.quantity));

  if (options?.base)
    params.set("base", options.base);

  if (options?.color)
    params.set("color", options.color);

  return params.toString()
    ? `${path}?${params.toString()}`
    : path;
}