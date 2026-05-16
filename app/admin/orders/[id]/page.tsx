import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RetryButton } from "./retry-button";

const RON_TO_BRL = 1.15;

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = createAdminClient();

  const { data: order } = await sb.from("orders").select("*").eq("id", id).single();
  if (!order) return notFound();

  const { data: items } = await sb.from("order_items").select("*").eq("order_id", id);
  const { data: logs } = await sb.from("ecomhub_logs").select("*").eq("order_id", id).order("created_at", { ascending: false });

  const o = order as any;
  const date = new Date(o.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const brl = (Number(o.total_price) * RON_TO_BRL).toFixed(2);
  const needsSync = ["pending_ecomhub_sync", "failed", "pending"].includes(o.ecomhub_sync_status);

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/admin/orders" className="text-sm text-gray-500 hover:text-gray-800">← Voltar</Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pedido #{o.id.slice(0, 8)}</h1>
          <p className="text-sm text-gray-500">{date}</p>
        </div>
        <div className="flex gap-2">
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${o.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{o.status}</span>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${o.ecomhub_sync_status === "synced" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}`}>{o.ecomhub_sync_status}</span>
        </div>
      </div>

      {/* Erro EcomHub */}
      {needsSync && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="font-medium">Pedido não sincronizado com EcomHub</p>
          <p className="text-sm text-yellow-700">Erro: {o.ecomhub_error_code ?? "—"} — {o.ecomhub_error_context ?? ""}</p>
          <div className="mt-3 flex items-center gap-3">
            <p className="text-xs text-yellow-600">Falhou: {o.ecomhub_error_context ?? "—"}</p>
            <RetryButton orderId={o.id} />
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {/* Cliente */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-bold mb-2">Cliente</h3>
          <p className="font-medium">{o.customer_name}</p>
          {o.customer_email && <p className="text-sm text-gray-500">{o.customer_email}</p>}
          <p className="text-sm text-gray-500">{o.customer_phone}</p>
        </div>

        {/* Endereço */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-bold mb-2">Endereço</h3>
          <p className="text-sm">{o.shipping_address1}</p>
          {o.shipping_address2 && <p className="text-sm text-gray-600">{o.shipping_address2}</p>}
          <p className="text-sm">{o.shipping_city}, {o.shipping_province}</p>
          <p className="text-sm">{o.shipping_postal_code} — {o.shipping_country_code}</p>
        </div>

        {/* IP e origem */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-bold mb-2">Origem do pedido</h3>
          <div className="space-y-1">
            <p className="text-sm"><span className="text-gray-500">IP:</span> <span className="font-mono text-xs">{o.ip_address ?? "Não capturado"}</span></p>
            <p className="text-sm"><span className="text-gray-500">País:</span> {o.shipping_country_code}</p>
            <p className="text-sm"><span className="text-gray-500">Pagamento:</span> {o.payment_method}</p>
          </div>
        </div>
      </div>

      {/* Itens com BRL */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-bold mb-3">Itens</h3>
        {(items ?? []).map((it: any, i: number) => (
          <div key={i} className="flex justify-between py-2 border-b last:border-0">
            <span>{it.quantity}× {it.product_name}</span>
            <div className="text-right">
              <span className="font-medium">{Number(it.total_price).toFixed(2)} RON</span>
              <span className="text-green-700 text-sm ml-2">(R$ {(Number(it.total_price) * RON_TO_BRL).toFixed(2)})</span>
            </div>
          </div>
        ))}
        <div className="flex justify-between pt-3 font-bold text-lg">
          <span>Total</span>
          <div className="text-right">
            <span>{Number(o.total_price).toFixed(2)} RON</span>
            <span className="text-green-700 ml-2">(R$ {brl})</span>
          </div>
        </div>
      </div>

      {/* Logs EcomHub */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-bold mb-3">Logs EcomHub</h3>
        {(!logs || logs.length === 0) ? (
          <p className="text-sm text-gray-400">Nenhum log.</p>
        ) : (
          <div className="space-y-4">
            {logs.map((log: any) => {
              const logDate = new Date(log.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
              return (
                <div key={log.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium">{log.action}</span>
                      <span className="text-xs text-gray-500 ml-2">{logDate}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${log.status === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {log.status} · HTTP {log.http_status} · {log.duration_ms}ms
                    </span>
                  </div>
                  {log.error_code && (
                    <p className="text-sm text-red-600">{log.error_code}: {log.error_context}</p>
                  )}
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer">Ver payload</summary>
                    <pre className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-x-auto max-h-60">
                      {JSON.stringify(log.request_payload, null, 2)}
                    </pre>
                    <pre className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-x-auto max-h-60">
                      {JSON.stringify(log.response_payload, null, 2)}
                    </pre>
                  </details>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
