-- =============================================================
-- EcomHub Store - Schema Inicial
-- =============================================================

-- Extensões
create extension if not exists "uuid-ossp";

-- =============================================================
-- ADMIN USERS (perfil estendendo auth.users do Supabase)
-- =============================================================
create table public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'admin' check (role in ('admin','super_admin')),
  created_at timestamptz default now() not null
);

-- =============================================================
-- PRODUCTS
-- =============================================================
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  sku text unique,
  ecomhub_variant_id text not null,
  description text,
  price numeric(10,2) not null,
  compare_at_price numeric(10,2),
  currency_code text not null default 'RON',
  image_url text,
  status text not null default 'active' check (status in ('active','draft','archived')),
  stock integer,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
create index idx_products_status on public.products(status);
create index idx_products_slug on public.products(slug);

-- =============================================================
-- ORDERS
-- =============================================================
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  external_id text not null unique,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  shipping_country_code text not null,
  shipping_country_id integer not null,
  shipping_city text not null,
  shipping_province text,
  shipping_address1 text not null,
  shipping_address2 text,
  shipping_postal_code text not null,
  total_price numeric(10,2) not null,
  currency_code text not null default 'RON',
  payment_method text not null check (payment_method in ('card','paypal','transfer','cash on delivery','financial','other')),
  status text not null default 'pending' check (status in ('pending','paid','shipped','delivered','cancelled','refunded')),
  ecomhub_order_id text,
  ecomhub_sync_status text not null default 'pending' check (ecomhub_sync_status in ('pending','synced','failed','pending_ecomhub_sync')),
  ecomhub_error_code text,
  ecomhub_error_context text,
  ecomhub_synced_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
create index idx_orders_status on public.orders(status);
create index idx_orders_sync on public.orders(ecomhub_sync_status);
create index idx_orders_created on public.orders(created_at desc);
create index idx_orders_email on public.orders(customer_email);

-- =============================================================
-- ORDER ITEMS
-- =============================================================
create table public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  variant_id text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null,
  total_price numeric(10,2) not null,
  ecomhub_line_item_id text,
  created_at timestamptz default now() not null
);
create index idx_order_items_order on public.order_items(order_id);
create index idx_order_items_product on public.order_items(product_id);

-- =============================================================
-- ECOMHUB LOGS (auditoria de toda chamada para a API)
-- =============================================================
create table public.ecomhub_logs (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete set null,
  action text not null,
  request_payload jsonb,
  response_payload jsonb,
  status text not null check (status in ('success','error')),
  error_code text,
  error_context text,
  http_status integer,
  duration_ms integer,
  created_at timestamptz default now() not null
);
create index idx_logs_order on public.ecomhub_logs(order_id);
create index idx_logs_status on public.ecomhub_logs(status);
create index idx_logs_created on public.ecomhub_logs(created_at desc);

-- =============================================================
-- TRIGGER: updated_at automático
-- =============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_products_updated before update on public.products
  for each row execute function public.set_updated_at();
create trigger trg_orders_updated before update on public.orders
  for each row execute function public.set_updated_at();

-- =============================================================
-- RLS (Row Level Security)
-- Tudo bloqueado por padrão. Apenas admins acessam via service_role.
-- =============================================================
alter table public.admin_users enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.ecomhub_logs enable row level security;

-- Admins podem ler/escrever tudo
create policy "admins_all_admin_users" on public.admin_users for all to authenticated
  using (exists (select 1 from public.admin_users where id = auth.uid()))
  with check (exists (select 1 from public.admin_users where id = auth.uid()));

create policy "admins_all_products" on public.products for all to authenticated
  using (exists (select 1 from public.admin_users where id = auth.uid()))
  with check (exists (select 1 from public.admin_users where id = auth.uid()));

create policy "admins_all_orders" on public.orders for all to authenticated
  using (exists (select 1 from public.admin_users where id = auth.uid()))
  with check (exists (select 1 from public.admin_users where id = auth.uid()));

create policy "admins_all_order_items" on public.order_items for all to authenticated
  using (exists (select 1 from public.admin_users where id = auth.uid()))
  with check (exists (select 1 from public.admin_users where id = auth.uid()));

create policy "admins_all_ecomhub_logs" on public.ecomhub_logs for all to authenticated
  using (exists (select 1 from public.admin_users where id = auth.uid()))
  with check (exists (select 1 from public.admin_users where id = auth.uid()));

-- Storefront público pode ler apenas products ativos (consulta anônima)
create policy "public_read_active_products" on public.products for select to anon
  using (status = 'active');

-- =============================================================
-- SEED: produto JBL Boombox (já cadastrado pra você)
-- =============================================================
insert into public.products (name, slug, sku, ecomhub_variant_id, description, price, compare_at_price, currency_code, image_url, status)
values (
  'JBL Boombox Bluetooth',
  'jbl-boombox-bluetooth',
  'JBL-BOOMBOX-001',
  'TROCAR_PELO_VARIANT_ID_REAL_DA_ECOMHUB',
  'Boxă Bluetooth puternică cu sunet masiv JBL, încărcare USB-C, IP68 și autonomie pentru toată ziua.',
  49.00,
  100.00,
  'RON',
  '/images/01-produto-principal.png',
  'active'
);
