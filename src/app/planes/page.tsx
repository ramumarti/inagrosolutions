import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { PricingClient } from './PricingClient';
import { PlanesNavbar } from './PlanesNavbar';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const tenantSlug = params?.tenant;

  if (!tenantSlug) {
    return {
      title: 'Planes Cuaderno Digital Agrícola | Plataforma Oficial',
      description: 'Elige el plan de Cuaderno de Campo Digital para tu explotación. Cumple SIEX, gestiona parcelas y fitosanitarios cómodamente.',
      openGraph: {
        title: 'Cuaderno Digital para Agricultores | Plataforma Oficial',
        description: 'Gestiona tu explotación desde el móvil o el ordenador.',
        images: ['/icon.png'],
      },
    };
  }

  try {
    const supabase = await createClient();
    const { data: tenant } = await supabase
      .from('tenants')
      .select('name, public_description, logo_url')
      .eq('slug', tenantSlug)
      .single();

    if (tenant) {
      const title = `Planes y Tarifas para Socios | ${tenant.name}`;
      const description = tenant.public_description || `Consulta los planes de Cuaderno de Campo Digital SIEX para socios de ${tenant.name}.`;
      return {
        title,
        description,
        openGraph: {
          title,
          description,
          images: tenant.logo_url ? [tenant.logo_url] : [],
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: tenant.logo_url ? [tenant.logo_url] : [],
        },
      };
    }
  } catch (e) {
    console.error('Error generating planes metadata:', e);
  }

  return {
    title: 'Planes Cuaderno Digital Agrícola | Plataforma Oficial',
    description: 'Elige el plan de Cuaderno de Campo Digital para tu explotación. Cumple SIEX, gestiona parcelas y fitosanitarios cómodamente.',
  };
}

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
