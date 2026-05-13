-- =============================================================
-- FIX RLS: Permite usuários autenticados lerem o PRÓPRIO registro
-- na tabela admin_users (necessário pra middleware checar role)
-- =============================================================

-- Remove a policy genérica antiga que causava deadlock
drop policy if exists "admins_all_admin_users" on public.admin_users;

-- Recria com regra mais granular:
-- 1) Qualquer authenticated pode ler SEU PRÓPRIO registro (pra middleware)
create policy "admin_self_read" on public.admin_users
  for select to authenticated
  using (id = auth.uid());

-- 2) Apenas admins podem inserir/atualizar/deletar admin_users
create policy "admins_modify_admin_users" on public.admin_users
  for all to authenticated
  using (exists (select 1 from public.admin_users where id = auth.uid()))
  with check (exists (select 1 from public.admin_users where id = auth.uid()));
