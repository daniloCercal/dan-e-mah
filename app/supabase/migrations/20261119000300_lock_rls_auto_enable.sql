-- Some projects come with public.rls_auto_enable(), an event-trigger function that turns RLS on for every new table.
-- It is security definer and was callable through the Data API; nobody needs to call it directly.
-- Revoking EXECUTE does not stop the event trigger from firing.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end;
$$;
