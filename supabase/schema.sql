-- Run in Supabase SQL Editor. Review before production use.
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null default '',
  category text not null,
  price integer not null check (price >= 0),
  file_path text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id),
  amount integer not null check (amount >= 0),
  invoice_id text unique,
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','expired','failed')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.profiles enable row level security;
create policy "Public can view active products" on public.products for select using (is_active = true);
create policy "Users can view their own orders" on public.orders for select to authenticated using (auth.uid() = user_id);
create policy "Users can view own profile" on public.profiles for select to authenticated using (auth.uid() = id);
-- IMPORTANT: do not let users update their own role. Set role='admin' manually in SQL Editor:
-- update public.profiles set role='admin' where id='AUTH_USER_UUID';
-- For production, add a trusted trigger to create profiles and server-only admin policies.
-- Do not store private ZIP files in a public bucket.
