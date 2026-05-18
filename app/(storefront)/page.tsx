import Link from "next/link";
import { TrackViewContent } from "@/app/tiktok-events";
import { ProductGallery } from "./product-gallery";
import { createAdminClient } from "@/lib/supabase/server";
import { ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function StorefrontPage() {
  const sb = createAdminClient();
  const { data: product } = await sb
    .from("products")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center">
        <h2 className="text-2xl font-bold mb-2">Nenhum produto disponível</h2>
        <p className="text-muted-foreground">Cadastre produtos no painel admin.</p>
      </div>
    );
  }

  const checkoutUrl = `/checkout?productId=${product.id}`;
  const price = formatCurrency(Number(product.price), product.currency_code);
  const comparePrice = product.compare_at_price
    ? formatCurrency(Number(product.compare_at_price), product.currency_code)
    : null;

  return (
    <>
      <TrackViewContent />
      {/* ====== PRODUCT HERO ====== */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="md:sticky md:top-24">
            <div className="flex items-center justify-center py-8">
              <ProductGallery alt={product.name} />
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-5">{product.name}</h1>
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <span className="text-2xl font-semibold">{price}</span>
              {comparePrice && <span className="text-lg text-gray-400 line-through">{comparePrice}</span>}
              <span className="bg-black text-white text-xs px-4 py-1.5 rounded-full font-semibold tracking-wide">SUNET PUTERNIC, ORIUNDE</span>
            </div>

            <div className="flex items-center gap-2 mb-7">
              <span className="text-amber-400 text-lg tracking-tight">★★★★★</span>
              <span className="font-bold text-base">4.8</span>
              <span className="text-gray-500 text-sm">(312 recenzii)</span>
            </div>

            <ul className="space-y-2.5 mb-8 text-base">
              <li>🔊 Sunet masiv JBL pentru fiecare petrecere</li>
              <li>🔥 Bas profund, energie mare, entuziasm instantaneu</li>
              <li>🔋 Autonomie pentru toată ziua, libertate de ascultare neîntreruptă</li>
              <li>💦 Robust IP68, pregătit pentru orice aventură</li>
            </ul>

            <p className="text-center text-sm text-gray-500 mb-2">Adu ritmul acasă</p>

            {/* Barra de escassez */}
            <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold text-red-700">🔥 Stoc limitat!</span>
                <span className="text-xs font-semibold text-red-600">Doar 7 bucăți rămase</span>
              </div>
              <div className="w-full bg-red-100 rounded-full h-2.5">
                <div className="bg-red-500 h-2.5 rounded-full" style={{width: "83%"}} />
              </div>
              <p className="text-[11px] text-red-500 mt-1.5">⚡ 34 de persoane au cumpărat în ultimele 24 de ore</p>
            </div>

            <Link href={checkoutUrl} className="hidden md:block">
              <button className="w-full bg-black text-white py-5 rounded-lg text-base font-semibold flex items-center justify-center gap-3 hover:bg-gray-900 transition-colors">
                <ShoppingCart className="h-5 w-5" />
                Cumpără cu plată ramburs
              </button>
            </Link>
            <p className="text-center text-sm text-gray-500 mt-3 mb-6">Achiziționați-vă sistemul de sunet portabil puternic</p>



                        {/* Banner GLS */}
            <div className="mb-6 mx-auto max-w-sm">
              <img src="/images/gls-shipping.png" alt="Livrare GLS gratuita in toata Romania in 24-48h" className="w-full rounded-lg shadow-sm" />
            </div>
<div className="bg-amber-50 rounded-xl p-6 flex gap-5 items-center mb-8">
              <div className="flex-shrink-0 w-20 h-20 rounded-full bg-white border-2 border-amber-700/30 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold">60</span>
                <span className="text-[10px] font-bold text-amber-800">Ziua</span>
              </div>
              <div>
                <h3 className="font-bold mb-1">Garanție de returnare a banilor în 60 de zile</h3>
                <p className="text-sm text-gray-600">Vrem să zâmbești de la prima melodie. Dacă această boxă nu-ți place, returnează-o pentru o rambursare integrală. Simplu, fără riscuri și ușor.</p>
              </div>
            </div>

            <details className="border-b py-4 group">
              <summary className="flex justify-between items-center cursor-pointer font-semibold">Detalii produs <span className="text-gray-400 group-open:rotate-180 transition-transform">⌃</span></summary>
              <p className="mt-3 text-sm text-gray-600 pb-2">Boxă Bluetooth portabilă cu sunet puternic JBL, încărcare USB-C și design IP68 rezistent la apă. Autonomie pentru toată ziua, Bluetooth 5.3, suport bivolt.</p>
            </details>
            <details className="border-b py-4 group">
              <summary className="flex justify-between items-center cursor-pointer font-semibold">Cum se conectează <span className="text-gray-400 group-open:rotate-180 transition-transform">⌃</span></summary>
              <p className="mt-3 text-sm text-gray-600 pb-2">Activați Bluetooth pe dispozitivul dumneavoastră, selectați difuzorul și începeți redarea. Asocierea este concepută pentru a fi rapidă și simplă.</p>
            </details>
          </div>
        </div>
      </section>

      {/* ====== DISCOUNT BANNER ====== */}
      <div className="bg-black text-white text-center py-4 font-bold text-sm tracking-widest">
        REDUCERE LIMITATĂ DE 50% CARE SE ÎNCHEIE SĂPTĂMÂNA ACEASTA
      </div>

      {/* ====== FEATURES SECTION ====== */}
      <section className="mx-6 my-10">
        <div className="bg-gray-100 rounded-3xl p-8 md:p-14 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold mb-8 tracking-tight">Sunetul care te pune în mișcare</h2>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold mb-2">Conectare instantanee</h4>
                <p className="text-sm text-gray-600 mb-3">Conectați-vă rapid dispozitivul și începeți să ascultați muzică fără bătaia de cap a cablurilor.</p>
                <span className="text-xs text-gray-700 flex items-center gap-2"><span className="w-4 h-4 bg-black rounded inline-block"></span>Redare wireless simplificată</span>
              </div>
              <div>
                <h4 className="font-bold mb-2">Putere de ieșire mare</h4>
                <p className="text-sm text-gray-600 mb-3">Bucurați-vă de un sunet puternic care umple cu ușurință încăperile, terasele și întâlnirile în aer liber.</p>
                <span className="text-xs text-gray-700 flex items-center gap-2"><span className="w-4 h-4 bg-black rounded inline-block"></span>Sunet puternic pentru orice spațiu</span>
              </div>
              <div>
                <h4 className="font-bold mb-2">Reîncărcare ușoară</h4>
                <p className="text-sm text-gray-600 mb-3">Conectează-te prin USB-C și continuă să asculți muzică cu suport modern de încărcare.</p>
                <span className="text-xs text-gray-700 flex items-center gap-2"><span className="w-4 h-4 bg-black rounded inline-block"></span>Confort de încărcare USB-C</span>
              </div>
              <div>
                <h4 className="font-bold mb-2">Bivolt Ready</h4>
                <p className="text-sm text-gray-600 mb-3">Folosiți-l cu diferite standarde de tensiune pentru o încredere sporită în timpul călătoriilor sau al configurării.</p>
                <span className="text-xs text-gray-700 flex items-center gap-2"><span className="w-4 h-4 bg-black rounded inline-block"></span>Construit pentru utilizare flexibilă</span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden">
            <img src="/images/06-respingo-agua.png" alt="JBL rezistent la apă" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* ====== STEPS SECTION ====== */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <div>
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 tracking-tight">De la asociere la petrecere</h2>
          <p className="text-gray-500 mb-3">Instalează-l rapid, apasă play și lasă camera să prindă viață cu sunetul puternic JBL.</p>
          <p className="font-bold mb-6">Un flux simplu pentru zile mai zgomotoase și nopți mai bune</p>

          {[
            { n: "1", t: "Despachetați boxa", d: "Scoate boxa ta JBL și așaz-o acolo unde vrei să înceapă muzica." },
            { n: "2", t: "Pornește-l", d: "Încărcați prin USB-C și pregătiți-vă pentru următoarea sesiune." },
            { n: "3", t: "Conectare Bluetooth", d: "Asociați telefonul, tableta sau laptopul în câteva atingeri rapide." },
            { n: "4", t: "Alegeți lista de redare", d: "Alegeți melodiile care se potrivesc momentului, de la cele relaxante la cele pentru petreceri." },
            { n: "5", t: "Mărește energia", d: "Bucură-te de un sunet amplificat, care te ajută să-ți faci muzica remarcată oriunde mergi." },
            { n: "6", t: "Ia-l oriunde", d: "Deplasați-vă cu ușurință dintr-o cameră în alta sau luați-l cu dumneavoastră în călătorii." },
          ].map((step, i) => (
            <div key={i} className="flex gap-4 mb-6 relative">
              <div className="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm z-10">
                {step.n}
              </div>
              {i < 5 && <div className="absolute left-[19px] top-10 w-0.5 h-[calc(100%+8px)] bg-black/15"></div>}
              <div>
                <h4 className="font-bold mb-1">{step.t}</h4>
                <p className="text-sm text-gray-600">{step.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ====== STATS SECTION ====== */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-14 items-center">
        <div>
          <p className="text-sm text-gray-500 mb-4">Construit pentru a amplifica audiția zilnică, cu putere portabilă și ușurință wireless.</p>
          <h2 className="text-3xl md:text-4xl font-semibold mb-8 tracking-tight">Momente mai zgomotoase, întâlniri mai fericite</h2>

          {[
            { pct: 96, text: "Experimentați o muzică mai clară în timpul evenimentelor în aer liber" },
            { pct: 94, text: "Am adorat procesul rapid de conectare prin Bluetooth" },
            { pct: 92, text: "Am găsit sunetul portabil util pentru utilizarea zilnică" },
          ].map((stat, i) => (
            <div key={i} className="flex gap-5 items-center py-5 border-t border-gray-200">
              <div className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center relative"
                style={{ background: `conic-gradient(#1a1a1a ${stat.pct}%, #e5e5e5 0)` }}>
                <span className="bg-white w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold">{stat.pct}%</span>
              </div>
              <p className="text-sm text-gray-700">{stat.text}</p>
            </div>
          ))}
          <p className="text-xs text-gray-400 mt-4">Rezultatele se bazează pe feedback-ul clienților și pe caracteristicile produsului. Experiențele individuale pot varia.</p>
        </div>
        <div className="rounded-2xl overflow-hidden">
          <img src="/images/05-skate-menina.png" alt="Clientă cu JBL" className="w-full object-cover rounded-2xl" />
        </div>
      </section>

      {/* ====== DIAGRAM SECTION ====== */}
      <section className="max-w-7xl mx-auto px-6 py-16 text-center">
        <p className="text-sm text-gray-500 mb-4">Putere portabilă, stil JBL</p>
        <h2 className="text-3xl md:text-4xl font-semibold mb-14 max-w-3xl mx-auto tracking-tight">O boxă Bluetooth îndrăzneață, creată pentru audiții zilnice și momente speciale.</h2>
        <div className="grid md:grid-cols-3 gap-8 items-center">
          <div className="space-y-12 text-left">
            <div>
              <h4 className="font-bold mb-2 border-b-2 border-black inline-block pb-1">Redare wireless</h4>
              <p className="text-sm text-gray-600">Transmite cu ușurință muzică de pe telefon sau tabletă cu conexiune Bluetooth.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2 border-b-2 border-black inline-block pb-1">Sunet amplificat</h4>
              <p className="text-sm text-gray-600">Bucură-te de un sunet puternic care aduce mai multă energie fiecărei liste de redare.</p>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden">
            <img src="/images/06-respingo-agua.png" alt="JBL cu apă" className="w-full object-cover rounded-2xl" />
          </div>
          <div className="space-y-12 md:text-right">
            <div>
              <h4 className="font-bold mb-2 border-b-2 border-black inline-block pb-1">Versiune portabilă</h4>
              <p className="text-sm text-gray-600">Transportați-l dintr-o cameră în alta sau luați-l cu ușurință în călătorii.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2 border-b-2 border-black inline-block pb-1">Încărcare USB-C</h4>
              <p className="text-sm text-gray-600">Încărcați convenabil cu o conexiune USB-C modernă.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ====== BOTTOM MARQUEE ====== */}
      <div className="bg-black text-white py-4 overflow-hidden font-semibold text-sm tracking-widest">
        <div className="flex gap-20 w-max animate-marquee whitespace-nowrap">
          <span>ÎN CARE AU ÎNCREDERE IUBITORII MUZICII</span>
          <span>SUNET PORTABIL, ENERGIE MARE</span>
          <span>CONSTRUITĂ PENTRU FIECARE JAM SESSION</span>
          <span>ÎN CARE AU ÎNCREDERE IUBITORII MUZICII</span>
          <span>SUNET PORTABIL, ENERGIE MARE</span>
          <span>CONSTRUITĂ PENTRU FIECARE JAM SESSION</span>
        </div>
      </div>

      {/* ====== MUSIC ANYWHERE ====== */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-14 items-center">
        <div className="rounded-2xl overflow-hidden">
          <img src="/images/02-praia-jbl.png" alt="JBL pe plajă" className="w-full object-cover rounded-2xl" />
        </div>
        <div>
          <h2 className="text-3xl md:text-4xl font-semibold mb-6 tracking-tight">Muzica ta, oriunde</h2>
          <div className="space-y-2 text-gray-600">
            <p>- Sunet puternic pentru acasă sau în aer liber</p>
            <p>- Libertate Bluetooth cu împerechere simplă</p>
            <p>- Încărcare USB-C pentru confort zilnic</p>
            <p>- Design portabil pentru transport facil</p>
            <p>- Suport bivolt pentru utilizare flexibilă</p>
          </div>
        </div>
      </section>

      {/* ====== COMPARISON ====== */}
      <section className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-semibold mb-3 tracking-tight">De ce iese în evidență acest vorbitor</h2>
        <p className="text-gray-500 mb-12">Comparați avantajul zilnic al sunetului portabil JBL față de boxele obișnuite.</p>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative text-left">
            <div className="bg-gray-100 rounded-xl p-6 mb-14">
              <h3 className="font-bold tracking-wide mb-4">NOI</h3>
              <ul className="space-y-3">
                {["Sunet mai puternic într-o dimensiune compactă", "Asocierea Bluetooth rămâne rapidă și ușoară", "Încărcarea USB-C se potrivește rutinelor moderne", "Suficient de portabil pentru călătorii și activități în aer liber", "Suportul bivolt adaugă o flexibilitate suplimentară"].map((t, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="flex-shrink-0 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-[10px] mt-0.5">✓</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white border-2 border-black rounded-full flex items-center justify-center font-bold z-10">VS</div>
            <div className="bg-gray-100 rounded-xl p-6">
              <h3 className="font-bold tracking-wide mb-4">LOR</h3>
              <ul className="space-y-3">
                {["Volum mai mic pentru spații mai mari", "Împerecherea lentă sau anevoioasă a dispozitivului", "Porturile de încărcare mai vechi se simt învechite", "Construcțiile voluminoase sunt mai greu de deplasat", "Opțiunile de putere limitate reduc versatilitatea"].map((t, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="flex-shrink-0 w-5 h-5 border border-black rounded-full flex items-center justify-center text-[10px] mt-0.5">✕</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden">
            <img src="/images/05-skate-menina.png" alt="Clientă cu JBL" className="w-full object-cover rounded-2xl" />
          </div>
        </div>
      </section>

      {/* ====== SOCIAL PROOF - PRODUSUL A AJUNS ====== */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-4">
            <span className="inline-block bg-green-100 text-green-800 text-xs font-bold px-4 py-1.5 rounded-full tracking-wide mb-4">✅ VERIFICAT DE CLIENȚI REALI</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Produsul a ajuns! Iată ce spun clienții</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Peste 1.200 de clienți mulțumiți din România. Comandă cu încredere — plătești doar la livrare.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            {[
              { img: "/images/social-proof/cliente-1.png.jpeg", name: "Andrei M.", city: "București", text: "A venit în 3 zile! Sunetul e incredibil 🔥", rating: "5.0", stars: "★★★★★" },
              { img: "/images/social-proof/cliente-2.png.jpeg", name: "Maria P.", city: "Cluj-Napoca", text: "Cadou perfect pentru soțul meu!", rating: "4.5", stars: "★★★★½" },
              { img: "/images/social-proof/cliente-3.png.jpeg", name: "Cristian D.", city: "Timișoara", text: "Calitate premium, nu mă așteptam!", rating: "4.75", stars: "★★★★¾" },
              { img: "/images/social-proof/cliente-4.png.jpeg", name: "Elena R.", city: "Iași", text: "Am comandat a doua bucată 😍", rating: "5.0", stars: "★★★★★" },
              { img: "/images/social-proof/cliente-5.png.jpeg", name: "Răzvan A.", city: "Brașov", text: "Basul se simte în piept! Top!", rating: "4.5", stars: "★★★★½" },
              { img: "/images/social-proof/cliente-6.png.jpeg", name: "Ana S.", city: "Constanța", text: "Livrat rapid, ambalaj impecabil", rating: "4.75", stars: "★★★★¾" },
              { img: "/images/social-proof/cliente-7.png.jpeg", name: "Mihai L.", city: "Sibiu", text: "O folosesc zilnic, bateria ține!", rating: "5.0", stars: "★★★★★" },
              { img: "/images/social-proof/cliente-8.png.jpeg", name: "Diana T.", city: "Oradea", text: "Cea mai bună achiziție din anul ăsta", rating: "4.5", stars: "★★★★½" },
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-square overflow-hidden">
                  <img src={c.img} alt={`Client ${c.name}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-amber-400 text-sm">{c.stars}</span>
                    <span className="text-xs font-bold text-gray-600">{c.rating}</span>
                  </div>
                  <p className="text-sm text-gray-700 italic mb-2">&ldquo;{c.text}&rdquo;</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold">{c.name}</p>
                      <p className="text-[11px] text-gray-400">{c.city}</p>
                    </div>
                    <span className="text-[9px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-semibold">✓ Verificat</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-sm">
              <div className="flex -space-x-2">
                <img src="/images/social-proof/cliente-1.png.jpeg" className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="" />
                <img src="/images/social-proof/cliente-2.png.jpeg" className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="" />
                <img src="/images/social-proof/cliente-3.png.jpeg" className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="" />
                <img src="/images/social-proof/cliente-4.png.jpeg" className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold">4.9/5 — 1.247 recenzii</p>
                <p className="text-xs text-gray-500">Clienți verificați din România</p>
              </div>
              <span className="text-amber-400 text-lg">★★★★★</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====== FAQ ====== */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-16">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Întrebări frecvente</h2>
        <div className="md:col-span-2">
          {[
            { q: "Cum îmi conectez telefonul?", a: "Activați Bluetooth pe dispozitivul dumneavoastră, selectați difuzorul și începeți redarea. Asocierea este concepută pentru a fi rapidă și simplă." },
            { q: "Se încarcă prin USB-C?", a: "Da, boxa acceptă încărcare USB-C pentru confort modern și utilizare ușoară în fiecare zi." },
            { q: "Pot să-l folosesc în aer liber?", a: "Absolut. Designul său portabil îl face o alegere excelentă pentru terase, călătorii și întâlniri în aer liber." },
            { q: "Ce înseamnă bivolt?", a: "Suportul bivolt înseamnă că poate funcționa cu diferite standarde de tensiune, ceea ce adaugă flexibilitate pentru diverse medii." },
            { q: "E bun pentru petreceri?", a: "Da, ieșirea sonoră amplificată este ideală pentru muzică, întâlniri și sesiuni de ascultare energice." },
            { q: "Dacă nu sunt mulțumit?", a: "Beneficiezi de garanția de returnare a banilor în 60 de zile. Simplu, fără riscuri și fără complicații." },
          ].map((faq, i) => (
            <details key={i} className="border-b py-5 group">
              <summary className="flex justify-between items-center cursor-pointer font-semibold text-base">
                {faq.q}
                <span className="text-gray-400 group-open:rotate-180 transition-transform text-xl">⌃</span>
              </summary>
              <p className="mt-3 text-sm text-gray-600 pb-1">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ====== STICKY CTA (mobile) ====== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50">
        <Link href={checkoutUrl}>
          <button className="w-full bg-black text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Cumpără · {price}
          </button>
        </Link>
      </div>

      {/* ====== FOOTER ====== */}
      <footer className="bg-black text-white py-12 text-center text-sm space-y-2">
        <p className="opacity-70">© 2026 JBL Boombox Store. Toate drepturile rezervate.</p>
        <p className="opacity-50">Transport gratuit · Returnări 60 de zile · Suport 24/7</p>
      </footer>
  </>
  );
}
