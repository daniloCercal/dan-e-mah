-- Dan & Mah — starting tags, activity log written by the database, storage for covers and profile photos.

-- ============ starting tags (the prototype's taxonomy) ============
insert into public.tags (kind, name, slug) values
  ('genero', 'Terror', 'terror'),
  ('genero', 'Sobrevivência', 'sobrevivencia'),
  ('genero', 'Puzzle', 'puzzle'),
  ('genero', 'Aventura', 'aventura'),
  ('genero', 'RPG', 'rpg'),
  ('genero', 'Estratégia', 'estrategia'),
  ('genero', 'Simulação', 'simulacao'),
  ('genero', 'Plataforma', 'plataforma'),
  ('genero', 'Ação', 'acao'),
  ('genero', 'Corrida', 'corrida'),
  ('genero', 'Luta', 'luta'),
  ('genero', 'Esporte', 'esporte'),
  ('genero', 'Tiro', 'tiro'),
  ('genero', 'Festa', 'festa'),
  ('genero', 'Música', 'musica'),
  ('genero', 'Visual novel', 'visual-novel'),
  ('modo', 'Co-op online', 'coop-online'),
  ('modo', 'Co-op local', 'coop-local'),
  ('modo', 'Tela dividida', 'tela-dividida'),
  ('modo', 'Competitivo', 'competitivo'),
  ('modo', 'Single-player', 'single-player'),
  ('modo', 'Crossplay', 'crossplay'),
  ('caracteristica', 'História', 'historia'),
  ('caracteristica', 'Mundo aberto', 'mundo-aberto'),
  ('caracteristica', 'Construção de base', 'construcao-de-base'),
  ('caracteristica', 'Crafting', 'crafting'),
  ('caracteristica', 'Roguelike', 'roguelike'),
  ('caracteristica', 'Investigação', 'investigacao'),
  ('caracteristica', 'Exploração', 'exploracao'),
  ('caracteristica', 'Relaxante', 'relaxante'),
  ('caracteristica', 'Difícil', 'dificil'),
  ('caracteristica', 'Casual', 'casual'),
  ('humor', 'Para rir', 'para-rir'),
  ('humor', 'Para tomar susto', 'para-tomar-susto'),
  ('humor', 'Para relaxar', 'para-relaxar'),
  ('humor', 'Para passar raiva', 'para-passar-raiva'),
  ('humor', 'Sessão rápida', 'sessao-rapida'),
  ('humor', 'Para jogar por horas', 'para-jogar-por-horas'),
  ('humor', 'Para zerar no fim de semana', 'para-zerar-no-fim-de-semana')
on conflict (kind, slug) do nothing;

-- ============ activity, written by the database ============
-- Security definer: activity has no insert policy, so only these triggers can write it.
create function app_private.log_activity()
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
    insert into public.activity (actor, kind, game_id, details)
    values (new.user_id, 'rated', new.game_id, jsonb_build_object('rating', new.rating));

  elsif tg_table_name = 'game_member_state' then
    if new.finished_on is not null and (tg_op = 'INSERT' or old.finished_on is null) then
      insert into public.activity (actor, kind, game_id) values (new.user_id, 'finished', new.game_id);
    end if;
    -- A match: this person now wants it and the other one already did.
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
revoke execute on function app_private.log_activity() from public, anon, authenticated;

create trigger games_activity after insert or update of archived_at on public.games
  for each row execute function app_private.log_activity();
create trigger reviews_activity after insert on public.reviews
  for each row execute function app_private.log_activity();
create trigger game_member_state_activity after insert or update of finished_on, wants on public.game_member_state
  for each row execute function app_private.log_activity();
create trigger play_sessions_activity after insert on public.play_sessions
  for each row execute function app_private.log_activity();

-- ============ storage: covers and profile photos (private buckets) ============
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('capas', 'capas', false, 1048576, array['image/webp', 'image/jpeg', 'image/png']),
  ('fotos', 'fotos', false, 524288,  array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

-- Covers: any member reads and writes.
create policy capas_select on storage.objects for select to authenticated
  using (bucket_id = 'capas' and (select app_private.is_member()));
create policy capas_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'capas' and (select app_private.is_member()));
create policy capas_update on storage.objects for update to authenticated
  using (bucket_id = 'capas' and (select app_private.is_member()))
  with check (bucket_id = 'capas' and (select app_private.is_member()));
create policy capas_delete on storage.objects for delete to authenticated
  using (bucket_id = 'capas' and (select app_private.is_member()));

-- Profile photos: both read; each writes only inside a folder named with their own user id.
create policy fotos_select on storage.objects for select to authenticated
  using (bucket_id = 'fotos' and (select app_private.is_member()));
create policy fotos_insert_own on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos' and (select app_private.is_member())
              and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy fotos_update_own on storage.objects for update to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'fotos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy fotos_delete_own on storage.objects for delete to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = (select auth.uid())::text);
