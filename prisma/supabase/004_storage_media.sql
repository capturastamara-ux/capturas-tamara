-- Bucket media-files (público) + políticas RLS para admin
-- Ejecutar en Supabase: SQL Editor → New query → Run
-- (El bucket puede crearse también desde Dashboard → Storage)

insert into storage.buckets (id, name, public)
values ('media-files', 'media-files', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read media files" on storage.objects;
create policy "Public read media files"
  on storage.objects for select
  using (bucket_id = 'media-files');

drop policy if exists "Admin upload media files" on storage.objects;
create policy "Admin upload media files"
  on storage.objects for insert
  with check (bucket_id = 'media-files' and public.is_admin());

drop policy if exists "Admin update media files" on storage.objects;
create policy "Admin update media files"
  on storage.objects for update
  using (bucket_id = 'media-files' and public.is_admin())
  with check (bucket_id = 'media-files' and public.is_admin());

drop policy if exists "Admin delete media files" on storage.objects;
create policy "Admin delete media files"
  on storage.objects for delete
  using (bucket_id = 'media-files' and public.is_admin());
