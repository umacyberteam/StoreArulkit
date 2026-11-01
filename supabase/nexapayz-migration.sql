-- Jalankan sekali di Supabase SQL Editor sebelum deploy.
alter table public.orders
  add column if not exists qris_image text,
  add column if not exists payment_link text,
  add column if not exists expires_at timestamptz,
  add column if not exists fee integer not null default 0 check (fee >= 0),
  add column if not exists total integer check (total is null or total >= 0);

create index if not exists orders_invoice_id_idx on public.orders(invoice_id);
create index if not exists orders_user_created_idx on public.orders(user_id, created_at desc);
