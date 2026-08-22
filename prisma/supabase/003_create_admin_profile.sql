-- Perfil admin para CapturasTamara
-- 1. Authentication → Users → crea/confirma el usuario admin
-- 2. Copia el UUID
-- 3. Reemplaza YOUR_USER_UUID y ejecuta:

-- insert into profiles (id, role)
-- values ('YOUR_USER_UUID', 'admin')
-- on conflict (id) do update set role = excluded.role;
