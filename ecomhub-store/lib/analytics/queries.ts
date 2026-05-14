import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import { subDays, startOfDay, startOfMonth, format } from "date-fns";

export type Period = "today" | "yesterday" | "7d" | "30d" | "month" | { from: Date; to: Date };

export function periodToRange(p: Period): { from: Date; to: Date } {
  const now = new Date();
  if (typeof p === "object") return p;
  switch (p) {
    case "today": return { from: startOfDay(now), to: now };
    case "yesterday": {
      const y = startOfDay(subDays(now, 1));
      return { from: y, to: startOfDay(now) };
    }
    case "7d": return { from: subDays(startOfDay(now), 6), to: now };
    case "30d": return { from: subDays(startOfDay(now), 29), to: now };
    case "month": return { from: startOfMonth(now), to: now };
  }
}

export async function getRevenueStats(period: Period) {
  const sb = createAdminClient();
  const { from, to } = periodToRange(period);
  const { data } = await sb
    .from("orders")
    .select("total_price, status")
    .gte("created_at", from.toISOString())
    .lte("created_at", to.toISOString())
    .neq("status", "cancelled");

  const totalRevenue = (data ?? []).reduce((s, o) => s + Number(o.total_price), 0);
  const totalOrders = data?.length ?? 0;
  const avgTicket = totalOrders ? totalRevenue / totalOrders : 0;
  return { totalRevenue, totalOrders, avgTicket };
}

export async function getOrdersStats(period: Period) {
  const sb = createAdminClient();
  const { from, to } = periodToRange(period);
  const { data } = await sb
    .from("orders")
    .select("status, ecomhub_sync_status")
    .gte("created_at", from.toISOString())
    .lte("created_at", to.toISOString());

  const total = data?.length ?? 0;
  const synced = (data ?? []).filter(o => o.ecomhub_sync_status === "synced").length;
  const failed = (data ?? []).filter(o =>
    o.ecomhub_sync_status === "failed" || o.ecomhub_sync_status === "pending_ecomhub_sync"
  ).length;

  return { total, synced, failed };
}

export async function getSalesByDay(period: Period) {
  const sb = createAdminClient();
  const { from, to } = periodToRange(period);
  const { data } = await sb
    .from("orders")
    .select("created_at, total_price")
    .gte("created_at", from.toISOString())
    .lte("created_at", to.toISOString())
    .neq("status", "cancelled")
    .order("created_at", { ascending: true });

  const map = new Map<string, { date: string; revenue: number; orders: number }>();
  for (const o of data ?? []) {
    const day = format(new Date(o.created_at), "yyyy-MM-dd");
    const cur = map.get(day) ?? { date: day, revenue: 0, orders: 0 };
    cur.revenue += Number(o.total_price);
    cur.orders += 1;
    map.set(day, cur);
  }
  return Array.from(map.values());
}

export async function getOrdersByStatus(period: Period) {
  const sb = createAdminClient();
  const { from, to } = periodToRange(period);
  const { data } = await sb
    .from("orders")
    .select("status")
    .gte("created_at", from.toISOString())
    .lte("created_at", to.toISOString());

  const counts = new Map<string, number>();
  for (const o of data ?? []) counts.set(o.status, (counts.get(o.status) ?? 0) + 1);
  return Array.from(counts, ([status, count]) => ({ status, count }));
}

export async function getPaymentMethods(period: Period) {
  const sb = createAdminClient();
  const { from, to } = periodToRange(period);
  const { data } = await sb
    .from("orders")
    .select("payment_method")
    .gte("created_at", from.toISOString())
    .lte("created_at", to.toISOString());

  const counts = new Map<string, number>();
  for (const o of data ?? []) counts.set(o.payment_method, (counts.get(o.payment_method) ?? 0) + 1);
  return Array.from(counts, ([method, count]) => ({ method, count }));
}

export async function getTopCountries(period: Period, limit = 10) {
  const sb = createAdminClient();
  const { from, to } = periodToRange(period);
  const { data } = await sb
    .from("orders")
    .select("shipping_country_code, shipping_city, total_price")
    .gte("created_at", from.toISOString())
    .lte("created_at", to.toISOString())
    .neq("status", "cancelled");

  const counts = new Map<string, { country: string; orders: number; revenue: number }>();
  for (const o of data ?? []) {
    const key = o.shipping_country_code;
    const cur = counts.get(key) ?? { country: key, orders: 0, revenue: 0 };
    cur.orders += 1;
    cur.revenue += Number(o.total_price);
    counts.set(key, cur);
  }
  return Array.from(counts.values()).sort((a, b) => b.orders - a.orders).slice(0, limit);
}

export async function getBestSellingProducts(period: Period, limit = 10) {
  const sb = createAdminClient();
  const { from, to } = periodToRange(period);

  const { data: orders } = await sb
    .from("orders")
    .select("id")
    .gte("created_at", from.toISOString())
    .lte("created_at", to.toISOString())
    .neq("status", "cancelled");

  const orderIds = (orders ?? []).map(o => o.id);
  if (!orderIds.length) return [];

  const { data: items } = await sb
    .from("order_items")
    .select("product_id, product_name, quantity, total_price")
    .in("order_id", orderIds);

  const map = new Map<string, { product_id: string; name: string; qty: number; revenue: number; orders: number }>();
  for (const it of items ?? []) {
    const key = it.product_id ?? it.product_name;
    const cur = map.get(key) ?? { product_id: key, name: it.product_name, qty: 0, revenue: 0, orders: 0 };
    cur.qty += it.quantity;
    cur.revenue += Number(it.total_price);
    cur.orders += 1;
    map.set(key, cur);
  }
  return Array.from(map.values()).sort((a, b) => b.qty - a.qty).slice(0, limit);
}

export async function getEcomHubSyncStats() {
  const sb = createAdminClient();
  const { data } = await sb
    .from("orders")
    .select("ecomhub_sync_status");

  const counts = { synced: 0, pending: 0, failed: 0, pending_retry: 0 };
  for (const o of data ?? []) {
    if (o.ecomhub_sync_status === "synced") counts.synced++;
    else if (o.ecomhub_sync_status === "failed") counts.failed++;
    else if (o.ecomhub_sync_status === "pending_ecomhub_sync") counts.pending_retry++;
    else counts.pending++;
  }
  return counts;
}
