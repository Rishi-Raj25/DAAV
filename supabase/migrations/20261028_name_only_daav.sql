-- Allow users to create a DAAV with only a company/product name.
-- Optional profile details can be added later.
alter table public.listings
  alter column website_url drop not null,
  alter column description drop not null,
  alter column category drop not null;

