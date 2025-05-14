"use client";
import { useImageSlider } from "./SliderContext";

export default function TextEffect() {
  const { currentImage } = useImageSlider();

  return (
    <div className="absolute top-0 left-0 flex items-center justify-center h-screen w-full pointer-events-none">
      <h1
        className="text-[10rem] md:text-[12rem] font-bold text-white text-center px-4 mix-blend-difference font-nunito tracking-wider"
        style={{
          textShadow: "0px 2px 10px rgba(0, 0, 0, 0.5)",
          fontFamily: "var(--font-nunito)",
          letterSpacing: "0.12em",
          lineHeight: "0.95",
        }}
      >
        EXPLORE
        <br />
        WONDERS
      </h1>
    </div>
  );
}
