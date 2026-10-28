-- DAAV initial schema draft. Review before applying to a live project.
-- RLS is enabled. Public read policies expose only approved listings and aggregate board data.
-- Never expose private verification documents or payment-provider secrets in public tables.

create extension if not exists pgcrypto;

create type public.verification_status as enum ('pending', 'approved', 'rejected', 'needs_information');
create type public.payment_status as enum ('created', 'pending', 'paid', 'failed', 'refunded', 'partially_refunded');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  name text not null check (char_length(name) between 2 and 100),
  slug text not null unique,
  website_url text not null,
  description text not null check (char_length(description) between 20 and 500),
  category text not null,
  entity_type text not null default 'product' check (entity_type in ('company', 'llp', 'sole_proprietor', 'independent_product', 'other')),
  registration_identifier text,
  verification_status public.verification_status not null default 'pending',
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete restrict,
  payer_id uuid not null references auth.users(id) on delete restrict,
  amount_paise bigint not null check (amount_paise > 0),
  currency text not null default 'INR' check (currency = 'INR'),
  status public.payment_status not null default 'created',
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  signature_verified_at timestamptz,
  paid_at timestamptz,
  refunded_paise bigint not null default 0 check (refunded_paise >= 0 and refunded_paise <= amount_paise),
  created_at timestamptz not null default now()
);

create table public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider_event_id text not null unique,
  event_type text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_error text
);

create table public.verification_reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  reviewer_id uuid references auth.users(id) on delete set null,
  decision public.verification_status not null,
  notes text,
  created_at timestamptz not null default now()
);

create index listings_approved_category_idx on public.listings(category, approved_at desc) where verification_status = 'approved';
create index payments_listing_status_paid_idx on public.payments(listing_id, paid_at desc) where status = 'paid';
create index payments_paid_at_idx on public.payments(paid_at) where status = 'paid';

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.payments enable row level security;
alter table public.payment_webhook_events enable row level security;
alter table public.verification_reviews enable row level security;

-- Public can read approved listing details only. Private review/admin queries belong in server-only code.
create policy "Public can read approved listings" on public.listings
  for select using (verification_status = 'approved');

create policy "Owners can read own listings" on public.listings
  for select to authenticated using (auth.uid() = owner_id);

create policy "Owners can submit pending listings" on public.listings
  for insert to authenticated with check (auth.uid() = owner_id and verification_status = 'pending' and approved_at is null);

create policy "Owners can update own pending listings" on public.listings
  for update to authenticated using (auth.uid() = owner_id and verification_status in ('pending', 'needs_information'))
  with check (auth.uid() = owner_id and verification_status in ('pending', 'needs_information'));

create policy "Owners can read own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);

create policy "Owners can insert own profile" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

-- No client-side payment writes or webhook reads are allowed.
-- Implement verified payment and admin operations using trusted server code/service role,
-- with authorization checks and transactional updates. Do not add public SELECT policies to payments.
