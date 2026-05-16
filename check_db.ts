import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://cezsxcrazgskecrisaas.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function test() {
  const { data: tenants } = await supabase.from('tenants').select('id, name, stripe_account_id, stripe_onboarding_status, stripe_charges_enabled');
  console.log('Tenants Stripe Data:', tenants?.filter(t => t.stripe_account_id));
}
test();
