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
  Globe,
  Clock,
  AlertTriangle,
  FileCheck,
  ThumbsUp,
  Star,
  WifiOff,
  Droplets,
  Tractor,
  Sparkles,
  Calculator,
  Layout,
  Navigation
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
      { title: 'Gestión del Cuaderno Digital (CUE)', description: 'Tus registros al día y conectados al SIEX. Nosotros configuramos el cuaderno para que te olvides del papeleo.' },
      { title: 'Asesoramiento Técnico Integrado', description: 'Nuestros ingenieros o técnicos te ayudan con tratamientos, fertilización y normativas.' },
      { title: 'Tranquilidad con tu PAC', description: 'Garantizamos que tus registros cumplen todos los requisitos y eco-regímenes de la PAC vigentes.' },
      { title: 'Soporte Continuo', description: 'Atención personalizada por teléfono, WhatsApp o directamente con visitas a tu finca.' }
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
                  href="#pasos"
                  className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg border border-white/20 hover:bg-white/10 transition-colors"
                >
                  Cómo funciona
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

            {/* Decorative Side Mockup */}
            <div className="hidden lg:block relative animate-in fade-in zoom-in duration-1000">
              <div className="relative w-full aspect-[4/3] rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-3xl overflow-hidden shadow-2xl skew-y-2 hover:skew-y-0 transition-transform duration-700">
                 <img 
                   src="/brain/6214425b-d09c-45a9-aa76-4775c7712706/modern_agrotech_dashboard_1776933422129.png" 
                   alt="Plataforma Digital" 
                   className="w-full h-full object-cover opacity-90"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                 
                 {/* Floating floating elements */}
                 <div className="absolute -top-10 -right-10 w-40 h-40 blur-[80px]" style={{ backgroundColor: primaryColor + '44' }} />
                 <div className="absolute -bottom-10 -left-10 w-40 h-40 blur-[80px]" style={{ backgroundColor: secondaryColor + '22' }} />
                 
                 <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="p-2 rounded-lg" style={{ backgroundColor: primaryColor + '22' }}>
                          <ShieldCheck size={20} style={{ color: primaryColor }} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Garantía SIEX</p>
                          <p className="text-xs font-bold">Cumplimiento Legal 100%</p>
                       </div>
                    </div>
                    <div className="flex -space-x-2">
                       {[1,2,3].map(i => (
                         <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-white/10" />
                       ))}
                    </div>
                 </div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -top-6 -left-6 p-6 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl animate-bounce-slow">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                       <TrendingUp size={24} />
                    </div>
                    <div>
                       <p className="text-2xl font-black">+45%</p>
                       <p className="text-[10px] uppercase font-bold text-white/50">Eficiencia en campo</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* HERO ENDS */}
        
        {/* Empathy / Problem Section */}
        <section className="py-24 px-6 relative z-10 bg-black/50 border-y border-white/5">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full text-xs font-bold uppercase tracking-wider border border-white/10 bg-white/5 text-white/70">
              <AlertTriangle size={14} /> Te Entendemos
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-12">Sabemos lo que te preocupa</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="p-8 rounded-2xl bg-red-950/20 border border-red-500/20 flex flex-col items-center">
                <Clock className="text-red-400 w-12 h-12 mb-4" />
                <h3 className="text-xl font-bold mb-2">Falta de tiempo</h3>
                <p className="text-white/60">El campo exige tu atención diaria. No deberías perder horas valiosas delante de un ordenador rellenando informes.</p>
              </div>
              <div className="p-8 rounded-2xl bg-amber-950/20 border border-amber-500/20 flex flex-col items-center">
                <ShieldCheck className="text-amber-400 w-12 h-12 mb-4" />
                <h3 className="text-xl font-bold mb-2">Miedo a multas</h3>
                <p className="text-white/60">La normativa CUE/SIEX es estricta. Un error u olvido en tu libreta puede suponer inspecciones y recortes en tus ayudas.</p>
              </div>
              <div className="p-8 rounded-2xl bg-blue-950/20 border border-blue-500/20 flex flex-col items-center">
                <FileCheck className="text-blue-400 w-12 h-12 mb-4" />
                <h3 className="text-xl font-bold mb-2">Trámites liosos</h3>
                <p className="text-white/60">Nuevas leyes, SIGPAC, registros y validaciones que cambian constantemente sin que nadie te explique fácilmente qué hacer.</p>
              </div>
            </div>
            <div className="mt-12 text-center">
              <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r uppercase tracking-tight" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor || '#ffffff'})` }}>
                Por eso en nuestra entidad nos encargamos de todo.
              </p>
            </div>
          </div>
        </section>

        {/* Mechanism / How it works Section */}
        <section id="pasos" className="py-24 px-6 relative z-10 border-b border-white/5 bg-gradient-to-b from-black to-[#050505]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-sm font-black uppercase text-emerald-500 tracking-[0.3em] mb-4" style={{ color: primaryColor }}>Tu Digitalización en 3 Pasos</h2>
              <h3 className="text-4xl md:text-5xl font-black">¿Cómo empiezo mi Cuaderno Digital?</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Connector line (desktop) */}
              <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2 z-0" />
              
              {[
                { 
                  step: "01", 
                  title: "Únete a la Entidad", 
                  desc: "Regístrate en nuestro portal. Si ya eres socio, vincularemos tu cuenta automáticamente con tus datos de la cooperativa.",
                  icon: <Users size={24} />
                },
                { 
                  step: "02", 
                  title: "Configuración SIGPAC", 
                  desc: "Nosotros nos encargamos del trabajo pesado. Cargamos tus parcelas y fincas directamente del sistema oficial para que no tengas que picar datos.",
                  icon: <Navigation size={24} />
                },
                { 
                  step: "03", 
                  title: "Registra desde el Tractor", 
                  desc: "Ya puedes empezar a apuntar labores, abonos y tratamientos desde tu móvil, incluso sin cobertura. Nosotros generamos los libros legales.",
                  icon: <Tractor size={24} />
                }
              ].map((step, i) => (
                <div key={i} className="relative z-10 group text-center space-y-6">
                  <div 
                    className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center border border-white/10 bg-white/5 backdrop-blur-xl group-hover:scale-110 transition-transform duration-500 shadow-2xl"
                    style={{ backgroundColor: `${primaryColor}10` }}
                  >
                    <div style={{ color: primaryColor }}>{step.icon}</div>
                  </div>
                  <div className="space-y-3 px-4">
                    <span className="text-sm font-black opacity-20 uppercase tracking-widest">{step.step}</span>
                    <h4 className="text-2xl font-bold">{step.title}</h4>
                    <p className="text-white/50 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-16 text-center">
               <Link 
                  href={`/cuaderno/planes?tenant=${tenant.slug}`}
                  className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-lg uppercase tracking-widest transition-all hover:scale-105"
                  style={{ backgroundColor: primaryColor, color: '#000' }}
               >
                  Empezar ahora mismo <ArrowRight size={20} />
               </Link>
            </div>
          </div>
        </section>

        {/* Feature Matrix - Rescued from home-v1 */}
        <section id="tecnologia" className="py-24 px-6 relative z-10 bg-[#020202]">
           <div className="max-w-7xl mx-auto text-center mb-16 px-4">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-4" style={{ color: primaryColor }}>Tecnología InagroSolutions</h2>
              <p className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6">Diseñado para la realidad del campo</p>
              <p className="text-lg text-white/50 max-w-2xl mx-auto">Nuestra tecnología se adapta a tus necesidades diarias, no al revés.</p>
           </div>
           
           <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  icon: <WifiOff />, 
                  title: "Uso sin Cobertura (Offline)", 
                  desc: "Apúntalo todo desde el tractor incluso si no tienes señal. Se sincroniza automáticamente cuando recuperas internet." 
                },
                { 
                  icon: <FileCheck />, 
                  title: "Reportes SIEX Automáticos", 
                  desc: "Exporta tu cuaderno oficial al formato legal requerido por el Ministerio con un solo clic. Sin errores." 
                },
                { 
                  icon: <Layout />, 
                  title: "Interfaz con Botones Grandes", 
                  desc: "Pensado para manos de agricultor. Botones grandes, contrastes altos y navegación intuitiva sin distracciones." 
                },
                { 
                  icon: <Droplets />, 
                  title: "Control de Fitosanitarios", 
                  desc: "Calcula dosis exactas y evita multas. Incluimos validadores técnicos para que tus tratamientos cumplan la normativa." 
                },
                { 
                  icon: <Smartphone />, 
                  title: "Tu App de Cooperativa", 
                  desc: "Accede desde cualquier dispositivo. Es una PWA que se instala en tu pantalla de inicio como cualquier otra aplicación." 
                },
                { 
                  icon: <ShieldCheck />, 
                  title: "Soporte Técnico Especializado", 
                  desc: "Nuestros ingenieros revisan tus datos para que tengas tranquilidad total ante cualquier inspección de la administración." 
                }
              ].map((feat, i) => (
                <div key={i} className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all hover:bg-white/[0.07] backdrop-blur-sm">
                   <div 
                     className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                     style={{ backgroundColor: `${primaryColor}20`, color: primaryColor, border: `1px solid ${primaryColor}30` }}
                   >
                     {React.cloneElement(feat.icon as React.ReactElement, { size: 28 })}
                   </div>
                   <h4 className="text-xl font-bold mb-3">{feat.title}</h4>
                   <p className="text-white/50 leading-relaxed text-sm">{feat.desc}</p>
                </div>
              ))}
           </div>
        </section>
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
                {(services as any[]).map((srv: any, i: number) => {
                  const title = srv.title.toLowerCase();
                  let Icon = CheckCircle2;
                  if (title.includes('cuaderno') || title.includes('digital')) Icon = Layout;
                  if (title.includes('técnico') || title.includes('asesora')) Icon = ShieldCheck;
                  if (title.includes('pac') || title.includes('ayuda')) Icon = FileCheck;
                  if (title.includes('soporte') || title.includes('atención')) Icon = Smartphone;

                  return (
                    <div key={i} className="group p-8 rounded-[32px] bg-white/[0.03] border border-white/5 hover:border-white/20 hover:bg-white/[0.08] transition-all duration-500 relative overflow-hidden backdrop-blur-md flex flex-col h-full">
                       <div className="absolute top-0 left-0 w-full h-1 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700" style={{ backgroundColor: primaryColor }} />
                       <div 
                         className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border transition-all duration-500 shadow-xl group-hover:rotate-6 bg-white/5 border-white/10 group-hover:bg-white/10"
                       >
                         <Icon size={28} style={{ color: primaryColor }} />
                       </div>
                       <h3 className="font-black text-xl mb-4 tracking-tight text-white leading-tight">{srv.title}</h3>
                       <p className="text-white/40 leading-relaxed text-sm font-medium">{srv.description}</p>
                       <div className="mt-8 pt-8 border-t border-white/5 mt-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: primaryColor }}>
                         Saber más <ArrowRight size={14} />
                       </div>
                    </div>
                  );
                })}
             </div>

             {/* Pricing Packages Preview */}
             <div className="mt-24">
                <div className="text-center mb-16">
                   <h3 className="text-3xl font-black mb-4">Planes Adaptados a tu Explotación</h3>
                   <p className="text-white/50">Todos los planes incluyen el Cuaderno Digital oficial y soporte técnico.</p>
                </div>
                
                <div className="grid lg:grid-cols-4 gap-6">
                   {[
                     { name: "Básico", size: "Hasta 5 HA", color: "#6366f1" },
                     { name: "Intermedio", size: "Hasta 20 HA", color: "#3b82f6" },
                     { name: "Avanzado", size: "Hasta 50 HA", color: "#a855f7", best: true },
                     { name: "Premium", size: "Hasta 100 HA", color: "#f59e0b" }
                   ].map((pkg, i) => (
                     <div 
                       key={i} 
                       className={`p-8 rounded-[32px] border transition-all hover:scale-105 flex flex-col items-center text-center ${pkg.best ? 'bg-white/10 border-white/20 shadow-2xl relative overflow-hidden' : 'bg-white/5 border-white/10'}`}
                     >
                        {pkg.best && (
                          <div 
                            className="absolute -top-3 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-black z-20"
                            style={{ backgroundColor: primaryColor }}
                          >
                            Más popular
                          </div>
                        )}
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl" style={{ backgroundColor: `${pkg.color}30`, color: pkg.color }}>
                           <Sparkles size={24} />
                        </div>
                        <h4 className="text-2xl font-black mb-1">{pkg.name}</h4>
                        <span className="text-xs font-black uppercase tracking-widest opacity-40 mb-8">{pkg.size}</span>
                        
                        <ul className="space-y-4 mb-10 text-sm font-medium text-white/60">
                           <li className="flex items-center gap-2 justify-center"><CheckCircle2 size={14} style={{ color: primaryColor }} /> Registro SIEX</li>
                           <li className="flex items-center gap-2 justify-center"><CheckCircle2 size={14} style={{ color: primaryColor }} /> Fitosanitarios</li>
                           <li className="flex items-center gap-2 justify-center"><CheckCircle2 size={14} style={{ color: primaryColor }} /> PAC Digital</li>
                        </ul>
                        
                        <Link 
                           href={`/cuaderno/planes?tenant=${tenant.slug}`}
                           className="w-full py-4 rounded-2xl font-bold transition-colors border border-white/10 hover:bg-white/10 mt-auto"
                        >
                           Ver Detalles
                        </Link>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 px-6 relative z-10 bg-white/[0.02] border-t border-white/5">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/10 bg-white/5 text-white/70">
                <ThumbsUp size={14} /> Ventajas Exclusivas
              </div>
              <h2 className="text-4xl md:text-5xl font-black">Lo que ganas al unirte a la entidad</h2>
              <div className="space-y-6">
                {[
                  { title: 'Ahorras horas cada mes', desc: 'Olvídate del papeleo interminable o de encender el ordenador a deshoras. Ese tiempo es tuyo para el campo.' },
                  { title: 'Tranquilidad frente a inspecciones', desc: 'Nuestros técnicos especializados mantienen tus datos 100% correctos y preparados para pasar cualquier inspección oficial sin estrés.' },
                  { title: 'Toda tu explotación en el móvil', desc: 'Parcelas, tratamientos, operarios y estado de la PAC accesibles desde el teléfono en un clic, sin complicaciones.' }
                ].map((ben, i) => (
                  <div key={i} className="flex gap-4 items-start p-4 hover:bg-white/5 rounded-2xl transition-colors border border-transparent hover:border-white/10">
                    <div className="mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: secondaryColor }}>
                      <CheckCircle2 size={16} className="text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">{ben.title}</h4>
                      <p className="text-white/60 leading-relaxed mt-1">{ben.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 w-full relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-black to-transparent z-10 rounded-3xl" />
              <div className="p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden text-center z-20 shadow-2xl">
                <div className="absolute -right-8 -top-8 w-40 h-40 blur-[50px] opacity-20 pointer-events-none" style={{ backgroundColor: primaryColor }} />
                <h3 className="text-6xl md:text-7xl font-black mb-2" style={{ color: primaryColor }}>+500</h3>
                <p className="text-xl font-bold mb-8 uppercase tracking-widest text-white/80">Socios ya nos confían su gestión</p>
                <div className="flex justify-center gap-1 text-yellow-400 mb-6">
                  <Star fill="currentColor" size={24} />
                  <Star fill="currentColor" size={24} />
                  <Star fill="currentColor" size={24} />
                  <Star fill="currentColor" size={24} />
                  <Star fill="currentColor" size={24} />
                </div>
                <p className="italic text-white/70 text-lg md:text-xl leading-relaxed">
                  "El Cuaderno Digital me quitaba el sueño. Desde que la cooperativa se ocupa junto con inagrosolutions, tengo todo al día y la PAC en regla sin tener que tocar un solo botón."
                </p>
                <p className="mt-4 font-bold text-white">— Socio Agricultor</p>
              </div>
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
                  href="#planes"
                  className="inline-flex h-16 items-center justify-center rounded-2xl px-10 font-black text-lg transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] uppercase tracking-wider"
                  style={{ backgroundColor: 'white', color: 'black' }}
                >
                  Regístrate ahora
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
