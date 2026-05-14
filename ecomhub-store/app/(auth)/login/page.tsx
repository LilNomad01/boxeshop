import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

async function login(formData: FormData) {
  "use server";
  const sb = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`);
  }
  // Garante que vai pra rota /admin (ou a que o usuário tentou)
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next ?? "/admin";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Entrar no painel</CardTitle>
          <CardDescription>Use suas credenciais de admin</CardDescription>
        </CardHeader>
        <CardContent>
          {sp.error && (
            <div className="mb-4 p-3 text-sm bg-red-50 border border-red-200 text-red-700 rounded">
              {sp.error === "not_admin"
                ? "Esse usuário não tem permissão de admin. Verifique se ele foi adicionado na tabela admin_users."
                : sp.error}
            </div>
          )}
          <form action={login} className="space-y-4">
            <input type="hidden" name="next" value={next} />
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input type="email" name="email" required autoComplete="email" />
            </div>
            <div>
              <label className="text-sm font-medium">Senha</label>
              <Input type="password" name="password" required autoComplete="current-password" />
            </div>
            <Button type="submit" className="w-full">Entrar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
