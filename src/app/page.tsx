
import BottomFeatures from "@/components/BottomFeatures";
import Categories from "@/components/Categories";
import DesignSteps from "@/components/DesignSteps";
import Hero from "@/components/Hero";
import Occasions from "@/components/Occasions";
import StatsBar from "@/components/StatsBar";

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