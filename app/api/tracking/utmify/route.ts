/**
 * ─────────────────────────────────────────────────────────────────────────────
 * UTMIFY — Route Handler (Next.js App Router)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * CONFIGURAÇÃO NO .env.local:
 *   UTMIFY_API_TOKEN=seu_token_utmify_aqui
 *
 * Recebe o payload montado por lib/tracking/utmify.ts e repassa à API da Utmify.
 * Se o token não estiver configurado, retorna "skipped" silenciosamente.
 */

import { NextRequest, NextResponse } from "next/server";

const API_TOKEN = process.env.UTMIFY_API_TOKEN ?? "";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!API_TOKEN) {
    return NextResponse.json({ status: "skipped", reason: "no_token" });
  }

  try {
    const res  = await fetch("https://api.utmify.com.br/api-credentials/orders", {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-token":  API_TOKEN,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
