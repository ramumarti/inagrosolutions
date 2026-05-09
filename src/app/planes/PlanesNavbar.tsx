import Link from 'next/link';
import { TrendingUp } from 'lucide-react';

export function PlanesNavbar({ serverTenant, tenantSlug }: { serverTenant?: any, tenantSlug?: string }) {
  const primaryColor = serverTenant?.primary_color || '#10B981';
  const logoUrl = serverTenant?.logo_url;
  const partnerName = serverTenant?.name || "Plataforma Oficial";

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href={tenantSlug ? `/c/${tenantSlug}` : "/planes"} className="flex items-center gap-2">
          {logoUrl ? (
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/5 shadow-lg">
              <img src={logoUrl} alt={partnerName} className="h-8 object-contain" />
            </div>
          ) : (
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center" 
              style={{ backgroundColor: primaryColor, boxShadow: `0 0 20px ${primaryColor}4D` }}
            >
              <TrendingUp className="text-black w-6 h-6" />
            </div>
          )}
          {!logoUrl && (
            <span className="text-2xl font-bold tracking-tight">
              {tenantSlug ? partnerName : <>Inagro<span style={{ color: primaryColor }}>Solutions</span></>}
            </span>
          )}
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
          <Link href={tenantSlug ? `/planes?tenant=${tenantSlug}` : "/planes"} className="hover:text-white transition-colors">Planes</Link>
          <a href="#faqs" className="hover:text-white transition-colors">FAQs</a>
          <a href="#contacto" className="hover:text-white transition-colors">Contacto</a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <button 
              className="hidden sm:flex px-6 py-2.5 rounded-xl font-bold border bg-transparent transition-colors hover:bg-white/5"
              style={{ borderColor: `${primaryColor}33`, color: primaryColor }}
            >
              Acceso
            </button>
          </Link>
          <Link href={`/signup${tenantSlug ? `?tenant=${tenantSlug}` : ''}`}>
            <button 
              className="px-6 py-2.5 rounded-xl font-bold text-black transition-all hover:scale-105"
              style={{ backgroundColor: primaryColor, boxShadow: `0 0 15px ${primaryColor}66` }}
            >
              Empezar
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
