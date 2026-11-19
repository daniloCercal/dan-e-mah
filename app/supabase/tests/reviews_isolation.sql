-- Ratings: one member must not write the other's rating, the step is 0.5, and blind ratings hide the other's rating until you rate.
-- Run on mah-dev only (needs the two test members). One transaction, rolled back by the final exception.
do $$
declare
  dan uuid := '11111111-1111-1111-1111-111111111111';
  mah uuid := '22222222-2222-2222-2222-222222222222';
  gid bigint;
  n int;
  failed boolean;
begin
  insert into public.games (title, source, shared_status) values ('rls-review-test', 'manual', 'lista') returning id into gid;

  -- sign in as Danilo
  perform set_config('request.jwt.claims', json_build_object('sub', dan, 'role', 'authenticated')::text, true);
  set local role authenticated;

  insert into public.reviews (game_id, user_id, rating, recommends, would_replay) values (gid, dan, 8, true, false);

  failed := false;
  begin
    insert into public.reviews (game_id, user_id, rating, recommends, would_replay) values (gid, mah, 1, true, true);
  exception when others then failed := true; end;
  if not failed then raise exception 'FAIL: Danilo inserted a rating as Maellen'; end if;

  failed := false;
  begin
    update public.reviews set rating = 7.3 where game_id = gid and user_id = dan;
  exception when check_violation then failed := true; end;
  if not failed then raise exception 'FAIL: a rating off the 0.5 step was accepted'; end if;

  -- sign in as Maellen
  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', mah, 'role', 'authenticated')::text, true);
  set local role authenticated;

  insert into public.reviews (game_id, user_id, rating, recommends, would_replay) values (gid, mah, 6, true, true);

  select count(*) into n from public.reviews where game_id = gid;
  if n <> 2 then raise exception 'FAIL: with blind ratings off both ratings should be readable, got %', n; end if;

  update public.reviews set rating = 0, comment = 'hack' where game_id = gid and user_id = dan;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: Maellen changed Danilo''s rating'; end if;

  delete from public.reviews where game_id = gid and user_id = dan;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: Maellen deleted Danilo''s rating'; end if;

  update public.reviews set rating = 6.5 where game_id = gid and user_id = mah;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL: Maellen could not edit her own rating'; end if;

  -- the log of activity must not carry the number
  select count(*) into n from public.activity where kind = 'rated' and game_id = gid and details ? 'rating';
  if n <> 0 then raise exception 'FAIL: the activity log leaks the rating'; end if;

  -- blind ratings on, for Maellen, before she has rated: Danilo's rating is hidden from her
  delete from public.reviews where game_id = gid and user_id = mah;
  update public.members set prefs = prefs || '{"blindRatings": true}'::jsonb where user_id = mah;
  select count(*) into n from public.reviews where game_id = gid and user_id = dan;
  if n <> 0 then raise exception 'FAIL: blind ratings showed Danilo''s rating before Maellen rated'; end if;
  select count(*) into n from public.reviews where game_id = gid;
  if n <> 0 then raise exception 'FAIL: expected no visible rating, got %', n; end if;

  insert into public.reviews (game_id, user_id, rating, recommends, would_replay) values (gid, mah, 9, true, true);
  select count(*) into n from public.reviews where game_id = gid;
  if n <> 2 then raise exception 'FAIL: after rating, Maellen should see both, got %', n; end if;

  -- Danilo (blind off) still sees both
  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', dan, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into n from public.reviews where game_id = gid;
  if n <> 2 then raise exception 'FAIL: Danilo (blind off) should see both, got %', n; end if;

  -- a signed-in account that is not a member sees nothing
  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', gen_random_uuid(), 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into n from public.reviews;
  if n <> 0 then raise exception 'FAIL: a non-member read ratings'; end if;

  raise exception 'PASS: ratings rules hold (rolled back)';
end $$;
