'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Database, 
  Smartphone, 
  Globe, 
  Lock,
  ChevronRight,
  Menu,
  X,
  CreditCard,
  Target,
  BarChart4,
  Layers,
  Sparkles
} from 'lucide-react';

// Reusable Components
const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] ${className}`}>
    {children}
  </div>
);

const GlowButton = ({ children, variant = 'primary', className = "" }: { children: React.ReactNode, variant?: 'primary' | 'secondary', className?: string }) => (
  <button className={`
    font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center
    ${variant === 'primary' 
      ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]' 
      : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'}
    ${className}
  `}>
    {children}
  </button>
);

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#050510] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[150px] rounded-full" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-600/5 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
               <Layers size={22} className="text-white" />
             </div>
             <span className="text-2xl font-black tracking-tighter glow-text">IASOLUTIONS</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Funciones', 'Planes', 'Seguridad'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">{item}</a>
            ))}
            <Link href="/login">
              <GlowButton variant="secondary" className="px-6 py-2.5 rounded-xl text-[10px]">
                Iniciar Sesión
              </GlowButton>
            </Link>
            <Link href="#pricing">
              <GlowButton variant="primary" className="px-8 py-2.5 rounded-xl text-[10px]">
                Empieza Ya
              </GlowButton>
            </Link>
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative z-10 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                <Sparkles size={14} className="text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Portal SaaS Empresarial V2.0</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black leading-none tracking-tighter">
                TU NEGOCIO, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-500 to-purple-600">
                  SIN LÍMITES.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-white/40 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Gestión avanzada de micro-aplicaciones, control corporativo y automatización empresarial en una sola plataforma unificada.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                 <Link href="#pricing">
                   <GlowButton variant="primary" className="px-10 py-5 rounded-2xl text-base group">
                     Empieza Gratis <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
                   </GlowButton>
                 </Link>
                 <Link href="/login">
                    <GlowButton variant="secondary" className="px-10 py-5 rounded-2xl text-base">
                      Acceso Empresa
                    </GlowButton>
                 </Link>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-indigo-500/20 blur-[120px] rounded-full group-hover:bg-blue-600/20 transition-all duration-1000" />
              <GlassCard className="p-4 border-white/20 bg-white/[0.03] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] transform hover:scale-[1.02] transition-all duration-700">
                <div className="h-[400px] w-full bg-[#080815] rounded-[24px] border border-white/5 overflow-hidden relative">
                   <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent" />
                   {/* Simulated Dashboard UI */}
                   <div className="p-8 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/5 animate-pulse" />
                        <div className="space-y-2">
                          <div className="w-32 h-3 bg-white/10 rounded-full" />
                          <div className="w-20 h-2 bg-white/5 rounded-full" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="h-32 bg-white/5 rounded-2xl border border-white/5" />
                         <div className="h-32 bg-white/5 rounded-2xl border border-white/5" />
                      </div>
                      <div className="h-24 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 rounded-2xl border border-white/5" />
                   </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* Features Matrix */}
      <section id="funciones" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center mb-24 text-center">
            <h2 className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.8em] mb-4">Core Ecosystem</h2>
            <p className="text-[40px] md:text-5xl font-black tracking-tighter text-white">Potencia tu Transformación Digital</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Zap />, title: "Ready-to-Use", desc: "Despliega micro-aplicaciones en segundos con nuestra arquitectura sin fricción." },
              { icon: <ShieldCheck />, title: "Seguridad Pro", desc: "Encriptación de grado militar y control de acceso granular para tu equipo." },
              { icon: <Target />, title: "Escalabilidad", desc: "Desde startups hasta multinacionales. Crecemos con tus necesidades operativas." },
              { icon: <BarChart4 />, title: "Analytics", desc: "Métricas en tiempo real de uso y rendimiento de todas tus herramientas." },
              { icon: <Globe />, title: "Multi-idioma", desc: "Localizado para equipos globales en múltiples idiomas y regiones." },
              { icon: <Lock />, title: "Privacidad", desc: "Cumplimiento 100% GDPR y normativas locales de soberanía de datos." }
            ].map((feat, i) => (
              <GlassCard key={i} className="p-10 border-white/5 hover:bg-white/[0.04] transition-all group">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 mb-8 border border-white/10 group-hover:scale-110 transition-transform">
                   {React.cloneElement(feat.icon as React.ReactElement<{ size?: number }>, { size: 28 })}
                </div>
                <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight">{feat.title}</h3>
                <p className="text-white/40 leading-relaxed font-medium">{feat.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 relative bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black tracking-tighter text-white mb-4">Planes para Equipos Ganadores</h2>
            <p className="text-white/40 uppercase font-black text-[10px] tracking-widest">Escoge tu camino hacia el éxito</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
             {/* Starter */}
             <GlassCard className="p-10 border-white/10 flex flex-col items-center text-center">
                <span className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-4">Starter</span>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-black">€0</span>
                  <span className="text-white/20 font-black text-xs uppercase">/Forever</span>
                </div>
                <ul className="space-y-4 mb-10 w-full text-white/50 text-sm font-medium">
                   <li className="flex items-center gap-2 justify-center"><CheckCircle2 size={16} className="text-indigo-500" /> 1 Micro-App Activa</li>
                   <li className="flex items-center gap-2 justify-center"><CheckCircle2 size={16} className="text-indigo-500" /> 2 Usuarios</li>
                   <li className="flex items-center gap-2 justify-center"><CheckCircle2 size={16} className="text-indigo-500" /> Soporte Comunidad</li>
                </ul>
                <Link href="/register" className="w-full">
                  <GlowButton variant="secondary" className="w-full py-4 rounded-2xl text-xs">Empezar Gratis</GlowButton>
                </Link>
             </GlassCard>

             {/* Professional */}
             <GlassCard className="p-10 border-indigo-500/30 bg-indigo-500/[0.02] flex flex-col items-center text-center scale-105 shadow-[0_30px_60px_-15px_rgba(16,185,129,0.15)] relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-indigo-500 text-black text-[9px] font-black uppercase tracking-widest rounded-full">Más Popular</div>
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-4 font-bold">Professional</span>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-black">€29</span>
                  <span className="text-indigo-400/30 font-black text-xs uppercase">/mes</span>
                </div>
                <ul className="space-y-4 mb-10 w-full text-white/70 text-sm font-black">
                   <li className="flex items-center gap-2 justify-center"><CheckCircle2 size={16} className="text-indigo-500" /> Micro-Apps Ilimitadas</li>
                   <li className="flex items-center gap-2 justify-center"><CheckCircle2 size={16} className="text-indigo-500" /> Hasta 10 Usuarios</li>
                   <li className="flex items-center gap-2 justify-center"><CheckCircle2 size={16} className="text-indigo-500" /> API Access</li>
                   <li className="flex items-center gap-2 justify-center"><CheckCircle2 size={16} className="text-indigo-500" /> Soporte Prioritario</li>
                </ul>
                <Link href="/register" className="w-full">
                  <GlowButton variant="primary" className="w-full py-4 rounded-2xl text-xs">Escoger Pro</GlowButton>
                </Link>
             </GlassCard>

             {/* Enterprise */}
             <GlassCard className="p-10 border-white/10 flex flex-col items-center text-center">
                <span className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-4">Enterprise</span>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-black">€99</span>
                  <span className="text-white/20 font-black text-xs uppercase">/mes</span>
                </div>
                <ul className="space-y-4 mb-10 w-full text-white/50 text-sm font-medium">
                   <li className="flex items-center gap-2 justify-center"><CheckCircle2 size={16} className="text-indigo-500" /> White Labeling</li>
                   <li className="flex items-center gap-2 justify-center"><CheckCircle2 size={16} className="text-indigo-500" /> Usuarios Ilimitados</li>
                   <li className="flex items-center gap-2 justify-center"><CheckCircle2 size={16} className="text-indigo-500" /> SLA Garantizado</li>
                </ul>
                <Link href="/login" className="w-full">
                  <GlowButton variant="secondary" className="w-full py-4 rounded-2xl text-xs">Contactar Ventas</GlowButton>
                </Link>
             </GlassCard>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-black/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center font-black">I</div>
              <span className="text-xl font-black tracking-tighter">IASOLUTIONS</span>
           </div>
           <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-white/30">
              <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy</a>
              <a href="/cookie-policy" className="hover:text-white transition-colors">Cookies</a>
              <a href="/legal-notice" className="hover:text-white transition-colors">Legal</a>
           </div>
           <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
             © 2026 IASOLUTIONS. All systems operational.
           </p>
        </div>
      </footer>
    </div>
  );
}

function CheckCircle2({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/>
    </svg>
  );
}
