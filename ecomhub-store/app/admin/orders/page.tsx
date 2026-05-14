import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Eye } from "lucide-react";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; sync?: string }>;
}) {
  const sp = await searchParams;
  const sb = createAdminClient();
  let q = sb.from("orders")
    .select("id, external_id, customer_name, customer_email, customer_phone, total_price, currency_code, status, ecomhub_sync_status, ecomhub_order_id, payment_method, shipping_country_code, shipping_city, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (sp.status) q = q.eq("status", sp.status);
  if (sp.sync) q = q.eq("ecomhub_sync_status", sp.sync);

  const { data: orders } = await q;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <p className="text-sm text-muted-foreground">Últimos 100 pedidos</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/admin/orders"><Button variant={!sp.status && !sp.sync ? "default" : "outline"} size="sm">Todos</Button></Link>
        <Link href="/admin/orders?sync=pending_ecomhub_sync"><Button variant={sp.sync === "pending_ecomhub_sync" ? "default" : "outline"} size="sm">Aguardam retry</Button></Link>
        <Link href="/admin/orders?sync=failed"><Button variant={sp.sync === "failed" ? "default" : "outline"} size="sm">Com erro</Button></Link>
        <Link href="/admin/orders?status=delivered"><Button variant={sp.status === "delivered" ? "default" : "outline"} size="sm">Entregues</Button></Link>
        <Link href="/admin/orders?status=cancelled"><Button variant={sp.status === "cancelled" ? "default" : "outline"} size="sm">Cancelados</Button></Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>EcomHub</TableHead>
                <TableHead>Data</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(orders ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    Nenhum pedido ainda.
                  </TableCell>
                </TableRow>
              ) : (
                (orders ?? []).map((o: any) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.customer_name}</TableCell>
                    <TableCell className="text-xs">
                      <div>{o.customer_email}</div>
                      <div className="text-muted-foreground">{o.customer_phone}</div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {o.shipping_city}, {o.shipping_country_code}
                    </TableCell>
                    <TableCell className="text-xs">{o.payment_method}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(Number(o.total_price), o.currency_code)}
                    </TableCell>
                    <TableCell><StatusBadge status={o.status} /></TableCell>
                    <TableCell><StatusBadge status={o.ecomhub_sync_status} /></TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{formatDate(o.created_at)}</TableCell>
                    <TableCell>
                      <Link href={`/admin/orders/${o.id}`}>
                        <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
