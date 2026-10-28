-- Support public, no-login DAAV creation with company name and website only.
alter table public.listings
  alter column owner_id drop not null,
  alter column description drop not null,
  alter column category drop not null;
