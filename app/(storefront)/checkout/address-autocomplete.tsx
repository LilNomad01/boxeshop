"use client";
import { useState, useEffect, useRef } from "react";

const API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;

export type AddressSelection = {
  street: string;
  housenumber?: string;
  city: string;
  county: string;       // județ
  postcode: string;
  formatted: string;
};

type Feature = {
  properties: {
    formatted: string;
    street?: string;
    housenumber?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    postcode?: string;
  };
};

export function AddressAutocomplete({
  onSelect,
  defaultValue = "",
}: {
  onSelect: (a: AddressSelection) => void;
  defaultValue?: string;
}) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Feature[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fecha sugestões ao clicar fora
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Busca com debounce
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    if (!API_KEY) {
      console.warn("NEXT_PUBLIC_GEOAPIFY_KEY missing");
      return;
    }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&filter=countrycode:ro&lang=ro&limit=5&apiKey=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        setSuggestions(data.features || []);
        setOpen(true);
      } catch (err) {
        console.error("Geoapify error", err);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query]);

  function pick(f: Feature) {
    const p = f.properties;
    const sel: AddressSelection = {
      street: p.street || "",
      housenumber: p.housenumber,
      city: p.city || p.town || p.village || "",
      county: p.county || p.state || "",
      postcode: p.postcode || "",
      formatted: p.formatted,
    };
    setQuery(p.formatted);
    setHasSelection(true);
    setOpen(false);
    onSelect(sel);
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex items-center gap-2 border-b-2 border-gray-300 pb-2 focus-within:border-blue-500">
        <span className="text-amber-600">🔍</span>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHasSelection(false);
          }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Ex: Strada Unirii 34, Cluj-Napoca"
          className="flex-1 outline-none text-base bg-transparent placeholder:text-gray-400"
          autoComplete="off"
        />
        {loading && <span className="text-xs text-gray-400">...</span>}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-72 overflow-auto">
          {suggestions.map((f, i) => (
            <li
              key={i}
              onClick={() => pick(f)}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-gray-900">
                {f.properties.street || f.properties.city || f.properties.formatted}
                {f.properties.housenumber ? ` ${f.properties.housenumber}` : ""}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{f.properties.formatted}</div>
            </li>
          ))}
        </ul>
      )}

      {!hasSelection && query.length > 3 && !loading && suggestions.length === 0 && open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-amber-200 rounded-lg shadow-lg z-50 p-3 text-xs text-amber-700">
          Niciun rezultat. Verifică ortografia sau continuă completarea manuală mai jos.
        </div>
      )}
    </div>
  );
}
