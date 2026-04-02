"use client";

import React from "react";
import { 
  Sprout, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  Globe, 
  Smartphone, 
  Layers, 
  Database,
  ArrowRight,
  Sparkles,
  CloudSun
} from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#060105] text-white selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-[100] backdrop-blur-xl border-b border-white/5 bg-[#060105]/80">
        <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Sprout className="text-white" size={24} />
             </div>
             <span className="text-2xl font-black tracking-tighter uppercase">Inagro<span className="text-emerald-400">Solutions</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-white/40">
             <a href="#features" className="hover:text-white transition-colors">Funciones</a>
             <a href="#siex" className="hover:text-white transition-colors">SIEX</a>
             <a href="#pricing" className="hover:text-white transition-colors">Precios</a>
          </div>

          <div className="flex items-center gap-4">
             <Link href="/login">
                <button className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-all">Acceso Usuario</button>
             </Link>
             <Link href="#pricing">
                <GlowButton variant="primary" className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest">
                   Comenzar Ahora
                </GlowButton>
             </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 px-6 overflow-hidden">
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <div className="flex justify-center mb-10">
               <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2 text-[10px] font-black text-emerald-400 tracking-[0.2em] uppercase animate-bounce">
                  <Sparkles size={12} /> Campaña 2026 Abierta
               </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-8 glow-text animate-in fade-in slide-in-from-bottom-10 duration-1000">
              Tu Cuaderno de <br /> Campo <span className="text-white">Inteligente</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/40 font-medium max-w-2xl mx-auto mb-14 leading-relaxed">
              Cumplimiento SIEX / PAC automático, telemetría en tiempo real y gestión inteligente de cultivos a un solo toque.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
               <Link href="#pricing">
                  <GlowButton variant="primary" className="w-full sm:w-auto px-12 py-6 rounded-2xl text-base font-black uppercase tracking-widest shadow-2xl shadow-emerald-500/20 group">
                    Explorar Demo <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
                  </GlowButton>
               </Link>
               <Link href="/ayuda/manual">
                  <button className="w-full sm:w-auto px-12 py-6 bg-white/5 border border-white/10 rounded-2xl text-base font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                    Guía Rápida
                  </button>
               </Link>
            </div>
          </div>

          {/* App Preview Mockup */}
          <div className="max-w-6xl mx-auto mt-24 relative px-4">
             <div className="absolute inset-0 bg-emerald-500/5 blur-[100px] -z-10 rounded-full" />
             <GlassCard className="p-4 border-white/10 bg-white/[0.02] shadow-[0_50px_100px_rgba(0,0,0,0.5)] rounded-[40px] overflow-hidden group">
                <div className="flex items-center gap-3 mb-4 px-4 bg-white/5 py-3 rounded-2xl border border-white/10">
                   <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/30" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/30" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/30" />
                   </div>
                   <div className="flex-1 bg-white/5 h-6 rounded-lg text-[10px] flex items-center justify-center text-white/20 font-black uppercase tracking-[0.2em] px-4 whitespace-nowrap overflow-hidden">
                      app.inagrosolutions.com / (cuaderno) / dashboard
                   </div>
                </div>
                <img 
                  src="/mockup.png" 
                  alt="App Interface Mockup" 
                  className="w-full rounded-[24px] opacity-40 grayscale brightness-50 group-hover:opacity-100 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="bg-[#060105]/60 backdrop-blur-lg border border-white/10 px-8 py-4 rounded-3xl text-sm font-black uppercase tracking-widest text-emerald-400">
                      Visualiza tus parcelas en Digital
                   </div>
                </div>
             </GlassCard>
          </div>
        </section>

        {/* Features Matrix */}
        <section id="features" className="py-32 px-6 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
               <h2 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.5em] mb-4">La Potencia de Inagro</h2>
               <p className="text-[40px] font-black tracking-tighter text-white leading-none">Todo lo que necesitas para tu explotación.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               {[
                 { icon: <ShieldCheck />, title: "SIEX / PAC Ready", desc: "Generación automática del cuaderno de campo oficial listo para el envío telemático." },
                 { icon: <Zap />, title: "Sincronización Offline", desc: "Registra tratamientos y labores sin cobertura. Tus datos se suben al detectar red." },
                 { icon: <Sparkles />, title: "Predictor IA", desc: "Nuestro asistente analiza el clima para avisarte de riesgos de plagas y enfermedades." },
                 { icon: <Database />, title: "Historial Ilimitado", desc: "Toda la trazabilidad de tus parcelas almacenada de forma segura por tiempo indefinido." },
                 { icon: <Smartphone />, title: "Mobile First", desc: "Optimizado para ser usado con guantes sobre el tractor. Interfaz de alto contraste." },
                 { icon: <CloudSun />, title: "Alertas Climáticas", desc: "Previsión hiper-localizada para cada una de tus parcelas SIGPAC vinculadas." }
               ].map((feat, i) => (
                 <GlassCard key={i} className="p-10 border-white/5 hover:bg-white/[0.04] transition-all group">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-400 mb-8 border border-white/10 group-hover:scale-110 transition-transform">
                       {React.cloneElement(feat.icon as React.ReactElement<{ size?: number }>, { size: 28 })}
                    </div>
                    <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight">{feat.title}</h3>
                    <p className="text-white/40 leading-relaxed font-medium">{feat.desc}</p>
                 </GlassCard>
               ))}
            </div>
          </div>
        </section>

        {/* SIEX Compliance Banner */}
        <section id="siex" className="py-32 bg-emerald-500/5 border-y border-emerald-500/10">
           <div className="max-w-4xl mx-auto px-6 text-center">
              <div className="flex justify-center mb-8">
                 <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                    <Layers size={40} />
                 </div>
              </div>
              <h2 className="text-[32px] font-black tracking-tight text-white mb-6 uppercase">SIEX: Se acabó la burocracia</h2>
              <p className="text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed italic">
                "Desde que usamos Inagro, el registro de fitosanitarios nos lleva 2 minutos al día en lugar de 2 horas al mes."
              </p>
              <div className="flex justify-center gap-12">
                 <div>
                    <div className="text-4xl font-black text-white mb-1">0</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/30">Errores PAC</div>
                 </div>
                 <div>
                    <div className="text-4xl font-black text-emerald-500 mb-1">100%</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400">SIEX-Ready</div>
                 </div>
              </div>
           </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 px-6 relative">
          <div className="max-w-7xl mx-auto">
             <div className="text-center mb-24">
                <h2 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.5em] mb-4">Planes y Precios</h2>
                <p className="text-[40px] font-black tracking-tighter text-white leading-none">Escala tu explotación sin límites.</p>
             </div>

             <div className="grid md:grid-cols-3 gap-8">
                {[
                  { 
                    name: "Gratuito", 
                    price: "0€", 
                    period: "para siempre",
                    features: ["Gestión hasta 2 parcelas", "Cuaderno Digital Básico", "Alertas meteorológicas"],
                    cta: "Empezar Gratis",
                    highlight: false
                  },
                  { 
                    name: "Básico", 
                    price: "9€", 
                    period: "al mes",
                    features: ["Registro de Tratamientos", "Productos Fitosanitarios", "Uso y Dosis", "Modo Simple"],
                    cta: "Elegir Básico",
                    highlight: false
                  },
                  { 
                    name: "Profesional", 
                    price: "19€", 
                    period: "al mes / finca",
                    features: ["Parcelas ilimitadas", "Exportación SIEX Oficial", "Predictor IA Avanzado", "Sincronización Offline"],
                    cta: "Prueba Pro",
                    highlight: true
                  },
                  { 
                    name: "Empresarial", 
                    price: "Personalizado", 
                    period: "grandes explotaciones",
                    features: ["Gestión Multi-Usuario", "API de Integración", "Consultoría Agronómica", "Formación VIP"],
                    cta: "Contactar Ventas",
                    highlight: false
                  }
                ].map((plan, i) => (
                  <GlassCard 
                    key={i} 
                    className={`p-8 relative flex flex-col ${plan.highlight ? 'border-emerald-500/30 bg-emerald-500/[0.03] scale-105 z-10 shadow-[0_20px_50px_rgba(16,185,129,0.1)]' : 'border-white/5'}`}
                  >
                    {plan.highlight && (
                       <div className="absolute top-0 right-8 -translate-y-1/2 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full">
                          Más popular
                       </div>
                    )}
                    <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.3em] mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                       <span className="text-4xl font-black text-white tracking-tighter">{plan.price}</span>
                       <span className="text-[9px] font-medium text-white/30 uppercase tracking-widest">{plan.period}</span>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                       {plan.features.map((feat, j) => (
                          <li key={j} className="flex items-start gap-2 text-[13px] text-white/60 font-medium">
                             <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                             </div>
                             {feat}
                          </li>
                       ))}
                    </ul>
                    {plan.name === "Básico" && (
                       <div className="mb-6 self-start px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-widest text-emerald-400">
                          Modo Simple
                       </div>
                    )}
                    <Link href={plan.name === "Empresarial" ? "mailto:ventas@inagrosolutions.com" : "/cuaderno"}>
                       <GlowButton 
                        variant={plan.highlight ? "primary" : "ghost"} 
                        className="w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]"
                       >
                          {plan.cta}
                       </GlowButton>
                    </Link>
                  </GlassCard>
                ))}
             </div>
          </div>
        </section>

        {/* App Context Image Section */}
        <section className="py-32 px-6">
           <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
              <div className="md:w-1/2 space-y-8">
                 <h2 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.5em]">El Cuaderno en Acción</h2>
                 <p className="text-[54px] font-black tracking-tighter text-white leading-none">Diseñado para el <span className="text-emerald-400">campo real</span>.</p>
                 <p className="text-xl text-white/50 leading-relaxed max-w-lg">
                    InagroSolutions no es solo software de oficina. Es una herramienta robusta pensada para ser usada bajo el sol, con guantes, y en los terrenos más exigentes del olivar español.
                 </p>
                 <ul className="space-y-4">
                    {['Lectura clara bajo luz solar directa', 'Interfaz preparada para uso táctil rápido', 'Sincronización instantánea con SIGPAC'].map((item, i) => (
                       <li key={i} className="flex items-center gap-3 text-white/70 font-bold">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                          {item}
                       </li>
                    ))}
                 </ul>
              </div>
              <div className="md:w-1/2 relative group">
                 <div className="absolute inset-0 bg-emerald-500/20 blur-[80px] rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <img 
                    src="/usage_context.png" 
                    alt="Farmer using Digital Field Notebook" 
                    className="w-full rounded-[48px] shadow-2xl border-4 border-white/5 grayscale-[30%] hover:grayscale-0 transition-all duration-700"
                 />
              </div>
           </div>
        </section>

        {/* Global CTA */}
        <section className="py-32 px-6">
           <GlassCard className="max-w-5xl mx-auto p-16 md:p-24 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border-emerald-500/20 text-center relative overflow-hidden flex flex-col items-center">
              <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 text-white">
                 <Sprout size={200} />
              </div>
              
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-10 leading-none">Únete a la nueva <br />era agrícola</h2>
              <p className="text-xl text-white/60 mb-14 max-w-xl mx-auto font-medium">Empieza a gestionar tus cultivos con InagroSolutions hoy mismo de forma gratuita.</p>
              
              <Link href="#pricing">
                 <GlowButton variant="primary" className="px-16 py-8 rounded-3xl text-xl font-black uppercase tracking-[0.2em] shadow-2xl">
                    Crear mi Cuaderno <ArrowRight className="ml-4" />
                 </GlowButton>
              </Link>
           </GlassCard>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-white/5">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-3">
               <Sprout className="text-emerald-500" size={20} />
               <span className="text-lg font-black tracking-tighter uppercase">Inagro<span className="text-emerald-400">Solutions</span></span>
            </div>
            
            <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-white/20">
               <a href="/legal-notice" className="hover:text-white transition-colors">Aviso Legal</a>
               <a href="/privacy-policy" className="hover:text-white transition-colors">Privacidad</a>
               <a href="/cookie-policy" className="hover:text-white transition-colors">Cookies</a>
            </div>
            
            <div className="text-[10px] font-black uppercase tracking-widest text-white/20">
               © 2026 InagroSolutions S.L.
            </div>
         </div>
      </footer>
    </div>
  );
}
