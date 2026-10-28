# DAAV

**India's paid product leaderboard.** Apna product. Apni pehchaan.

DAAV is a lean MVP for discovering products and businesses in India through daily and all-time paid-rank leaderboards.

> **Development status:** one-field quick-creation MVP. A signed-in user enters a company or product name to create a DAAV listing. No website, documents, description, sector, or company-verification steps are required. The public leaderboard still uses demo listings. Payments and live paid rankings are not implemented; do not accept real payments.

## MVP scope

- Indian-inspired, responsive public leaderboard
- One-field DAAV creation: company or product name only
- Supabase Auth sign-up/sign-in (email confirmation may be controlled by Supabase Auth settings)
- Direct listing creation after basic name validation
- No company or website verification process during creation
- Responsive public demo leaderboard with search, category filtering, hover feedback, entrance motion and reduced-motion support
- Payments, live rankings, protected admin review and payment reconciliation are not implemented yet

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase Auth and PostgreSQL

## Run locally

1. Install Node.js LTS.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in your Supabase settings.
4. Start development: `npm run dev`
5. Open http://localhost:3000

The homepage still uses demo data. Supabase and the server-only secret key must be configured. If your existing database schema requires a website, description, or category, apply the migration in `supabase/migrations/20261028_name_only_daav.sql` in the Supabase SQL Editor before testing name-only creation.

## Environment variables

See `.env.example`. Never expose Supabase service-role keys or Razorpay secrets in browser code.

## Before production

- [ ] Configure Supabase Auth, environment variables and Row Level Security
- [ ] Apply the name-only listing migration if the existing schema has required metadata columns
- [ ] Add rate limiting and abuse controls
- [ ] Implement payments, server-side payment verification, transactional rankings, refunds/reconciliation and legal disclosures before accepting real payments

## Product language

- Today: **Aaj Ka Daav**
- All-time: **All-time**
- Main action: **Create my DAAV**
- Brand line: **India ka product leaderboard**

## License

No license has been granted yet. All rights reserved by the repository owner unless a license is added.
