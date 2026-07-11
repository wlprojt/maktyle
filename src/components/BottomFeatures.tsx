"use client";

import { Heart, BadgeCheck, Truck, LockKeyhole } from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "Personalized with Love",
    text: "Made just for your loved ones",
  },
  {
    icon: BadgeCheck,
    title: "Premium Quality",
    text: "Finest materials & printing",
  },
  {
    icon: Truck,
    title: "Fast & Reliable Delivery",
    text: "Pan India delivery",
  },
  {
    icon: LockKeyhole,
    title: "Secure Checkout",
    text: "100% safe payment",
  },
];

export default function BottomFeatures() {
  return (
    <section className="bg-gradient-to-r from-[#F5ECFF] via-[#FBF7FF] to-[#F3E8FF] px-5 py-7">
      <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className={`flex items-center gap-4 ${
                index !== features.length - 1
                  ? "lg:border-r lg:border-purple-200"
                  : ""
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <Icon size={23} strokeWidth={1.8} />
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-gray-600">{item.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}