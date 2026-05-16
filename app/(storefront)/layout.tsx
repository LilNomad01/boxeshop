export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-black text-white py-3 overflow-hidden text-sm">
        <div className="flex gap-20 w-max animate-marquee whitespace-nowrap">
          <span>Transport gratuit pentru comenzi peste 50 RON</span>
          <span>•</span>
          <span>Returnări fără complicații în 30 de zile</span>
          <span>•</span>
          <span>Livrare în 24-48h</span>
          <span>•</span>
          <span>Transport gratuit pentru comenzi peste 50 RON</span>
          <span>•</span>
          <span>Returnări fără complicații în 30 de zile</span>
          <span>•</span>
          <span>Livrare în 24-48h</span>
        </div>
      </div>
      <header className="border-b py-4 px-6 sticky top-0 bg-white z-50">
        <div className="max-w-7xl mx-auto flex justify-center">
          <h1 className="text-2xl font-extrabold tracking-tight">
            <span className="text-orange-500">!</span>JBL
          </h1>
        </div>
      </header>
      {children}
    </div>
  );
}
