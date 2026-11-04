-- Tira is_staff() da API publica (aviso do verificador de seguranca do Supabase).
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
alter function public.is_staff() set schema private;
revoke all on function private.is_staff() from public, anon;
grant execute on function private.is_staff() to authenticated;
