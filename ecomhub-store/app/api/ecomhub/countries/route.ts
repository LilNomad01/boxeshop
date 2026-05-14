import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getEcomHubCountries } from "@/lib/ecomhub/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const result = await getEcomHubCountries();
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").toLowerCase();
  const filtered = q
    ? result.data.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.acronym.toLowerCase().includes(q)
      )
    : result.data;

  return NextResponse.json({ count: filtered.length, countries: filtered });
}
