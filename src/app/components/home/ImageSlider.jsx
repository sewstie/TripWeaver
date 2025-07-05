"use client";
import { useImageSlider } from "./SliderContext";

export default function ImageSlider() {
  const {
    currentImage,
    nextImage,
    animationState,
    currentIndex,
    nextIndex,
    hasNextImage,
  } = useImageSlider();

  return (
    <div className="absolute inset-0 overflow-hidden flex items-center justify-center bg-[var(--tw-background)]">
      <div className="absolute w-[85%] sm:w-[75%] md:w-[60%] max-w-2xl aspect-[3/2] transform-gpu">
        <div
          className={`monument-image ${animationState}`}
          style={{
            backgroundImage: `url(${currentImage})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            contain: "paint",
            zIndex: 2,
            height: "100%",
            width: "100%",
            position: "absolute",
            touchAction: "pan-y",
          }}
          key={`current-${currentIndex}`}
          aria-hidden={animationState === "exiting"}
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
              height: "100%",
              width: "100%",
              position: "absolute",
              touchAction: "pan-y",
            }}
            key={`next-${nextIndex}`}
            aria-hidden="false"
          />
        )}
      </div>
    </div>
  );
}
