"use client";
import ImageSlider from "./components/home/ImageSlider";
import TextEffect from "./components/home/TextEffect";
import TripSearch from "./components/home/TripSearch";
import { SliderProvider } from "./components/home/SliderContext";
import ScrollIndicator from "./components/home/ScrollIndicator";

export default function Home() {
  return (
    <>
      <div className="relative min-h-screen overflow-hidden">
        <SliderProvider>
          <ImageSlider />
          <TextEffect />
          <ScrollIndicator />
        </SliderProvider>
      </div>
      <div className="relative z-10">
        <TripSearch />
      </div>
    </>
  );
}
