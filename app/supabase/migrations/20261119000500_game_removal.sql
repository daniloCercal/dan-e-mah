-- Dan & Mah — removing a game hides it and can be undone; notes, sessions and both people's states stay in place.
alter table public.games add column removed_at timestamptz;
