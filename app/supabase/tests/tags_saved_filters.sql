-- Tags and shortcuts: members may create only their own ("nossa") tags and never touch the starting taxonomy.
-- Run on mah-dev only. One transaction, rolled back by the final exception.
do $$
declare
  dan uuid := '11111111-1111-1111-1111-111111111111';
  n int;
  failed boolean;
begin
  perform set_config('request.jwt.claims', json_build_object('sub', dan, 'role', 'authenticated')::text, true);
  set local role authenticated;

  insert into public.tags (kind, name, slug) values ('nossa', 'tag-de-teste', 'tag-de-teste');

  failed := false;
  begin
    insert into public.tags (kind, name, slug) values ('genero', 'Inventado', 'inventado');
  exception when others then failed := true; end;
  if not failed then raise exception 'FAIL: a member created a taxonomy tag'; end if;

  update public.tags set name = 'Hack' where kind = 'genero' and slug = 'terror';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: a member renamed a taxonomy tag'; end if;

  delete from public.tags where kind = 'genero' and slug = 'terror';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: a member deleted a taxonomy tag'; end if;

  insert into public.saved_filters (name, query) values ('Atalho Teste', 'modo=coop-online');
  failed := false;
  begin
    insert into public.saved_filters (name, query) values ('atalho teste', 'modo=coop-local');
  exception when unique_violation then failed := true; end;
  if not failed then raise exception 'FAIL: two shortcuts with the same name'; end if;

  raise exception 'PASS: tags and shortcuts rules hold (rolled back)';
end $$;
