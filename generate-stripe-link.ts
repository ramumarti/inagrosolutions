const Stripe = require('stripe');
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: tenant, error } = await adminSupabase
      .from('tenants')
      .select('id, name, slug')
      .eq('name', 'pedraza')
      .single();

    if (error || !tenant) {
      console.error('Tenant not found');
      process.exit(1);
    }

    const account = await stripe.accounts.create({
      type: 'express',
    });

    await adminSupabase
      .from('tenants')
      .update({
        stripe_account_id: account.id,
        stripe_onboarding_status: 'pending',
      })
      .eq('id', tenant.id);

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: 'http://localhost:3000/superadmin/tenants',
      return_url: 'http://localhost:3000/superadmin/tenants',
      type: 'account_onboarding',
    });

    console.log("URL:", accountLink.url);

  } catch (error: any) {
    console.error(error.message || error);
  }
}

run();
