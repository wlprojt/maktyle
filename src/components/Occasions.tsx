"use client";

import Image from "next/image";
import { LayoutDashboard, GamepadDirectional } from "lucide-react";
import Link from "next/link";

const occasions = [
  { title: "Birthday", image: "/happy.jpg" },
  { title: "Anniversary", image: "/anvicery.jpg" },
  { title: "Wedding", image: "/wading.jpg"},
  { title: "Valentine's Day", image: "/valentine.jpg" },
  { title: "Corporate Gifts", image: "/office.jpg" },
  { title: "Festivals", image: "/pooja.jpg" },
];

export default function Occasions() {
  return (
    <section className="bg-white px-5 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-center gap-5">
          <GamepadDirectional size={14} className="fill-purple-600 text-purple-600" />
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-gray-900 md:text-xl">
            Gifts For Every Occasion
          </h2>
          <GamepadDirectional size={14} className="fill-purple-600 text-purple-600" />
        </div>

        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
          {occasions.map((item) => (
            <div key={item.title} className="group cursor-pointer">
              <div className="relative aspect-[1.15/1] overflow-hidden rounded-2xl bg-gray-100">
                <Link href={"/shop"}>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-110"
                />
                </Link>
              </div>

              <Link href={"/shop"}>
              <h3 className="mt-4 text-center text-sm font-extrabold text-gray-900">
                {item.title}
              </h3>
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link href={"/search"}>
          <button className="flex items-center gap-4 rounded-full border border-gray-200 bg-white px-10 py-4 text-sm font-extrabold uppercase text-gray-900 shadow-md transition hover:scale-105">
            View All Occasions
            <LayoutDashboard size={15} className="text-purple-600" />
          </button>
          </Link>
        </div>
      </div>
    </section>
  );
}