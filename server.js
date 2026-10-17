import express from 'express';
import Stripe from 'stripe';
import { books, recommend } from './books.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();
const PORT = process.env.PORT || 3000;

// Works locally and behind Vercel's proxy
const baseUrl = (req) => process.env.BASE_URL || `${req.headers['x-forwarded-proto'] || req.protocol}://${req.headers.host}`;

// Webhook needs the raw body, so it must be registered before express.json()
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    const s = event.data.object;
    console.log(`🫙 Jar topped up: €${(s.amount_total / 100).toFixed(2)} (${s.mode}) for ${s.metadata?.child || 'child'}`);
  }
  res.json({ received: true });
});

app.use(express.json());
app.use(express.static('public'));
// On Vercel, public/ is served by the CDN but "/" still reaches the function
app.get('/', (req, res) => res.redirect('/index.html'));

// Age-appropriate books first, then the rest of the catalog
app.get('/api/rewards', (req, res) => {
  const picks = recommend({ ageMonths: Number(req.query.age) || 30 });
  res.json([...picks, ...books.filter((b) => !picks.some((p) => p.id === b.id))].slice(0, 6));
});

// Parent: one-off top-up
app.post('/api/topup', async (req, res) => {
  try {
    const amount = Math.max(500, Math.min(10000, Number(req.body.amount) || 2000));
    const child = String(req.body.child || 'your toddler').slice(0, 40);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        quantity: 1,
        price_data: { currency: 'eur', unit_amount: amount, product_data: { name: `Bedtime Bounty jar top-up for ${child}`, description: 'Turned into stars your toddler earns with good habits' } },
      }],
      metadata: { child },
      success_url: `${baseUrl(req)}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl(req)}/`,
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Parent: monthly allowance subscription
app.post('/api/subscribe', async (req, res) => {
  try {
    const child = String(req.body.child || 'your toddler').slice(0, 40);
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{
        quantity: 1,
        price_data: { currency: 'eur', unit_amount: 999, recurring: { interval: 'month' }, product_data: { name: 'Bedtime Bounty monthly allowance', description: '€9.99 into the jar every month' } },
      }],
      metadata: { child },
      subscription_data: { metadata: { child } },
      success_url: `${baseUrl(req)}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl(req)}/`,
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Success page asks Stripe whether the session was actually paid before the jar is credited
app.get('/api/confirm/:id', async (req, res) => {
  try {
    const s = await stripe.checkout.sessions.retrieve(req.params.id);
    res.json({ id: s.id, paid: s.payment_status === 'paid', amount: s.amount_total, mode: s.mode, email: s.customer_details?.email });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

if (!process.env.VERCEL) app.listen(PORT, () => console.log(`🌙 Bedtime Bounty running at http://localhost:${PORT}`));

export default app;
