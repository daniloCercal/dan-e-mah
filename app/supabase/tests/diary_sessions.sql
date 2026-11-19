-- Sessions are saved with their players atomically, only as their author, and need at least one player.
-- Run on mah-dev only (needs the two test members). Rolled back by the final exception.
do $$
declare
  dan uuid := '11111111-1111-1111-1111-111111111111';
  mah uuid := '22222222-2222-2222-2222-222222222222';
  g bigint; sid bigint; n int;
begin
  insert into public.games (title, source) values ('diary-test', 'manual') returning id into g;
  perform set_config('request.jwt.claims', json_build_object('sub', dan, 'role', 'authenticated')::text, true);
  set local role authenticated;

  sid := public.save_play_session(null, g, current_date, 90, '  nice ', '', array[dan, mah]);
  select count(*) into n from public.session_participants where session_id = sid;
  if n <> 2 then raise exception 'FAIL: expected 2 players, got %', n; end if;
  if (select note from public.play_sessions where id = sid) <> 'nice' then raise exception 'FAIL: note not trimmed'; end if;
  if (select moment from public.play_sessions where id = sid) is not null then raise exception 'FAIL: empty moment kept'; end if;

  perform public.save_play_session(sid, g, current_date, 45, null, null, array[mah]);
  select count(*) into n from public.session_participants where session_id = sid;
  if n <> 1 then raise exception 'FAIL: edit should leave 1 player, got %', n; end if;

  begin
    perform public.save_play_session(null, g, current_date, 30, null, null, '{}');
    raise exception 'FAIL: empty players accepted';
  exception when raise_exception then
    if sqlerrm like 'FAIL%' then raise; end if;
  end;

  begin
    insert into public.play_sessions (game_id, played_on, minutes, created_by) values (g, current_date, 10, mah);
    raise exception 'FAIL: wrote a session as someone else';
  exception when insufficient_privilege or check_violation then null;
  end;

  begin
    perform public.save_play_session(null, g, current_date, 0, null, null, array[dan]);
    raise exception 'FAIL: zero minutes accepted';
  exception when check_violation then null;
  end;

  reset role;
  raise exception 'PASS: diary session tests (rolled back)';
end;
$$;
