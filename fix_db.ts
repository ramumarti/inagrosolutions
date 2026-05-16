import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://cezsxcrazgskecrisaas.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fix() {
  await supabase.from('tenants').update({
    stripe_onboarding_status: 'completed',
    stripe_charges_enabled: true,
    stripe_payouts_enabled: true,
    stripe_onboarding_completed_at: new Date().toISOString()
  }).eq('stripe_account_id', 'acct_1TXcZ5EXrhvlZvGB');
  console.log('✅ Base de datos sincronizada. ¡El tenant ahora está Activo!');
}
fix();
