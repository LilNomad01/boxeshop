"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export function RetryButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function retry() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/ecomhub/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const json = await res.json();
      const r = json.results?.[0];
      if (r?.ok) {
        setMsg("Sincronizado com sucesso!");
        setTimeout(() => location.reload(), 800);
      } else {
        setMsg(`Falhou: ${r?.error?.context ?? "erro"}`);
      }
    } catch {
      setMsg("Erro de rede");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {msg && <span className="text-xs">{msg}</span>}
      <Button onClick={retry} disabled={loading} size="sm">
        <RotateCcw className="h-4 w-4" />
        {loading ? "Reenviando..." : "Reenviar para EcomHub"}
      </Button>
    </div>
  );
}
