-- Impersonation test: one member must not touch the other's state. Run on mah-dev only (needs the two test members).
-- Everything happens inside one transaction that is rolled back by the final exception, so no row is left behind.
do $$
declare
  dan uuid := '11111111-1111-1111-1111-111111111111';
  mah uuid := '22222222-2222-2222-2222-222222222222';
  gid bigint;
  n int;
  failed boolean;
begin
  insert into public.games (title, source, shared_status) values ('rls-test-game', 'manual', 'lista') returning id into gid;
  insert into public.game_member_state (game_id, user_id, status, wants) values (gid, dan, 'lista', false), (gid, mah, 'lista', false);

  -- sign in as Danilo
  perform set_config('request.jwt.claims', json_build_object('sub', dan, 'role', 'authenticated')::text, true);
  set local role authenticated;

  update public.game_member_state set status = 'zerado', wants = true where game_id = gid and user_id = mah;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: Danilo changed Maellen''s state (% rows)', n; end if;

  delete from public.game_member_state where game_id = gid and user_id = mah;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: Danilo deleted Maellen''s state'; end if;

  failed := false;
  begin
    insert into public.game_member_state (game_id, user_id) values (gid, mah);
  exception when others then failed := true; end;
  if not failed then raise exception 'FAIL: Danilo inserted a state row for Maellen'; end if;

  update public.game_member_state set status = 'jogando', wants = true where game_id = gid and user_id = dan;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL: Danilo could not change his own state'; end if;

  update public.members set display_name = 'hack' where user_id = mah;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: Danilo changed Maellen''s profile'; end if;

  update public.games set shared_status = 'jogando' where id = gid;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL: the shared status should be editable by both'; end if;

  -- a signed-in account that is not a member sees and writes nothing
  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', gen_random_uuid(), 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into n from public.games;
  if n <> 0 then raise exception 'FAIL: a non-member read games'; end if;
  failed := false;
  begin
    insert into public.games (title, source) values ('intruder', 'manual');
  exception when others then failed := true; end;
  if not failed then raise exception 'FAIL: a non-member inserted a game'; end if;

  -- a visitor with no session gets nothing
  reset role;
  set local role anon;
  failed := false;
  begin
    perform 1 from public.games;
  exception when others then failed := true; end;
  if not failed then raise exception 'FAIL: anon could read games'; end if;

  reset role;
  raise exception 'PASS: all isolation checks held (rolled back on purpose)';
end;
$$;
