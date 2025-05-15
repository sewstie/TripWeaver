"use client";
import Link from "next/link";
import { useRef } from "react";

export default function Header() {
  const scrollToNextSection = () => {
    const viewportHeight = window.innerHeight;
    window.scrollTo({
      top: viewportHeight,
      behavior: "smooth",
    });
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 py-4"
      style={{ backgroundColor: "transparent" }}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold z-10 text-[var(--tw-text)]"
        >
          TripWeaver
        </Link>
        <button
          onClick={scrollToNextSection}
          className="px-5 py-2 rounded-full border border-[var(--tw-focus)] text-[var(--tw-text)] transition-all duration-300 hover:bg-opacity-20 z-10"
          style={{ backgroundColor: "transparent" }}
        >
          Explore
        </button>
      </div>
    </header>
  );
}
