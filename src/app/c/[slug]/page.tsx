import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { 
  MapPin, Mail, Phone, ArrowRight, CheckCircle2, Leaf, Users, 
  Target, ShieldCheck, 
  Globe, Clock, AlertTriangle, FileCheck, ThumbsUp, Star, 
  WifiOff, Droplets, Tractor, Sparkles, Layout, Navigation,
  Smartphone, Headset, FileSpreadsheet, Map
} from 'lucide-react';
import { TIER_CONFIG } from '@/lib/modules';
import { TenantPricing } from '@/components/cuaderno/TenantPricing';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable cache to show branding changes immediately

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

  const { data: testimonials } = await supabase
    .from('site_testimonials')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false });

  // Define brand styles based on tenant colors
  const primaryColor = tenant.primary_color || '#10B981';
  const secondaryColor = tenant.secondary_color || '#065F46';
  const logoUrl = tenant.logo_url || null;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20 relative overflow-hidden">
      {/* Background gradients aligned with planes page */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] pointer-events-none opacity-20" 
        style={{ backgroundColor: primaryColor }}
      />
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[40%] rounded-full blur-[120px] pointer-events-none opacity-10" 
        style={{ backgroundColor: secondaryColor }}
      />

      {/* Navbar */}
      <nav className="absolute top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href={`/c/${tenant.slug}`} className="flex items-center gap-3">
             {logoUrl ? (
               <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/5">
                 <img src={logoUrl} alt={tenant.name} className="h-8 object-contain" />
               </div>
             ) : (
               <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: primaryColor }}>
                 <Globe className="text-black w-6 h-6" />
               </div>
             )}
             <span className="font-bold text-xl tracking-tight hidden sm:block text-white">
               {tenant.name}
             </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <a href="#ventajas" className="hover:text-white transition-colors">Ventajas</a>
            <a href="#planes" className="hover:text-white transition-colors">Planes</a>
            <a href="#contacto" className="hover:text-white transition-colors">Contacto</a>
          </div>
          <div className="flex gap-4 items-center">
             <Link href="/login" className="px-5 py-2.5 text-sm font-bold text-white/70 hover:text-white transition-colors hidden sm:block">
               Acceso
             </Link>
             <Link href={`/planes?tenant=${tenant.slug}`}>
               <button 
                 className="px-6 py-2.5 text-sm font-bold rounded-xl transition-all shadow-lg hover:brightness-110 flex items-center gap-2"
                 style={{ backgroundColor: primaryColor, color: '#000' }}
               >
                 Únete ahora <ArrowRight size={16} />
               </button>
             </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* 1. HERO SECTION (Centered, like Planes page) */}
        <section className="relative pt-40 pb-20 px-6 w-full text-center z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 min-h-[70vh] flex flex-col justify-center overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img 
              src="/images/hero_cooperativa_v2.png" 
              alt="Fondo de campo" 
              className="w-full h-full object-cover opacity-40 mix-blend-luminosity scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/90 to-black"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto">
            <div 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold mb-8"
              style={{ 
                backgroundColor: `${primaryColor}15`, 
                borderColor: `${primaryColor}30`,
                color: primaryColor 
              }}
            >
              <Leaf className="w-4 h-4" />
              <span>Plataforma Agrícola Oficial</span>
            </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-white leading-tight">
            {tenant.hero_title ? (
              <span style={{ color: primaryColor, textShadow: `0 0 30px ${primaryColor}50` }}>
                {tenant.hero_title}
              </span>
            ) : (
              <>
                Digitalización total para <br className="hidden md:block" />
                <span style={{ color: primaryColor, textShadow: `0 0 30px ${primaryColor}50` }}>{tenant.name}</span>
              </>
            )}
          </h1>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            {tenant.hero_subtitle || 'Optimiza tus parcelas y cumple con la normativa utilizando nuestro Cuaderno de Campo Digital oficial. Nosotros nos encargamos de configurarlo para que tú solo te preocupes de tu cosecha.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm md:text-base text-gray-300 font-medium mb-12">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" style={{ color: primaryColor }} /> Sin complicaciones informáticas</div>
            <div className="hidden sm:block" style={{ color: primaryColor }}>•</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" style={{ color: primaryColor }} /> Adaptado a la normativa SIEX</div>
            <div className="hidden sm:block" style={{ color: primaryColor }}>•</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" style={{ color: primaryColor }} /> Soporte directo de tu Entidad</div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href={`/planes?tenant=${tenant.slug}#planes`} className="w-full sm:w-auto">
              <button 
                className="w-full sm:w-auto h-14 px-8 text-lg font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105"
                style={{ backgroundColor: primaryColor, color: '#000' }}
              >
                Ver Planes para Socios
              </button>
            </Link>
            <a href="#contacto" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto h-14 px-8 rounded-xl font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 backdrop-blur-sm">
                <Phone className="w-5 h-5" />
                Contactar a la Entidad
              </button>
            </a>
          </div>
          </div>
        </section>

        {/* 1.5. ABOUT US SECTION (Public Description) */}
        {tenant.public_description && (
          <section className="py-24 relative overflow-hidden border-y border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
              <div className="relative order-2 md:order-1">
                 <div className="absolute inset-0 rounded-full blur-[100px] opacity-10" style={{ backgroundColor: primaryColor }} />
                 <img 
                   src="/images/olivar_cooperativa.png" 
                   alt="Nuestra Historia" 
                   className="relative z-10 w-full aspect-[4/3] object-cover rounded-[2rem] border border-white/10 grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl" 
                 />
                 <div className="absolute -top-6 -right-6 w-32 h-32 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-center z-20">
                    <div className="text-center">
                      <p className="text-3xl font-black" style={{ color: primaryColor }}>30+</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Años de Exp.</p>
                    </div>
                 </div>
              </div>
              
              <div className="space-y-8 order-1 md:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/10 bg-white/5 text-gray-300">
                  <Users size={14} style={{ color: primaryColor }} /> Sobre Nosotros
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                  Nuestra <span style={{ color: primaryColor }}>Cooperativa</span>
                </h2>
                <p className="text-lg text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {tenant.public_description}
                </p>
                <div className="pt-4 flex gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-white font-bold">Confianza</p>
                    <p className="text-xs text-gray-500 mt-1">Servicio cercano y personalizado.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-white font-bold">Innovación</p>
                    <p className="text-xs text-gray-500 mt-1">Lo último en tecnología agrícola.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 2. VALUE PROP CARDS */}
        <section id="ventajas" className="py-20 relative border-y border-white/5 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">¿Por qué usar el Cuaderno a través nuestro?</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">Te ofrecemos ventajas exclusivas como socio, además de acompañarte en todo el proceso para que nunca te quedes atascado.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: ShieldCheck, title: "Nosotros lo preparamos", desc: "No partes de cero. Cargamos tus parcelas y explotaciones directamente desde el SIGPAC." },
                { icon: Smartphone, title: "Llévalo en el tractor", desc: "Apunta tus tratamientos fitosanitarios y labores directamente desde tu teléfono móvil." },
                { icon: FileCheck, title: "Garantía de cumplimiento", desc: "Te avisamos de alertas de dosis y generamos los Excel legales que te pedirá la administración." },
                { icon: Headset, title: "Soporte de confianza", desc: "Si tienes dudas, nos llamas. Tu entidad de siempre respaldándote con la nueva tecnología." },
                { icon: Tractor, title: "Control de costes", desc: "Lleva el control de lo que gastas en cada finca de manera automática al registrar tus insumos." },
                { icon: Users, title: "Precio preferente", desc: "Al ser socio te beneficias de un modelo colaborativo a precio de volumen." }
              ].map((benefit, i) => (
                <GlassCard key={i} className="p-8 border-white/5 hover:border-white/20 transition-all text-left group">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                    <benefit.icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-white">{benefit.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{benefit.desc}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* 3. INCLUDED SERVICES BLOCK */}
        <section className="py-24 max-w-7xl mx-auto px-6 relative">
          <div className="flex flex-col md:flex-row gap-16 items-center">
             <div className="flex-1">
                <div className="relative aspect-square max-w-md mx-auto">
                   <div className="absolute inset-0 rounded-full blur-[80px] opacity-20 animate-pulse-slow" style={{ backgroundColor: primaryColor }} />
                   <img src="/images/olivar_campesino_v1.png" className="relative z-10 w-full h-full object-cover rounded-[40px] border border-white/10 shadow-2xl skew-y-2 hover:skew-y-0 transition-transform duration-700" alt="Dashboard Agrícola" />
                   
                   <div className="absolute -bottom-6 -left-6 p-6 rounded-3xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl z-20">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-black font-black" style={{ backgroundColor: primaryColor }}>
                            SIEX
                         </div>
                         <div>
                            <p className="text-lg font-black text-white">100% Legal</p>
                            <p className="text-xs text-gray-400">Exportación automática</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
             
             <div className="flex-1 space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/10 bg-white/5 text-gray-300">
                  <Star size={14} style={{ color: primaryColor }} /> Tecnología de Vanguardia
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                  Más que una app,<br/>es tu tranquilidad
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4 items-start p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="mt-1 shrink-0"><CheckCircle2 size={24} style={{ color: primaryColor }} /></div>
                    <div>
                      <h4 className="text-lg font-bold text-white">Registro Offline en el Campo</h4>
                      <p className="text-gray-400 leading-relaxed text-sm mt-1">Aunque no tengas cobertura entre los olivos o viñedos, podrás apuntar tus labores y se sincronizará al llegar a casa.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="mt-1 shrink-0"><CheckCircle2 size={24} style={{ color: primaryColor }} /></div>
                    <div>
                      <h4 className="text-lg font-bold text-white">Calculadora de Dosis</h4>
                      <p className="text-gray-400 leading-relaxed text-sm mt-1">Nuestro sistema te avisa si el producto que intentas aplicar no está autorizado o excede los límites legales.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="mt-1 shrink-0"><CheckCircle2 size={24} style={{ color: primaryColor }} /></div>
                    <div>
                      <h4 className="text-lg font-bold text-white">Inventario en Tiempo Real</h4>
                      <p className="text-gray-400 leading-relaxed text-sm mt-1">Lleva el control de tu almacén y de lo que gastas sin usar Excel ni perder facturas.</p>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </section>

        {/* 4. PLANS */}
        <section id="planes" className="py-24 relative bg-[#0B0F15] border-y border-white/5">
          <TenantPricing tenantSlug={tenant.slug} primaryColor={primaryColor} />
        </section>

        {/* 4.5. TESTIMONIALS */}
        {testimonials && testimonials.length > 0 && (
          <section className="py-24 bg-white/[0.02]">
            <div className="max-w-7xl mx-auto px-6 text-center">
              <h2 className="text-3xl font-bold mb-12 text-white">Lo que dicen nuestros socios</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {testimonials.map((t: any) => (
                  <GlassCard key={t.id} className="p-8 text-left relative overflow-hidden">
                    <div className="text-8xl text-white/5 absolute -top-4 right-2 font-serif">"</div>
                    <p className="text-gray-300 italic mb-6 relative z-10 text-sm leading-relaxed">
                      {t.content}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full border flex items-center justify-center font-bold" style={{ backgroundColor: `${primaryColor}20`, borderColor: primaryColor, color: primaryColor }}>
                        {t.author_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{t.author_name}</h4>
                        <p className="text-xs text-gray-400">{t.author_role}</p>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 4.6. FAQ */}
        <section className="py-24 bg-black border-t border-white/5">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-12 text-center text-white">Preguntas Frecuentes</h2>
            <div className="space-y-4">
              {[
                {
                  q: '¿Qué validez legal tiene este cuaderno?',
                  a: 'El Cuaderno Digital generado a través de nuestra plataforma cumple al 100% con la normativa SIEX (Sistema de información de explotaciones agrícolas) y está preparado para cualquier inspección del MAPA o CC.AA.'
                },
                {
                  q: '¿Necesito conocimientos de informática avanzados?',
                  a: 'En absoluto. El sistema está diseñado para que cualquier persona que sepa usar un smartphone pueda gestionar su explotación con un par de clics. Además, cuentas con nuestro soporte técnico directo.'
                },
                {
                  q: '¿Qué pasa si mi finca no tiene cobertura móvil?',
                  a: 'Puedes apuntar los tratamientos en el campo con nuestra app móvil. Los datos se guardarán localmente y se sincronizarán automáticamente en cuanto recuperes la conexión a internet.'
                },
                {
                  q: '¿Puedo cambiar de plan más adelante?',
                  a: 'Sí, puedes ampliar tu plan en cualquier momento si tus necesidades crecen. El cambio se aplica de forma automática y solo pagas la diferencia proporcional.'
                }
              ].map((faq, i) => (
                <GlassCard key={i} className="p-6 border-white/10 hover:border-white/20 transition-all">
                  <h3 className="font-bold text-lg mb-2 text-white flex items-center gap-3">
                    <span style={{ color: primaryColor }}>Q.</span> {faq.q}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed pl-8">
                    {faq.a}
                  </p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* 5. CONTACT & FOOTER */}
        <section id="contacto" className="py-24 px-6 relative bg-black">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-black text-white">Contacta con Nosotros</h2>
              <p className="text-gray-400 leading-relaxed">
                ¿Tienes dudas sobre cómo empezar o qué plan elegir? Nuestro equipo técnico está para ayudarte en todo momento.
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-500 font-bold uppercase">Dirección</h4>
                    <p className="text-white font-medium">{tenant.address || 'Sede principal'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-500 font-bold uppercase">Teléfono</h4>
                    <p className="text-white font-medium">{tenant.contact_phone || 'No disponible'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-500 font-bold uppercase">Email</h4>
                    <p className="text-white font-medium">{tenant.contact_email || 'Contacto vía web'}</p>
                  </div>
                </div>

                {/* Social Links */}
                {tenant.social_links && Object.values(tenant.social_links as any).some(v => !!v) && (
                  <div className="pt-4 flex gap-4">
                    {(tenant.social_links as any).facebook && (
                      <a href={(tenant.social_links as any).facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-gray-400 hover:text-white" title="Facebook">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                      </a>
                    )}
                    {(tenant.social_links as any).twitter && (
                      <a href={(tenant.social_links as any).twitter} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-gray-400 hover:text-white" title="Twitter / X">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                      </a>
                    )}
                    {(tenant.social_links as any).instagram && (
                      <a href={(tenant.social_links as any).instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-gray-400 hover:text-white" title="Instagram">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                      </a>
                    )}
                    {(tenant.social_links as any).linkedin && (
                      <a href={(tenant.social_links as any).linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-gray-400 hover:text-white" title="LinkedIn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <GlassCard className="p-10 border-white/10 text-center space-y-6 bg-white/5">
              <h3 className="text-2xl font-bold text-white">Únete a {tenant.name}</h3>
              <p className="text-gray-400">Simplifica tu día a día en el campo con la garantía de tu cooperativa y la tecnología más avanzada.</p>
              <Link href={`/planes?tenant=${tenant.slug}#planes`} className="block">
                <button 
                  className="w-full py-4 rounded-xl font-bold text-black transition-transform hover:scale-105 shadow-xl"
                  style={{ backgroundColor: primaryColor }}
                >
                  Regístrate como Socio
                </button>
              </Link>
            </GlassCard>
          </div>
        </section>
      </main>

      <footer className="py-8 px-6 border-t border-white/5 text-center bg-black space-y-3">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} {tenant.name}. Todos los derechos reservados.
        </p>
        <div className="flex items-center justify-center gap-4 text-[11px] text-gray-600">
          <Link href={`/privacy-policy?tenant=${tenant.slug}`} className="hover:text-white transition-colors">Política de Privacidad</Link>
          <Link href={`/cookie-policy?tenant=${tenant.slug}`} className="hover:text-white transition-colors">Política de Cookies</Link>
          <Link href={`/legal-notice?tenant=${tenant.slug}`} className="hover:text-white transition-colors">Aviso Legal</Link>
        </div>
      </footer>
    </div>
  );
}
