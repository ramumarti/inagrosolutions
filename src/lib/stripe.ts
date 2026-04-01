import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_for_build_purposes';

export const stripe = new Stripe(stripeKey, {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: '2026-03-25.dahlia',
  appInfo: {
    name: 'Cuaderno Digital Modular',
    version: '0.1.0'
  }
});
