-- Dan & Mah — base schema: members, games, personal state, ratings, tags, diary, saved filters, activity.
-- Access model: only the two members (rows in public.members) can read or write anything.
-- Personal rows (state, ratings, own profile) can only be written by their owner.

-- ============ private schema (not exposed by the Data API) ============
create schema if not exists app_private;
revoke all on schema app_private from public, anon, authenticated;

-- ============ who may sign up ============
create table app_private.allowed_emails (
  email text primary key check (email = lower(email)),
  slot  smallint not null unique check (slot in (1, 2))  -- 1 = Danilo, 2 = Maellen
);

-- Auth hook "before user created": rejects any sign-up whose e-mail is not on the list.
create function app_private.hook_before_user_created(event jsonb)
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
begin
  if exists (
    select 1 from app_private.allowed_emails
    where email = lower(event->'user'->>'email')
  ) then
    return '{}'::jsonb;
  end if;
  return jsonb_build_object('error', jsonb_build_object(
    'http_code', 403,
    'message', 'Esta conta não faz parte do clube.'));
end;
$$;
grant usage on schema app_private to supabase_auth_admin;
grant select on app_private.allowed_emails to supabase_auth_admin;
grant execute on function app_private.hook_before_user_created(jsonb) to supabase_auth_admin;
revoke execute on function app_private.hook_before_user_created(jsonb) from public, anon, authenticated;

-- ============ shared helpers ============
create function app_private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============ members ============
create table public.members (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  slot          smallint not null unique check (slot in (1, 2)),
  display_name  text not null check (char_length(display_name) between 1 and 24),
  photo_path    text check (photo_path is null or char_length(photo_path) <= 300),
  nicknames     text[] not null default '{}',
  use_nicknames boolean not null default true,
  prefs         jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger members_updated_at before update on public.members
  for each row execute function app_private.set_updated_at();

-- First sign-in creates the member row from the allow-list slot.
create function app_private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  s smallint;
begin
  select slot into s from app_private.allowed_emails where email = lower(new.email);
  if s is null then
    raise exception 'e-mail not allowed';
  end if;
  insert into public.members (user_id, slot, display_name, nicknames)
  values (
    new.id, s,
    case s when 1 then 'Danilo' else 'Maellen' end,
    case s when 2 then array['Mahsterchef','Mahdame','Mahgnata','Mahnhosa','Mahmimada'] else '{}' end
  );
  return new;
end;
$$;
revoke execute on function app_private.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function app_private.handle_new_user();

-- Membership test used by every policy. Security definer so it can read members under RLS;
-- it only ever answers about the caller.
create function app_private.is_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.members where user_id = (select auth.uid()));
$$;
revoke execute on function app_private.is_member() from public, anon;
grant usage on schema app_private to authenticated;
grant execute on function app_private.is_member() to authenticated;

