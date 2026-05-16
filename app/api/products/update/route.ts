import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, price, compareAtPrice } = body;

    if (!productId || !price) {
      return NextResponse.json({ error: "productId e price são obrigatórios" }, { status: 400 });
    }

    const sb = createAdminClient();
    const { error } = await sb.from("products").update({
      price: Number(price),
      compare_at_price: compareAtPrice ? Number(compareAtPrice) : null,
    }).eq("id", productId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
