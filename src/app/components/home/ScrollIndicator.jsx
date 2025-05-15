"use client";

export default function ScrollIndicator() {
  const scrollToNextSection = () => {
    const viewportHeight = window.innerHeight;
    window.scrollTo({
      top: viewportHeight,
      behavior: "smooth",
    });
  };

  return (
    <div 
      className="absolute bottom-8 left-0 right-0 flex flex-row items-center justify-center cursor-pointer transition-opacity duration-300 hover:opacity-80 text-[var(--focus)]"
      onClick={scrollToNextSection}
    >
      <span className="font-light">scroll down</span>
      <span className="transform rotate-180 ml-2">^</span>
    </div>
  );
}
