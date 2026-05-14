import { createAdminClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default async function ProductsPage() {
  const sb = createAdminClient();

  const { data: products } = await sb.from("products").select("*").order("created_at", { ascending: false });

  // Buscar todas as line items com totals
  const { data: items } = await sb.from("order_items").select("product_id, quantity, total_price, order_id");
  const { data: orders } = await sb.from("orders").select("id, status").neq("status", "cancelled");
  const validOrderIds = new Set((orders ?? []).map((o: any) => o.id));

  // Aggregate per product
  const stats = new Map<string, { qty: number; revenue: number; orders: Set<string> }>();
  for (const it of items ?? []) {
    if (!validOrderIds.has(it.order_id)) continue;
    const cur = stats.get(it.product_id) ?? { qty: 0, revenue: 0, orders: new Set() };
    cur.qty += it.quantity;
    cur.revenue += Number(it.total_price);
    cur.orders.add(it.order_id);
    stats.set(it.product_id, cur);
  }

  const totalRevenue = Array.from(stats.values()).reduce((s, v) => s + v.revenue, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Produtos</h1>
        <p className="text-sm text-muted-foreground">{products?.length ?? 0} produtos cadastrados</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>SKU / Variant ID</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="text-right">Vendidos</TableHead>
                <TableHead className="text-right">Pedidos</TableHead>
                <TableHead className="text-right">Receita</TableHead>
                <TableHead className="text-right">% Receita</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(products ?? []).map((p: any) => {
                const s = stats.get(p.id) ?? { qty: 0, revenue: 0, orders: new Set() };
                const pct = totalRevenue ? ((s.revenue / totalRevenue) * 100).toFixed(1) : "0";
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-xs">
                      <div>{p.sku}</div>
                      <div className="text-muted-foreground">{p.ecomhub_variant_id}</div>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(p.price), p.currency_code)}</TableCell>
                    <TableCell className="text-right">{s.qty}</TableCell>
                    <TableCell className="text-right">{s.orders.size}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(s.revenue, p.currency_code)}</TableCell>
                    <TableCell className="text-right">{pct}%</TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
