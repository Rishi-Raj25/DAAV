# DAAV

**India's paid product leaderboard.** Apna product. Apni pehchaan.

DAAV is a lean MVP for discovering products and businesses in India through daily and all-time paid-rank leaderboards. Higher eligible, confirmed paid amounts rank higher; verification establishes eligibility and does not affect rank.

> **Development status:** starter scaffold. Do not use for live payments or real customer data until the production checklist below is completed and reviewed.

## MVP scope

- Indian-inspired, responsive public leaderboard
- Daily leaderboard based on Asia/Kolkata calendar day and cumulative all-time board
- Product/company submission with manual verification status
- Supabase Auth and PostgreSQL (configuration required)
- Razorpay payment integration scaffold (credentials, server-side order creation and webhooks required)
- Admin review and payment reconciliation are planned; never mark a company or payment verified based on client-side state

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

The homepage currently uses visibly labelled demo data. Authentication, persisted listings, real rankings and payments require configured server services.

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

- [ ] Configure Supabase project and apply a reviewed schema with Row Level Security
- [ ] Implement signup/login flows and verify sessions on server routes
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
