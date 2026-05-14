import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getEcomHubStore, getEcomHubCountries } from "@/lib/ecomhub/client";

export async function GET() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [store, countries] = await Promise.all([
    getEcomHubStore(),
    getEcomHubCountries(),
  ]);

  return NextResponse.json({
    store: store.ok ? store.data : { error: store.error },
    countries: countries.ok ? { count: countries.data.length, sample: countries.data.slice(0, 5) } : { error: countries.error },
    storeOk: store.ok,
    countriesOk: countries.ok,
  });
}
