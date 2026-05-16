const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    const account = await stripe.accounts.retrieve();
    console.log("Account ID:", account.id);
    console.log("Business Name:", account.business_profile?.name || account.settings?.dashboard?.display_name);
    console.log("Is Platform:", account.charges_enabled && account.details_submitted);
  } catch (e) {
    console.error(e.message);
  }
}

check();
