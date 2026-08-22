-- Perfil admin para el usuario actual
-- UID actual (Authentication → Users): 3f9c20b4-fa19-4858-93f4-d2e0a19059f2
-- Si recreas el usuario, cambia el UUID.

insert into profiles (id, role)
values ('3f9c20b4-fa19-4858-93f4-d2e0a19059f2', 'admin')
on conflict (id) do update set role = excluded.role;