-- ============ games ============
create table public.games (
  id            bigint generated always as identity primary key,
  title         text not null check (char_length(title) between 1 and 200),
  title_key     text generated always as (lower(regexp_replace(btrim(title), '\s+', ' ', 'g'))) stored,
  release_year  smallint check (release_year between 1950 and 2100),
  developer     text check (developer is null or char_length(developer) <= 200),
  description   text check (description is null or char_length(description) <= 5000),
  source        text not null check (source in ('igdb', 'manual')),
  igdb_id       bigint unique,
  steam_app_id  bigint unique,
  cover_url     text check (cover_url is null or (cover_url like 'https://%' and char_length(cover_url) <= 500)),
  cover_path    text check (cover_path is null or char_length(cover_path) <= 300),
  extra         jsonb not null default '{}'::jsonb,
  shared_status text not null default 'lista'
                check (shared_status in ('quero','lista','jogando','pausado','zerado','abandonado','rejogar')),
  archived_at   timestamptz,
  added_by      uuid references public.members (user_id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create unique index games_manual_title_year_key
  on public.games (title_key, coalesce(release_year, 0)) where igdb_id is null;
create index games_added_by_idx on public.games (added_by);
create index games_active_created_idx on public.games (created_at desc) where archived_at is null;
create trigger games_updated_at before update on public.games
  for each row execute function app_private.set_updated_at();

create table public.game_links (
  id      bigint generated always as identity primary key,
  game_id bigint not null references public.games (id) on delete cascade,
  store   text not null check (store in ('steam','epic','gog','xbox','playstation','nintendo','itch','outra')),
  url     text not null check (url like 'https://%' and char_length(url) <= 500),
  unique (game_id, url)
);
create index game_links_game_id_idx on public.game_links (game_id);

-- ============ tags ============
create table public.tags (
  id         bigint generated always as identity primary key,
  kind       text not null check (kind in ('genero','modo','caracteristica','humor','nossa')),
  name       text not null check (char_length(name) between 1 and 40),
  slug       text not null check (slug ~ '^[a-z0-9-]{1,40}$'),
  created_by uuid references public.members (user_id) on delete set null,
  unique (kind, slug)
);
create index tags_created_by_idx on public.tags (created_by);

create table public.game_tags (
  game_id bigint not null references public.games (id) on delete cascade,
  tag_id  bigint not null references public.tags (id) on delete cascade,
  primary key (game_id, tag_id)
);
create index game_tags_tag_id_idx on public.game_tags (tag_id);

-- ============ each person's own state and rating ============
create table public.game_member_state (
  game_id     bigint not null references public.games (id) on delete cascade,
  user_id     uuid   not null references public.members (user_id) on delete cascade,
  status      text not null default 'lista'
              check (status in ('quero','lista','jogando','pausado','zerado','abandonado','rejogar')),
  wants       boolean not null default false,
  owned       boolean not null default false,
  finished_on date,
  updated_at  timestamptz not null default now(),
  primary key (game_id, user_id)
);
create index game_member_state_user_id_idx on public.game_member_state (user_id);
create trigger game_member_state_updated_at before update on public.game_member_state
  for each row execute function app_private.set_updated_at();

create table public.reviews (
  game_id      bigint not null references public.games (id) on delete cascade,
  user_id      uuid   not null references public.members (user_id) on delete cascade,
  rating       numeric(3,1) not null check (rating between 0 and 10 and rating * 2 = trunc(rating * 2)),
  comment      text check (comment is null or char_length(comment) <= 2000),
  recommends   boolean not null,
  would_replay boolean not null,
  rated_at     timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  primary key (game_id, user_id)
);
create index reviews_user_id_idx on public.reviews (user_id);
create trigger reviews_updated_at before update on public.reviews
  for each row execute function app_private.set_updated_at();

-- ============ diary ============
create table public.play_sessions (
  id         bigint generated always as identity primary key,
  game_id    bigint not null references public.games (id) on delete cascade,
  played_on  date not null,
  minutes    integer not null check (minutes between 1 and 1440),
  note       text check (note is null or char_length(note) <= 1000),
  moment     text check (moment is null or char_length(moment) <= 1000),
  created_by uuid references public.members (user_id) on delete set null,
  created_at timestamptz not null default now()
);
create index play_sessions_game_id_idx on public.play_sessions (game_id);
create index play_sessions_played_on_idx on public.play_sessions (played_on desc);
create index play_sessions_created_by_idx on public.play_sessions (created_by);

create table public.session_participants (
  session_id bigint not null references public.play_sessions (id) on delete cascade,
  user_id    uuid   not null references public.members (user_id) on delete cascade,
  primary key (session_id, user_id)
);
create index session_participants_user_id_idx on public.session_participants (user_id);

-- ============ saved filters and activity ============
create table public.saved_filters (
  id         bigint generated always as identity primary key,
  name       text not null check (char_length(name) between 1 and 40),
  query      text not null check (char_length(query) <= 1000),
  position   smallint not null default 0,
  created_by uuid references public.members (user_id) on delete set null,
  created_at timestamptz not null default now()
);
create index saved_filters_created_by_idx on public.saved_filters (created_by);

create table public.activity (
  id         bigint generated always as identity primary key,
  actor      uuid references public.members (user_id) on delete set null,
  kind       text not null check (kind in ('game_added','rated','finished','matched','session_logged','archived')),
  game_id    bigint references public.games (id) on delete cascade,
  details    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index activity_created_at_idx on public.activity (created_at desc);
create index activity_game_id_idx on public.activity (game_id);
create index activity_actor_idx on public.activity (actor);

-- ============ row level security ============
alter table public.members              enable row level security;
alter table public.games                enable row level security;
alter table public.game_links           enable row level security;
alter table public.tags                 enable row level security;
alter table public.game_tags            enable row level security;
alter table public.game_member_state    enable row level security;
alter table public.reviews              enable row level security;
alter table public.play_sessions        enable row level security;
alter table public.session_participants enable row level security;
alter table public.saved_filters        enable row level security;
alter table public.activity             enable row level security;

-- members: both read; each edits only their own row (slot and user_id cannot change: see trigger below).
create policy members_select on public.members for select to authenticated
  using ((select app_private.is_member()));
create policy members_update_own on public.members for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create function app_private.members_lock_identity()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.slot <> old.slot or new.user_id <> old.user_id then
    raise exception 'slot and user_id are fixed';
  end if;
  return new;
end;
$$;
create trigger members_lock_identity before update on public.members
  for each row execute function app_private.members_lock_identity();

-- Shared tables: any member reads and writes.
do $$
declare
  t text;
begin
  foreach t in array array['games','game_links','tags','game_tags','play_sessions','session_participants','saved_filters'] loop
    execute format('create policy %1$s_select on public.%1$I for select to authenticated using ((select app_private.is_member()))', t);
    execute format('create policy %1$s_insert on public.%1$I for insert to authenticated with check ((select app_private.is_member()))', t);
    execute format('create policy %1$s_update on public.%1$I for update to authenticated using ((select app_private.is_member())) with check ((select app_private.is_member()))', t);
    execute format('create policy %1$s_delete on public.%1$I for delete to authenticated using ((select app_private.is_member()))', t);
  end loop;
end;
$$;

-- Personal tables: both read; each writes only their own rows.
do $$
declare
  t text;
begin
  foreach t in array array['game_member_state','reviews'] loop
    execute format('create policy %1$s_select on public.%1$I for select to authenticated using ((select app_private.is_member()))', t);
    execute format('create policy %1$s_insert_own on public.%1$I for insert to authenticated with check ((select app_private.is_member()) and (select auth.uid()) = user_id)', t);
    execute format('create policy %1$s_update_own on public.%1$I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
    execute format('create policy %1$s_delete_own on public.%1$I for delete to authenticated using ((select auth.uid()) = user_id)', t);
  end loop;
end;
$$;

-- activity: both read; written only by the database.
create policy activity_select on public.activity for select to authenticated
  using ((select app_private.is_member()));

-- ============ grants ============
-- Data API access for signed-in users only; RLS decides the rows. Visitors (anon) get nothing.
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
grant select, insert, update, delete on
  public.games, public.game_links, public.tags, public.game_tags, public.game_member_state,
  public.reviews, public.play_sessions, public.session_participants, public.saved_filters
  to authenticated;
grant select, update on public.members to authenticated;
grant select on public.activity to authenticated;
