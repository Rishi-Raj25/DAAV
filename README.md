# DAAV

**India's paid product leaderboard.** Apna product. Apni pehchaan.

DAAV is a lean MVP for discovering products and businesses in India through daily and all-time paid-rank leaderboards. Higher eligible, confirmed paid amounts rank higher; verification establishes eligibility and does not affect rank.

> **Development status:** quick-registration MVP in progress. The public leaderboard still uses demo listings. Registration runs a server-side HTTPS website screen and compares visible page text with the submitted name, description and sector. This is a heuristic anti-abuse check, not legal company verification or a guarantee that a business is genuine. Supabase and the server-only service-role environment variable must be configured. Payments are not implemented; do not accept real payments.

## MVP scope

- Indian-inspired, responsive public leaderboard
- Daily leaderboard based on Asia/Kolkata calendar day and cumulative all-time board
- Four-field quick registration: name, website, description, and sector
- Supabase Auth sign-up/sign-in and email confirmation callback (configuration required)
- Server-side HTTPS website screening with public-IP checks, pinned DNS lookup, bounded response size/time, redirect revalidation, parked/placeholder detection, and content matching
- Unreachable websites can retry; suspicious placeholders are rejected; ambiguous websites are not registered automatically
- Responsive public demo leaderboard with search, category filtering, hover feedback, entrance motion and reduced-motion support
- Razorpay payments, protected admin review, payment reconciliation and live rankings are not implemented yet; never mark a company or payment verified based on client-side state

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase Auth and PostgreSQL
- Razorpay Orders/Checkout + server-side signature and webhook verification

## Run locally

1. Install Node.js LTS.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in your Supabase settings.
4. Start development: `npm run dev`
5. Open http://localhost:3000

The homepage currently uses visibly labelled demo data. Quick registration needs Supabase configured in Vercel, the SQL schema applied, and `SUPABASE_SERVICE_ROLE_KEY` configured as a server-only environment variable. The API authenticates the user, screens the supplied HTTPS site, and creates an approved listing only when the basic content checks pass. Timeouts are retryable; unclear matches do not create a listing. This automated screen is not proof of legal incorporation. There is no live ranking or payment flow yet.

## Environment variables

See `.env.example`. Never expose Supabase service-role keys or Razorpay secrets in browser code.

## Payment and ranking rules

1. A listing must be approved before appearing as eligible for paid ranking.
2. The server creates the Razorpay order and amount; the browser cannot select a trusted amount by itself.
3. The server verifies payment signatures and, preferably, confirms payment/order status with Razorpay.
4. A verified payment is recorded idempotently. Duplicate webhook deliveries must not increase spend twice.
5. Daily spend uses the `Asia/Kolkata` calendar day. All-time spend is cumulative.
6. Ranking updates happen transactionally on the server. Never trust a return URL or client event alone.
7. Refunds, chargebacks, failed payments, moderation, minimum price rules, and simultaneous bids must be addressed before launch.

## Website screening policy

DAAV asks only for the product/business name, website, short description and sector. The server requires HTTPS on the standard port, resolves and pins a public IPv4 address, revalidates each redirect, limits response size and time, and inspects public page text for parked/placeholder signals and a match to the submitted details. Temporary network failures can be retried. Obvious parked/demo pages are rejected. Ambiguous pages are not registered automatically. A pass means the site passed DAAV's lightweight automated website screen; it does not prove legal incorporation or ownership. Keep payment verification separate. Before public launch, add persistent rate limiting, abuse monitoring, and human appeal/review operations.

## Before production

- [ ] Configure Supabase project, add its URL and anon/publishable key to Vercel, and apply a reviewed schema with Row Level Security
- [x] Add client sign-up/sign-in and email confirmation callback (requires Supabase configuration)
- [ ] Review server-side session handling and authorization before launch
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` in Vercel as a server-only variable (never prefix with `NEXT_PUBLIC_`)
- [ ] Test website screening against real sites, parked domains, redirects and temporary outages
- [ ] Add persistent rate limiting and abuse controls before public launch
- [ ] Add protected admin roles; do not rely on hidden UI buttons for authorization
- [ ] Implement company review queue and audit trail
- [ ] Add Razorpay order creation, server signature verification, webhook signature verification and idempotency
- [ ] Add server-side transactional ranking updates and IST rollover/archive process
- [ ] Implement refund/reconciliation workflows, rate limiting, input validation and spam controls
- [ ] Add privacy policy, terms, pricing disclosures, refund policy and contact details
- [ ] Obtain legal/tax review for the paid-placement model and Indian payment/tax requirements
- [ ] Test in gateway test mode, then deploy and monitor before accepting real payments

## Product language

- Today: **Aaj Ka Daav**
- All-time: **All-time**
- Main action: **List your product**
- Brand line: **India ka product leaderboard**

## License

No license has been granted yet. All rights reserved by the repository owner unless a license is added.


## Deploy to Vercel

1. Open the Vercel import flow: https://vercel.com/new
2. Import `Rishi-Raj25/DAAV` from GitHub.
3. Keep the detected framework as **Next.js** and the root directory as `./`.
4. For the first visual preview, no environment variables are required; the page uses clearly labelled demo data.
5. Select **Deploy**. Vercel will build the `main` branch and provide a deployment URL.
6. Later, add environment variables in **Project → Settings → Environment Variables** when Supabase and Razorpay server integrations are implemented. Redeploy after changing environment variables.

**Important:** this deployment is only a UI preview. It does not yet provide real authentication, business verification, or live payments. Do not accept real customer payments until server-side payment verification, transactional ranking logic, admin access controls, refunds/reconciliation, and legal disclosures are implemented and tested.
