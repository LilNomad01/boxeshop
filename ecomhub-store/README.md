# EcomHub Store — Guia rápido

## ⚡ Pra rodar agora

### 1. Instalar dependências

```bash
cd ~/Downloads/ecomhub-store
npm install --legacy-peer-deps
```

### 2. Configurar credenciais

Abre o arquivo `.env.local`:

```bash
open -a TextEdit .env.local
```

**ANTES DE EDITAR**: no TextEdit, vai em **Format → Make Plain Text** (Cmd + Shift + T). Isso é OBRIGATÓRIO senão o Mac salva como rich text e quebra tudo.

Depois preenche cada linha trocando o placeholder pelo valor real:

```
ECOMHUB_TOKEN=cole_aqui_seu_token_real
ECOMHUB_SECRET=cole_aqui_seu_secret_real
ECOMHUB_BASE_URL=https://api.ecomhub.app
NEXT_PUBLIC_SUPABASE_URL=https://eyqfnxedetfmhixpdooh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=cole_aqui_anon_key_real
SUPABASE_SERVICE_ROLE_KEY=cole_aqui_service_role_real
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Salva (Cmd + S) e fecha.

**Confere se ficou certo:**

```bash
cat .env.local
```

A primeira linha tem que ser `ECOMHUB_TOKEN=...` (sem `cat`, sem `EOF`, sem aspas simples no início).

### 3. Rodar a migration de fix do RLS

⚠️ **IMPORTANTE**: o admin não consegue logar até você rodar isso.

No Supabase → **SQL Editor → New query** → cola e executa:

```sql
drop policy if exists "admins_all_admin_users" on public.admin_users;

create policy "admin_self_read" on public.admin_users
  for select to authenticated
  using (id = auth.uid());

create policy "admins_modify_admin_users" on public.admin_users
  for all to authenticated
  using (exists (select 1 from public.admin_users where id = auth.uid()))
  with check (exists (select 1 from public.admin_users where id = auth.uid()));
```

(Esse SQL também está em `supabase/migrations/002_fix_rls_admin_users.sql`)

### 4. Rodar o servidor

```bash
npm run dev
```

Abre em http://localhost:3000

### 5. Login no admin

Aba anônima → http://localhost:3000/login → email + senha que você criou no Supabase Auth.

---

## 🐛 O que foi arrumado nessa versão

1. **`.env.local` corrompido** — recriado vazio com placeholders certos
2. **Login no admin não funcionava** — RLS da tabela `admin_users` causava deadlock. Migration 002 corrige.
3. **Middleware mais resiliente** — usa service_role pra checar admin, com tratamento de erro
4. **Logout simplificado** — link direto que funciona com GET
5. **Login redireciona pro `next` param** — se você tentou acessar `/admin/orders` direto, depois de logar volta pra lá

---

## 🧪 Como testar a integração com EcomHub

### Teste 1: Conexão
- Em `/admin/ecomhub` clica em **"Testar conexão"**
- Confirma se sua loja aparece + lista de países

### Teste 2: Pedido
- Faz um pedido em `/` (preenche o checkout)
- Vai em `/admin/orders` e clica no pedido
- Lá embaixo tem **Logs EcomHub** com payload, resposta e erro (se houver)

### Teste 3: Retry
- Se um pedido der erro, em `/admin/ecomhub` clica em **Reenviar pendentes**

---

## ⚠️ Atenção

**country_id da Romênia está hardcoded como 1** no checkout. Esse pode não ser o ID real.

Pra descobrir o ID correto:
1. Faz Teste 1 acima
2. O resultado mostra "Países disponíveis: X países" + sample dos primeiros 5
3. Encontra "România" e pega o `id`
4. Edita `app/(storefront)/checkout/checkout-form.tsx`, troca `id: 1` pelo ID real
