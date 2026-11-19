-- The draw only picks eligible games, many times over. Run on mah-dev only (needs the two test members).
-- One transaction, rolled back by the final exception. Existing games are archived first so only the fixtures count.
do $$
declare
  dan uuid := '11111111-1111-1111-1111-111111111111';
  mah uuid := '22222222-2222-2222-2222-222222222222';
  ok1 bigint; ok2 bigint; arch bigint; rem bigint; done_ bigint; drop_ bigint; one bigint; none_ bigint; solo bigint;
  pick bigint;
  i int;
  seen1 boolean := false; seen2 boolean := false;
  n int;
  tag_humor bigint;
begin
  update public.games set archived_at = now() where archived_at is null;

  insert into public.games (title, source, shared_status) values ('draw-ok-1', 'manual', 'lista') returning id into ok1;
  insert into public.games (title, source, shared_status) values ('draw-ok-2', 'manual', 'jogando') returning id into ok2;
  insert into public.games (title, source, shared_status, archived_at) values ('draw-archived', 'manual', 'lista', now()) returning id into arch;
  insert into public.games (title, source, shared_status, removed_at) values ('draw-removed', 'manual', 'lista', now()) returning id into rem;
  insert into public.games (title, source, shared_status) values ('draw-finished', 'manual', 'zerado') returning id into done_;
  insert into public.games (title, source, shared_status) values ('draw-dropped', 'manual', 'abandonado') returning id into drop_;
  insert into public.games (title, source, shared_status) values ('draw-one-wants', 'manual', 'lista') returning id into one;
  insert into public.games (title, source, shared_status) values ('draw-nobody', 'manual', 'lista') returning id into none_;

  insert into public.game_member_state (game_id, user_id, wants)
  select g, u, true from unnest(array[ok1, ok2, arch, rem, done_, drop_]) g, unnest(array[dan, mah]) u;
  insert into public.game_member_state (game_id, user_id, wants) values (one, dan, true), (one, mah, false);

  select id into tag_humor from public.tags where kind = 'humor' and slug = 'para-rir';
  insert into public.game_tags (game_id, tag_id) values (ok1, tag_humor), (one, tag_humor);

  perform set_config('request.jwt.claims', json_build_object('sub', dan, 'role', 'authenticated')::text, true);
  set local role authenticated;

  -- matches only: exactly the two eligible games, never anything else
  select count(*) into n from public.draw_candidates(true);
  if n <> 2 then raise exception 'FAIL: expected 2 candidates, got %', n; end if;
  for i in 1..300 loop
    pick := public.draw_pick(true);
    if pick = ok1 then seen1 := true; elsif pick = ok2 then seen2 := true;
    else raise exception 'FAIL: the draw picked an ineligible game (%)', pick; end if;
  end loop;
  if not (seen1 and seen2) then raise exception 'FAIL: the draw never reached one of the eligible games'; end if;

  -- not only matches: also games wanted by one or nobody, still never archived, removed, finished or dropped
  select count(*) into n from public.draw_candidates(false);
  if n <> 4 then raise exception 'FAIL: expected 4 candidates without the match rule, got %', n; end if;
  for i in 1..300 loop
    pick := public.draw_pick(false);
    if pick not in (ok1, ok2, one, none_) then raise exception 'FAIL: picked an ineligible game without the match rule (%)', pick; end if;
  end loop;

  -- mood filter narrows to games carrying that tag (any of the chosen)
  select count(*) into n from public.draw_candidates(true, array['para-rir']);
  if n <> 1 then raise exception 'FAIL: mood filter with matches expected 1, got %', n; end if;
  for i in 1..50 loop
    if public.draw_pick(true, array['para-rir']) <> ok1 then raise exception 'FAIL: mood filter picked the wrong game'; end if;
  end loop;
  select count(*) into n from public.draw_candidates(false, array['para-rir']);
  if n <> 2 then raise exception 'FAIL: mood filter without matches expected 2, got %', n; end if;

  -- the previous pick is avoided while there is another choice
  for i in 1..100 loop
    if public.draw_pick(true, '{}', '{}', ok1) <> ok2 then raise exception 'FAIL: the previous pick came back'; end if;
  end loop;
  -- ...but with a single candidate it is still returned
  if public.draw_pick(true, array['para-rir'], '{}', ok1) is distinct from ok1 then raise exception 'FAIL: the only candidate was not returned'; end if;

  -- nothing eligible: null, not an error
  if public.draw_pick(true, array['para-passar-raiva']) is not null then raise exception 'FAIL: expected null with no candidates'; end if;

  -- a non-member sees no game, so nothing can be drawn
  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', gen_random_uuid(), 'role', 'authenticated')::text, true);
  set local role authenticated;
  if public.draw_pick(false) is not null then raise exception 'FAIL: a non-member drew a game'; end if;

  -- a visitor cannot call it at all
  reset role;
  set local role anon;
  begin
    perform public.draw_pick(false);
    raise exception 'FAIL: anon could call draw_pick';
  exception when insufficient_privilege then null; end;

  raise exception 'PASS: the draw only uses eligible games (rolled back)';
end $$;
