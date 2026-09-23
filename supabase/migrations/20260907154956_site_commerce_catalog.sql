-- Separate catalogue store. Existing components/catalog/lead tables are preserved.
create table if not exists public.site_commerce (
  id text primary key check (id = 'catalog'),
  revision bigint not null check (revision >= 0),
  state jsonb not null check (jsonb_typeof(state) = 'object'),
  updated_at timestamptz not null default now(),
  constraint commerce_revision_matches check ((state->>'revision')::bigint = revision)
);
create table if not exists public.site_commerce_history (
  revision bigint primary key,
  state jsonb not null,
  saved_at timestamptz not null default now()
);
alter table public.site_commerce enable row level security;
alter table public.site_commerce_history enable row level security;
revoke all on public.site_commerce, public.site_commerce_history from public, anon, authenticated;
grant select, insert, update on public.site_commerce to service_role;
grant select, insert on public.site_commerce_history to service_role;

-- One transaction for the complete price/import batch. Concurrent edits cannot overwrite each other.
create or replace function public.save_site_commerce(expected_revision bigint, next_state jsonb)
returns bigint language plpgsql security invoker set search_path = '' as $$
declare current_revision bigint;
begin
  perform pg_advisory_xact_lock(310, 717);
  select revision into current_revision from public.site_commerce where id = 'catalog' for update;
  if coalesce(current_revision, 0) <> expected_revision then
    raise exception 'catalog revision conflict' using errcode = '40001';
  end if;
  if jsonb_typeof(next_state) <> 'object'
    or (next_state->>'revision')::bigint <> expected_revision + 1
    or jsonb_typeof(next_state->'draft') <> 'object' then
    raise exception 'invalid catalog state' using errcode = '22023';
  end if;
  insert into public.site_commerce_history(revision, state)
    select revision, state from public.site_commerce where id = 'catalog'
    on conflict (revision) do nothing;
  insert into public.site_commerce(id, revision, state)
    values ('catalog', expected_revision + 1, next_state)
    on conflict (id) do update set revision = excluded.revision, state = excluded.state, updated_at = now();
  return expected_revision + 1;
end;
$$;
revoke all on function public.save_site_commerce(bigint, jsonb) from public, anon, authenticated;
grant execute on function public.save_site_commerce(bigint, jsonb) to service_role;
