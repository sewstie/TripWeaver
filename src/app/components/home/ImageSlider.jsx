"use client";
import { useImageSlider } from "./SliderContext";

export default function ImageSlider() {
  const { currentImage, nextImage, animationState, currentIndex, nextIndex, hasNextImage } = useImageSlider();

  return (
    <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
      <div className="absolute w-[60%] max-w-2xl aspect-[3/2] transform-gpu">
        <div
          className={`monument-image ${animationState}`}
          style={{
            backgroundImage: `url(${currentImage})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            contain: "paint",
            zIndex: 2,
          }}
          key={`current-${currentIndex}`}
        />
        
        {hasNextImage && animationState === "exiting" && (
          <div
            className="monument-image entering"
            style={{
              backgroundImage: `url(${nextImage})`,
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              contain: "paint",
              zIndex: 1,
            }}
            key={`next-${nextIndex}`}
          />
        )}
      </div>
    </div>
  );
}
