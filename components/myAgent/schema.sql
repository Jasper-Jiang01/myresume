-- Chat tables: deny Data API (anon / authenticated).
-- Isolation is enforced in /api/chat via service_role + profile_id = device_id.
-- Client-supplied device_id must never be used as an RLS predicate on the anon key.

alter table if exists public.profiles enable row level security;
alter table if exists public.conversations enable row level security;
alter table if exists public.messages enable row level security;
alter table if exists public.chat_rate_limits enable row level security;

do $$
declare
  r record;
begin
  for r in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles', 'conversations', 'messages', 'chat_rate_limits')
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end
$$;

revoke all on table public.profiles from anon, authenticated, public;
revoke all on table public.conversations from anon, authenticated, public;
revoke all on table public.messages from anon, authenticated, public;

grant select, insert, update, delete on table public.profiles to service_role;
grant select, insert, update, delete on table public.conversations to service_role;
grant select, insert, update, delete on table public.messages to service_role;

create table if not exists public.chat_rate_limits (
  ip_hash text not null,
  window_start timestamptz not null,
  hit_count int not null default 0,
  primary key (ip_hash, window_start)
);

alter table public.chat_rate_limits enable row level security;

revoke all on table public.chat_rate_limits from anon, authenticated, public;
grant select, insert, update, delete on table public.chat_rate_limits to service_role;

create or replace function public.bump_chat_rate_limit(
  p_ip_hash text,
  p_window_start timestamptz
)
returns int
language sql
security invoker
set search_path = public
as $$
  insert into public.chat_rate_limits as t (ip_hash, window_start, hit_count)
  values (p_ip_hash, p_window_start, 1)
  on conflict (ip_hash, window_start)
  do update set hit_count = t.hit_count + 1
  returning t.hit_count;
$$;

revoke all on function public.bump_chat_rate_limit(text, timestamptz) from public, anon, authenticated;
grant execute on function public.bump_chat_rate_limit(text, timestamptz) to service_role;
