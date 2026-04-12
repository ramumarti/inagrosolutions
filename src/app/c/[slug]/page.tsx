import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Mail, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';

export const revalidate = 60; // Revalidate every minute

export default async function TenantPublicPage({ params }: { params: { slug: string } }) {
  // Use service role to bypass RLS for public read
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch the tenant by slug
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!tenant || !tenant.show_public_page) {
    notFound();
  }

  const primaryColor = tenant.primary_color || '#10B981';
  const secondaryColor = tenant.secondary_color || '#065F46';
  const logoUrl = tenant.logo_url || '/icon.png';
  const services = tenant.services || [
    { title: 'Asesoramiento TÃ©cnico', description: 'Visitas a finca y cuadernos de campo.' },
    { title: 'Compra Conjunta', description: 'Mejores precios en insumos.' },
    { title: 'GestiÃ³n de Subvenciones', description: 'TramitaciÃ³n PAC y ayudas.' }
  ];

  return (
    <div className="min-h-screen font-sans selection:bg-white/20" style={{ backgroundColor: '#050505', backgroundImage: `radial-gradient(ellipse at top, ${primaryColor}15, transparent 50%)` }}>
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <img src={logoUrl} alt={tenant.name} className="h-10 object-contain" />
             <span className="font-extrabold text-xl tracking-tight hidden sm:block">{tenant.name}</span>
          </div>
          <div className="flex gap-4">
             <Link href="/login" className="px-5 py-2.5 text-sm font-bold text-white/70 hover:text-white transition-colors">
               Iniciar SesiÃ³n
             </Link>
             <Link 
               href={`/signup?tenant=${tenant.slug}`} 
               className="px-5 py-2.5 text-sm font-black uppercase tracking-widest rounded-xl transition-all shadow-xl hover:scale-105"
               style={{ backgroundColor: primaryColor, color: '#000', boxShadow: `0 4px 14px ${primaryColor}40` }}
             >
               Hazte Socio
             </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="pt-40 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1]">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                {tenant.hero_title || `Bienvenido a ${tenant.name}`}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 font-light max-w-2xl mx-auto leading-relaxed">
              {tenant.hero_subtitle || 'Digitaliza tu cuaderno de campo, gestiona tus parcelas y forma parte de nuestra comunidad agrÃ­cola de forma rÃ¡pida y sencilla.'}
            </p>
            <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href={`/signup?tenant=${tenant.slug}`}
                className="group relative flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-black text-lg uppercase tracking-widest overflow-hidden transition-all hover:scale-105 shadow-2xl"
                style={{ backgroundColor: primaryColor, color: '#000', boxShadow: `0 8px 30px ${primaryColor}55` }}
              >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                Unirme Ahora
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* Description Section */}
        <section className="py-20 px-6 border-t border-white/5 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
             <div>
                <h2 className="text-3xl font-black mb-6">Sobre nosotros</h2>
                <div className="space-y-4 text-white/60 leading-relaxed text-lg">
                   {tenant.public_description ? (
                     <p>{tenant.public_description}</p>
                   ) : (
                     <p>Somos una cooperativa dedicada al respaldo, asesoramiento y comercializaciÃ³n conjunta de nuestros agricultores socios, priorizando la tecnologÃ­a, la trazabilidad y la rentabilidad en todos nuestros procesos. Ãšnete para centralizar tus labores agrÃ­colas, simplificar tu cumplimiento normativo mediante tu Cuaderno Digital y acceder a una amplia gama de ventajas exclusivas.</p>
                   )}
                </div>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((srv: any, i: number) => (
                  <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                     <CheckCircle2 className="w-8 h-8 mb-4" style={{ color: primaryColor }} />
                     <h3 className="font-bold text-lg mb-2">{srv.title}</h3>
                     <p className="text-sm text-white/50 leading-relaxed">{srv.description}</p>
                  </div>
                ))}
             </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 px-6 border-t border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at center, ${secondaryColor}60, transparent 70%)` }} />
          <div className="max-w-3xl mx-auto text-center space-y-12 relative z-10">
            <h2 className="text-3xl font-black">Contacto y AtenciÃ³n al Socio</h2>
            
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
                <MapPin className="w-8 h-8 mx-auto mb-4 text-white/40" />
                <h4 className="font-bold mb-1">DirecciÃ³n</h4>
                <p className="text-sm text-white/50">{tenant.address || 'Sede principal'}</p>
              </div>
              <div className="p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
                <Phone className="w-8 h-8 mx-auto mb-4 text-white/40" />
                <h4 className="font-bold mb-1">TelÃ©fono</h4>
                <p className="text-sm text-white/50">{tenant.contact_phone || '--'}</p>
              </div>
              <div className="p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
                <Mail className="w-8 h-8 mx-auto mb-4 text-white/40" />
                <h4 className="font-bold mb-1">Email</h4>
                <p className="text-sm text-white/50">{tenant.contact_email || 'info@cooperativa.es'}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-white/5 text-center text-sm text-white/30 hidden sm:block">
        Â© {new Date().getFullYear()} {tenant.name}. Todos los derechos reservados. Portal impulsado por Inagrosolutions.
      </footer>
    </div>
  );
}
