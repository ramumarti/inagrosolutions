import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import {
  MapPin, Mail, Phone, ArrowRight, CheckCircle2, Leaf, Users,
  ShieldCheck, Globe, Star, Tractor, AlertTriangle, FileCheck,
  ThumbsUp, Headset, FileSpreadsheet, Map, MessageSquare, Check
} from 'lucide-react';
import { Metadata, ResolvingMetadata } from 'next';
import { TenantPricing } from '@/components/cuaderno/TenantPricing';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from('tenants')
    .select('name, public_description, logo_url')
    .eq('slug', slug)
    .single();

  if (!tenant) return {};

  const title = `${tenant.name} | Cuaderno Digital de Campo, SIEX y PAC Olivar`;
  const description = tenant.public_description || `Asegura tu PAC e inspecciones agrícolas sin papeleos. Gestión profesional del cuaderno de campo digital especializado en olivar para socios de ${tenant.name}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: tenant.logo_url ? [tenant.logo_url] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: tenant.logo_url ? [tenant.logo_url] : [],
    }
  };
}

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

  // Define brand styles based on tenant colors
  const primaryColor = tenant.primary_color || '#10B981';
  const secondaryColor = tenant.secondary_color || '#065F46';
  const logoUrl = tenant.logo_url || null;

  const finalPrivacyUrl = tenant.privacy_policy_url || `/privacy-policy?tenant=${tenant.slug}`;
  const finalLegalNoticeUrl = tenant.legal_notice_url || `/legal-notice?tenant=${tenant.slug}`;
  const finalTermsUrl = tenant.terms_url || `/terms-conditions?tenant=${tenant.slug}`;

  // WhatsApp link generator helper
  const cleanPhone = tenant.contact_phone ? tenant.contact_phone.replace(/\s+/g, '') : '';
  const whatsAppLink = cleanPhone 
    ? `https://wa.me/${cleanPhone.startsWith('+') ? cleanPhone : '+34' + cleanPhone}?text=Hola,%20soy%20agricultor%20y%20quiero%20saber%20mas%20sobre%20el%20Cuaderno%20Digital%20CDC` 
    : '#contacto';

  return (
    <div className="min-h-screen bg-[#07090e] text-white selection:bg-white/20 relative overflow-hidden font-sans">
      {/* Background radial glow effects */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[150px] pointer-events-none opacity-20"
        style={{ backgroundColor: primaryColor }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full blur-[150px] pointer-events-none opacity-10"
        style={{ backgroundColor: secondaryColor }}
      />

      {/* Navbar */}
      <nav className="absolute top-0 w-full z-50 border-b border-white/5 bg-[#07090e]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href={`/c/${tenant.slug}`} className="flex items-center gap-3">
            {logoUrl ? (
              <div className="bg-white/5 p-1.5 rounded-xl border border-white/10 backdrop-blur-md">
                <img src={logoUrl} alt={tenant.name} className="h-9 object-contain" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: primaryColor }}>
                <Globe className="text-black w-6 h-6" />
              </div>
            )}
            <span className="font-black text-xl tracking-tight hidden sm:block text-white">
              {tenant.name}
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-white/70">
            <a href="#problemas" className="hover:text-white transition-colors">El Reto</a>
            <a href="#solucion" className="hover:text-white transition-colors">Nuestra Solución</a>
            <a href="#olivar" className="hover:text-white transition-colors">Especialistas Olivar</a>
            <a href="#precios" className="hover:text-white transition-colors">Precios</a>
            <a href="#funcionamiento" className="hover:text-white transition-colors">Cómo Funciona</a>
            <a href="#faq" className="hover:text-white transition-colors">Preguntas</a>
          </div>
          <div className="flex gap-3 items-center">
            <Link href={`/login?tenant=${tenant.slug}`} className="px-4 py-2 text-sm font-bold text-white/70 hover:text-white transition-colors hidden sm:block">
              Acceso Socio
            </Link>
            <Link href={`/planes?tenant=${tenant.slug}`}>
              <button
                className="px-5 py-2.5 text-xs sm:text-sm font-black rounded-xl transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2"
                style={{ backgroundColor: primaryColor, color: '#000' }}
              >
                Registrar Explotación <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="relative pt-40 pb-28 px-6 w-full text-center z-10 animate-in fade-in duration-1000 min-h-[90vh] flex flex-col justify-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/images/hero_olivos_v2.png"
            alt="Paisaje de olivar tradicional en Andalucía"
            className="w-full h-full object-cover opacity-25 mix-blend-luminosity scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#07090e]/90 via-[#07090e]/95 to-[#07090e]"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-black uppercase tracking-wider mb-8"
            style={{
              backgroundColor: `${primaryColor}10`,
              borderColor: `${primaryColor}25`,
              color: primaryColor
            }}
          >
            <Leaf className="w-4 h-4" />
            <span>Soporte Oficial SIEX y PAC para Olivareros</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight mb-8 text-white leading-tight">
            Olvídate del papeleo en tu olivar.
            <br />
            <span style={{ color: primaryColor, textShadow: `0 0 40px ${primaryColor}30` }}>
              Tu Cuaderno de Campo Digital, al día y sin dolores de cabeza.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
            Cumple con la normativa oficial SIEX, asegura tus subvenciones de la PAC y supera cualquier inspección de fitosanitarios. Con la sencillez del móvil y el asesoramiento constante de tu cooperativa.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm sm:text-base text-gray-300 font-bold mb-12">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: primaryColor }} /> Sin tecleados complejos</span>
            <span className="hidden sm:block text-gray-700">•</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: primaryColor }} /> 100% Homologado SIEX / MAPA</span>
            <span className="hidden sm:block text-gray-700">•</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: primaryColor }} /> Supervisado por Ingenieros Agrónomos</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-md mx-auto sm:max-w-none">
            <Link href="#precios" className="w-full sm:w-auto">
              <button
                className="w-full sm:w-auto h-14 px-8 text-base font-black rounded-xl transition-all shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:scale-105 active:scale-95"
                style={{ backgroundColor: primaryColor, color: '#000' }}
              >
                Ver Tarifas y Planes
              </button>
            </Link>
            {tenant.contact_phone && (
              <a href={`tel:${cleanPhone}`} className="w-full sm:w-auto">
                <button className="w-full sm:w-auto h-14 px-8 rounded-xl font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-3 backdrop-blur-md">
                  <Phone className="w-5 h-5" />
                  Llamar a la Cooperativa ({tenant.contact_phone})
                </button>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* 2. BLOQUE DE PROBLEMAS REALES */}
      <section id="problemas" className="py-24 relative border-b border-white/5 bg-gradient-to-b from-transparent to-[#0a0d14]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-red-500">El Reto del Campo Actual</span>
            <h2 className="text-3xl md:text-5xl font-black mt-2 mb-4 text-white">¿Te roban más tiempo las leyes que tus propios olivos?</h2>
            <p className="text-gray-400 text-lg">
              La burocracia agrícola en España no para de aumentar. Llevar al día las fincas ya no consiste solo en labrar, abonar y cosechar; ahora exige convertirse en administrativo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Miedo a sanciones e inspecciones",
                desc: "Un simple error al apuntar la dosis de un fitosanitario o el número de registro de la maquinaria puede acarrear multas de miles de euros o el bloqueo de tu explotación."
              },
              {
                title: "Riesgo real de perder la PAC",
                desc: "Las nuevas normativas exigen declarar de forma telemática tus tratamientos. Si hay descuadres con el SIGPAC, tus ayudas directas de la PAC se retrasarán o denegarán."
              },
              {
                title: "Fines de semana perdidos en la oficina",
                desc: "Pasar tus valiosos ratos libres rodeado de albaranes, facturas de abonos, libretas de campo y carpetas de tratamientos en lugar de descansar con tu familia."
              },
              {
                title: "La informática no es tu fuerte",
                desc: "Los portales de la administración y las aplicaciones complejas no están pensadas para el día a día real en el tractor o en mitad del olivar. Son frustrantes y lentos."
              },
              {
                title: "Cambios normativos constantes",
                desc: "Vademécum, materias activas prohibidas de un mes para otro, ecorregímenes... Estar al día de lo que permite el ministerio es casi un trabajo a tiempo completo."
              },
              {
                title: "Estrés y agobio administrativo",
                desc: "La constante sensación de que te falta algún documento técnico por registrar y la preocupación constante ante la llamada de un inspector de Sanidad Vegetal."
              }
            ].map((problem, i) => (
              <GlassCard key={i} className="p-8 border-white/5 hover:border-red-500/20 hover:bg-red-500/[0.01] transition-all text-left group">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-6 bg-red-500/10 text-red-500">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-3 text-white">{problem.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{problem.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 3. LA SOLUCIÓN */}
      <section id="solucion" className="py-24 relative overflow-hidden border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: primaryColor }}>Tranquilidad Garantizada</span>
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
              Tú haces tu trabajo en el campo.<br />
              <span style={{ color: primaryColor }}>Nosotros te respaldamos con el Cuaderno.</span>
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed">
              El Cuaderno Digital de Campo no tiene por qué ser una tortura. Nuestra plataforma simplificada te permite registrar lo indispensable en dos clics. Y lo mejor de todo: **el equipo técnico de tu cooperativa está detrás para revisar y validar cada apunte** antes de que sea enviado al SIEX.
            </p>

            <div className="space-y-4">
              {[
                { title: "Gestión simplificada", desc: "Registra tus tratamientos y abonos en segundos, incluso por voz desde el tractor." },
                { title: "Validación técnica integrada", desc: "Nuestros ingenieros agrónomos revisan tus datos para confirmar que cumples con el ecorregímen." },
                { title: "Listo para inspecciones", desc: "Con un botón descargas el PDF/Excel legal oficial listo para presentar a Sanidad Vegetal." },
                { title: "Atención directa por WhatsApp", desc: "¿Una duda con un producto? Nos mandas una foto del albarán por WhatsApp y te ayudamos." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                    <Check size={14} className="stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">{item.title}</h4>
                    <p className="text-sm text-gray-400 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6">
              <a href={whatsAppLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-emerald-500 text-black font-black hover:scale-105 active:scale-95 transition-all shadow-lg">
                <MessageSquare className="w-5 h-5 fill-current" />
                Resolver dudas por WhatsApp
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-[120px] opacity-15" style={{ backgroundColor: primaryColor }} />
            <div className="relative z-10 border border-white/10 rounded-[2.5rem] bg-[#0c0f15]/80 p-8 shadow-2xl skew-y-1">
              <img
                src="/images/agricultor_app_v2.png"
                alt="Aplicación móvil del Cuaderno Digital en el olivar"
                className="w-full h-auto rounded-2xl border border-white/5 object-cover"
              />
              <div className="absolute -bottom-6 -right-6 p-6 rounded-3xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl z-20 max-w-[240px]">
                <p className="text-2xl font-black" style={{ color: primaryColor }}>100%</p>
                <p className="text-xs font-bold text-white mt-1">Sincronización Automática</p>
                <p className="text-[10px] text-gray-400 mt-1 leading-normal">Funciona sin cobertura en el campo y se guarda al conectar a internet.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ESPECIALIZACIÓN EN OLIVAR */}
      <section id="olivar" className="py-24 relative border-b border-white/5 bg-[#090b10]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: primaryColor }}>Especialistas en Olivar</span>
            <h2 className="text-3xl md:text-5xl font-black mt-2 mb-4 text-white">Diseñado por y para Olivareros profesionales</h2>
            <p className="text-gray-400 text-lg">
              No somos un software genérico para cualquier cultivo. Entendemos los retos específicos de la olivicultura de nuestro territorio, sea cual sea tu tipo de explotación.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-all flex gap-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                <Tractor className="w-6 h-6" />
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-xl text-white">Tipos de Olivar Controlados</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Totalmente optimizado para **olivar tradicional** (de secano o regadío, mecanizable o no), **olivar intensivo** y **olivar superintensivo** en seto. Registra marcos de plantación, calles e interlíneas de forma rápida.
                </p>
              </div>
            </div>

            <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-all flex gap-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                <Leaf className="w-6 h-6" />
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-xl text-white">Fitosanitarios y Vademécum de Olivar</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Control estricto de tratamientos específicos: **mosca del olivo, repilo, algodoncillo, prays, barrenillo**. El sistema comprueba al instante si el producto está autorizado para olivar y valida las dosis máximas permitidas.
                </p>
              </div>
            </div>

            <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-all flex gap-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-xl text-white">Fertilización y Ecorregímenes</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Lleva el control de unidades de nitrógeno, fósforo y potasio. Ideal para el cumplimiento de las cubiertas vegetales (vivas e inertes) y para justificar los cobros adicionales de la PAC en ecorregímenes.
                </p>
              </div>
            </div>

            <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-all flex gap-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-xl text-white">Trazabilidad en Almazara</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Tus tratamientos y parcelas se vinculan directamente con las entregas de aceituna en la almazara de la cooperativa, asegurando la trazabilidad alimentaria necesaria para aceites premium y DOP.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRECIOS */}
      <section id="precios" className="py-24 relative bg-[#06080c] border-b border-white/5">
        <TenantPricing tenantSlug={tenant.slug} primaryColor={primaryColor} />
      </section>

      {/* 6. CÓMO FUNCIONA */}
      <section id="funcionamiento" className="py-24 relative border-b border-white/5 bg-[#080a0f]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: primaryColor }}>Proceso Sencillo</span>
            <h2 className="text-3xl md:text-5xl font-black mt-2 mb-4 text-white">¿Cómo empezamos a trabajar?</h2>
            <p className="text-gray-400 text-lg">
              Solo necesitas 3 pasos muy simples para olvidarte de las libretas de papel y los apuntes de oficina.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto relative">
            {/* Step 1 */}
            <div className="text-center space-y-4 group">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center font-black text-2xl bg-white/5 border border-white/10 group-hover:border-emerald-500/30 transition-all" style={{ color: primaryColor }}>
                1
              </div>
              <h3 className="font-bold text-xl text-white">Sube tus datos SIGPAC</h3>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">
                Nosotros cargamos tus parcelas directamente desde el catastro. No tienes que meter coordenadas, recintos ni hectáreas a mano.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-4 group">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center font-black text-2xl bg-white/5 border border-white/10 group-hover:border-emerald-500/30 transition-all" style={{ color: primaryColor }}>
                2
              </div>
              <h3 className="font-bold text-xl text-white">Apunta con un par de clics</h3>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">
                Registra tus fitosanitarios, labores y abonos en nuestra app móvil simplificada o dictándolo por voz directamente en el tractor.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-4 group">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center font-black text-2xl bg-white/5 border border-white/10 group-hover:border-emerald-500/30 transition-all" style={{ color: primaryColor }}>
                3
              </div>
              <h3 className="font-bold text-xl text-white">Tú tranquilo, nosotros revisamos</h3>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">
                El equipo técnico de la cooperativa supervisa tus datos de forma automatizada y se encarga del volcado legal al SIEX sin que te enteres.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIOS */}
      <section className="py-24 relative border-b border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: primaryColor }}>Opiniones Reales</span>
            <h2 className="text-3xl md:text-5xl font-black mt-2 mb-4 text-white">Lo que dicen los olivareros</h2>
            <p className="text-gray-400 text-lg">
              Compañeros de tu zona que ya han dado el paso para digitalizar su explotación y quitarse el agobio de los papeles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <GlassCard className="p-8 text-left relative overflow-hidden flex flex-col justify-between">
              <div className="text-8xl text-white/5 absolute -top-4 right-2 font-serif">"</div>
              <p className="text-gray-300 italic mb-8 relative z-10 text-sm leading-relaxed">
                "Al principio le tenía pánico a esto del cuaderno digital. Yo con los ordenadores me llevo regular, pero con la aplicación móvil es facilísimo. Apunto lo que tiro de abono o veneno en el mismo día desde el olivo y me olvido. Y si me equivoco, mi ingeniero en la cooperativa me avisa."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full flex items-center justify-center font-black" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                  FJ
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Francisco J. Galán</h4>
                  <p className="text-xs text-gray-400">Olivarero Tradicional (Úbeda, Jaén)</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-8 text-left relative overflow-hidden flex flex-col justify-between">
              <div className="text-8xl text-white/5 absolute -top-4 right-2 font-serif">"</div>
              <p className="text-gray-300 italic mb-8 relative z-10 text-sm leading-relaxed">
                "Llevo 40 hectáreas de olivar superintensivo y el control de fitosanitarios era un infierno de albaranes. Con el cuaderno de campo digital, no solo voy al día ante inspecciones de sanidad vegetal, sino que llevo un control exacto de los costes por finca. Ha sido un cambio brutal."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full flex items-center justify-center font-black" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                  MM
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Manuel Muñoz</h4>
                  <p className="text-xs text-gray-400">Explotación Profesional (Priego de Córdoba)</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-8 text-left relative overflow-hidden flex flex-col justify-between">
              <div className="text-8xl text-white/5 absolute -top-4 right-2 font-serif">"</div>
              <p className="text-gray-300 italic mb-8 relative z-10 text-sm leading-relaxed">
                "Tener la tranquilidad de que nuestros ingenieros agrónomos de la cooperativa están supervisando el cuaderno antes de subirlo al SIEX nos da una paz mental increíble. Sabes que cobras la PAC seguro y sin retrasos por errores técnicos."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full flex items-center justify-center font-black" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                  AG
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Antonio Gutiérrez</h4>
                  <p className="text-xs text-gray-400">Socio de Cooperativa (Baena, Córdoba)</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 9. FAQ */}
      <section id="faq" className="py-24 bg-[#06080c] border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-black mb-16 text-center text-white">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            {[
              {
                q: '¿Es obligatorio llevar el Cuaderno Digital en el olivar?',
                a: 'Sí, la normativa del Ministerio de Agricultura (MAPA) establece la obligatoriedad progresiva del cuaderno de campo digital para todas las explotaciones que realicen tratamientos fitosanitarios o soliciten ayudas de la PAC. No disponer de él puede bloquear tus ayudas y provocar sanciones.'
              },
              {
                q: '¿Qué ocurre si no registro mis tratamientos a tiempo?',
                a: 'La administración cruza datos telemáticamente. Los retrasos o la falta de concordancia en los tratamientos fitosanitarios de olivar y el uso de maquinaria pueden suspender el abono de la PAC o generar inspecciones sorpresa por parte de las comunidades autónomas.'
              },
              {
                q: 'No me llevo bien con la informática, ¿podré usarlo?',
                a: 'Totalmente. El sistema se ha diseñado específicamente para ser operado con facilidad extrema por agricultores de todas las edades. Cuenta con botones grandes, opción de dictar labores por voz y, lo más importante, el respaldo presencial o por WhatsApp de los técnicos de tu cooperativa.'
              },
              {
                q: '¿Sirve para superar inspecciones oficiales de Sanidad Vegetal?',
                a: 'Sí. El cuaderno digital exporta al instante los modelos oficiales homologados por el MAPA y el SIEX. Al incluir todas las materias activas autorizadas en el olivar, las dosis máximas y los aplicadores con carnet en vigor, pasarás cualquier inspección sin ningún problema.'
              },
              {
                q: '¿Cómo envío los datos de mis tratamientos y compras?',
                a: 'Puedes anotarlos en el momento desde la app móvil en tu tractor. Si lo prefieres, también puedes hacer una foto a los albaranes de compra y enviárnoslos directamente por WhatsApp para que la cooperativa te guíe en el registro.'
              }
            ].map((faq, i) => (
              <details key={i} className="group border-b border-white/10 pb-4">
                <summary className="font-bold text-lg text-white flex items-center justify-between cursor-pointer list-none py-3 select-none">
                  <span className="flex items-center gap-3">
                    <span style={{ color: primaryColor }}>•</span> {faq.q}
                  </span>
                  <span className="transition-transform duration-300 group-open:rotate-180 text-gray-500">
                    ▼
                  </span>
                </summary>
                <div className="text-gray-400 text-sm leading-relaxed pl-6 pt-2 animate-in fade-in duration-300">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 10. CTA FINAL */}
      <section className="py-28 px-6 text-center relative bg-gradient-to-t from-black to-[#07090e]">
        <div className="max-w-4xl mx-auto relative z-10 space-y-8">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-black" style={{ backgroundColor: primaryColor }}>
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
            El campo no espera,<br />tu tranquilidad tampoco.
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Protege tus ayudas PAC, olvídate de las sanciones de una vez por todas y dedica tu tiempo a lo que de verdad importa: tus cosechas.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none pt-4">
            <Link href={`/planes?tenant=${tenant.slug}`} className="w-full sm:w-auto">
              <button
                className="w-full sm:w-auto h-14 px-10 text-lg font-black rounded-xl transition-all shadow-[0_0_35px_rgba(255,255,255,0.05)] hover:scale-105 active:scale-95"
                style={{ backgroundColor: primaryColor, color: '#000' }}
              >
                Empezar con mi Cuaderno Digital
              </button>
            </Link>
            {tenant.contact_phone && (
              <a href={whatsAppLink} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto h-14 px-8 rounded-xl font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-3">
                  <MessageSquare className="w-5 h-5" />
                  Escríbenos por WhatsApp
                </button>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-white/5 text-center bg-[#05060a] space-y-4">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} {tenant.name}. Todos los derechos reservados.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-gray-500 max-w-2xl mx-auto leading-relaxed">
          {tenant.address && <span>Dirección: {tenant.address}</span>}
          {tenant.contact_phone && <span>| Teléfono: {tenant.contact_phone}</span>}
          {tenant.contact_email && <span>| Email: <a href={`mailto:${tenant.contact_email}`} className="underline">{tenant.contact_email}</a></span>}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-gray-400 mt-2">
          <a href={finalPrivacyUrl} target="_blank" rel="noreferrer" className="hover:text-white transition-colors underline">Política de Privacidad</a>
          <a href={finalTermsUrl} target="_blank" rel="noreferrer" className="hover:text-white transition-colors underline">Términos y Condiciones</a>
          <a href={finalLegalNoticeUrl} target="_blank" rel="noreferrer" className="hover:text-white transition-colors underline">Aviso Legal</a>
        </div>
      </footer>
    </div>
  );
}
