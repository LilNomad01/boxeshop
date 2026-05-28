import { createAdminClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

const RON_TO_BRL = 1.15;

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrdersPage() {
  const sb = createAdminClient();
  const { data: orders } = await sb.from("orders").select("*").order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <p className="text-sm text-muted-foreground">{orders?.length ?? 0} pedidos · 1 RON = {RON_TO_BRL} BRL</p>
      </div>

      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Pedido</th>
              <th className="px-4 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-left">IP</th>
              <th className="px-4 py-3 text-left">Cidade</th>
              <th className="px-4 py-3 text-right">RON</th>
              <th className="px-4 py-3 text-right">BRL</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">EcomHub</th>
              <th className="px-4 py-3 text-left">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(orders ?? []).map((o: any) => {
              const brl = (Number(o.total_price) * RON_TO_BRL).toFixed(2);
              const date = new Date(o.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
              return (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="text-blue-600 hover:underline font-mono text-xs">
                      #{o.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{o.customer_name}</div>
                    <div className="text-xs text-gray-400">{o.customer_phone}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{o.ip_address ?? "—"}</td>
                  <td className="px-4 py-3 text-xs">{o.shipping_city}, {o.shipping_country_code}</td>
                  <td className="px-4 py-3 text-right font-medium">{Number(o.total_price).toFixed(2)} RON</td>
                  <td className="px-4 py-3 text-right text-green-700 font-medium">R$ {brl}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      o.status === "completed" ? "bg-green-100 text-green-800" :
                      o.status === "cancelled" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      o.ecomhub_sync_status === "synced" ? "bg-green-100 text-green-800" :
                      o.ecomhub_sync_status === "failed" ? "bg-red-100 text-red-800" :
                      "bg-orange-100 text-orange-800"
                    }`}>{o.ecomhub_sync_status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{date}</td>
                </tr>
              );
            })}
            {(!orders || orders.length === 0) && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">Nenhum pedido encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {orders && orders.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <p className="text-xs text-gray-500">Total RON</p>
            <p className="text-xl font-bold">{formatCurrency(orders.reduce((s: number, o: any) => s + Number(o.total_price), 0), "RON")}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-xs text-gray-500">Total BRL</p>
            <p className="text-xl font-bold text-green-700">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(orders.reduce((s: number, o: any) => s + Number(o.total_price), 0) * RON_TO_BRL)}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-xs text-gray-500">Pedidos</p>
            <p className="text-xl font-bold">{orders.length}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-xs text-gray-500">Sincronizados</p>
            <p className="text-xl font-bold text-green-700">{orders.filter((o: any) => o.ecomhub_sync_status === "synced").length}</p>
          </div>
        </div>
      )}
    </div>
  );
}
