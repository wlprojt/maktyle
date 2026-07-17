"use client";

import Image from "next/image";
import { ArrowRight, PenLine } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#FFF9F6] via-[#F6ECE6] to-[#D8B8A8]">
      <div className="mx-auto grid min-h-[650px] max-w-7xl items-center gap-8 px-5 py-10 lg:grid-cols-2 lg:px-8 lg:py-16">

        {/* Image */}
        <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
          <Image
            src="/hero.png"
            alt="Personalized Gifts"
            width={700}
            height={650}
            priority
            className="h-auto w-full max-w-[650px] object-contain"
          />
        </div>

        {/* Text */}
        <div className="order-2 flex flex-col items-center lg:order-1 lg:items-start">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.20em] text-purple-600 sm:text-base">
            Make It Yours
          </p>

          <h1 className="text-center text-4xl font-extrabold leading-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-left lg:text-6xl">
            Personalized Gifts
            <br />
            Made for Every
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
              Special Moment
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-center text-gray-600 sm:text-lg lg:text-left">
            Create meaningful, custom gifts that <br /> your loved ones will cherish
            forever.
          </p>

          <div className="mt-8 flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
            <Link className="flex items-center justify-center gap-2 rounded-full bg-purple-600 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-purple-700" href="/shop">
            {/* <button > */}
              Shop Now
              <ArrowRight size={18} />
            {/* </button> */}
            </Link>

            <button className="flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-gray-900 shadow-md transition-all hover:scale-105">
              Design Your Gift
              <PenLine size={18} className="text-purple-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}