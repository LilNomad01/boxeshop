"use client";
import { useState, useEffect } from "react";

const testimonials = [
  {
    name: "Andrei P.",
    loc: "București",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&crop=faces&q=80",
    text: "Am cumpărat-o pentru petreceri în curte și a depășit toate așteptările! Sunetul e clar, basul se simte real, iar bateria ține o zi întreagă.",
  },
  {
    name: "Maria I.",
    loc: "Cluj-Napoca",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&crop=faces&q=80",
    text: "Cadou perfect pentru soțul meu de ziua lui. S-a îndrăgostit instant! Calitatea e excelentă pentru preț, livrarea rapidă în 4 zile.",
  },
  {
    name: "Cristian D.",
    loc: "Timișoara",
    avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=128&h=128&fit=crop&crop=faces&q=80",
    text: "Am testat-o la mare — nisip, apă, soare, niciun fel de problemă. IP68 chiar funcționează. Volumul e impresionant pentru dimensiunea ei.",
  },
  {
    name: "Elena M.",
    loc: "Iași",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop&crop=faces&q=80",
    text: "Conectarea Bluetooth e instantă, fără bătăi de cap. O folosesc zilnic la grătare și ieșiri în parc. Pentru preț e un chilipir adevărat!",
  },
  {
    name: "Răzvan A.",
    loc: "Brașov",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=128&h=128&fit=crop&crop=faces&q=80",
    text: "Sceptic la început, impresionat acum. Am avut multe boxe Bluetooth, dar aceasta le întrece pe toate. Designul premium, autonomia incredibilă.",
  },
];

export function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % testimonials.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const t = testimonials[current];

  return (
    <div className="mt-6">
      <div className="border rounded-2xl p-6 flex items-center gap-3 shadow-sm bg-white">
        <button
          onClick={() => setCurrent((current - 1 + testimonials.length) % testimonials.length)}
          className="text-2xl text-gray-300 hover:text-black transition-colors px-1"
        >
          ‹
        </button>

        <div className="flex items-center gap-4 flex-1 min-w-0">
          <img
            src={t.avatar}
            alt={t.name}
            className="w-14 h-14 rounded-full object-cover flex-shrink-0 border-2 border-white shadow"
          />
          <div className="flex-1 min-w-0">
            <div className="text-amber-400 text-sm tracking-wider mb-1">★★★★★</div>
            <p className="text-sm text-gray-700 italic leading-relaxed mb-2">"{t.text}"</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold">{t.name}</span>
              <span className="text-xs text-gray-400">{t.loc}</span>
              <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-semibold">✓ Achiziție verificată</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setCurrent((current + 1) % testimonials.length)}
          className="text-2xl text-gray-300 hover:text-black transition-colors px-1"
        >
          ›
        </button>
      </div>

      <div className="flex justify-center gap-1.5 mt-3">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === current ? "w-5 bg-black" : "w-1.5 bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
