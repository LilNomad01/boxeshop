import { createServerClient } from "@supabase/ssr";
import { createClient as createSb } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  // REGRA 1: /login NUNCA redireciona. Sempre mostra a página.
  // Isso previne qualquer loop de redirect.
  if (path === "/login") {
    return response;
  }

  // REGRA 2: /api/* nunca redireciona (APIs tratam auth internamente)
  if (path.startsWith("/api/")) {
    return response;
  }

  // Se Supabase não está configurado, deixa passar
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  // Refresh do token via cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(toSet: any[]) {
          toSet.forEach(({ name, value }: any) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }: any) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // REGRA 3: Só rotas /admin são protegidas
  if (path.startsWith("/admin")) {
    // Não logado → login
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", path);
      return NextResponse.redirect(loginUrl);
    }

    // Logado → checa se é admin usando service_role (bypassa RLS)
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[middleware] SUPABASE_SERVICE_ROLE_KEY missing");
      return NextResponse.redirect(new URL("/login?error=server_error", request.url));
    }

    try {
      const sb = createSb(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
      );

      const { data: admin } = await sb
        .from("admin_users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!admin) {
        // Não é admin → faz signOut pra limpar cookies e manda pro login
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL("/login?error=not_admin", request.url));
      }
    } catch (err) {
      console.error("[middleware] admin check failed:", err);
      return NextResponse.redirect(new URL("/login?error=server_error", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
