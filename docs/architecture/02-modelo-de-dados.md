# Modelo de dados — Dan & Mah

Versão 1.0 para aprovação, 18/11/2026. O SQL abaixo é o rascunho que vira as migrations; nada foi aplicado ao banco ainda.

## Em palavras

- **Sócios.** Dois, cada um ligado a uma conta do Google. O "lugar" (1 ou 2) define a cor e a inicial.
- **Jogos.** Um registro por jogo da dupla, com os dados copiados da IGDB ou digitados à mão, o estado **da dupla**, e os identificadores externos (IGDB, Steam) que impedem duplicatas.
- **Estado de cada um.** Para cada jogo e cada sócio: estado pessoal, "quero jogar", "já tenho" e a data em que zerou. É daqui que saem o "nós dois queremos" e o "zeramos juntos".
- **Notas.** Uma por sócio e por jogo. A média e a diferença são calculadas, nunca guardadas, e só existem com as duas notas.
- **Tags.** Uma tabela só para gênero, modo, característica, humor e as tags criadas por vocês, ligada aos jogos.
- **Sessões.** Data, duração, observação, momento memorável e quem participou.
- **Atalhos de filtro, links de loja, atividade.** Tabelas pequenas de apoio.
- **Steam.** Duas tabelas previstas, criadas só quando a integração for construída.

## Quem pode o quê

| Tabela | Ler | Criar | Alterar | Apagar |
|---|---|---|---|---|
| Sócios | Os dois | Ninguém pelo site (criado no primeiro login) | Só o próprio | Ninguém |
| Jogos, links, tags, ligações jogo–tag | Os dois | Os dois | Os dois | Os dois |
| Estado de cada um | Os dois | Só o próprio | Só o próprio | Só o próprio |
| Notas | Os dois | Só a própria | Só a própria | Só a própria |
| Sessões e participantes | Os dois | Os dois | Os dois | Os dois |
| Atalhos de filtro | Os dois | Os dois | Os dois | Os dois |
| Atividade | Os dois | Gravada pelo banco | Ninguém | Ninguém |
| Lista de e-mails autorizados | Ninguém pelo site | — | — | — |

"Os dois" significa: usuário autenticado **e** presente na tabela de sócios. Quem não é sócio não lê nem escreve nada.

## Decisões de modelagem

- **Chaves:** `bigint` com identidade nas tabelas próprias; `uuid` só onde a chave é o usuário do Supabase Auth.
- **Textos com valores fixos** (estado, tipo de tag, loja) usam `text` com `check`, mais fácil de evoluir que tipos enumerados.
- **Datas com fuso** (`timestamptz`); a data da sessão é `date`, porque "sábado, 14 de novembro" não tem hora.
- **Nota:** `numeric(3,1)` com verificação de 0 a 10 em passos de 0,5.
- **Duplicatas:** índice único no identificador da IGDB e no da Steam; para jogos manuais, índice único no título normalizado + ano.
- **Arquivar** é uma data (`archived_at`), não exclusão: preserva notas e sessões e permite desfazer.
- **Toda chave estrangeira tem índice.**
- **Estatísticas** são consultas e visões com `security_invoker`, calculadas na hora; nada de números guardados que possam ficar errados.

## SQL (rascunho)

