"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlignCenter,
  ArrowDown,
  ArrowUp,
  Bold,
  ChevronLeft,
  Circle,
  Copy,
  Download,
  Eye,
  EyeOff,
  Heart,
  ImagePlus,
  Italic,
  Layers3,
  Lock,
  Minus,
  Move,
  Plus,
  Redo2,
  RotateCcw,
  Save,
  ShoppingCart,
  Sparkles,
  Square,
  Star,
  Trash2,
  Type,
  Undo2,
  Unlock,
  Upload,
} from "lucide-react";
import {
  ChangeEvent,
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { toPng } from "html-to-image";
import { createClient } from "@/lib/supabase/client";

type Product = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  price: number;
  finalPrice: number;
  stock: number | null;
  previewImage: string | null;
};

type BaseElement = {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  hidden: boolean;
  locked: boolean;
};

type ImageElement = BaseElement & {
  type: "image";
  src: string;
  fit: "contain" | "cover";
  flipX: boolean;
  flipY: boolean;
};

type TextElement = BaseElement & {
  type: "text";
  text: string;
  color: string;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  align: "left" | "center" | "right";
  letterSpacing: number;
  shadow: boolean;
};

type ShapeKind = "rectangle" | "circle" | "heart" | "star";

type ShapeElement = BaseElement & {
  type: "shape";
  shape: ShapeKind;
  fill: string;
  stroke: string;
  strokeWidth: number;
};

type StickerElement = BaseElement & {
  type: "sticker";
  emoji: string;
};

type DesignElement = ImageElement | TextElement | ShapeElement | StickerElement;

type CustomizerClientProps = {
  product: Product;
  initialQuantity?: number;
  initialBase?: string;
  initialColor?: string;
};

type DragState = {
  id: string;
  startPointerX: number;
  startPointerY: number;
  startX: number;
  startY: number;
};

type ResizeState = {
  id: string;
  startPointerX: number;
  startPointerY: number;
  startWidth: number;
  startHeight: number;
};

type FrameConfig = {
  id: string;
  name: string;
  price: number;
  thumbnailShape?: string;
  previewImage?: string | null;
  width: number;
  height: number;
  radius: number;
  printArea: {
    x: number;
    y: number;
    width: number;
    height: number;
    radius: number;
    clipPath?: string;
  };
};

const colors = [
  "#ffffff",
  "#111827",
  "#f36a47",
  "#8549e8",
  "#ef4444",
  "#f59e0b",
  "#22c55e",
  "#2563eb",
  "#ec4899",
];

const backgroundColors = [
  "#ffffff",
  "#f8fafc",
  "#fef3c7",
  "#fce7f3",
  "#ede9fe",
  "#dbeafe",
  "#dcfce7",
  "#111827",
];

const fonts = ["Arial", "Georgia", "Verdana", "Courier New", "Times New Roman"];
const stickers = ["❤️", "⭐", "🎂", "🎁", "🌸", "😊", "🎄", "✨", "🦋", "👑"];

function createId() {
  return crypto.randomUUID();
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, encodedData] = dataUrl.split(",");

  if (!header || !encodedData) {
    throw new Error("Invalid image data.");
  }

  const mimeType = header.match(/data:(.*?);base64/)?.[1] ?? "image/png";
  const binary = atob(encodedData);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mimeType });
}

function cloneElements(elements: DesignElement[]) {
  return elements.map((element) => ({ ...element }));
}

