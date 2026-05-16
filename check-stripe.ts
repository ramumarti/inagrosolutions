const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    const account = await stripe.accounts.retrieve();
    console.log("Account ID:", account.id);
    console.log("Capabilities:", account.capabilities);
    console.log("Details Submitted:", account.details_submitted);
    console.log("Charges Enabled:", account.charges_enabled);
  } catch (e) {
    console.error(e.message);
  }
}

check();
