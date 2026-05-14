import { createServerClient } from "@supabase/ssr";
import { createClient as createSb } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

// Cliente admin (service_role) que bypassa RLS
function adminClient() {
  return createSb(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  // Se as variáveis não estão setadas, deixa passar pra evitar tela branca total
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("[middleware] Supabase env vars missing");
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(toSet) {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Rotas /admin são protegidas
  if (path.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", path);
      return NextResponse.redirect(loginUrl);
    }

    // Checa se é admin usando service_role (bypassa RLS)
    try {
      const sb = adminClient();
      const { data: admin } = await sb
        .from("admin_users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!admin) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("error", "not_admin");
        return NextResponse.redirect(loginUrl);
      }
    } catch (err) {
      console.error("[middleware] admin check failed:", err);
      // Em caso de erro, redireciona pro login
      return NextResponse.redirect(new URL("/login?error=server_error", request.url));
    }
  }

  // Se já logado E é admin, /login redireciona pro /admin
  if (path === "/login" && user) {
    try {
      const sb = adminClient();
      const { data: admin } = await sb
        .from("admin_users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
      if (admin) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    } catch { /* deixa fluir pro /login */ }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
