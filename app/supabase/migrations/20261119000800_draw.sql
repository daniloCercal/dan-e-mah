-- Stage 8: the draw is decided here. Eligible = in the library (not archived, not removed), not finished or dropped
-- by the pair, and, when asked, wanted by both. Mood and mode filters match any of the chosen tags.
create function public.draw_candidates(
  only_matches boolean default true,
  mood_slugs text[] default '{}',
  mode_slugs text[] default '{}'
)
returns setof bigint
language sql
stable
security invoker
set search_path = ''
as $$
  select g.id
  from public.games g
  where g.archived_at is null
    and g.removed_at is null
    and g.shared_status not in ('zerado', 'abandonado')
    and (not only_matches or (
      (select count(*) from public.members) = 2
      and (select count(*) from public.game_member_state s where s.game_id = g.id and s.wants) = 2
    ))
    and (coalesce(cardinality(mood_slugs), 0) = 0 or exists (
      select 1 from public.game_tags gt join public.tags t on t.id = gt.tag_id
      where gt.game_id = g.id and t.kind = 'humor' and t.slug = any (mood_slugs)))
    and (coalesce(cardinality(mode_slugs), 0) = 0 or exists (
      select 1 from public.game_tags gt join public.tags t on t.id = gt.tag_id
      where gt.game_id = g.id and t.kind = 'modo' and t.slug = any (mode_slugs)))
$$;

-- Picks one at random, avoiding the previous pick when there is any other choice.
create function public.draw_pick(
  only_matches boolean default true,
  mood_slugs text[] default '{}',
  mode_slugs text[] default '{}',
  except_id bigint default null
)
returns bigint
language sql
stable
security invoker
set search_path = ''
as $$
  select c
  from public.draw_candidates(only_matches, mood_slugs, mode_slugs) c
  where except_id is null or c <> except_id
     or (select count(*) from public.draw_candidates(only_matches, mood_slugs, mode_slugs)) = 1
  order by random()
  limit 1
$$;

revoke execute on function public.draw_candidates(boolean, text[], text[]) from public, anon;
revoke execute on function public.draw_pick(boolean, text[], text[], bigint) from public, anon;
grant execute on function public.draw_candidates(boolean, text[], text[]) to authenticated;
grant execute on function public.draw_pick(boolean, text[], text[], bigint) to authenticated;
