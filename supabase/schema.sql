-- Fiscaliza Brasil — esquema Supabase (projeto gratuito do PostgREST)
-- Rode no SQL Editor do Supabase (https://supabase.com/dashboard -> seu projeto -> SQL Editor).
-- Depois configure na Vercel: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY, e faça Redeploy.

-- 1) Contador de visitas agregado (dia + caminho da página; sem IP, cookie ou identificação pessoal)
create table if not exists public.visits (
  day   date  not null,
  path  text  not null,
  count bigint not null default 0,
  primary key (day, path)
);

-- 2) RPC idempotente de incremento (upsert com soma)
create or replace function public.increment_visit(p_day date, p_path text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.visits (day, path, count)
  values (p_day, p_path, 1)
  on conflict (day, path)
  do update set count = public.visits.count + 1;
$$;

-- 3) Segurança: só o serviço (service_role) lê/escreve; a chave anon NÃO enxerga nada.
alter table public.visits enable row level security;
revoke all on public.visits from anon;
revoke all on public.visits from authenticated;
grant select, insert, update on public.visits to service_role;
grant execute on function public.increment_visit(date, text) to service_role;
