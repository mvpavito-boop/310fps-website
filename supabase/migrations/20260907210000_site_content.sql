-- Content admin schema for a new Supabase project. No existing tables/data are removed.
begin;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) > 0),
  city text,
  text text not null check (length(btrim(text)) > 0),
  pc text,
  rating integer not null default 5 check (rating between 1 and 5),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.faq (
  id uuid primary key default gen_random_uuid(),
  question text not null check (length(btrim(question)) > 0),
  answer text not null check (length(btrim(answer)) > 0),
  icon_name text not null default 'HelpCircle',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Public site text only. Credentials must never be stored here.
create table if not exists public.site_settings (
  key text primary key check (key ~ '^[a-zA-Z0-9_.-]{1,80}$'),
  value text not null
);

create index if not exists reviews_active_order_idx on public.reviews(active, sort_order);
create index if not exists faq_active_order_idx on public.faq(active, sort_order);

alter table public.reviews enable row level security;
alter table public.faq enable row level security;
alter table public.site_settings enable row level security;
revoke all on public.reviews, public.faq, public.site_settings from public, anon, authenticated;
grant select on public.reviews, public.faq, public.site_settings to anon, authenticated;
grant select, insert, update, delete on public.reviews, public.faq, public.site_settings to service_role;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'reviews' and policyname = 'content_active_reviews') then
    create policy content_active_reviews on public.reviews for select to anon, authenticated using (active = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'faq' and policyname = 'content_active_faq') then
    create policy content_active_faq on public.faq for select to anon, authenticated using (active = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'site_settings' and policyname = 'content_public_settings') then
    create policy content_public_settings on public.site_settings for select to anon, authenticated using (true);
  end if;
end $$;

commit;
