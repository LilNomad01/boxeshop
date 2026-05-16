import { createAdminClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { ProductPriceEditor } from "./price-editor";

// Taxa de câmbio RON → BRL (atualizar periodicamente)
const RON_TO_BRL = 1.15;

export default async function ProductsPage() {
  const sb = createAdminClient();
  const { data: products } = await sb.from("products").select("*").order("created_at", { ascending: false });

  const { data: items } = await sb.from("order_items").select("product_id, quantity, total_price, order_id");
  const { data: orders } = await sb.from("orders").select("id, status").neq("status", "cancelled");
  const validOrderIds = new Set((orders ?? []).map((o: any) => o.id));

  const stats = new Map<string, { qty: number; revenue: number; orders: Set<string> }>();
  for (const it of (items ?? []) as any[]) {
    if (!validOrderIds.has(it.order_id)) continue;
    const cur = stats.get(it.product_id) ?? { qty: 0, revenue: 0, orders: new Set() };
    cur.qty += it.quantity;
    cur.revenue += Number(it.total_price);
    cur.orders.add(it.order_id);
    stats.set(it.product_id, cur);
  }

  const totalRevenue = Array.from(stats.values()).reduce((s: number, v: any) => s + v.revenue, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Produtos</h1>
        <p className="text-sm text-muted-foreground">{products?.length ?? 0} produtos cadastrados · Taxa: 1 RON = {RON_TO_BRL} BRL</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>SKU / Variant ID</TableHead>
                <TableHead className="text-right">Preço (RON)</TableHead>
                <TableHead className="text-right">Preço (BRL)</TableHead>
                <TableHead className="text-right">Vendidos</TableHead>
                <TableHead className="text-right">Receita RON</TableHead>
                <TableHead className="text-right">Receita BRL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Editar preço</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(products ?? []).map((p: any) => {
                const s = stats.get(p.id) ?? { qty: 0, revenue: 0, orders: new Set() };
                const priceBRL = (Number(p.price) * RON_TO_BRL).toFixed(2);
                const revenueBRL = (s.revenue * RON_TO_BRL).toFixed(2);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-xs">
                      <div>{p.sku}</div>
                      <div className="text-muted-foreground">{p.ecomhub_variant_id}</div>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(p.price), "RON")}</TableCell>
                    <TableCell className="text-right text-green-700 font-medium">R$ {priceBRL}</TableCell>
                    <TableCell className="text-right">{s.qty}</TableCell>
                    <TableCell className="text-right">{formatCurrency(s.revenue, "RON")}</TableCell>
                    <TableCell className="text-right text-green-700 font-medium">R$ {revenueBRL}</TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                    <TableCell>
                      <ProductPriceEditor productId={p.id} currentPrice={Number(p.price)} currentCompare={Number(p.compare_at_price ?? 0)} />
                    </TableCell>
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
