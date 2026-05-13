import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const sb = await createClient();
  await sb.auth.signOut();

  // Redireciona pro login usando a URL da própria request (mais confiável que env var)
  return NextResponse.redirect(new URL("/login", req.url), { status: 303 });
}

// Permite GET também pra facilitar (usuário pode acessar /api/auth/logout direto)
export async function GET(req: NextRequest) {
  return POST(req);
}
