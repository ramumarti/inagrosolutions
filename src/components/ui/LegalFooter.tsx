"use client";

import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';

function LegalFooterContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const tenantFromParam = searchParams.get('tenant');
  const tenantFromPath = pathname.startsWith('/c/') ? pathname.split('/c/')[1]?.split('/')[0] : null;
  const tenantSlug = tenantFromParam || tenantFromPath || null;
  
  const [tenantName, setTenantName] = useState<string | null>(null);

  useEffect(() => {
    if (tenantSlug) {
      const fetchTenant = async () => {
        const supabase = createClient();
        const { data } = await supabase.from('tenants').select('name').eq('slug', tenantSlug).single();
        if (data) setTenantName(data.name);
      };
      fetchTenant();
    }
  }, [tenantSlug]);

  const entityName = tenantName || 'InagroSolutions';

  return (
    <div className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
          <TrendingUp className="text-white w-5 h-5" />
        </div>
        <span className="text-lg font-bold tracking-tight">{entityName}</span>
      </div>
      <div className="text-sm text-white/30 flex gap-8">
        <Link href={`/legal-notice${tenantSlug ? `?tenant=${tenantSlug}` : ''}`} className="hover:text-white transition-colors">Aviso Legal</Link>
        <Link href={`/privacy-policy${tenantSlug ? `?tenant=${tenantSlug}` : ''}`} className="hover:text-white transition-colors">Privacidad</Link>
        <Link href={`/cookie-policy${tenantSlug ? `?tenant=${tenantSlug}` : ''}`} className="hover:text-white transition-colors">Cookies</Link>
        {!tenantSlug && <Link href="/partner-policy" className="hover:text-white transition-colors underline decoration-[var(--color-primary)]/30">Política de Partners</Link>}
      </div>
      <div className="text-sm text-white/20">
        © {new Date().getFullYear()} {entityName}. Todos los derechos reservados.
      </div>
    </div>
  );
}

export function LegalFooter() {
  return (
    <Suspense fallback={
      <div className="mt-24 pt-12 border-t border-white/5 flex justify-center items-center">
        <div className="text-sm text-white/20">Cargando...</div>
      </div>
    }>
      <LegalFooterContent />
    </Suspense>
  );
}

