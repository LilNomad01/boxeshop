"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Check, X } from "lucide-react";

export function ProductPriceEditor({ productId, currentPrice, currentCompare }: {
  productId: string; currentPrice: number; currentCompare: number;
}) {
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(String(currentPrice));
  const [compare, setCompare] = useState(String(currentCompare));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/products/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, price: Number(price), compareAtPrice: Number(compare) || null }),
      });
      if (res.ok) {
        setMsg("✓ Salvo!");
        setEditing(false);
        setTimeout(() => { setMsg(null); location.reload(); }, 1000);
      } else {
        setMsg("Erro ao salvar");
      }
    } finally { setSaving(false); }
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        {msg && <span className="text-xs text-green-600">{msg}</span>}
        <Button variant="ghost" size="icon" onClick={() => setEditing(true)}>
          <Pencil className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2 min-w-[160px]">
      <div>
        <label className="text-xs text-muted-foreground">Preço (RON)</label>
        <Input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="h-8 text-sm" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Preço anterior (RON)</label>
        <Input type="number" step="0.01" value={compare} onChange={e => setCompare(e.target.value)} className="h-8 text-sm" />
      </div>
      <div className="flex gap-1">
        <Button size="sm" onClick={save} disabled={saving} className="h-7 text-xs">
          <Check className="h-3 w-3" /> {saving ? "..." : "Salvar"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="h-7 text-xs">
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
