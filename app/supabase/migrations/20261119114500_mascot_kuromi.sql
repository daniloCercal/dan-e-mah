-- Dan & Mah — add Kuromi da Maah as a third mascot option.
alter table public.members
  drop constraint if exists members_mascot_check;

alter table public.members
  add constraint members_mascot_check
  check (mascot in ('fantasma', 'roxinha', 'kuromi'));
