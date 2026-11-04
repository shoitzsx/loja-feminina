-- Etapa 3: tabelas minimas + RLS desde o primeiro dia.
-- Aplicada no projeto closet-dev. Nao contem segredos; a senha do papel closet_app e definida fora da migracao.

create type public.user_role as enum ('CUSTOMER','STAFF','ADMIN');
create type public.order_status as enum ('PENDING_PAYMENT','PAID','PREPARING','SHIPPED','DELIVERED','CANCELED','REFUNDED');
create type public.payment_status as enum ('PENDING','AUTHORIZED','PAID','FAILED','CANCELED','REFUNDED');
create type public.payment_method as enum ('PIX','CREDIT_CARD','DEBIT_CARD');
create type public.review_status as enum ('PENDING','APPROVED','REJECTED');
create type public.suggestion_status as enum ('NEW','READ','ANSWERED');

create function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'CUSTOMER',
  full_name text check (char_length(full_name) <= 120),
  phone_encrypted text,
  avatar_url text check (char_length(avatar_url) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text check (char_length(label) <= 40),
  recipient_name text not null check (char_length(recipient_name) <= 120),
  cpf_encrypted text,
  phone_encrypted text not null,
  zip_code text not null check (zip_code ~ '^[0-9]{8}$'),
  street text not null check (char_length(street) <= 160),
  number text not null check (char_length(number) <= 20),
  complement text check (char_length(complement) <= 80),
  district text not null check (char_length(district) <= 80),
  city text not null check (char_length(city) <= 80),
  state text not null check (char_length(state) = 2),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index addresses_user_id_idx on public.addresses(user_id);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references public.profiles(id) on delete set null,
  guest_token_hash text,
  customer_name text not null check (char_length(customer_name) <= 120),
  customer_email text not null check (char_length(customer_email) <= 254),
  customer_phone_encrypted text,
  shipping_address jsonb,
  status public.order_status not null default 'PENDING_PAYMENT',
  subtotal_cents integer not null check (subtotal_cents >= 0),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  shipping_cents integer not null default 0 check (shipping_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  shipping_method text,
  anonymized_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz,
  check (user_id is not null or guest_token_hash is not null or anonymized_at is not null)
);
create index orders_user_id_idx on public.orders(user_id);
create index orders_status_idx on public.orders(status);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_slug text not null,
  product_name text not null,
  sku text not null,
  size text,
  color text,
  quantity integer not null check (quantity between 1 and 50),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  total_cents integer not null check (total_cents >= 0)
);
create index order_items_order_id_idx on public.order_items(order_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  method public.payment_method not null,
  status public.payment_status not null default 'PENDING',
  provider text not null,
  provider_ref text,
  amount_cents integer not null check (amount_cents >= 0),
  installments integer check (installments between 1 and 12),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);
create index payments_order_id_idx on public.payments(order_id);
create unique index payments_provider_ref_uidx on public.payments(provider, provider_ref) where provider_ref is not null;

create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  received_at timestamptz not null default now(),
  unique (provider, event_id)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_item_id uuid not null unique references public.order_items(id) on delete cascade,
  product_slug text not null,
  rating smallint not null check (rating between 1 and 5),
  comment text check (char_length(comment) <= 1000),
  display_name text not null check (char_length(display_name) <= 60),
  status public.review_status not null default 'PENDING',
  created_at timestamptz not null default now(),
  moderated_at timestamptz
);
create index reviews_product_status_idx on public.reviews(product_slug, status);

create table public.suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  message text not null check (char_length(message) between 5 and 2000),
  contact text check (char_length(contact) <= 200),
  status public.suggestion_status not null default 'NEW',
  created_at timestamptz not null default now()
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null check (char_length(action) <= 80),
  entity text not null check (char_length(entity) <= 80),
  entity_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table public.rate_limits (
  key text primary key,
  count integer not null default 0,
  window_start timestamptz not null default now()
);

create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger addresses_updated before update on public.addresses for each row execute function public.set_updated_at();
create trigger orders_updated before update on public.orders for each row execute function public.set_updated_at();
create trigger payments_updated before update on public.payments for each row execute function public.set_updated_at();

create function public.audit_log_immutable() returns trigger language plpgsql set search_path = '' as $$
begin raise exception 'audit_log e somente de inclusao'; end $$;
create trigger audit_log_no_change before update or delete on public.audit_log for each row execute function public.audit_log_immutable();

-- perfil criado automaticamente; o papel NUNCA vem dos dados do cadastro
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, role) values (new.id, 'CUSTOMER');
  return new;
end $$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create function public.is_staff() returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role in ('STAFF','ADMIN'))
$$;
revoke all on function public.is_staff() from public, anon;
grant execute on function public.is_staff() to authenticated;

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.webhook_events enable row level security;
alter table public.reviews enable row level security;
alter table public.suggestions enable row level security;
alter table public.audit_log enable row level security;
alter table public.rate_limits enable row level security;

-- o Supabase da acesso total por padrao: tirar tudo de anon/authenticated e devolver so o minimo
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

grant select on public.profiles, public.addresses, public.orders, public.order_items, public.reviews to authenticated;
grant select on public.reviews to anon;

create policy profiles_own_select on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy addresses_own_select on public.addresses for select to authenticated using (user_id = (select auth.uid()));
create policy orders_own_select on public.orders for select to authenticated using (user_id = (select auth.uid()) or public.is_staff());
create policy order_items_own_select on public.order_items for select to authenticated using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = (select auth.uid()) or public.is_staff())));
create policy reviews_public_approved on public.reviews for select to anon, authenticated using (status = 'APPROVED');
create policy reviews_own_select on public.reviews for select to authenticated using (user_id = (select auth.uid()) or public.is_staff());

do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'closet_app') then create role closet_app nologin; end if;
end $$;
grant usage on schema public to closet_app;
grant select, insert, update, delete on public.profiles, public.addresses to closet_app;
grant select, insert, update on public.orders, public.order_items, public.payments, public.reviews, public.suggestions to closet_app;
grant select, insert on public.webhook_events, public.audit_log to closet_app;
grant select, insert, update, delete on public.rate_limits to closet_app;
grant usage on all sequences in schema public to closet_app;
grant delete on public.reviews to closet_app;

create policy server_all_profiles on public.profiles for all to closet_app using (true) with check (true);
create policy server_all_addresses on public.addresses for all to closet_app using (true) with check (true);
create policy server_all_orders on public.orders for all to closet_app using (true) with check (true);
create policy server_all_order_items on public.order_items for all to closet_app using (true) with check (true);
create policy server_all_payments on public.payments for all to closet_app using (true) with check (true);
create policy server_all_webhook_events on public.webhook_events for all to closet_app using (true) with check (true);
create policy server_all_reviews on public.reviews for all to closet_app using (true) with check (true);
create policy server_all_suggestions on public.suggestions for all to closet_app using (true) with check (true);
create policy server_all_audit_log on public.audit_log for all to closet_app using (true) with check (true);
create policy server_all_rate_limits on public.rate_limits for all to closet_app using (true) with check (true);
