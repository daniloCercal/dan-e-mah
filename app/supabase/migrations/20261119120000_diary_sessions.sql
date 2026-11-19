-- Diary: a session and its players are saved together (one transaction), and a session can only be written as its author.
drop policy play_sessions_insert on public.play_sessions;
create policy play_sessions_insert on public.play_sessions for insert to authenticated
  with check ((select app_private.is_member()) and created_by = (select auth.uid()));

create function public.save_play_session(
  p_id bigint,
  p_game_id bigint,
  p_played_on date,
  p_minutes integer,
  p_note text,
  p_moment text,
  p_who uuid[]
)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  sid bigint;
begin
  if coalesce(cardinality(p_who), 0) = 0 then
    raise exception 'a session needs at least one player';
  end if;
  if p_id is null then
    insert into public.play_sessions (game_id, played_on, minutes, note, moment, created_by)
    values (p_game_id, p_played_on, p_minutes, nullif(btrim(p_note), ''), nullif(btrim(p_moment), ''), (select auth.uid()))
    returning id into sid;
  else
    update public.play_sessions
       set game_id = p_game_id, played_on = p_played_on, minutes = p_minutes,
           note = nullif(btrim(p_note), ''), moment = nullif(btrim(p_moment), '')
     where id = p_id
    returning id into sid;
    if sid is null then
      raise exception 'session not found';
    end if;
    delete from public.session_participants where session_id = sid;
  end if;
  insert into public.session_participants (session_id, user_id)
  select sid, u from unnest(p_who) as u
  on conflict do nothing;
  return sid;
end;
$$;
revoke execute on function public.save_play_session(bigint, bigint, date, integer, text, text, uuid[]) from public, anon;
grant execute on function public.save_play_session(bigint, bigint, date, integer, text, text, uuid[]) to authenticated;
