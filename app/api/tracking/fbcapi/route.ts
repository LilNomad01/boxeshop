/**
 * ─────────────────────────────────────────────────────────────────────────────
 * FACEBOOK CONVERSIONS API — Route Handler (Next.js App Router)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * CONFIGURAÇÃO NO .env.local:
 *   NEXT_PUBLIC_FB_PIXEL_ID=seu_pixel_id
 *   FB_ACCESS_TOKEN=seu_access_token_da_capi
 *   FB_TEST_EVENT_CODE=TEST12345   (opcional — apenas para testes no Events Manager)
 *
 * Este handler recebe os dados do cliente (lib/tracking/fbevents.ts),
 * faz hash SHA-256 nos dados pessoais e envia à Graph API do Facebook.
 * O event_id garante a deduplicação entre Pixel e CAPI.
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const PIXEL_ID     = process.env.NEXT_PUBLIC_FB_PIXEL_ID ?? "";
const ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN         ?? "";

function sha256(value: string) {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Dados do utilizador (hashed)
  const userData: Record<string, string> = {
    client_ip_address: req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "",
    client_user_agent: req.headers.get("user-agent") ?? "",
  };
  if (body.external_id) userData.external_id = sha256(body.external_id);
  if (body.email)       userData.em           = sha256(body.email);
  if (body.phone)       userData.ph           = sha256(body.phone.replace(/\D/g, ""));
  if (body.fn)          userData.fn           = sha256(body.fn);
  if (body.ln)          userData.ln           = sha256(body.ln);
  if (body.fbp)         userData.fbp          = body.fbp;
  if (body.fbc)         userData.fbc          = body.fbc;

  // Dados do evento
  const customData: Record<string, unknown> = {
    currency:     body.currency     ?? "EUR",
    content_type: body.content_type ?? "product",
  };
  if (body.value        !== undefined) customData.value        = body.value;
  if (body.contents)                   customData.contents     = body.contents;
  if (body.num_items    !== undefined) customData.num_items    = body.num_items;
  if (body.content_name)               customData.content_name = body.content_name;
  if (body.content_ids)                customData.content_ids  = body.content_ids;
  else if (body.contents)              customData.content_ids  = body.contents.map((c: { id: string }) => c.id);

  const event = {
    event_name:       body.event_name,
    event_time:       Math.floor(Date.now() / 1000),
    event_id:         body.event_id,
    event_source_url: body.event_source_url,
    action_source:    "website",
    user_data:        userData,
    custom_data:      customData,
  };

  // Se não há token configurado, ignora silenciosamente
  if (!ACCESS_TOKEN) {
    return NextResponse.json({ status: "skipped", reason: "no_token" });
  }

  const url     = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;
  const payload: Record<string, unknown> = { data: [event] };
  if (process.env.FB_TEST_EVENT_CODE) payload.test_event_code = process.env.FB_TEST_EVENT_CODE;

  try {
    const res  = await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
