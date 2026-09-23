-- Keep existing leads and their status history. Record consent and attribution server-side.
-- Works for an empty project too; existing tables and records are preserved.
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  message text not null default '',
  status text not null default 'new',
  created_at timestamptz not null default now()
);
create table if not exists public.saved_builds (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  total_price integer not null default 0,
  components jsonb not null default '{}'::jsonb
);

alter table public.leads add column if not exists context jsonb not null default '{}'::jsonb;
comment on column public.leads.context is 'Order, campaign attribution and versioned consent; acceptedAt is recorded by the server';

-- Saved configurations are read by UUID through the server API. Anonymous clients
-- must not bypass API validation/rate limits or enumerate the complete table.
alter table public.saved_builds enable row level security;
revoke all on public.saved_builds from public, anon, authenticated;
grant select, insert on public.saved_builds to service_role;

alter table public.leads enable row level security;
revoke all on public.leads from public, anon, authenticated;
grant select, insert, update on public.leads to service_role;
create index if not exists leads_created_at_idx on public.leads (created_at desc);
