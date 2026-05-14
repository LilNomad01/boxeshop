"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plug, RotateCw, CheckCircle2, AlertCircle } from "lucide-react";

export function EcomHubActions({ hasPending }: { hasPending: boolean }) {
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [retryResult, setRetryResult] = useState<string | null>(null);

  async function testConnection() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/ecomhub/test");
      setTestResult(await res.json());
    } finally { setTesting(false); }
  }

  async function retryAll() {
    setRetrying(true);
    setRetryResult(null);
    try {
      const res = await fetch("/api/ecomhub/retry", { method: "POST", body: "{}" });
      const json = await res.json();
      const ok = json.results?.filter((r: any) => r.ok).length ?? 0;
      setRetryResult(`${ok} de ${json.processed} reenviados com sucesso`);
      setTimeout(() => location.reload(), 1500);
    } finally { setRetrying(false); }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button onClick={testConnection} disabled={testing} variant="outline">
          <Plug className="h-4 w-4" />
          {testing ? "Testando..." : "Testar conexão"}
        </Button>
        <Button onClick={retryAll} disabled={retrying || !hasPending}>
          <RotateCw className="h-4 w-4" />
          {retrying ? "Reenviando..." : `Reenviar pendentes${hasPending ? "" : " (nada pendente)"}`}
        </Button>
      </div>

      {retryResult && (
        <Card className="border-green-300 bg-green-50">
          <CardContent className="p-3 text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" /> {retryResult}
          </CardContent>
        </Card>
      )}

      {testResult && (
        <Card>
          <CardContent className="p-4 space-y-3 text-sm">
            {/* LOJA */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                {testResult.storeOk
                  ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                  : <AlertCircle className="h-4 w-4 text-red-600" />}
                <span className="font-semibold">Loja conectada:</span>
              </div>
              {testResult.storeOk ? (
                <code className="block text-xs bg-muted px-2 py-1 rounded ml-6">
                  ID: {testResult.store?.id ?? "?"}
                  {testResult.store?.myshopifyDomain ? ` · ${testResult.store.myshopifyDomain}` : ""}
                </code>
              ) : (
                <div className="ml-6 text-xs text-red-600 bg-red-50 border border-red-200 p-2 rounded">
                  <p><strong>Código:</strong> {testResult.store?.error?.code ?? "?"}</p>
                  <p><strong>Mensagem:</strong> {testResult.store?.error?.context ?? "?"}</p>
                </div>
              )}
            </div>

            {/* PAÍSES */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                {testResult.countriesOk
                  ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                  : <AlertCircle className="h-4 w-4 text-red-600" />}
                <span className="font-semibold">Países disponíveis:</span>
              </div>
              {testResult.countriesOk ? (
                <div className="ml-6 space-y-1">
                  <p className="text-xs">{testResult.countries?.count ?? 0} países disponíveis</p>
                  <div className="text-xs bg-muted p-2 rounded">
                    <p className="font-semibold mb-1">Primeiros 5 países (use o ID da Romênia no checkout):</p>
                    <ul className="space-y-0.5 font-mono">
                      {(testResult.countries?.sample ?? []).map((c: any) => (
                        <li key={c.id} className={c.acronym === "RO" || c.name?.toLowerCase().includes("rom") ? "text-green-700 font-bold" : ""}>
                          ID: {c.id} · {c.acronym} · {c.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="ml-6 text-xs text-red-600 bg-red-50 border border-red-200 p-2 rounded">
                  <p><strong>Código:</strong> {testResult.countries?.error?.code ?? "?"}</p>
                  <p><strong>Mensagem:</strong> {testResult.countries?.error?.context ?? "?"}</p>
                </div>
              )}
            </div>

            {/* DEBUG: resposta completa */}
            <details>
              <summary className="cursor-pointer text-xs text-muted-foreground">Ver resposta completa (debug)</summary>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
