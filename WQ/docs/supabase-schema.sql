create extension if not exists pgcrypto;

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'pending',
  consent boolean not null default true,
  source text not null default 'landing_page',
  created_at timestamptz not null default now(),
  confirmed_at timestamptz null
);

create table if not exists public.email_confirmations (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references public.subscribers(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  consumed_at timestamptz null,
  created_at timestamptz not null default now()
);

create index if not exists idx_email_confirmations_token on public.email_confirmations(token);
create index if not exists idx_email_confirmations_subscriber on public.email_confirmations(subscriber_id);
