-- Stage 6: only the pair's own tags ("nossa") can be created, changed or removed from the app; the starting taxonomy is fixed.
drop policy tags_insert on public.tags;
drop policy tags_update on public.tags;
drop policy tags_delete on public.tags;
create policy tags_insert on public.tags for insert to authenticated
  with check ((select app_private.is_member()) and kind = 'nossa');
create policy tags_update on public.tags for update to authenticated
  using ((select app_private.is_member()) and kind = 'nossa')
  with check ((select app_private.is_member()) and kind = 'nossa');
create policy tags_delete on public.tags for delete to authenticated
  using ((select app_private.is_member()) and kind = 'nossa');

-- One shortcut per name, however it is capitalised.
create unique index saved_filters_name_key on public.saved_filters (lower(name));
