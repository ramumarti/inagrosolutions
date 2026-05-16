import { Stripe } from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

async function test() {
  const account = await stripe.accounts.retrieve('acct_1TXcZ5EXrhvlZvGB');
  console.log('Account status:', {
    charges_enabled: account.charges_enabled,
    payouts_enabled: account.payouts_enabled,
    details_submitted: account.details_submitted,
    requirements: account.requirements?.currently_due
  });
}
test();
