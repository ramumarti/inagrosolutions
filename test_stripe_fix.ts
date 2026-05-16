import { stripe } from './src/lib/stripe';

async function test() {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'ES',
      email: 'test@inagrosolutions.com',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    console.log('✅ Cuenta creada correctamente:', account.id);
    
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: 'http://localhost:3000/refresh',
      return_url: 'http://localhost:3000/return',
      type: 'account_onboarding',
    });
    console.log('✅ Link generado correctamente:', accountLink.url);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
