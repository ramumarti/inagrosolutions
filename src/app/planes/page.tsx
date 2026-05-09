import { createClient } from '@/lib/supabase/server';
import { PricingClient } from './PricingClient';
import { PlanesNavbar } from './PlanesNavbar';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Force immediate updates

export default async function PricingLandingPage({ searchParams }: { searchParams: Promise<{ tenant?: string }> }) {
  const params = await searchParams;
  const tenantSlug = params?.tenant;
  let tenant = null;

  if (tenantSlug) {
    const supabase = await createClient();
    const { data } = await supabase.from('tenants').select('*').eq('slug', tenantSlug).single();
    if (data) tenant = data;
  }

  return (
    <>
      <PlanesNavbar serverTenant={tenant} tenantSlug={tenantSlug} />
      <PricingClient tenant={tenant} tenantSlug={tenantSlug} />
    </>
  );
}
