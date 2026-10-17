# 🌙 Bedtime Bounty

**Good habits earn stars. Stars earn books.**

Parents fund a jar through Stripe, but the money stays locked until their toddler earns it by completing missions such as brushing teeth or going to bed on time. Each star unlocks part of the jar, and the unlocked money is traded for a new book.

🔗 **Live demo:** https://bedtime-bounty.vercel.app

Built in ~30 minutes at the Stripe hackathon at Culture Co-Work, Cork.

## How it works

| Parent tab | Kid tab |
|---|---|
| Top up the jar (€10 / €20 / €50) with **Stripe Checkout** | Big emoji mission buttons that earn stars ⭐ |
| Start a **€9.99/month allowance** subscription | Each star unlocks €0.50 from the jar 🫙 |
| Add custom missions, set the child's name and age | Books unlock on the reward shelf when there are enough stars 🎁 |
| Activity log | Earned books go to "My books" 📚 |

## Stripe integration

- **Checkout (`mode: payment`)**: one-off jar top-ups, priced inline with `price_data`
- **Checkout (`mode: subscription`)**: recurring monthly allowance, with the child stored in subscription `metadata`
- **Session verification**: the success page retrieves the Checkout Session server-side and credits the jar only when `payment_status === 'paid'`, once per session
- **Webhook**: `/webhook` verifies the signature and handles `checkout.session.completed`

## Stack

- Node.js + Express + `stripe` SDK (`server.js`)
- Vanilla HTML/CSS/JS (`public/`); jar state is kept in the browser's `localStorage`, so the app runs on serverless hosting without a database
- Hosted on Vercel

## Run locally

```bash
cp .env.example .env   # add your sk_test_ key
npm install
npm start              # http://localhost:3000
```

Test card: `4242 4242 4242 4242`, any future date, any CVC.

To test the webhook locally:

```bash
stripe listen --forward-to localhost:3000/webhook   # copy the whsec_ into .env
```

## Stripe CLI via Docker

The native `stripe.exe` was blocked on the corporate Windows laptop used here, so the CLI runs in Docker. The Stripe Projects plugin is a glibc binary and doesn't run on the official Alpine image, so `.stripe-docker/Dockerfile` builds a Debian-based one:

```powershell
docker build -t stripe-cli-debian .stripe-docker
.\stripe.ps1 login
.\stripe.ps1 projects --version
```

## Next steps

- **Stripe Projects**: `stripe projects add neon/postgres` to persist the jar server-side and `stripe projects add clerk/auth` to put the Parent tab behind a login. This was blocked during the hackathon because Stripe Projects needs a live-mode account and the new accounts were test-mode only.
- Real book fulfilment when a book is redeemed
- Customer Portal so parents can manage the allowance
