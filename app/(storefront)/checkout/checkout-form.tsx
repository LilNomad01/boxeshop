"use client";
import { useState } from "react";
import { TrackInitiateCheckout } from "@/app/tiktok-events";
import { useRouter } from "next/navigation";
import { AddressAutocomplete, type AddressSelection } from "./address-autocomplete";

const COUNTRIES = [
  { code: "RO", id: 142, name: "România" },
];

export function CheckoutForm({ product }: { product: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Campos preenchidos pela busca
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [address1, setAddress1] = useState("");
  const [postalCode, setPostalCode] = useState("");

  function handleAddressSelect(a: AddressSelection) {
    setProvince(a.county);
    setCity(a.city);
    setAddress1(a.housenumber ? `${a.street} ${a.housenumber}` : a.street);
    setPostalCode(a.postcode);
    setVerified(true);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAttemptedSubmit(true);
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);

    const fullName = String(fd.get("fullName") ?? "").trim();
    const parts = fullName.split(/\s+/);
    const firstName = parts[0] ?? "";
    const lastName = parts.slice(1).join(" ") || firstName;
    const country = COUNTRIES[0];

    const payload = {
      customer: {
        firstName,
        lastName,
        email: null,
        phone: String(fd.get("phone") ?? ""),
      },
      shipping: {
        countryCode: country.code,
        country_id: country.id,
        city: city.trim(),
        province: province.trim() || null,
        address1: address1.trim(),
        address2: String(fd.get("address2") ?? "") || undefined,
        postalCode: postalCode.trim() || "000000",
      },
      paymentMethod: "cod" as const,
      items: [{ productId: product.id, quantity: 1 }],
    };

    try {
      try { sessionStorage.setItem("ck_phone", payload.customer.phone); } catch {}
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Eroare necunoscută");
        return;
      }
      router.push(`/success?orderId=${json.externalId}`);
    } catch {
      setError("Eroare de rețea. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <TrackInitiateCheckout />
    <main className="max-w-md mx-auto px-4 py-6 pb-24">
      <div className="bg-blue-600 text-white text-center py-3 rounded-t-lg font-bold text-sm">
        ▼ COMPLETEAZĂ DATELE PENTRU LIVRARE ▼
      </div>

      <form onSubmit={submit} className="bg-white border border-t-0 rounded-b-lg p-5 space-y-5">

        {/* Nume și Prenume */}
        <div>
          <label className="block font-bold text-base mb-1">Nume și Prenume:</label>
          <p className="text-xs text-gray-500 italic mb-1">(exemplu: Ion Popescu)</p>
          <div className="flex items-center gap-2 border-b-2 border-gray-300 pb-2 focus-within:border-blue-500">
            <span className="text-amber-600">👉</span>
            <input name="fullName" required placeholder="Scrie aici..." className="flex-1 outline-none text-base bg-transparent placeholder:text-gray-400" />
          </div>
        </div>

        {/* Telefon */}
        <div>
          <label className="block font-bold text-base mb-1">Număr Telefon: <span className="font-normal text-gray-600">(pentru curier)</span></label>
          <p className="text-xs text-gray-500 italic mb-1">(exemplu: 0751234567 - trebuie început cu 07)</p>
          <div className="flex items-center gap-2 border-b-2 border-gray-300 pb-2 focus-within:border-blue-500">
            <span className="text-amber-600">👉</span>
            <input name="phone" type="tel" required pattern="07[0-9]{8}" placeholder="Scrie aici..." className="flex-1 outline-none text-base bg-transparent placeholder:text-gray-400" />
          </div>
        </div>

        {/* AUTOCOMPLETE de endereço */}
        <div>
          <label className="block font-bold text-base mb-1">Caută adresa ta:</label>
          <p className="text-xs text-gray-500 italic mb-1">Începe să scrii și alege din listă (recomandat)</p>
          <AddressAutocomplete onSelect={handleAddressSelect} />
          {verified && (
            <p className="text-xs text-green-700 mt-2">✓ Adresă verificată — câmpurile au fost completate automat</p>
          )}
        </div>

        {/* Județ */}
        <div>
          <label className="block font-bold text-base mb-1">Județ:</label>
          <p className="text-xs text-gray-500 italic mb-1">(exemplu: Cluj)</p>
          <div className="flex items-center gap-2 border-b-2 border-gray-300 pb-2 focus-within:border-blue-500">
            <span className="text-amber-600">👉</span>
            <input
              name="province"
              required
              value={province}
              onChange={(e) => { setProvince(e.target.value); setVerified(false); }}
              placeholder="Scrie aici..."
              className="flex-1 outline-none text-base bg-transparent placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Localitate */}
        <div>
          <label className="block font-bold text-base mb-1">Localitate:</label>
          <p className="text-xs text-gray-500 italic mb-1">(exemplu: comuna Floresti, sat Luna de Sus)</p>
          <div className="flex items-center gap-2 border-b-2 border-gray-300 pb-2 focus-within:border-blue-500">
            <span className="text-amber-600">👉</span>
            <input
              name="city"
              required
              value={city}
              onChange={(e) => { setCity(e.target.value); setVerified(false); }}
              placeholder="Scrie aici..."
              className="flex-1 outline-none text-base bg-transparent placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Strada și Numărul */}
        <div>
          <label className="block font-bold text-base mb-1">Strada și Numărul:</label>
          <p className="text-xs text-gray-500 italic mb-1">(exemplu: str. Unirii, nr. 34)</p>
          <div className="flex items-center gap-2 border-b-2 border-gray-300 pb-2 focus-within:border-blue-500">
            <span className="text-amber-600">👉</span>
            <input
              name="address1"
              required
              value={address1}
              onChange={(e) => { setAddress1(e.target.value); setVerified(false); }}
              placeholder="Scrie aici..."
              className="flex-1 outline-none text-base bg-transparent placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Detalii adresă (address2) */}
        <div>
          <label className="block font-bold text-base mb-1">Detalii adresă: <span className="font-normal text-gray-600">(opțional)</span></label>
          <p className="text-xs text-gray-500 italic mb-1">(exemplu: Bloc B, Scara 2, Etaj 5, Apartament 18)</p>
          <div className="flex items-center gap-2 border-b-2 border-gray-300 pb-2 focus-within:border-blue-500">
            <span className="text-amber-600">👉</span>
            <input name="address2" placeholder="Scrie aici..." className="flex-1 outline-none text-base bg-transparent placeholder:text-gray-400" />
          </div>
        </div>

        {/* Cod Poștal */}
        <div>
          <label className="block font-bold text-base mb-1">Cod Poștal:</label>
          <p className="text-xs text-gray-500 italic mb-1">(exemplu: 400114)</p>
          <div className="flex items-center gap-2 border-b-2 border-gray-300 pb-2 focus-within:border-blue-500">
            <span className="text-amber-600">👉</span>
            <input
              name="postalCode"
              required
              value={postalCode}
              onChange={(e) => { setPostalCode(e.target.value); setVerified(false); }}
              placeholder="Scrie aici..."
              className="flex-1 outline-none text-base bg-transparent placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Aviso se NÃO usou autocomplete (só após tentar submeter) */}
        {attemptedSubmit && !verified && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            ⚠️ Adresa nu a fost verificată automat. Te rugăm să folosești câmpul de căutare de mai sus pentru a evita întârzieri la livrare.
          </div>
        )}

        {/* Livrare */}
        <div className="pt-3">
          <label className="block font-bold text-base mb-1">Livrare în 24-48h - Plata la livrare</label>
          <p className="text-xs text-gray-600 mb-3">🇷🇴 Expediem din depozitul nostru Românesc! 🇷🇴</p>
          <div className="border-2 border-green-600 bg-green-600 text-white rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">🎉 TRANSPORT GRATUIT — Plata la curier</span>
              <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-green-600" />
              </span>
            </div>
          </div>
        </div>

        {/* Resumo total */}
        <div className="pt-3 border-t border-gray-200 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>{product.name} (1x)</span>
            <span>{Number(product.price).toFixed(2)} Lei</span>
          </div>
          <div className="flex justify-between">
            <span>Livrare</span>
            <span className="text-green-600 font-semibold">GRATUIT 🎉</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total</span>
            <span>{Number(product.price).toFixed(2)} Lei</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-5 rounded-lg font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition-colors">
          {loading ? "Se procesează..." : (<><span>👉</span><span className="tracking-wide">TRIMITE COMANDA</span><span>👈</span></>)}
        </button>

        <p className="text-center text-xs text-gray-500">🔒 Plată sigură la livrare · Fără riscuri</p>
      </form>
    </main>
  </>
  );
}
