
import BottomFeatures from "@/components/BottomFeatures";
import Categories from "@/components/Categories";
import DesignSteps from "@/components/DesignSteps";
import Hero from "@/components/Hero";
import Occasions from "@/components/Occasions";
import StatsBar from "@/components/StatsBar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "maktyle | Home",
  description: "Create personalized phone covers, photo frames, mugs, LED lamps, t-shirts, and unique custom gifts. Design your own gifts online with Maktyle.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <StatsBar />
      <DesignSteps />
      <Occasions />
      <BottomFeatures />
    </>
  );
}