```sql
-- ============ schemas ============
create schema if not exists app_private;  -- not exposed by the Data API
revoke all on schema app_private from anon, authenticated;

-- ============ who may sign up ============
create table app_private.allowed_emails (
  email text primary key check (email = lower(email)),
  slot  smallint not null unique check (slot in (1, 2))  -- 1 = Dan, 2 = Mah
);

-- Auth hook: reject any sign-up whose e-mail is not on the list.
create function app_private.hook_before_user_created(event jsonb)
returns jsonb
language plpgsql
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
    'http_code', 403, 'message', 'Esta conta não faz parte do clube.'));
end;
$$;
grant usage on schema app_private to supabase_auth_admin;
grant select on app_private.allowed_emails to supabase_auth_admin;
grant execute on function app_private.hook_before_user_created(jsonb) to supabase_auth_admin;
revoke execute on function app_private.hook_before_user_created(jsonb) from public, anon, authenticated;

-- ============ members ============
create table public.members (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  slot          smallint not null unique check (slot in (1, 2)),
  display_name  text not null check (char_length(display_name) between 1 and 24),
  photo_path    text,
  nicknames     text[] not null default '{}',
  use_nicknames boolean not null default true,
  prefs         jsonb not null default '{}'::jsonb,  -- theme, wallpaper, draw mode, decorative motion, blind ratings
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

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
  insert into public.members (user_id, slot, display_name)
  values (new.id, s, case s when 1 then 'Danilo' else 'Maellen' end);
  return new;
end;
$$;
revoke execute on function app_private.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function app_private.handle_new_user();

-- Membership test used by every policy. Lives in the private schema; checks the caller itself.
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
  title_key     text generated always as (lower(regexp_replace(title, '\s+', ' ', 'g'))) stored,
  release_year  smallint check (release_year between 1950 and 2100),
  developer     text,
  description   text,
  source        text not null check (source in ('igdb', 'manual')),
  igdb_id       bigint unique,
  steam_app_id  bigint unique,
  cover_url     text check (cover_url is null or cover_url like 'https://%'),
  cover_path    text,                          -- Storage object, for covers uploaded by hand
  extra         jsonb not null default '{}'::jsonb,  -- screenshots, trailer, platforms, as imported
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

create table public.game_links (
  id       bigint generated always as identity primary key,
  game_id  bigint not null references public.games (id) on delete cascade,
  store    text not null check (store in ('steam','epic','gog','xbox','playstation','nintendo','itch','outra')),
  url      text not null check (url like 'https://%' and char_length(url) <= 500),
  unique (game_id, url)
);
create index game_links_game_id_idx on public.game_links (game_id);

-- ============ tags ============
create table public.tags (
  id         bigint generated always as identity primary key,
  kind       text not null check (kind in ('genero','modo','caracteristica','humor','nossa')),
  name       text not null check (char_length(name) between 1 and 40),
  slug       text not null,
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

-- ============ each person's own state ============
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

-- ============ small supporting tables ============
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
  kind       text not null,          -- 'game_added', 'rated', 'finished', 'matched', 'session_logged', ...
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

-- members: both read; each edits only their own row; no insert/delete from the app.
create policy members_select on public.members for select to authenticated
  using ((select app_private.is_member()));
create policy members_update_own on public.members for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Shared tables: any member may read and write.
-- (Written out per table and per command in the migration; shown once here.)
create policy games_select on public.games for select to authenticated
  using ((select app_private.is_member()));
create policy games_insert on public.games for insert to authenticated
  with check ((select app_private.is_member()));
create policy games_update on public.games for update to authenticated
  using ((select app_private.is_member()))
  with check ((select app_private.is_member()));
create policy games_delete on public.games for delete to authenticated
  using ((select app_private.is_member()));
-- same four policies for: game_links, tags, game_tags, play_sessions, session_participants, saved_filters

-- Personal tables: both read; each writes only their own rows.
create policy reviews_select on public.reviews for select to authenticated
  using ((select app_private.is_member()));
create policy reviews_insert_own on public.reviews for insert to authenticated
  with check ((select app_private.is_member()) and (select auth.uid()) = user_id);
create policy reviews_update_own on public.reviews for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy reviews_delete_own on public.reviews for delete to authenticated
  using ((select auth.uid()) = user_id);
-- same four policies for: game_member_state

-- activity: both read; rows are written by triggers, never by the app.
create policy activity_select on public.activity for select to authenticated
  using ((select app_private.is_member()));

-- Explicit grants for the Data API (new tables are not exposed automatically).
grant select, insert, update, delete on all tables in schema public to authenticated;
revoke all on all tables in schema public from anon;
```

O que o rascunho ainda não mostra e entra nas migrations: os gatilhos de `updated_at` e de atividade, as políticas repetidas por tabela, as tags iniciais (gêneros, modos, características, humores), as visões de estatística e as políticas do Storage.

## Como as regras do produto aparecem aqui

| Regra | Onde está garantida |
|---|---|
| Três estados independentes | `games.shared_status` e uma linha por pessoa em `game_member_state` |
| "Nós dois queremos" | Os dois com `wants = true` e o estado da dupla diferente de zerado e abandonado. Calculado |
| Média e diferença só com duas notas | Calculadas na consulta; sem duas linhas em `reviews`, não existem |
| Um não altera a nota nem o estado do outro | Políticas `*_own` com `auth.uid() = user_id` |
| "Zeramos juntos" | Os dois com `finished_on` preenchido |
| Sem duplicatas | Índices únicos em `igdb_id`, `steam_app_id` e título + ano |
| Arquivar com desfazer | `archived_at` |
| Sessão solo ou em dupla | Linhas em `session_participants` |

## Steam (criadas só na integração)

```sql
create table public.steam_accounts (
  user_id      uuid primary key references public.members (user_id) on delete cascade,
  steam_id     text not null unique,
  linked_at    timestamptz not null default now(),
  last_sync_at timestamptz
);
create table public.steam_game_stats (
  user_id               uuid   not null references public.members (user_id) on delete cascade,
  steam_app_id          bigint not null,
  playtime_minutes      integer not null default 0,
  achievements_unlocked integer,
  achievements_total    integer,
  synced_at             timestamptz not null default now(),
  primary key (user_id, steam_app_id)
);
create index steam_game_stats_app_idx on public.steam_game_stats (steam_app_id);
```

## Tamanho esperado

Mil jogos, duas mil notas e alguns milhares de sessões ocupam poucos megabytes. O limite do plano gratuito é 500 MB de banco e 1 GB de arquivos; estamos ordens de grandeza abaixo.
