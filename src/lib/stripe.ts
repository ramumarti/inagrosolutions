import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  // Use a placeholder if not set, this will fail elegantly or warn
  console.warn("STRIPE_SECRET_KEY is missing. Stripe won't work real-time.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-12-18.acacia' as any,
  appInfo: {
    name: 'Inagrosolutions',
    version: '0.1.0',
  },
});
