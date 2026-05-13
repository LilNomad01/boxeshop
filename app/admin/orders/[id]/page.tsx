import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { RetryButton } from "./retry-button";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = createAdminClient();

  const { data: order } = await sb.from("orders").select("*").eq("id", id).maybeSingle();
  if (!order) notFound();

  const [{ data: items }, { data: logs }] = await Promise.all([
    sb.from("order_items").select("*").eq("order_id", id),
    sb.from("ecomhub_logs").select("*").eq("order_id", id).order("created_at", { ascending: false }).limit(10),
  ]);

  return (
    <div className="space-y-6 max-w-5xl">
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Pedido #{order.external_id.slice(0, 8)}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={order.status} />
          <StatusBadge status={order.ecomhub_sync_status} />
        </div>
      </div>

      {(order.ecomhub_sync_status === "pending_ecomhub_sync" || order.ecomhub_sync_status === "failed") && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-medium text-sm">Pedido não sincronizado com EcomHub</p>
              <p className="text-xs text-muted-foreground">
                Erro: {order.ecomhub_error_code} — {order.ecomhub_error_context}
              </p>
            </div>
            <RetryButton orderId={order.id} />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Cliente</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p><strong>{order.customer_name}</strong></p>
            <p className="text-muted-foreground">{order.customer_email}</p>
            <p className="text-muted-foreground">{order.customer_phone}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Endereço</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>{order.shipping_address1}</p>
            {order.shipping_address2 && <p>{order.shipping_address2}</p>}
            <p>{order.shipping_city}, {order.shipping_province}</p>
            <p>{order.shipping_postal_code} — {order.shipping_country_code}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Itens</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {(items ?? []).map((it: any) => (
              <li key={it.id} className="flex justify-between text-sm border-b pb-2 last:border-0">
                <span>{it.quantity}× {it.product_name}</span>
                <span className="font-medium">{formatCurrency(Number(it.total_price), order.currency_code)}</span>
              </li>
            ))}
            <li className="flex justify-between text-sm font-bold pt-2">
              <span>Total</span>
              <span>{formatCurrency(Number(order.total_price), order.currency_code)}</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Logs EcomHub</CardTitle></CardHeader>
        <CardContent>
          {(logs ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum log.</p>
          ) : (
            <ul className="space-y-3">
              {(logs ?? []).map((log: any) => (
                <li key={log.id} className="border rounded p-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{log.action}</span>
                    <span className={log.status === "success" ? "text-green-600" : "text-red-600"}>
                      {log.status} · HTTP {log.http_status} · {log.duration_ms}ms
                    </span>
                  </div>
                  <p className="text-muted-foreground">{formatDate(log.created_at)}</p>
                  {log.error_code && <p className="text-red-600">{log.error_code}: {log.error_context}</p>}
                  <details className="mt-1">
                    <summary className="cursor-pointer text-muted-foreground">Ver payload</summary>
                    <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
                      {JSON.stringify(log.request_payload, null, 2)}
                    </pre>
                    <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
                      {JSON.stringify(log.response_payload, null, 2)}
                    </pre>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
