-- Public DAAV registration with paid listing fee. Apply after existing schema.
alter table public.listings alter column owner_id drop not null, alter column description drop not null, alter column category drop not null;
alter table public.payments alter column payer_id drop not null;
create table if not exists public.registration_intents (
 id uuid primary key default gen_random_uuid(),
 name text not null check(char_length(name) between 2 and 100),
 website_url text not null,
 slug text not null unique,
 razorpay_order_id text unique,
 razorpay_payment_id text unique,
 listing_id uuid references public.listings(id) on delete set null,
 status text not null default 'pending' check(status in ('pending','paid','failed')),
 amount_paise bigint not null check(amount_paise>0),
 created_at timestamptz not null default now(),
 paid_at timestamptz
);
create index if not exists registration_intents_status_created_idx on public.registration_intents(status,created_at desc);
alter table public.registration_intents enable row level security;
