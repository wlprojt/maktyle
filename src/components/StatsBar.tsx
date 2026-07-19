"use client";

import { Gem, Users, Star, RotateCcw, Heart } from "lucide-react";

const stats = [
  {
    icon: Gem,
    value: "1000+",
    label: "Unique Designs",
  },
  {
    icon: Users,
    value: "50K+",
    label: "Happy Customers",
  },
  {
    icon: Star,
    value: "4.8 ⭐",
    label: "Average Rating",
  },
  {
    icon: RotateCcw,
    value: "7 Days",
    label: "Easy Returns",
  },
  {
    icon: Heart,
    value: "Made in India",
    label: "With Love",
  },
];

export default function StatsBar() {
  return (
    <section className="bg-white px-5 py-8">
      <div className="mx-auto max-w-7xl rounded-2xl bg-gradient-to-r from-[#7e48e1] to-[#a86ede] px-6 py-6 text-white shadow-lg">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.value}
                className={`flex items-center gap-4 ${
                  index !== stats.length - 1
                    ? "lg:border-r lg:border-white/15"
                    : ""
                }`}
              >
                <Icon size={42} strokeWidth={1.5} className="text-orange-200" />

                <div>
                  <h3 className="text-xl font-extrabold leading-tight">
                    {item.value}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-white/90">
                    {item.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}