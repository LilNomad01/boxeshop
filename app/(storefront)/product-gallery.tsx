"use client";
import { useState, useRef } from "react";

const IMAGES = [
  "/images/product/01.png",
  "/images/product/02.png",
  "/images/product/03.png",
  "/images/product/04.png",
];

export function ProductGallery({ alt }: { alt: string }) {
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && active < IMAGES.length - 1) setActive(active + 1);
      else if (diff < 0 && active > 0) setActive(active - 1);
    }
    touchStartX.current = null;
  }

  return (
    <div className="w-full">
      {/* Imagem principal */}
      <div
        className="relative bg-white rounded-2xl overflow-hidden flex items-center justify-center select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={IMAGES[active]}
          alt={alt}
          className="w-full max-w-lg max-h-[50vh] md:max-h-[60vh] object-contain mix-blend-multiply transition-opacity duration-300"
          draggable={false}
        />

        {/* Setas (desktop) */}
        {active > 0 && (
          <button
            onClick={() => setActive(active - 1)}
            aria-label="Imagine anterioară"
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-md border border-gray-200 text-gray-700"
          >
            ‹
          </button>
        )}
        {active < IMAGES.length - 1 && (
          <button
            onClick={() => setActive(active + 1)}
            aria-label="Imagine următoare"
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-md border border-gray-200 text-gray-700"
          >
            ›
          </button>
        )}

        {/* Dots (mobile) */}
        <div className="md:hidden absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {IMAGES.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-5 bg-black" : "w-1.5 bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 mt-4 justify-center md:justify-start overflow-x-auto pb-1">
        {IMAGES.map((src, i) => (
          <button
            key={src}
            onClick={() => setActive(i)}
            aria-label={`Vezi imaginea ${i + 1}`}
            className={`flex-shrink-0 h-16 w-16 md:h-20 md:w-20 rounded-lg border-2 overflow-hidden bg-white transition-all ${
              i === active ? "border-black" : "border-gray-200 hover:border-gray-400"
            }`}
          >
            <img
              src={src}
              alt=""
              className="w-full h-full object-contain mix-blend-multiply"
              loading="lazy"
              draggable={false}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
