-- J Montoya — perfiles admin (mismo patrón que CamilaCordoba)
-- Ejecutar en Supabase: SQL Editor → New query → Run
--
-- Después de correr esto:
-- 1. Authentication → Users → crea/confirma tu usuario admin
-- 2. Copia el UUID del usuario
-- 3. Ejecuta al final: insert into profiles (id, role) values ('UUID', 'admin');

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "Users read own profile" on profiles;
create policy "Users read own profile"
  on profiles for select
  using (auth.uid() = id);

drop policy if exists "Admin read profiles" on profiles;
create policy "Admin read profiles"
  on profiles for select
  using (public.is_admin());

-- Ejemplo (reemplaza el UUID por el de Authentication → Users):
-- insert into profiles (id, role) values ('a61d2f97-b73b-47f6-9d20-45c7eafb8cdf', 'admin');
