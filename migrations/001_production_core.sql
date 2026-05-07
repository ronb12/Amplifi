create table if not exists creator_accounts (
  id bigserial primary key,
  user_id text not null unique,
  email text,
  stripe_account_id text not null,
  onboarding_url text,
  charges_enabled boolean not null default false,
  payouts_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists payments (
  id bigserial primary key,
  stripe_session_id text unique,
  creator_id text,
  buyer_id text,
  kind text not null,
  amount_cents integer not null default 0,
  currency text not null default 'usd',
  status text not null default 'created',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists payment_events (
  id text primary key,
  type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists live_streams (
  id text primary key,
  creator_id text not null,
  title text not null,
  channel_name text not null unique,
  agora_uid integer not null,
  is_public boolean not null default true,
  allow_chat boolean not null default true,
  status text not null default 'scheduled',
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_creator_id_idx on payments (creator_id);
create index if not exists live_streams_creator_id_idx on live_streams (creator_id);
