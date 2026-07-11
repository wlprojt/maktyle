"use client";

import Image from "next/image";
import { ArrowRight, Gift, Type, UploadCloud } from "lucide-react";

const steps = [
  {
    icon: UploadCloud,
    number: "1",
    title: "Choose & Upload",
    text: "Pick a product and upload your photo or design.",
  },
  {
    icon: Type,
    number: "2",
    title: "Personalize It",
    text: "Add name, text, colors and make it uniquely yours.",
  },
  {
    icon: Gift,
    number: "3",
    title: "Preview & Order",
    text: "Preview your creation and place the order.",
  },
];

export default function DesignSteps() {
  return (
    <section className="bg-white px-5 py-10">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
        <div>
          <h2 className="mb-10 text-center text-xl font-extrabold uppercase text-gray-900">
            Design in <span className="text-purple-600">3</span> Simple Steps
          </h2>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={step.number} className="relative text-center">
                  {index !== steps.length - 1 && (
                    <div className="absolute left-[70%] top-10 hidden w-[75px] border-t-2 border-dashed border-purple-400 sm:block" />
                  )}

                  <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                    <Icon size={42} strokeWidth={1.8} />
                  </div>

                  <div className="mx-auto -mt-4 flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 text-lg font-bold text-white">
                    {step.number}
                  </div>

                  <h3 className="mt-4 text-base font-extrabold text-gray-900">
                    {step.title}
                  </h3>

                  <p className="mx-auto mt-2 max-w-[170px] text-sm leading-5 text-gray-600">
                    {step.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-purple-50 to-white p-8 shadow-sm">
          <div className="grid items-center gap-6 sm:grid-cols-2">
            <div>
              <h2 className="text-3xl font-extrabold leading-tight text-gray-900">
                Create. Personalize.
                <br />
                <span className="bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
                  Gift Happiness.
                </span>
              </h2>

              <p className="mt-5 text-gray-600">
                Design something unique for your loved ones.
              </p>

              <button className="mt-7 flex items-center gap-2 rounded-full bg-purple-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-purple-300 transition hover:scale-105">
                START DESIGNING
                <ArrowRight size={18} />
              </button>
            </div>

            <Image
              src="/cbox.png"
              alt="Gift box"
              width={300}
              height={260}
              className="h-auto w-full object-contain drop-shadow-[0_15px_20px_rgba(0,0,0,0.6)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}