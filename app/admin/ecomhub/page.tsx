import { createAdminClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { EcomHubActions } from "./actions";

export default async function EcomHubPage() {
  const sb = createAdminClient();

  const [{ data: pending }, { data: logs }] = await Promise.all([
    sb.from("orders")
      .select("id, external_id, customer_name, total_price, currency_code, ecomhub_error_code, ecomhub_error_context, created_at")
      .in("ecomhub_sync_status", ["pending_ecomhub_sync", "failed"])
      .order("created_at", { ascending: false })
      .limit(50),
    sb.from("ecomhub_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Integração EcomHub</h1>
        <p className="text-sm text-muted-foreground">Conexão, sincronização e logs</p>
      </div>

      <EcomHubActions hasPending={(pending?.length ?? 0) > 0} />

      <Card>
        <CardHeader>
          <CardTitle>Pedidos pendentes ({pending?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {(pending ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground p-6">Tudo sincronizado 🎉</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Erro</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(pending ?? []).map((o: any) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">#{o.external_id.slice(0, 8)}</TableCell>
                    <TableCell>{o.customer_name}</TableCell>
                    <TableCell className="text-xs">
                      <p className="font-medium text-red-600">{o.ecomhub_error_code}</p>
                      <p className="text-muted-foreground">{o.ecomhub_error_context}</p>
                    </TableCell>
                    <TableCell className="text-xs">{formatDate(o.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de chamadas (últimas 30)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>HTTP</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Erro</TableHead>
                <TableHead>Quando</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(logs ?? []).map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell className="text-xs">{l.action}</TableCell>
                  <TableCell><StatusBadge status={l.status === "success" ? "synced" : "failed"} /></TableCell>
                  <TableCell className="text-xs">{l.http_status}</TableCell>
                  <TableCell className="text-xs">{l.duration_ms}ms</TableCell>
                  <TableCell className="text-xs">{l.error_code ?? "—"}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{formatDate(l.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
