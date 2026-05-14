import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { createEcomHubOrder, getEcomHubCountries } from "@/lib/ecomhub/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const orderId: string | undefined = body.orderId;

    const sb = createAdminClient();

    // 1) Busca moedas corretas da EcomHub
    let currencyMap = new Map<number, string>();
    try {
      const countriesResult = await getEcomHubCountries();
      if (countriesResult.ok) {
        for (const c of countriesResult.data) {
          if (c.currencies?.code) {
            currencyMap.set(c.id, c.currencies.code);
          }
        }
      }
    } catch (err) {
      console.log("[retry] failed to fetch countries, using EUR fallback");
    }

    // 2) Busca pedidos pendentes
    let q = sb.from("orders")
      .select("id, external_id, total_price, currency_code, payment_method, customer_name, customer_email, customer_phone, shipping_country_code, shipping_country_id, shipping_city, shipping_province, shipping_address1, shipping_address2, shipping_postal_code")
      .in("ecomhub_sync_status", ["pending_ecomhub_sync", "failed", "pending"]);
    if (orderId) q = q.eq("id", orderId);

    const { data: orders, error } = await q;
    if (error) {
      console.error("[retry] query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ processed: 0, results: [], message: "Nenhum pedido pendente" });
    }

    const results: any[] = [];
    for (const o of orders) {
      const { data: items } = await sb
        .from("order_items")
        .select("variant_id, quantity")
        .eq("order_id", o.id);

      const nameParts = (o.customer_name || "").split(" ");
      const firstName = nameParts[0] || "Cliente";
      const lastName = nameParts.slice(1).join(" ") || firstName;

      // Usa moeda da EcomHub, não do banco
      const ecomhubCurrency = currencyMap.get(o.shipping_country_id) || "EUR";

      const payload = {
        price: Number(o.total_price),
        currency_code: ecomhubCurrency,
        paymentMethod: o.payment_method as any,
        external_id: o.external_id,
        shippingAddress: {
          countryCode: o.shipping_country_code,
          province: o.shipping_province,
          address1: o.shipping_address1,
          address2: o.shipping_address2 ?? undefined,
          postalCode: o.shipping_postal_code || "000000",
          name: firstName,
          firstName,
          lastName,
          phone: o.customer_phone,
          email: o.customer_email,
          country_id: o.shipping_country_id,
          city: o.shipping_city,
        },
        lineItems: (items ?? []).map((i: any) => ({ id: i.variant_id, quantity: i.quantity })),
      };

      console.log("[retry] sending order", o.id, "currency:", ecomhubCurrency, "payload:", JSON.stringify(payload));

      const result = await createEcomHubOrder(payload);

      console.log("[retry] result:", JSON.stringify(result));

      await sb.from("ecomhub_logs").insert({
        order_id: o.id,
        action: "retry_create_order",
        request_payload: payload,
        response_payload: result.ok ? result.data : { error: result.error },
        status: result.ok ? "success" : "error",
        error_code: result.ok ? null : result.error.code,
        error_context: result.ok ? null : result.error.context,
        http_status: result.httpStatus,
        duration_ms: result.durationMs,
      });

      if (result.ok) {
        await sb.from("orders").update({
          ecomhub_order_id: result.data.id,
          ecomhub_sync_status: "synced",
          ecomhub_synced_at: new Date().toISOString(),
          ecomhub_error_code: null,
          ecomhub_error_context: null,
        }).eq("id", o.id);
        results.push({ orderId: o.id, ok: true, ecomhubId: result.data.id });
      } else {
        await sb.from("orders").update({
          ecomhub_sync_status: "pending_ecomhub_sync",
          ecomhub_error_code: result.error.code,
          ecomhub_error_context: result.error.context,
        }).eq("id", o.id);
        results.push({ orderId: o.id, ok: false, error: result.error });
      }
    }

    return NextResponse.json({ processed: results.length, results });
  } catch (err: any) {
    console.error("[retry] unexpected error:", err);
    return NextResponse.json({ error: err.message || "Erro interno" }, { status: 500 });
  }
}
