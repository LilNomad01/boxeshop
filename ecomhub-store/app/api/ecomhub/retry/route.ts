import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { createEcomHubOrder, getEcomHubCountries } from "@/lib/ecomhub/client";

/**
 * POST /api/ecomhub/retry
 * Body: { orderId?: string }  — se omitido, tenta TODOS pendentes
 */
export async function POST(req: Request) {
  // Auth check
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: admin } = await sb.from("admin_users").select("id").eq("id", user.id).maybeSingle();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const orderId: string | undefined = body.orderId;

  const adminSb = createAdminClient();
  let q = adminSb.from("orders")
    .select("id, external_id, total_price, currency_code, payment_method, customer_name, customer_email, customer_phone, shipping_country_code, shipping_country_id, shipping_city, shipping_province, shipping_address1, shipping_address2, shipping_postal_code")
    .in("ecomhub_sync_status", ["pending_ecomhub_sync", "failed"]);
  if (orderId) q = q.eq("id", orderId);

  const { data: orders, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const countriesResult = await getEcomHubCountries();
  const countriesMap = new Map<number, string>();
  if (countriesResult.ok) {
    for (const c of countriesResult.data) {
      if (c.currencies?.code) countriesMap.set(c.id, c.currencies.code);
    }
  }

  const results: any[] = [];
  for (const o of orders ?? []) {
    const { data: items } = await adminSb
      .from("order_items")
      .select("variant_id, quantity")
      .eq("order_id", o.id);

    const [firstName, ...rest] = o.customer_name.split(" ");
    const lastName = rest.join(" ") || firstName;

    const ecomhubCurrency = countriesMap.get(o.shipping_country_id) ?? "EUR";

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
        postalCode: o.shipping_postal_code,
        name: firstName,
        firstName,
        lastName,
        phone: o.customer_phone,
        email: o.customer_email,
        country_id: o.shipping_country_id,
        city: o.shipping_city,
      },
      lineItems: (items ?? []).map(i => ({ id: i.variant_id, quantity: i.quantity })),
    };

    const result = await createEcomHubOrder(payload);

    await adminSb.from("ecomhub_logs").insert({
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
      await adminSb.from("orders").update({
        ecomhub_order_id: result.data.id,
        ecomhub_sync_status: "synced",
        ecomhub_synced_at: new Date().toISOString(),
        ecomhub_error_code: null,
        ecomhub_error_context: null,
      }).eq("id", o.id);
      results.push({ orderId: o.id, ok: true, ecomhubId: result.data.id });
    } else {
      await adminSb.from("orders").update({
        ecomhub_error_code: result.error.code,
        ecomhub_error_context: result.error.context,
      }).eq("id", o.id);
      results.push({ orderId: o.id, ok: false, error: result.error });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
