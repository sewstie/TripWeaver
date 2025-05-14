"use client";
import ImageSlider from "./components/home/ImageSlider";
import TextEffect from "./components/home/TextEffect";
import { SliderProvider } from "./components/home/SliderContext";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <SliderProvider>
        <ImageSlider />
        <TextEffect />
      </SliderProvider>
    </div>
  );
}