function normalizeCategory(category: string) {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getFrameOptions(
  category: string,
  productPreview: string | null,
): FrameConfig[] {
  const value = normalizeCategory(category);

  const option = (
    id: string,
    name: string,
    price: number,
    config: Omit<FrameConfig, "id" | "name" | "price" | "previewImage">,
  ): FrameConfig => ({
    id,
    name,
    price,
    previewImage: productPreview,
    ...config,
  });

  if (value.includes("phone") || value.includes("case")) {
    return [
      option("standard", "Standard", 0, {
        width: 320,
        height: 640,
        radius: 48,
        thumbnailShape: "rounded",
        printArea: { x: 18, y: 18, width: 284, height: 604, radius: 42 },
      }),
      option("clear", "Clear", 80, {
        width: 320,
        height: 640,
        radius: 48,
        thumbnailShape: "rounded",
        printArea: { x: 18, y: 18, width: 284, height: 604, radius: 42 },
      }),
      option("magsafe", "MagSafe", 150, {
        width: 320,
        height: 640,
        radius: 48,
        thumbnailShape: "rounded",
        printArea: { x: 18, y: 18, width: 284, height: 604, radius: 42 },
      }),
    ];
  }

  if (value.includes("tshirt") || value.includes("t-shirt")) {
    return [
      option("front", "Front", 0, {
        width: 520,
        height: 620,
        radius: 22,
        thumbnailShape: "shirt",
        printArea: { x: 110, y: 135, width: 300, height: 350, radius: 10 },
      }),
      option("back", "Back", 50, {
        width: 520,
        height: 620,
        radius: 22,
        thumbnailShape: "shirt",
        printArea: { x: 110, y: 120, width: 300, height: 370, radius: 10 },
      }),
      option("pocket", "Pocket", 30, {
        width: 520,
        height: 620,
        radius: 22,
        thumbnailShape: "shirt",
        printArea: { x: 285, y: 155, width: 115, height: 135, radius: 8 },
      }),
    ];
  }

  if (value.includes("mug")) {
    return [
      option("center", "Center", 0, {
        width: 620,
        height: 420,
        radius: 28,
        thumbnailShape: "mug",
        printArea: { x: 145, y: 105, width: 310, height: 205, radius: 18 },
      }),
      option("left", "Left Side", 0, {
        width: 620,
        height: 420,
        radius: 28,
        thumbnailShape: "mug",
        printArea: { x: 105, y: 105, width: 270, height: 205, radius: 18 },
      }),
      option("wrap", "Full Wrap", 100, {
        width: 620,
        height: 420,
        radius: 28,
        thumbnailShape: "mug",
        printArea: { x: 70, y: 90, width: 450, height: 235, radius: 24 },
      }),
    ];
  }

  if (value.includes("bottle")) {
    return [
      option("tall", "Tall", 0, {
        width: 360,
        height: 650,
        radius: 34,
        thumbnailShape: "bottle",
        printArea: { x: 84, y: 135, width: 192, height: 380, radius: 28 },
      }),
      option("wide", "Wide", 60, {
        width: 390,
        height: 620,
        radius: 38,
        thumbnailShape: "bottle",
        printArea: { x: 75, y: 145, width: 240, height: 330, radius: 30 },
      }),
    ];
  }

  if (value.includes("pillow")) {
    return [
      option("square", "Square", 0, {
        width: 560,
        height: 560,
        radius: 60,
        thumbnailShape: "square",
        printArea: { x: 45, y: 45, width: 470, height: 470, radius: 48 },
      }),
      option("heart", "Heart", 100, {
        width: 560,
        height: 560,
        radius: 20,
        thumbnailShape: "heart",
        printArea: {
          x: 55,
          y: 55,
          width: 450,
          height: 440,
          radius: 0,
          clipPath:
            "polygon(50% 92%, 8% 52%, 5% 30%, 16% 12%, 35% 8%, 50% 23%, 65% 8%, 84% 12%, 95% 30%, 92% 52%)",
        },
      }),
      option("round", "Round", 80, {
        width: 560,
        height: 560,
        radius: 280,
        thumbnailShape: "circle",
        printArea: {
          x: 45,
          y: 45,
          width: 470,
          height: 470,
          radius: 235,
          clipPath: "circle(50% at 50% 50%)",
        },
      }),
    ];
  }

  if (value.includes("keychain") || value.includes("key-chain")) {
    return [
      option("circle", "Circle", 0, {
        width: 460,
        height: 460,
        radius: 230,
        thumbnailShape: "circle",
        printArea: {
          x: 55,
          y: 55,
          width: 350,
          height: 350,
          radius: 175,
          clipPath: "circle(50% at 50% 50%)",
        },
      }),
      option("heart", "Heart", 40, {
        width: 460,
        height: 460,
        radius: 20,
        thumbnailShape: "heart",
        printArea: {
          x: 45,
          y: 50,
          width: 370,
          height: 340,
          radius: 0,
          clipPath:
            "polygon(50% 95%, 8% 55%, 4% 31%, 15% 10%, 35% 7%, 50% 22%, 65% 7%, 85% 10%, 96% 31%, 92% 55%)",
        },
      }),
      option("rectangle", "Rectangle", 30, {
        width: 500,
        height: 360,
        radius: 35,
        thumbnailShape: "rectangle",
        printArea: { x: 45, y: 45, width: 410, height: 270, radius: 28 },
      }),
    ];
  }

  if (value.includes("led") || value.includes("lamp")) {
    return [
      option("heart", "Heart", 0, {
        width: 500,
        height: 620,
        radius: 34,
        thumbnailShape: "heart",
        printArea: {
          x: 70,
          y: 45,
          width: 360,
          height: 430,
          radius: 0,
          clipPath:
            "polygon(50% 96%, 7% 55%, 4% 30%, 16% 9%, 35% 6%, 50% 22%, 65% 6%, 84% 9%, 96% 30%, 93% 55%)",
        },
      }),
      option("circle", "Circle", 50, {
        width: 500,
        height: 620,
        radius: 34,
        thumbnailShape: "circle",
        printArea: {
          x: 70,
          y: 45,
          width: 360,
          height: 420,
          radius: 180,
          clipPath: "circle(50% at 50% 50%)",
        },
      }),
      option("square", "Square", 50, {
        width: 500,
        height: 620,
        radius: 34,
        thumbnailShape: "square",
        printArea: { x: 72, y: 55, width: 356, height: 410, radius: 28 },
      }),
      option("hexagon", "Hexagon", 80, {
        width: 500,
        height: 620,
        radius: 34,
        thumbnailShape: "hexagon",
        printArea: {
          x: 75,
          y: 42,
          width: 350,
          height: 430,
          radius: 0,
          clipPath:
            "polygon(25% 4%, 75% 4%, 100% 50%, 75% 96%, 25% 96%, 0% 50%)",
        },
      }),
      option("star", "Star", 100, {
        width: 500,
        height: 620,
        radius: 34,
        thumbnailShape: "star",
        printArea: {
          x: 60,
          y: 35,
          width: 380,
          height: 450,
          radius: 0,
          clipPath:
            "polygon(50% 1%, 61% 35%, 98% 35%, 68% 57%, 79% 94%, 50% 72%, 21% 94%, 32% 57%, 2% 35%, 39% 35%)",
        },
      }),
      option("moon", "Moon", 120, {
        width: 500,
        height: 620,
        radius: 34,
        thumbnailShape: "moon",
        printArea: {
          x: 80,
          y: 35,
          width: 340,
          height: 450,
          radius: 170,
          clipPath:
            "polygon(72% 0%, 51% 12%, 38% 32%, 34% 54%, 42% 76%, 60% 92%, 82% 100%, 63% 96%, 43% 86%, 25% 68%, 15% 46%, 17% 25%, 33% 8%, 52% 1%)",
        },
      }),
      option("butterfly", "Butterfly", 140, {
        width: 520,
        height: 620,
        radius: 34,
        thumbnailShape: "butterfly",
        printArea: {
          x: 48,
          y: 70,
          width: 424,
          height: 390,
          radius: 0,
          clipPath:
            "polygon(50% 34%, 37% 8%, 8% 0%, 2% 28%, 20% 52%, 5% 82%, 35% 76%, 50% 98%, 65% 76%, 95% 82%, 80% 52%, 98% 28%, 92% 0%, 63% 8%)",
        },
      }),
      option("tree", "Tree", 150, {
        width: 500,
        height: 620,
        radius: 34,
        thumbnailShape: "tree",
        printArea: {
          x: 80,
          y: 30,
          width: 340,
          height: 460,
          radius: 0,
          clipPath:
            "polygon(50% 0%, 72% 30%, 61% 30%, 85% 62%, 68% 62%, 96% 92%, 58% 92%, 58% 100%, 42% 100%, 42% 92%, 4% 92%, 32% 62%, 15% 62%, 39% 30%, 28% 30%)",
        },
      }),
    ];
  }

  return [
    option("portrait", "Portrait", 0, {
      width: 520,
      height: 700,
      radius: 20,
      thumbnailShape: "portrait",
      printArea: { x: 55, y: 55, width: 410, height: 590, radius: 4 },
    }),
    option("landscape", "Landscape", 80, {
      width: 700,
      height: 520,
      radius: 20,
      thumbnailShape: "landscape",
      printArea: { x: 55, y: 55, width: 590, height: 410, radius: 4 },
    }),
    option("square", "Square", 50, {
      width: 580,
      height: 580,
      radius: 20,
      thumbnailShape: "square",
      printArea: { x: 55, y: 55, width: 470, height: 470, radius: 4 },
    }),
    option("circle", "Circle", 100, {
      width: 580,
      height: 580,
      radius: 290,
      thumbnailShape: "circle",
      printArea: {
        x: 55,
        y: 55,
        width: 470,
        height: 470,
        radius: 235,
        clipPath: "circle(50% at 50% 50%)",
      },
    }),
    option("heart", "Heart", 130, {
      width: 580,
      height: 580,
      radius: 20,
      thumbnailShape: "heart",
      printArea: {
        x: 55,
        y: 55,
        width: 470,
        height: 450,
        radius: 0,
        clipPath:
          "polygon(50% 95%, 8% 55%, 4% 31%, 15% 10%, 35% 7%, 50% 22%, 65% 7%, 85% 10%, 96% 31%, 92% 55%)",
      },
    }),
  ];
}
function shapeStyle(element: ShapeElement): CSSProperties {
  const base: CSSProperties = {
    width: "100%",
    height: "100%",
    background: element.fill,
    border: `${element.strokeWidth}px solid ${element.stroke}`,
  };

  if (element.shape === "circle") return { ...base, borderRadius: "50%" };
  if (element.shape === "heart") {
    return {
      ...base,
      border: "none",
      clipPath:
        "path('M50 91 C20 70 0 52 0 29 C0 12 13 0 29 0 C39 0 47 5 50 13 C53 5 61 0 71 0 C87 0 100 12 100 29 C100 52 80 70 50 91 Z')",
    };
  }
  if (element.shape === "star") {
    return {
      ...base,
      border: "none",
      clipPath:
        "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 92%, 50% 70%, 21% 92%, 32% 57%, 2% 35%, 39% 35%)",
    };
  }

  return { ...base, borderRadius: 12 };
}

export default function CustomizerClient({
  product,
  initialQuantity = 1,
  initialBase = "Standard",
  initialColor = "#ffffff",
}: CustomizerClientProps) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const resizeRef = useRef<ResizeState | null>(null);

  const frameOptions = useMemo(
    () => getFrameOptions(product.category, product.previewImage),
    [product.category, product.previewImage],
  );
  const [selectedFrameId, setSelectedFrameId] = useState(
    frameOptions.find(
      (item) => item.name.toLowerCase() === initialBase.toLowerCase(),
    )?.id ?? frameOptions[0].id,
  );
  const frame = useMemo(
    () =>
      frameOptions.find((item) => item.id === selectedFrameId) ??
      frameOptions[0],
    [frameOptions, selectedFrameId],
  );

  const [elements, setElements] = useState<DesignElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<DesignElement[][]>([]);
  const [future, setFuture] = useState<DesignElement[][]>([]);
  const [backgroundColor, setBackgroundColor] = useState(
    initialColor || "#ffffff",
  );
  const [quantity, setQuantity] = useState(Math.max(1, initialQuantity));
  const [zoom, setZoom] = useState(0.9);
  const [base, setBase] = useState(initialBase);
  const [mobilePanel, setMobilePanel] = useState<
    "add" | "layers" | "properties" | null
  >(null);
  const [addingToCart, setAddingToCart] = useState(false);

  const selectedElement = useMemo(
    () => elements.find((element) => element.id === selectedId) ?? null,
    [elements, selectedId],
  );

  const sortedElements = useMemo(
    () => [...elements].sort((a, b) => a.zIndex - b.zIndex),
    [elements],
  );

  const unitPrice = product.finalPrice + frame.price;
  const totalPrice = unitPrice * quantity;
  const isOutOfStock = product.stock !== null && product.stock <= 0;

  function saveHistorySnapshot() {
    setHistory((previous) => [...previous.slice(-29), cloneElements(elements)]);
    setFuture([]);
  }

  function updateElement(id: string, updates: Partial<DesignElement>) {
    setElements((previous) =>
      previous.map((element) =>
        element.id === id
          ? ({ ...element, ...updates } as DesignElement)
          : element,
      ),
    );
  }

  function nextZIndex() {
    return Math.max(0, ...elements.map((element) => element.zIndex)) + 1;
  }

  function addText() {
    saveHistorySnapshot();
    const element: TextElement = {
      id: createId(),
      type: "text",
      name: `Text ${elements.filter((item) => item.type === "text").length + 1}`,
      text: "Your Text",
      x: 40,
      y: 55,
      width: 190,
      height: 70,
      rotation: 0,
      opacity: 1,
      zIndex: nextZIndex(),
      hidden: false,
      locked: false,
      color: "#111827",
      fontSize: 30,
      fontFamily: "Arial",
      bold: true,
      italic: false,
      align: "center",
      letterSpacing: 0,
      shadow: false,
    };
    setElements((previous) => [...previous, element]);
    setSelectedId(element.id);
  }

  function addShape(shape: ShapeKind) {
    saveHistorySnapshot();
    const element: ShapeElement = {
      id: createId(),
      type: "shape",
      name: `${shape[0].toUpperCase()}${shape.slice(1)}`,
      shape,
      x: 70,
      y: 90,
      width: 130,
      height: 130,
      rotation: 0,
      opacity: 1,
      zIndex: nextZIndex(),
      hidden: false,
      locked: false,
      fill: "#8549e8",
      stroke: "#ffffff",
      strokeWidth: 0,
    };
    setElements((previous) => [...previous, element]);
    setSelectedId(element.id);
  }

  function addSticker(emoji: string) {
    saveHistorySnapshot();
    const element: StickerElement = {
      id: createId(),
      type: "sticker",
      name: `Sticker ${emoji}`,
      emoji,
      x: 85,
      y: 100,
      width: 100,
      height: 100,
      rotation: 0,
      opacity: 1,
      zIndex: nextZIndex(),
      hidden: false,
      locked: false,
    };
    setElements((previous) => [...previous, element]);
    setSelectedId(element.id);
  }

  async function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error(`Unable to read ${file.name}`));
        }
      };

      reader.onerror = () => {
        reject(reader.error ?? new Error(`Unable to read ${file.name}`));
      };

      reader.readAsDataURL(file);
    });
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target;

    const files = Array.from(input.files ?? []).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (!files.length) return;

    try {
      saveHistorySnapshot();

      const maxZ = nextZIndex();

      const newElements: ImageElement[] = await Promise.all(
        files.map(async (file, index) => ({
          id: createId(),
          type: "image" as const,
          name: file.name,
          src: await fileToDataUrl(file),

          x: 35 + index * 12,
          y: 35 + index * 12,
          width: 190,
          height: 190,

          rotation: 0,
          opacity: 1,
          zIndex: maxZ + index,

          hidden: false,
          locked: false,

          fit: "contain" as const,
          flipX: false,
          flipY: false,
        })),
      );

      setElements((previous) => [...previous, ...newElements]);

      setSelectedId(newElements.at(-1)?.id ?? null);
    } catch (error) {
      console.error("Image upload error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to read the selected image.",
      );
    } finally {
      input.value = "";
    }
  }

  function startDragging(
    event: ReactPointerEvent<HTMLDivElement>,
    element: DesignElement,
  ) {
    if (element.locked) return;
    event.preventDefault();
    event.stopPropagation();
    saveHistorySnapshot();
    setSelectedId(element.id);
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      id: element.id,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startX: element.x,
      startY: element.y,
    };
  }

  function startResizing(
    event: ReactPointerEvent<HTMLButtonElement>,
    element: DesignElement,
  ) {
    if (element.locked) return;
    event.preventDefault();
    event.stopPropagation();
    saveHistorySnapshot();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeRef.current = {
      id: element.id,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startWidth: element.width,
      startHeight: element.height,
    };
  }

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (dragRef.current) {
        const drag = dragRef.current;
        const current = elements.find((item) => item.id === drag.id);
        if (!current) return;
        const deltaX = (event.clientX - drag.startPointerX) / zoom;
        const deltaY = (event.clientY - drag.startPointerY) / zoom;
        updateElement(drag.id, {
          x: Math.max(
            0,
            Math.min(
              frame.printArea.width - current.width,
              drag.startX + deltaX,
            ),
          ),
          y: Math.max(
            0,
            Math.min(
              frame.printArea.height - current.height,
              drag.startY + deltaY,
            ),
          ),
        });
      }

      if (resizeRef.current) {
        const resize = resizeRef.current;
        const current = elements.find((item) => item.id === resize.id);
        if (!current) return;
        const deltaX = (event.clientX - resize.startPointerX) / zoom;
        const deltaY = (event.clientY - resize.startPointerY) / zoom;
        updateElement(resize.id, {
          width: Math.max(
            45,
            Math.min(
              frame.printArea.width - current.x,
              resize.startWidth + deltaX,
            ),
          ),
          height: Math.max(
            40,
            Math.min(
              frame.printArea.height - current.y,
              resize.startHeight + deltaY,
            ),
          ),
        });
      }
    },
    [elements, frame.printArea.height, frame.printArea.width, zoom],
  );

  function stopPointerAction() {
    dragRef.current = null;
    resizeRef.current = null;
  }

  function deleteSelected() {
    if (!selectedId) return;
    saveHistorySnapshot();
    setElements((previous) =>
      previous.filter((element) => element.id !== selectedId),
    );
    setSelectedId(null);
  }

  function duplicateSelected() {
    if (!selectedElement) return;
    saveHistorySnapshot();
    const duplicated = {
      ...selectedElement,
      id: createId(),
      name: `${selectedElement.name} copy`,
      x: Math.min(
        selectedElement.x + 15,
        frame.printArea.width - selectedElement.width,
      ),
      y: Math.min(
        selectedElement.y + 15,
        frame.printArea.height - selectedElement.height,
      ),
      zIndex: nextZIndex(),
    } as DesignElement;
    setElements((previous) => [...previous, duplicated]);
    setSelectedId(duplicated.id);
  }

  function moveLayer(direction: "up" | "down") {
    if (!selectedElement) return;
    const ordered = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const index = ordered.findIndex(
      (element) => element.id === selectedElement.id,
    );
    const targetIndex = direction === "up" ? index + 1 : index - 1;
    if (targetIndex < 0 || targetIndex >= ordered.length) return;
    saveHistorySnapshot();
    const target = ordered[targetIndex];
    setElements((previous) =>
      previous.map((element) => {
        if (element.id === selectedElement.id)
          return { ...element, zIndex: target.zIndex };
        if (element.id === target.id)
          return { ...element, zIndex: selectedElement.zIndex };
        return element;
      }),
    );
  }

  function undo() {
    const previousState = history.at(-1);
    if (!previousState) return;
    setFuture((current) => [cloneElements(elements), ...current]);
    setElements(cloneElements(previousState));
    setHistory((current) => current.slice(0, -1));
    setSelectedId(null);
  }

  function redo() {
    const nextState = future[0];
    if (!nextState) return;
    setHistory((current) => [...current, cloneElements(elements)]);
    setElements(cloneElements(nextState));
    setFuture((current) => current.slice(1));
    setSelectedId(null);
  }

  function resetDesign() {
    saveHistorySnapshot();
    setElements([]);
    setSelectedId(null);
    setBackgroundColor(initialColor || "#ffffff");
    setZoom(0.9);
  }

  function saveDesign() {
    localStorage.setItem(
      `maktyle-design-${product.id}`,
      JSON.stringify({
        productId: product.id,
        category: product.category,
        base: frame.name,
        selectedFrameId: frame.id,
        framePrice: frame.price,
        backgroundColor,
        quantity,
        frame,
        elements: elements.map((element) =>
          element.type === "image" && element.src.startsWith("blob:")
            ? { ...element, src: null }
            : element,
        ),
      }),
    );
    alert("Design saved successfully.");
  }

  async function exportDesign() {
    if (!canvasRef.current) return;

    const currentSelection = selectedId;
    setSelectedId(null);

    try {
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );

      const dataUrl = await toPng(canvasRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        skipFonts: true,
        imagePlaceholder:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X4t8AAAAASUVORK5CYII=",
      });

      const link = document.createElement("a");
      link.download = `${product.title}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Export failed");
    } finally {
      setSelectedId(currentSelection);
    }
  }

  async function uploadDesignImages({
    userId,
    designId,
  }: {
    userId: string;
    designId: string;
  }): Promise<DesignElement[]> {
    const supabase = createClient();

    return Promise.all(
      elements.map(async (element, index) => {
        if (element.type !== "image" || !element.src) {
          return element;
        }

        if (
          element.src.startsWith("https://") ||
          element.src.startsWith("http://")
        ) {
          return element;
        }

        let imageBlob: Blob;

        if (element.src.startsWith("data:")) {
          imageBlob = dataUrlToBlob(element.src);
        } else if (element.src.startsWith("blob:")) {
          const response = await fetch(element.src);

          if (!response.ok) {
            throw new Error(`Unable to read ${element.name}.`);
          }

          imageBlob = await response.blob();
        } else {
          return element;
        }

        const rawExtension = imageBlob.type.split("/")[1] ?? "png";
        const extension = rawExtension === "jpeg" ? "jpg" : rawExtension;
        const storagePath = `${userId}/${designId}/images/${index}-${createId()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("custom-designs")
          .upload(storagePath, imageBlob, {
            contentType: imageBlob.type,
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from("custom-designs")
          .getPublicUrl(storagePath);

        return {
          ...element,
          src: publicUrlData.publicUrl,
        };
      }),
    );
  }

  async function createAndUploadPreview({
    userId,
    designId,
  }: {
    userId: string;
    designId: string;
  }): Promise<string> {
    if (!canvasRef.current) {
      throw new Error("Design canvas not found.");
    }

    const previousSelection = selectedId;
    setSelectedId(null);

    try {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });

      const dataUrl = await toPng(canvasRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        skipFonts: true,
        imagePlaceholder:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X4t8AAAAASUVORK5CYII=",
        filter: (node) => {
          if (!(node instanceof HTMLElement)) return true;
          return node.dataset.exportIgnore !== "true";
        },
      });

      const previewBlob = dataUrlToBlob(dataUrl);
      const storagePath = `${userId}/${designId}/preview.png`;
      const supabase = createClient();

      const { error: uploadError } = await supabase.storage
        .from("custom-designs")
        .upload(storagePath, previewBlob, {
          contentType: "image/png",
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Preview upload failed: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from("custom-designs")
        .getPublicUrl(storagePath);

      return `${publicUrlData.publicUrl}?v=${Date.now()}`;
    } finally {
      setSelectedId(previousSelection);
    }
  }

  async function addToCart() {
    if (addingToCart || isOutOfStock) return;

    setAddingToCart(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!user) {
        const redirectPath = `${window.location.pathname}${window.location.search}`;
        window.location.href = `/login?redirect=${encodeURIComponent(redirectPath)}`;
        return;
      }

      const designId = createId();

      const uploadedElements = await uploadDesignImages({
        userId: user.id,
        designId,
      });

      const previewUrl = await createAndUploadPreview({
        userId: user.id,
        designId,
      });

      const { data: savedDesign, error: designError } = await supabase
        .from("custom_designs")
        .insert({
          id: designId,
          user_id: user.id,
          product_id: product.id,
          product_title: product.title,
          product_category: product.category,
          product_image_url: product.previewImage,
          frame_id: frame.id,
          frame_name: frame.name,
          frame_price: frame.price,
          frame_config: frame,
          background_color: backgroundColor,
          design_elements: uploadedElements,
          preview_url: previewUrl,
          quantity,
          unit_price: unitPrice,
          total_price: totalPrice,
        })
        .select("id")
        .single();

      if (designError) {
        throw new Error(`Design save failed: ${designError.message}`);
      }

      const { error: cartError } = await supabase.from("cart_items").insert({
        user_id: user.id,
        design_id: savedDesign.id,
        product_id: product.id,
        quantity,
        unit_price: unitPrice,
      });

      if (cartError) {
        throw new Error(`Cart save failed: ${cartError.message}`);
      }

      window.dispatchEvent(new Event("maktyle-cart-updated"));
      window.location.href = "/cart";
    } catch (error) {
      console.error("Add to cart error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Unable to add the customized product to cart.",
      );
    } finally {
      setAddingToCart(false);
    }
  }

  const renderLayerIcon = (element: DesignElement) => {
    if (element.type === "image") return <ImagePlus size={16} />;
    if (element.type === "text") return <Type size={16} />;
    if (element.type === "shape") return <Square size={16} />;
    return <Sparkles size={16} />;
  };

  const addPanel = (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="tool-button"
        >
          <Upload size={18} /> Upload images
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <button type="button" onClick={addText} className="tool-button">
          <Type size={18} /> Add text
        </button>
      </div>

      <div>
        <p className="panel-title">Shapes</p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          <button onClick={() => addShape("rectangle")} className="icon-button">
            <Square size={18} />
          </button>
          <button onClick={() => addShape("circle")} className="icon-button">
            <Circle size={18} />
          </button>
          <button onClick={() => addShape("heart")} className="icon-button">
            <Heart size={18} />
          </button>
          <button onClick={() => addShape("star")} className="icon-button">
            <Star size={18} />
          </button>
        </div>
      </div>

      <div>
        <p className="panel-title">Stickers</p>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {stickers.map((emoji) => (
            <button
              key={emoji}
              onClick={() => addSticker(emoji)}
              className="h-10 rounded-xl border border-slate-200 text-xl hover:bg-purple-50"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="panel-title">Background</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {backgroundColors.map((color) => (
            <button
              key={color}
              onClick={() => setBackgroundColor(color)}
              className={`h-9 w-9 rounded-full border-2 ${backgroundColor === color ? "border-[#8549e8] ring-2 ring-purple-200" : "border-slate-200"}`}
              style={{ backgroundColor: color }}
            />
          ))}
          <label className="relative h-9 w-9 cursor-pointer overflow-hidden rounded-full border-2 border-slate-200">
            <input
              type="color"
              value={backgroundColor}
              onChange={(event) => setBackgroundColor(event.target.value)}
              className="absolute -left-2 -top-2 h-14 w-14"
            />
          </label>
        </div>
      </div>
    </div>
  );

  const layersPanel = (
    <div>
      <p className="panel-title flex items-center gap-2">
        <Layers3 size={15} /> Layers
      </p>
      <div className="mt-3 max-h-[420px] space-y-2 overflow-y-auto">
        {[...sortedElements].reverse().map((element) => (
          <button
            key={element.id}
            type="button"
            onClick={() => setSelectedId(element.id)}
            className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${selectedId === element.id ? "border-[#8549e8] bg-purple-50" : "border-slate-200"}`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
              {renderLayerIcon(element)}
            </span>
            <span className="min-w-0 flex-1 truncate text-xs font-bold">
              {element.name}
            </span>
            {element.locked && <Lock size={13} />}
            {element.hidden && <EyeOff size={13} />}
          </button>
        ))}
        {!elements.length && (
          <p className="rounded-xl border border-dashed p-4 text-center text-xs text-slate-400">
            Add an image, text, shape, or sticker.
          </p>
        )}
      </div>
    </div>
  );

  const propertiesPanel = selectedElement ? (
    <div className="space-y-5">
      <div>
        <label className="field-label">Layer name</label>
        <input
          value={selectedElement.name}
          onChange={(e) =>
            updateElement(selectedElement.id, { name: e.target.value })
          }
          className="field-input"
        />
      </div>

      {selectedElement.type === "text" && (
        <>
          <div>
            <label className="field-label">Text</label>
            <textarea
              rows={3}
              value={selectedElement.text}
              onChange={(e) =>
                updateElement(selectedElement.id, { text: e.target.value })
              }
              className="field-input resize-none"
            />
          </div>
          <div>
            <label className="field-label">Font</label>
            <select
              value={selectedElement.fontFamily}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  fontFamily: e.target.value,
                })
              }
              className="field-input"
            >
              {fonts.map((font) => (
                <option key={font}>{font}</option>
              ))}
            </select>
          </div>
          <Range
            label="Font size"
            value={selectedElement.fontSize}
            min={12}
            max={110}
            onChange={(value) =>
              updateElement(selectedElement.id, { fontSize: value })
            }
          />
          <Range
            label="Letter spacing"
            value={selectedElement.letterSpacing}
            min={-2}
            max={20}
            onChange={(value) =>
              updateElement(selectedElement.id, { letterSpacing: value })
            }
          />
          <ColorField
            label="Text color"
            value={selectedElement.color}
            onChange={(color) => updateElement(selectedElement.id, { color })}
          />
          <div className="grid grid-cols-3 gap-2">
            <Toggle
              active={selectedElement.bold}
              onClick={() =>
                updateElement(selectedElement.id, {
                  bold: !selectedElement.bold,
                })
              }
            >
              <Bold size={17} />
            </Toggle>
            <Toggle
              active={selectedElement.italic}
              onClick={() =>
                updateElement(selectedElement.id, {
                  italic: !selectedElement.italic,
                })
              }
            >
              <Italic size={17} />
            </Toggle>
            <Toggle
              active={selectedElement.shadow}
              onClick={() =>
                updateElement(selectedElement.id, {
                  shadow: !selectedElement.shadow,
                })
              }
            >
              <Sparkles size={17} />
            </Toggle>
          </div>
        </>
      )}

      {selectedElement.type === "image" && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() =>
                updateElement(selectedElement.id, {
                  fit: selectedElement.fit === "contain" ? "cover" : "contain",
                })
              }
              className="tool-button"
            >
              {selectedElement.fit === "contain" ? "Fill" : "Fit"}
            </button>
            <button
              onClick={() =>
                updateElement(selectedElement.id, {
                  flipX: !selectedElement.flipX,
                })
              }
              className="tool-button"
            >
              Flip X
            </button>
            <button
              onClick={() =>
                updateElement(selectedElement.id, {
                  flipY: !selectedElement.flipY,
                })
              }
              className="tool-button"
            >
              Flip Y
            </button>
          </div>
        </>
      )}

      {selectedElement.type === "shape" && (
        <>
          <ColorField
            label="Fill"
            value={selectedElement.fill}
            onChange={(fill) => updateElement(selectedElement.id, { fill })}
          />
          <ColorField
            label="Border"
            value={selectedElement.stroke}
            onChange={(stroke) => updateElement(selectedElement.id, { stroke })}
          />
          <Range
            label="Border width"
            value={selectedElement.strokeWidth}
            min={0}
            max={15}
            onChange={(value) =>
              updateElement(selectedElement.id, { strokeWidth: value })
            }
          />
        </>
      )}

      <Range
        label="Rotation"
        suffix="°"
        value={selectedElement.rotation}
        min={-180}
        max={180}
        onChange={(value) =>
          updateElement(selectedElement.id, { rotation: value })
        }
      />
      <Range
        label="Opacity"
        suffix="%"
        value={Math.round(selectedElement.opacity * 100)}
        min={10}
        max={100}
        onChange={(value) =>
          updateElement(selectedElement.id, { opacity: value / 100 })
        }
      />

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() =>
            updateElement(selectedElement.id, {
              locked: !selectedElement.locked,
            })
          }
          className="tool-button"
        >
          {selectedElement.locked ? <Unlock size={15} /> : <Lock size={15} />}
          {selectedElement.locked ? "Unlock" : "Lock"}
        </button>
        <button
          onClick={() =>
            updateElement(selectedElement.id, {
              hidden: !selectedElement.hidden,
            })
          }
          className="tool-button"
        >
          {selectedElement.hidden ? <Eye size={15} /> : <EyeOff size={15} />}
          {selectedElement.hidden ? "Show" : "Hide"}
        </button>
      </div>
    </div>
  ) : (
    <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
      <Layers3 size={32} className="mx-auto text-slate-300" />
      <p className="mt-3 text-sm font-bold">Select an element</p>
      <p className="mt-1 text-xs text-slate-500">
        Select a layer to edit its properties.
      </p>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <style jsx global>{`
        .tool-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 0.7rem 0.8rem;
          font-size: 0.75rem;
          font-weight: 700;
          background: white;
        }
        .tool-button:hover {
          background: #faf5ff;
          border-color: #8549e8;
        }
        .icon-button {
          display: flex;
          height: 2.5rem;
          align-items: center;
          justify-content: center;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
        }
        .panel-title {
          font-size: 0.7rem;
          line-height: 1rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #64748b;
        }
        .field-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #475569;
        }
        .field-input {
          margin-top: 0.5rem;
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 0.65rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .field-input:focus {
          border-color: #8549e8;
        }
      `}</style>

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="flex min-h-16 items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href={`/product/${product.id}`}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200"
            >
              <ChevronLeft size={20} />
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-black sm:text-base">
                {product.title}
              </h1>
              <p className="truncate text-xs text-slate-500">
                {product.category} · {frame.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={saveDesign}
              className="hidden rounded-xl border px-4 py-2 text-sm font-bold sm:flex"
            >
              <Save size={17} className="mr-2" />
              Save
            </button>
            <button
              type="button"
              onClick={addToCart}
              disabled={isOutOfStock || addingToCart}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8549e8] to-[#f36a47] px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart size={17} />
              <span className="hidden sm:inline">
                ₹{totalPrice.toLocaleString("en-IN")}
              </span>
              {addingToCart ? "Saving..." : "Add"}
            </button>
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-65px)] lg:grid-cols-[260px_minmax(0,1fr)_300px]">
        <aside className="hidden border-r border-slate-200 bg-white p-4 lg:block">
          {addPanel}
          <div className="mt-6">{layersPanel}</div>
        </aside>

        <section className="relative flex min-h-[650px] flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-3 sm:px-4">
            <div className="flex items-center gap-2">
              <button
                onClick={undo}
                disabled={!history.length}
                className="icon-button w-9 disabled:opacity-30"
              >
                <Undo2 size={17} />
              </button>
              <button
                onClick={redo}
                disabled={!future.length}
                className="icon-button w-9 disabled:opacity-30"
              >
                <Redo2 size={17} />
              </button>
              <button onClick={resetDesign} className="tool-button">
                <RotateCcw size={15} />
                Reset
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom((value) => Math.max(0.45, value - 0.1))}
                className="icon-button w-9"
              >
                <Minus size={16} />
              </button>
              <span className="min-w-12 text-center text-xs font-bold">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((value) => Math.min(1.4, value + 0.1))}
                className="icon-button w-9"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="border-b border-slate-200 bg-white px-3 py-3 sm:px-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="panel-title">Choose frame shape</p>
              <span className="text-xs font-bold text-[#8549e8]">
                {frame.name}
                {frame.price > 0 ? ` · +₹${frame.price}` : ""}
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {frameOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setSelectedFrameId(option.id);
                    setBase(option.name);
                    setSelectedId(null);
                  }}
                  className={`min-w-[92px] rounded-2xl border-2 p-2 text-center transition ${
                    frame.id === option.id
                      ? "border-[#8549e8] bg-purple-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-purple-300"
                  }`}
                >
                  <FrameThumbnail frame={option} />
                  <p className="mt-2 truncate text-[11px] font-black">
                    {option.name}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {option.price > 0 ? `+₹${option.price}` : "Included"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div
            className="flex flex-1 items-center justify-center overflow-auto p-5 sm:p-10"
            onPointerMove={handlePointerMove}
            onPointerUp={stopPointerAction}
            onPointerCancel={stopPointerAction}
            onClick={() => setSelectedId(null)}
          >
            <div
              style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
              className="transition-transform"
            >
              <div className="rounded-[36px] bg-white p-5 shadow-2xl">
                <div
                  ref={canvasRef}
                  className="relative overflow-hidden bg-white"
                  style={{
                    width: frame.width,
                    height: frame.height,
                    borderRadius: frame.radius,
                  }}
                >
                  <div
                    className="absolute z-20 overflow-hidden"
                    style={{
                      left: frame.printArea.x,
                      top: frame.printArea.y,
                      width: frame.printArea.width,
                      height: frame.printArea.height,
                      borderRadius: frame.printArea.radius,
                      clipPath: frame.printArea.clipPath,
                      backgroundColor,
                    }}
                  >
                    {sortedElements.map((element) => {
                      if (element.hidden) return null;
                      const isSelected = selectedId === element.id;
                      return (
                        <div
                          key={element.id}
                          onPointerDown={(event) =>
                            startDragging(event, element)
                          }
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedId(element.id);
                          }}
                          className={`absolute touch-none ${element.locked ? "cursor-default" : "cursor-move"} ${isSelected ? "outline outline-2 outline-[#8549e8]" : ""}`}
                          style={{
                            left: element.x,
                            top: element.y,
                            width: element.width,
                            height: element.height,
                            transform: `rotate(${element.rotation}deg)`,
                            opacity: element.opacity,
                            zIndex: element.zIndex,
                          }}
                        >
                          {element.type === "image" && (
                            <Image
                              src={element.src}
                              alt={element.name}
                              fill
                              unoptimized
                              draggable={false}
                              className="pointer-events-none select-none"
                              style={{
                                objectFit: element.fit,
                                transform: `scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})`,
                              }}
                            />
                          )}
                          {element.type === "text" && (
                            <div
                              className="flex h-full w-full items-center whitespace-pre-wrap break-words"
                              style={{
                                color: element.color,
                                fontSize: element.fontSize,
                                fontFamily: element.fontFamily,
                                fontWeight: element.bold ? 700 : 400,
                                fontStyle: element.italic ? "italic" : "normal",
                                textAlign: element.align,
                                justifyContent:
                                  element.align === "left"
                                    ? "flex-start"
                                    : element.align === "right"
                                      ? "flex-end"
                                      : "center",
                                letterSpacing: element.letterSpacing,
                                textShadow: element.shadow
                                  ? "0 3px 8px rgba(0,0,0,.35)"
                                  : "none",
                              }}
                            >
                              {element.text}
                            </div>
                          )}
                          {element.type === "shape" && (
                            <div style={shapeStyle(element)} />
                          )}
                          {element.type === "sticker" && (
                            <div
                              className="flex h-full w-full items-center justify-center leading-none"
                              style={{
                                fontSize:
                                  Math.min(element.width, element.height) *
                                  0.82,
                              }}
                            >
                              {element.emoji}
                            </div>
                          )}

                          {isSelected && !element.locked && (
                            <>
                              <span className="pointer-events-none absolute -left-3 -top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#8549e8] text-white shadow">
                                <Move size={13} />
                              </span>
                              <button
                                type="button"
                                onPointerDown={(event) =>
                                  startResizing(event, element)
                                }
                                className="absolute -bottom-3 -right-3 h-7 w-7 cursor-nwse-resize rounded-full border-2 border-white bg-[#8549e8] shadow"
                              />
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {frame.previewImage && (
                    <Image
                      src={frame.previewImage}
                      alt={product.title}
                      fill
                      priority
                      sizes={`${frame.width}px`}
                      className="pointer-events-none absolute inset-0 z-10 select-none object-contain"
                    />
                  )}
                  {!frame.previewImage && (
                    <div
                      className="pointer-events-none absolute inset-0 z-10 border-[12px] border-slate-800/90"
                      style={{ borderRadius: frame.radius }}
                    />
                  )}
                  <div
                    data-export-ignore="true"
                    className="pointer-events-none absolute z-30 border-2 border-dashed border-purple-400/70"
                    style={{
                      left: frame.printArea.x,
                      top: frame.printArea.y,
                      width: frame.printArea.width,
                      height: frame.printArea.height,
                      borderRadius: frame.printArea.radius,
                      clipPath: frame.printArea.clipPath,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-200 bg-white p-3 pb-20 lg:pb-3">
            <button
              onClick={duplicateSelected}
              disabled={!selectedElement}
              className="tool-button disabled:opacity-30"
            >
              <Copy size={15} />
              Duplicate
            </button>
            <button
              onClick={() => moveLayer("up")}
              disabled={!selectedElement}
              className="tool-button disabled:opacity-30"
            >
              <ArrowUp size={15} />
              Forward
            </button>
            <button
              onClick={() => moveLayer("down")}
              disabled={!selectedElement}
              className="tool-button disabled:opacity-30"
            >
              <ArrowDown size={15} />
              Backward
            </button>
            <button
              onClick={deleteSelected}
              disabled={!selectedElement}
              className="tool-button border-red-200 text-red-500 disabled:opacity-30"
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        </section>

        <aside className="hidden border-l border-slate-200 bg-white p-4 lg:block">
          <p className="panel-title">Properties</p>
          <div className="mt-4">{propertiesPanel}</div>
          <div className="mt-6 border-t pt-5">
            <label className="field-label">Selected frame</label>
            <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold">
              <div className="flex items-center justify-between">
                <span>{frame.name}</span>
                <span className="text-[#8549e8]">
                  {frame.price > 0 ? `+₹${frame.price}` : "Included"}
                </span>
              </div>
            </div>
            <Quantity
              value={quantity}
              stock={product.stock}
              onChange={setQuantity}
            />
            <div className="mt-4 rounded-2xl bg-purple-50 p-4 text-sm">
              <div className="flex justify-between">
                <span>
                  ₹{unitPrice.toLocaleString("en-IN")} × {quantity}
                </span>
                <strong className="text-[#8549e8]">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </strong>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={saveDesign}
                className="tool-button text-[#8549e8]"
              >
                <Save size={15} />
                Save
              </button>
              <button onClick={exportDesign} className="tool-button">
                <Download size={15} />
                Export
              </button>
            </div>
          </div>
        </aside>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-3 border-t border-slate-200 bg-white p-2 lg:hidden">
        <button
          onClick={() => setMobilePanel("add")}
          className="flex flex-col items-center gap-1 py-1 text-xs font-bold"
        >
          <Plus size={20} />
          Add
        </button>
        <button
          onClick={() => setMobilePanel("layers")}
          className="flex flex-col items-center gap-1 py-1 text-xs font-bold"
        >
          <Layers3 size={20} />
          Layers
        </button>
        <button
          onClick={() => setMobilePanel("properties")}
          className="flex flex-col items-center gap-1 py-1 text-xs font-bold"
        >
          <Sparkles size={20} />
          Edit
        </button>
      </nav>

      {mobilePanel && (
        <div
          className="fixed inset-0 z-[60] bg-black/35 lg:hidden"
          onClick={() => setMobilePanel(null)}
        >
          <div
            className="absolute inset-x-0 bottom-0 max-h-[72vh] overflow-y-auto rounded-t-3xl bg-white p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-300" />
            {mobilePanel === "add" && addPanel}
            {mobilePanel === "layers" && layersPanel}
            {mobilePanel === "properties" && propertiesPanel}
            <button
              onClick={() => setMobilePanel(null)}
              className="mt-5 w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function FrameThumbnail({ frame }: { frame: FrameConfig }) {
  const clip = frame.printArea.clipPath;
  const ratio = frame.width / frame.height;
  const width = ratio >= 1 ? 58 : Math.max(34, 58 * ratio);
  const height = ratio >= 1 ? Math.max(34, 58 / ratio) : 58;

  return (
    <div className="flex h-16 items-center justify-center rounded-xl bg-slate-100">
      <div
        className="border-[3px] border-slate-700 bg-gradient-to-br from-purple-100 to-orange-100 shadow-sm"
        style={{
          width,
          height,
          borderRadius:
            frame.printArea.radius > frame.printArea.width / 3
              ? "50%"
              : Math.min(12, frame.printArea.radius / 4),
          clipPath: clip,
        }}
      />
    </div>
  );
}

function Range({
  label,
  value,
  min,
  max,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs font-bold text-slate-600">
        <span>{label}</span>
        <span>
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 w-full accent-[#8549e8]"
      />
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="mt-2 flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={`h-8 w-8 rounded-full border-2 ${value === color ? "border-[#8549e8] ring-2 ring-purple-200" : "border-slate-200"}`}
            style={{ backgroundColor: color }}
          />
        ))}
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 w-8 rounded-full"
        />
      </div>
    </div>
  );
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-10 items-center justify-center rounded-xl border ${active ? "border-[#8549e8] bg-purple-50 text-[#8549e8]" : "border-slate-200"}`}
    >
      {children}
    </button>
  );
}

function Quantity({
  value,
  stock,
  onChange,
}: {
  value: number;
  stock: number | null;
  onChange: (value: number) => void;
}) {
  return (
    <div className="mt-5 flex items-center justify-between">
      <span className="text-sm font-bold">Quantity</span>
      <div className="flex overflow-hidden rounded-xl border border-slate-200">
        <button
          onClick={() => onChange(Math.max(1, value - 1))}
          className="flex h-10 w-10 items-center justify-center"
        >
          <Minus size={15} />
        </button>
        <span className="flex h-10 w-10 items-center justify-center border-x text-sm font-bold">
          {value}
        </span>
        <button
          onClick={() =>
            onChange(stock !== null ? Math.min(stock, value + 1) : value + 1)
          }
          className="flex h-10 w-10 items-center justify-center"
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}