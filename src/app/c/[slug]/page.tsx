import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  MapPin, 
  Mail, 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  Leaf, 
  Users, 
  Target, 
  ShieldCheck, 
  Instagram, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Globe 
} from 'lucide-react';

export const revalidate = 60; // Revalidate every minute

export default async function TenantPublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch the tenant by slug
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!tenant || !tenant.show_public_page) {
    notFound();
  }

  const primaryColor = tenant.primary_color || '#10B981';
  const secondaryColor = tenant.secondary_color || '#065F46';
  const logoUrl = tenant.logo_url || '/icon.png';
  
  // Parse or default services
  let services = tenant.services;
  if (!Array.isArray(services) || services.length === 0) {
    services = [
      { title: 'Asesoramiento Técnico', description: 'Visitas a finca y elaboración del Cuaderno Digital bajo normativas europeas e internacionales.' },
      { title: 'Central de Compras', description: 'Optimización de costes mediante la adquisición conjunta de fertilizantes, semillas y fitosanitarios.' },
      { title: 'Gestión de Subvenciones', description: 'Tramitación integral de la PAC, pagos básicos y ayudas medioambientales.' },
      { title: 'Comercialización', description: 'Canalización agrupada de productos para alcanzar mejores precios en los mercados globales.' }
    ];
  }

  const socialLinks = tenant.social_links || {};
  const hasSocials = Object.keys(socialLinks).length > 0;

  return (
    <div className="min-h-screen font-sans selection:bg-white/20 bg-[#020202] text-white relative overflow-hidden">
      
      {/* Dynamic Background Orbs */}
      <div 
        className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-20 pointer-events-none animate-pulse-slow object-cover" 
        style={{ backgroundImage: `radial-gradient(circle, ${primaryColor}, transparent 70%)` }}
      />
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[150px] opacity-10 pointer-events-none object-cover" 
        style={{ backgroundImage: `radial-gradient(circle, ${secondaryColor}, transparent 70%)` }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/40 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
             {logoUrl && (
               <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/5">
                 <img src={logoUrl} alt={tenant.name} className="h-8 md:h-10 object-contain drop-shadow-xl" />
               </div>
             )}
             <span className="font-extrabold text-xl tracking-tight hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
               {tenant.name}
             </span>
          </div>
          <div className="flex gap-4 items-center">
             <Link href="/login" className="px-5 py-2.5 text-sm font-semibold text-white/70 hover:text-white transition-colors">
               Acceso
             </Link>
             <Link 
               href={`/cuaderno/planes?tenant=${tenant.slug}`} 
               className="group relative px-6 py-2.5 text-sm font-black uppercase tracking-widest rounded-xl transition-all hover:scale-105 flex items-center gap-2 overflow-hidden shadow-xl"
               style={{ backgroundColor: primaryColor, color: '#000', boxShadow: `0 4px 20px ${primaryColor}40` }}
             >
               <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
               <span className="relative z-10 hidden sm:inline">Únete ahora</span>
               <span className="relative z-10 sm:hidden">Unirse</span>
             </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        
        {/* Hero Section */}
        <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 px-6">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 text-center lg:text-left animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-white/10 bg-white/5 backdrop-blur-md"
                style={{ color: primaryColor }}
              >
                <Leaf size={16} /> Entidad Colaboradora InagroSolutions
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.05]">
                <span className="block text-white mb-2">
                  {tenant.hero_title || `Digitalización total para`}
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor || '#ffffff'})` }}>
                  {tenant.hero_title ? '' : tenant.name}
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/60 font-light leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {tenant.hero_subtitle || 'Optimiza tus parcelas y cumple con la normativa utilizando nuestro Cuaderno de Campo Digital integrado, de forma rápida, colaborativa y segura.'}
              </p>
              
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  href={`/cuaderno/planes?tenant=${tenant.slug}`}
                  className="group relative flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-black text-lg uppercase tracking-widest overflow-hidden transition-all hover:scale-105"
                  style={{ backgroundColor: primaryColor, color: '#000', boxShadow: `0 8px 30px ${primaryColor}55` }}
                >
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  Soy Agricultor
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#servicios"
                  className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg border border-white/20 hover:bg-white/10 transition-colors"
                >
                  Saber más
                </Link>
              </div>

              {/* Stats highlights block */}
              <div className="pt-8 flex gap-8 justify-center lg:justify-start border-t border-white/10 mt-8">
                 <div>
                    <h5 className="text-3xl font-black" style={{ color: primaryColor }}>100%</h5>
                    <p className="text-sm text-white/50 uppercase tracking-wider font-semibold">Trazabilidad</p>
                 </div>
                 <div>
                    <h5 className="text-3xl font-black" style={{ color: primaryColor }}>24/7</h5>
                    <p className="text-sm text-white/50 uppercase tracking-wider font-semibold">Soporte Técnico</p>
                 </div>
              </div>
            </div>

            {/* Decorative Side Elements */}
            <div className="hidden lg:block relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-black to-transparent z-10 rounded-full" />
              <div className="relative w-full aspect-square rounded-full border border-white/10 bg-white/5 backdrop-blur-3xl flex items-center justify-center animate-[pulse_4s_infinite]">
                 {/* Internal Floating Cards mimicking UI elements */}
                 <div className="absolute top-10 left-[-20px] p-4 bg-black/60 rounded-xl border border-white/10 backdrop-blur-md shadow-2xl animate-[bounce_8s_infinite] flex items-center gap-4 z-20">
                    <div className="p-3 bg-green-500/20 rounded-lg text-green-400">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h6 className="font-bold">SIEX Compatible</h6>
                      <p className="text-xs text-white/50">Normativa al día</p>
                    </div>
                 </div>

                 <div className="absolute bottom-20 right-[-30px] p-4 bg-black/60 rounded-xl border border-white/10 backdrop-blur-md shadow-2xl animate-[bounce_7s_infinite_reverse] flex items-center gap-4 z-20">
                    <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                       <Target size={24} />
                    </div>
                    <div>
                      <h6 className="font-bold">Datos en Tiempo Real</h6>
                      <p className="text-xs text-white/50">Informes automatizados</p>
                    </div>
                 </div>

                 <div className="w-1/2 h-1/2 bg-white/5 rounded-full blur-[80px] absolute" style={{ backgroundColor: primaryColor }} />
                 {logoUrl && <img src={logoUrl} alt="Floating Logo" className="relative z-10 w-40 h-40 object-contain drop-shadow-[0_0_80px_rgba(255,255,255,0.4)]" />}
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="nosotros" className="py-24 px-6 relative z-10 bg-white/[0.02] border-y border-white/5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-center">
             <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/10 bg-white/5 text-white/70">
                   <Users size={14} /> Cooperativismo y Fuerza
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                  Quiénes somos
                </h2>
                <div className="w-20 h-2 bg-gradient-to-r rounded-full" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }} />
                <div className="space-y-4 text-white/60 leading-relaxed text-lg pt-4">
                   {tenant.public_description ? (
                     <p>{tenant.public_description}</p>
                   ) : (
                     <p>Somos una cooperativa dedicada al respaldo, asesoramiento y comercialización conjunta de nuestros agricultores socios, priorizando la tecnología, la trazabilidad y la rentabilidad en todos nuestros procesos. Únete para centralizar tus labores agrícolas, simplificar tu cumplimiento normativo mediante tu Cuaderno Digital y acceder a una amplia gama de ventajas exclusivas que impulsarán tus explotaciones.</p>
                   )}
                </div>
             </div>
             
             {/* Value Prop Cards */}
             <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all sm:mt-12">
                   <h3 className="text-4xl font-black mb-2 drop-shadow-md" style={{ color: primaryColor }}>1</h3>
                   <h4 className="font-bold text-lg mb-2 text-white">Comunidad</h4>
                   <p className="text-sm text-white/50 leading-relaxed">Pertenece a un colectivo fuerte que defiende tus intereses en el mercado.</p>
                </div>
                <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all sm:mb-12">
                   <h3 className="text-4xl font-black mb-2 drop-shadow-md" style={{ color: primaryColor }}>2</h3>
                   <h4 className="font-bold text-lg mb-2 text-white">Innovación</h4>
                   <p className="text-sm text-white/50 leading-relaxed">Acceso a las últimas herramientas AG-Tech de InagroSolutions.</p>
                </div>
             </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="servicios" className="py-24 px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
             <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
                <h2 className="text-4xl md:text-5xl font-black tracking-tight">Nuestros Servicios</h2>
                <p className="text-xl text-white/60">Todo lo que ofrecemos a nuestros socios para impulsar su crecimiento y sostenibilidad.</p>
             </div>
             
             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(services as any[]).map((srv: any, i: number) => (
                  <div key={i} className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 relative overflow-hidden backdrop-blur-sm">
                     <div className="absolute top-0 left-0 w-full h-1 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" style={{ backgroundColor: primaryColor }} />
                     <div 
                       className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center mb-6 border border-white/10 group-hover:bg-white/20 transition-colors shadow-lg"
                     >
                       <CheckCircle2 size={28} style={{ color: primaryColor }} />
                     </div>
                     <h3 className="font-black text-xl mb-3 tracking-tight text-white">{srv.title}</h3>
                     <p className="text-white/50 leading-relaxed text-sm">{srv.description}</p>
                  </div>
                ))}
             </div>
          </div>
        </section>

        {/* CTA Banner Section */}
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden relative border border-white/10 backdrop-blur-md shadow-2xl">
            <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }} />
            <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[80px]" />
            <div className="relative z-10 p-12 md:p-20 text-center space-y-8">
              <h2 className="text-3xl md:text-5xl font-black text-white px-4">Da el salto a la Agricultura Inteligente</h2>
              <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-light">
                No esperes a la fecha límite para el Cuaderno Digital. Regístrate en nuestra cooperativa y obtén acceso total.
              </p>
              <Link 
                  href={`/cuaderno/planes?tenant=${tenant.slug}`}
                  className="inline-flex items-center justify-center px-10 py-5 rounded-2xl font-black text-lg uppercase tracking-widest transition-transform hover:scale-[1.03] shadow-2xl border border-white/20"
                  style={{ backgroundColor: 'white', color: 'black' }}
                >
                  Darse de Alta
              </Link>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contacto" className="py-24 px-6 border-t border-white/5 relative overflow-hidden mt-12 bg-black/50">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl opacity-[0.03] pointer-events-none" style={{ background: `radial-gradient(circle, ${secondaryColor}, transparent 70%)` }} />
          
          <div className="max-w-5xl mx-auto relative z-10 grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-black text-white">Contacto</h2>
              <p className="text-lg text-white/50 font-light leading-relaxed">
                Estamos aquí para resolver cualquier duda que tengas sobre nuestros servicios, tu afiliación a la cooperativa o la plataforma inagrosolutions.
              </p>
              
              <div className="space-y-6 pt-4">
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors shadow-lg">
                    <MapPin className="w-5 h-5 text-white/70" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white/50 uppercase tracking-wide">Dirección</h4>
                    <p className="text-lg text-white font-medium">{tenant.address || 'Sede principal'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors shadow-lg">
                    <Phone className="w-5 h-5 text-white/70" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white/50 uppercase tracking-wide">Teléfono</h4>
                    <p className="text-lg text-white font-medium">{tenant.contact_phone || 'No disponible'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors shadow-lg">
                    <Mail className="w-5 h-5 text-white/70" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white/50 uppercase tracking-wide">Email</h4>
                    <p className="text-lg text-white font-medium">{tenant.contact_email || 'info@cooperativa.es'}</p>
                  </div>
                </div>
              </div>
            </div>

            {hasSocials ? (
              <div className="p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col justify-center items-center text-center space-y-8 shadow-2xl">
                <h3 className="text-2xl font-bold text-white">Síguenos en Redes</h3>
                <div className="flex flex-wrap gap-4 justify-center">
                  {(socialLinks as any).facebook && (
                    <a href={(socialLinks as any).facebook} target="_blank" rel="noreferrer" className="w-14 h-14 rounded-full bg-[#1877F2]/20 hover:bg-[#1877F2]/40 border border-[#1877F2]/30 transition-colors flex items-center justify-center text-[#1877F2]">
                      <Facebook size={24} />
                    </a>
                  )}
                  {(socialLinks as any).twitter && (
                    <a href={(socialLinks as any).twitter} target="_blank" rel="noreferrer" className="w-14 h-14 rounded-full bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/40 border border-[#1DA1F2]/30 transition-colors flex items-center justify-center text-[#1DA1F2]">
                      <Twitter size={24} />
                    </a>
                  )}
                  {(socialLinks as any).instagram && (
                    <a href={(socialLinks as any).instagram} target="_blank" rel="noreferrer" className="w-14 h-14 rounded-full bg-[#E4405F]/20 hover:bg-[#E4405F]/40 border border-[#E4405F]/30 transition-colors flex items-center justify-center text-[#E4405F]">
                      <Instagram size={24} />
                    </a>
                  )}
                  {(socialLinks as any).linkedin && (
                    <a href={(socialLinks as any).linkedin} target="_blank" rel="noreferrer" className="w-14 h-14 rounded-full bg-[#0A66C2]/20 hover:bg-[#0A66C2]/40 border border-[#0A66C2]/30 transition-colors flex items-center justify-center text-[#0A66C2]">
                      <Linkedin size={24} />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden md:block w-full h-full relative min-h-[300px]">
                 <div className="absolute inset-0 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md overflow-hidden">
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `radial-gradient(circle at bottom right, ${primaryColor}, transparent)` }} />
                 </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-white/10 text-center relative z-10 bg-black/80">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-8 opacity-60 grayscale hover:grayscale-0 transition-all filter" />
            ) : (
              <Globe className="w-6 h-6 text-white/30" />
            )}
            <span className="text-sm font-bold text-white/50">{tenant.name}</span>
          </div>
          <div className="text-xs text-white/30 space-y-1 md:text-right">
            <p>© {new Date().getFullYear()} Todos los derechos reservados.</p>
            <p>Portal impulsado por <span className="font-bold text-white/60">Inagrosolutions</span>. Tu socio tecnológico.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
