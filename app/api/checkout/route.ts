import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { createEcomHubOrder, getEcomHubCountries } from "@/lib/ecomhub/client";

export const dynamic = "force-dynamic";

const checkoutSchema = z.object({
  customer: z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email().nullable().optional(),
    phone: z.string().min(5).max(30),
  }),
  shipping: z.object({
    countryCode: z.string().length(2),
    country_id: z.number().int(),
    city: z.string().min(1).max(100),
    province: z.string().nullable().optional(),
    address1: z.string().min(1).max(200),
    address2: z.string().max(200).optional(),
    postalCode: z.string().min(1).max(20),
  }),
  paymentMethod: z.enum(["card", "paypal", "transfer", "cash on delivery", "financial", "other"]),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
  })).min(1),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validação falhou", details: parsed.error.format() },
      { status: 400 }
    );
  }
  const data = parsed.data;
  const sb = createAdminClient();

  // Moeda da carteira EcomHub (a loja opera em EUR)
  const ecomhubCurrency = "EUR";

  // 2) Buscar produtos
  const productIds = data.items.map((i: any) => i.productId);
  const { data: products, error: prodErr } = await sb
    .from("products")
    .select("id, name, price, currency_code, ecomhub_variant_id, status")
    .in("id", productIds);

  if (prodErr || !products?.length) {
    return NextResponse.json({ error: "Produtos não encontrados" }, { status: 404 });
  }
  if (products.find((p: any) => p.status !== "active")) {
    return NextResponse.json({ error: "Produto indisponível" }, { status: 400 });
  }

  // 3) Calcular total no servidor
  let totalPrice = 0;
  const dbCurrency = (products[0] as any).currency_code ?? "RON";
  const lineItemsForDb: any[] = [];
  const lineItemsForEcomhub: { id: string; quantity: number }[] = [];

  for (const item of data.items) {
    const p = products.find((x: any) => x.id === item.productId) as any;
    if (!p) continue;
    const lineTotal = Number(p.price) * item.quantity;
    totalPrice += lineTotal;
    lineItemsForDb.push({
      product_id: p.id,
      product_name: p.name,
      variant_id: p.ecomhub_variant_id,
      quantity: item.quantity,
      unit_price: p.price,
      total_price: lineTotal,
    });
    lineItemsForEcomhub.push({ id: p.ecomhub_variant_id, quantity: item.quantity });
  }

  // 4) Criar pedido no banco (usa moeda local RON)
  const externalId = crypto.randomUUID();
  const { data: order, error: orderErr } = await sb
    .from("orders")
    .insert({
      external_id: externalId,
      customer_name: `${data.customer.firstName} ${data.customer.lastName}`.trim(),
      customer_email: data.customer.email ?? null,
      customer_phone: data.customer.phone,
      shipping_country_code: data.shipping.countryCode,
      shipping_country_id: data.shipping.country_id,
      shipping_city: data.shipping.city,
      shipping_province: data.shipping.province ?? null,
      shipping_address1: data.shipping.address1,
      shipping_address2: data.shipping.address2 ?? null,
      shipping_postal_code: data.shipping.postalCode,
      total_price: totalPrice,
      currency_code: dbCurrency,
      payment_method: data.paymentMethod,
      status: "pending",
      ecomhub_sync_status: "pending",
    })
    .select("id, external_id")
    .single();

  if (orderErr || !order) {
    console.error("[checkout] insert order failed:", orderErr);
    return NextResponse.json({ error: "Falha ao criar pedido" }, { status: 500 });
  }

  await sb.from("order_items").insert(
    lineItemsForDb.map((li: any) => ({ ...li, order_id: order.id }))
  );

  // 5) Enviar para EcomHub (usa moeda da EcomHub, NÃO a do banco)
  const payload = {
    price: totalPrice,
    currency_code: "EUR",
    paymentMethod: data.paymentMethod,
    external_id: externalId,
    shippingAddress: {
      countryCode: data.shipping.countryCode,
      province: data.shipping.province ?? null,
      address1: data.shipping.address1,
      address2: data.shipping.address2,
      postalCode: data.shipping.postalCode,
      name: data.customer.firstName,
      firstName: data.customer.firstName,
      lastName: data.customer.lastName,
      phone: data.customer.phone,
      email: data.customer.email ?? null,
      country_id: data.shipping.country_id,
      city: data.shipping.city,
    },
    lineItems: lineItemsForEcomhub,
  };

  console.log("[checkout] sending to ecomhub:", JSON.stringify(payload));

  const result = await createEcomHubOrder(payload);

  console.log("[checkout] ecomhub response:", JSON.stringify(result));

  // 6) Logar
  await sb.from("ecomhub_logs").insert({
    order_id: order.id,
    action: "create_order",
    request_payload: payload,
    response_payload: result.ok ? result.data : { error: result.error },
    status: result.ok ? "success" : "error",
    error_code: result.ok ? null : result.error.code,
    error_context: result.ok ? null : result.error.context,
    http_status: result.httpStatus,
    duration_ms: result.durationMs,
  });

  // 7) Atualizar pedido
  if (result.ok) {
    await sb.from("orders").update({
      ecomhub_order_id: result.data.id,
      ecomhub_sync_status: "synced",
      ecomhub_synced_at: new Date().toISOString(),
    }).eq("id", order.id);
  } else {
    await sb.from("orders").update({
      ecomhub_sync_status: "pending_ecomhub_sync",
      ecomhub_error_code: result.error.code,
      ecomhub_error_context: result.error.context,
    }).eq("id", order.id);
  }

  return NextResponse.json({
    success: true,
    orderId: order.id,
    externalId: order.external_id,
    syncStatus: result.ok ? "synced" : "pending_retry",
  });
}
