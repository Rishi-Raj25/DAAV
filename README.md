# DAAV

**India's paid product leaderboard.** Apna product. Apni pehchaan.

DAAV is a lean MVP for discovering products and businesses in India through daily and all-time paid-rank leaderboards. Higher eligible, confirmed paid amounts rank higher; verification establishes eligibility and does not affect rank.

> **Development status:** interactive MVP in progress. The public board still uses demo listings. Supabase sign-up/sign-in and authenticated product submission are wired in code, but they only work after Supabase is configured in Vercel and the SQL schema is applied. Razorpay/live payments are not implemented. Do not accept real payments.

## MVP scope

- Indian-inspired, responsive public leaderboard
- Daily leaderboard based on Asia/Kolkata calendar day and cumulative all-time board
- Product/company submission with manual verification status
- Supabase Auth sign-up/sign-in and email confirmation callback (configuration required)
- Authenticated product submission into a pending-review queue (configuration and SQL schema required)
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

The homepage currently uses visibly labelled demo data. Sign-up/sign-in and product submission need a Supabase project, the SQL schema applied, and the public environment variables configured in Vercel. The product submission route writes listings as pending; there is no admin approval screen or live ranking yet.

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

## Verification policy

Use official registration records when a business claims registration and the record is available. Allow manual review for legitimate products, independent makers and unincorporated businesses. Keep business verification separate from public-listing approval and payment status. Never imply that a verified business is necessarily the best product.

## Before production

- [ ] Configure Supabase project, add its URL and anon/publishable key to Vercel, and apply a reviewed schema with Row Level Security
- [x] Add client sign-up/sign-in and email confirmation callback (requires Supabase configuration)
- [ ] Review server-side session handling and authorization before launch
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
