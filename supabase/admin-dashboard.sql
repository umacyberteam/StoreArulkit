-- Jalankan SETELAH supabase/schema.sql di Supabase SQL Editor.
-- Migrasi ini menyiapkan profil otomatis, hak akses admin, dan bucket ZIP privat.

-- Buat profil customer otomatis saat akun Supabase Auth dibuat.
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute procedure public.handle_new_user_profile();

-- Buat profil untuk akun yang sudah terdaftar sebelum trigger dipasang.
insert into public.profiles (id, display_name, role)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', split_part(u.email, '@', 1)),
  'customer'
from auth.users u
on conflict (id) do nothing;

-- Hanya admin yang boleh melihat seluruh produk, termasuk produk nonaktif,
-- serta menambah, mengubah, dan menghapus produk.
drop policy if exists "Admins can manage products" on public.products;
create policy "Admins can manage products"
on public.products
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

-- Bucket privat untuk file ZIP produk. Tidak ada akses publik.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-files', 'product-files', false, 104857600, array['application/zip', 'application/x-zip-compressed'])
on conflict (id) do update set
  public = false,
  file_size_limit = 104857600,
  allowed_mime_types = array['application/zip', 'application/x-zip-compressed'];

drop policy if exists "Admins can read product files" on storage.objects;
drop policy if exists "Admins can upload product files" on storage.objects;
drop policy if exists "Admins can delete product files" on storage.objects;

begin;
  create policy "Admins can read product files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'product-files'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
  create policy "Admins can upload product files"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'product-files'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
  create policy "Admins can delete product files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'product-files'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
commit;
