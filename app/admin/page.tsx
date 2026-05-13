import { Suspense } from "react";
import { StatsCard } from "@/components/admin/stats-card";
import { SalesChart } from "@/components/admin/sales-chart";
import { PeriodFilter } from "@/components/admin/period-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getRevenueStats, getOrdersStats, getSalesByDay, getOrdersByStatus,
  getPaymentMethods, getTopCountries, getBestSellingProducts, getEcomHubSyncStats,
  type Period,
} from "@/lib/analytics/queries";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, ShoppingBag, Package, AlertTriangle, TrendingUp, MapPin, CreditCard } from "lucide-react";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const sp = await searchParams;
  const period = (sp.period ?? "30d") as Period;

  const [revenue, orders, salesByDay, byStatus, byPayment, topCountries, topProducts, syncStats] =
    await Promise.all([
      getRevenueStats(period),
      getOrdersStats(period),
      getSalesByDay(period),
      getOrdersByStatus(period),
      getPaymentMethods(period),
      getTopCountries(period),
      getBestSellingProducts(period),
      getEcomHubSyncStats(),
    ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visão geral da sua loja</p>
        </div>
        <PeriodFilter />
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Receita total" value={formatCurrency(revenue.totalRevenue)} icon={DollarSign} />
        <StatsCard title="Pedidos" value={orders.total} icon={ShoppingBag} />
        <StatsCard title="Ticket médio" value={formatCurrency(revenue.avgTicket)} icon={TrendingUp} />
        <StatsCard
          title="Sync EcomHub"
          value={`${orders.synced} / ${orders.total}`}
          hint={`${orders.failed} com erro`}
          icon={Package}
        />
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Sincronizados" value={syncStats.synced} icon={Package} />
        <StatsCard title="Pendentes" value={syncStats.pending} icon={Package} />
        <StatsCard title="Aguardam retry" value={syncStats.pending_retry} icon={AlertTriangle} />
        <StatsCard title="Falhas totais" value={syncStats.failed} icon={AlertTriangle} />
      </div>

      <SalesChart data={salesByDay} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Package className="h-4 w-4" />Mais vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem vendas no período.</p>
            ) : (
              <ul className="space-y-2">
                {topProducts.map(p => (
                  <li key={p.product_id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.qty} unidades · {p.orders} pedidos</p>
                    </div>
                    <span className="text-sm font-semibold">{formatCurrency(p.revenue)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapPin className="h-4 w-4" />Países com mais pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            {topCountries.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem dados.</p>
            ) : (
              <ul className="space-y-2">
                {topCountries.map(c => (
                  <li key={c.country} className="flex justify-between items-center py-2 border-b last:border-0">
                    <span className="text-sm font-medium">{c.country}</span>
                    <div className="text-right">
                      <p className="text-sm">{c.orders} pedidos</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(c.revenue)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos por status</CardTitle>
          </CardHeader>
          <CardContent>
            {byStatus.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem dados.</p>
            ) : (
              <ul className="space-y-2">
                {byStatus.map(s => (
                  <li key={s.status} className="flex justify-between items-center py-2 border-b last:border-0">
                    <span className="text-sm capitalize">{s.status}</span>
                    <span className="text-sm font-semibold">{s.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CreditCard className="h-4 w-4" />Métodos de pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            {byPayment.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem dados.</p>
            ) : (
              <ul className="space-y-2">
                {byPayment.map(m => (
                  <li key={m.method} className="flex justify-between items-center py-2 border-b last:border-0">
                    <span className="text-sm">{m.method}</span>
                    <span className="text-sm font-semibold">{m.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
