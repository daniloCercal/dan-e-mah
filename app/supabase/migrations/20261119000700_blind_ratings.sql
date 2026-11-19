-- Stage 7: blind ratings. With the switch on (members.prefs.blindRatings), the other person's rating
-- is not readable until the reader has rated the same game. Enforced by the database, not by the page.
create function app_private.i_am_blind()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select prefs -> 'blindRatings' = 'true'::jsonb from public.members where user_id = (select auth.uid())), false);
$$;

create function app_private.i_rated(gid bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.reviews where game_id = gid and user_id = (select auth.uid()));
$$;

revoke execute on function app_private.i_am_blind() from public, anon;
revoke execute on function app_private.i_rated(bigint) from public, anon;
grant execute on function app_private.i_am_blind() to authenticated;
grant execute on function app_private.i_rated(bigint) to authenticated;

drop policy reviews_select on public.reviews;
create policy reviews_select on public.reviews for select to authenticated
  using (
    (select app_private.is_member())
    and (
      user_id = (select auth.uid())
      or not (select app_private.i_am_blind())
      or app_private.i_rated(game_id)
    )
  );

-- The activity log is readable by both, so it must not carry the rating itself.
update public.activity set details = details - 'rating' where kind = 'rated';

create or replace function app_private.log_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
begin
  if tg_table_name = 'games' then
    if tg_op = 'INSERT' then
      insert into public.activity (actor, kind, game_id) values (coalesce(new.added_by, me), 'game_added', new.id);
    elsif new.archived_at is not null and old.archived_at is null then
      insert into public.activity (actor, kind, game_id) values (me, 'archived', new.id);
    end if;

  elsif tg_table_name = 'reviews' then
    insert into public.activity (actor, kind, game_id) values (new.user_id, 'rated', new.game_id);

  elsif tg_table_name = 'game_member_state' then
    if new.finished_on is not null and (tg_op = 'INSERT' or old.finished_on is null) then
      insert into public.activity (actor, kind, game_id) values (new.user_id, 'finished', new.game_id);
    end if;
    if new.wants and (tg_op = 'INSERT' or not old.wants) and exists (
      select 1 from public.game_member_state o
      where o.game_id = new.game_id and o.user_id <> new.user_id and o.wants
    ) then
      insert into public.activity (actor, kind, game_id) values (new.user_id, 'matched', new.game_id);
    end if;

  elsif tg_table_name = 'play_sessions' then
    insert into public.activity (actor, kind, game_id, details)
    values (coalesce(new.created_by, me), 'session_logged', new.game_id, jsonb_build_object('minutes', new.minutes));
  end if;
  return new;
end;
$$;
