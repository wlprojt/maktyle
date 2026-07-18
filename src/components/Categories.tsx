"use client";

import Image from "next/image";
import { ChevronRight, GamepadDirectional} from "lucide-react";
import Link from "next/link";

const categories = [
  {
    title: "Photo Frames",
    image: "/fframe.png",
    link: "/shop?category=Photo%20Frame",
  },
  {
    title: "Custom Mugs",
    image: "/wmug.png",
    link: "/shop?category=Mug",
  },
  {
    title: "LED Lamps",
    image: "/dlamp.png",
    link: "/shop?category=Lamp",
  },
  {
    title: "Phone Cases",
    image: "/bcover.png",
    link: "/shop?category=Phone%20Case",
  },
  {
    title: "Pillow",
    image: "/pillow.png",
    link: "/shop?category=Pillow",
  },
  {
    title: "T-Shirts",
    image: "/ctshirt.png",
    link: "/shop?category=Tshirt",
  },
  {
    title: "Water Bottles",
    image: "/wbottle.png",
    link: "/shop?category=Bottle",
  },
  {
    title: "Keychain",
    image: "/kchain.png",
    link: "/shop?category=Keychain",
  },
];

export default function Categories() {
  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Heading */}
        <div className="mb-10 flex items-center justify-center gap-5">
          <GamepadDirectional
            size={14}
            className="fill-purple-600 text-purple-600"
          />

          <h2 className="text-sm font-extrabold uppercase tracking-wide text-gray-900 md:text-xl">
            Explore Our Categories
          </h2>

          <GamepadDirectional
            size={14}
            className="fill-purple-600 text-purple-600"
          />
        </div>

        {/* Categories */}
        <div className="relative">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {categories.map((item) => (
              <Link
                href={item.link}
                key={item.title}
                className="group cursor-pointer"
              >
                <div className="rounded-3xl border border-gray-100 bg-[#f8f5f5] p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative aspect-square">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-contain transition duration-300 group-hover:scale-110"
                    />
                  </div>
                </div>

                <h3 className="mt-3 text-center text-sm font-semibold text-gray-900">
                  {item.title}
                </h3>
              </Link>
            ))}
          </div>

          {/* Right Arrow */}
          {/* <button className="absolute -right-5 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-xl transition hover:scale-110 lg:flex">
            <ChevronRight size={22} />
          </button> */}
        </div>
      </div>
    </section>
  );
}