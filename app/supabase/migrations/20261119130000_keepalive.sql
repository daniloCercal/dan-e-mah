-- A real, trivial database round trip for the daily keep-alive job (the free tier pauses idle projects).
-- It reads nothing and is safe for anyone to call; the route that calls it is the one protected by a secret.
create function public.keepalive()
returns timestamptz
language sql
stable
security invoker
set search_path = ''
as $$
  select now();
$$;
revoke execute on function public.keepalive() from public;
grant execute on function public.keepalive() to anon, authenticated;
