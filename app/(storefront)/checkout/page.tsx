import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { CheckoutForm } from "./checkout-form";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string }>;
}) {
  const sp = await searchParams;
  const sb = createAdminClient();
  const { data: product } = await sb
    .from("products")
    .select("id, name, price, currency_code, image_url, ecomhub_variant_id, status")
    .eq("id", sp.productId ?? "")
    .eq("status", "active")
    .maybeSingle();

  if (!product) redirect("/");

  return <CheckoutForm product={product} />;
}
