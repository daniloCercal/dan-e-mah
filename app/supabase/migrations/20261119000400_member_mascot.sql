-- Dan & Mah — each member's mascot follows them across devices. Null = the default for their slot.
alter table public.members
  add column mascot text check (mascot in ('fantasma', 'roxinha'));
