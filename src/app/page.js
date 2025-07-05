"use client";
import { useEffect, useState } from "react";
import ImageSlider from "./components/home/ImageSlider";
import TextEffect from "./components/home/TextEffect";
import TripSearch from "./components/home/TripSearch";
import { SliderProvider } from "./components/home/SliderContext";
import ScrollIndicator from "./components/home/ScrollIndicator";

export default function Home() {
  const [viewportHeight, setViewportHeight] = useState("100vh");

  useEffect(() => {
    const updateHeight = () => {
      setViewportHeight(`${window.innerHeight}px`);
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  return (
    <>
      <div
        className="relative overflow-hidden"
        style={{ minHeight: viewportHeight }}
      >
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
