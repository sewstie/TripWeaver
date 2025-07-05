"use client";
import { createContext, useContext, useState, useEffect, useRef } from "react";

const images = [
  "/images/monuments/monument-1.png",
  "/images/monuments/monument-2.png",
  "/images/monuments/monument-3.png",
  "/images/monuments/monument-4.png",
  "/images/monuments/monument-5.png",
  "/images/monuments/monument-6.png",
  "/images/monuments/monument-7.png",
  "/images/monuments/monument-8.png",
  "/images/monuments/monument-9.png",
  "/images/monuments/monument-10.png",
  "/images/monuments/monument-11.png",
];

const SliderContext = createContext();

export function SliderProvider({ children }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationState, setAnimationState] = useState("entering");
  const [nextIndex, setNextIndex] = useState(null);
  const isFirstEffectRun = useRef(true);
  const isMobile = useRef(
    typeof window !== "undefined" && window.innerWidth < 640
  );

  useEffect(() => {
    const timers = [];
    let currentImageStartedAsEntering = false;

    if (isFirstEffectRun.current) {
      setAnimationState("entering");
      currentImageStartedAsEntering = true;
      isFirstEffectRun.current = false;
    } else {
      setAnimationState("visible");
    }

    const enteringDuration = currentImageStartedAsEntering
      ? isMobile.current
        ? 800
        : 1000
      : 0;
    const visibleDuration = isMobile.current ? 2000 : 2500;
    const exitingDuration = isMobile.current ? 800 : 1000;

    const scheduleExitTimer = setTimeout(() => {
      if (currentImageStartedAsEntering) {
        setAnimationState("visible");
      }
      const toExitingTimer = setTimeout(() => {
        setAnimationState("exiting");
        const next = (currentIndex + 1) % images.length;
        setNextIndex(next);
      }, visibleDuration);
      timers.push(toExitingTimer);
    }, enteringDuration);
    timers.push(scheduleExitTimer);

    const advanceToNextImageTimer = setTimeout(() => {
      const newCurrentIndex = (currentIndex + 1) % images.length;
      setCurrentIndex(newCurrentIndex);
      setNextIndex(null);
    }, enteringDuration + visibleDuration + exitingDuration);
    timers.push(advanceToNextImageTimer);

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [currentIndex]);

  return (
    <SliderContext.Provider
      value={{
        currentImage: images[currentIndex],
        nextImage: nextIndex !== null ? images[nextIndex] : null,
        animationState,
        currentIndex,
        nextIndex,
        hasNextImage: nextIndex !== null,
      }}
    >
      {children}
    </SliderContext.Provider>
  );
}

export function useImageSlider() {
  return useContext(SliderContext);
}
