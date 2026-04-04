'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  ShieldCheck, 
  Leaf, 
  WifiOff, 
  Smartphone, 
  FileDown, 
  Lock,
  Menu,
  X,
  CreditCard,
  Target,
  BarChart4,
  MapPin,
  Sparkles,
  Tractor,
  Droplets
} from 'lucide-react';

// Reusable Components
const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] ${className}`}>
    {children}
  </div>
);

const GlowButton = ({ children, variant = 'primary', className = "" }: { children: React.ReactNode, variant?: 'primary' | 'secondary', className?: string }) => (
  <button className={`
    font-bold transition-all active:scale-95 flex items-center justify-center
    ${variant === 'primary' 
      ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]' 
      : 'bg-white/5 text-white/90 hover:bg-white/10 border border-white/20'}
    ${className}
  `}>
    {children}
  </button>
);

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');

  const prices = {
    basico: { month: '4,99', year: '49,99', ha: '5' },
    intermedio: { month: '19,99', year: '199,99', ha: '20' },
    avanzado: { month: '49,99', year: '499,99', ha: '50' },
    premium: { month: '89,99', year: '899,99', ha: '100' }
  };

  return (
    <div className="min-h-screen bg-[#0a100d] text-white selection:bg-emerald-500/30 overflow-x-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-600/10 blur-[150px] rounded-full pointer-events-none" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 bg-[#0a100d]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
               <Leaf size={26} className="text-white" />
             </div>
             <span className="text-2xl font-black tracking-tighter text-white">INAGROSOLUTIONS</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Ventajas', 'Funcionamiento', 'Planes'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-bold text-white/70 hover:text-white transition-colors">
                {item}
              </a>
            ))}
            <Link href="/login">
              <GlowButton variant="secondary" className="px-6 py-3 rounded-xl text-sm">
                Acceso Agricultor
              </GlowButton>
            </Link>
            <Link href="#planes">
              <GlowButton variant="primary" className="px-8 py-3 rounded-xl text-sm">
                Probar Gratis
              </GlowButton>
            </Link>
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white/80 p-2">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative z-10 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <ShieldCheck size={18} className="text-emerald-400" />
                <span className="text-sm font-bold text-emerald-400">100% Adaptado a Normativa SIEX y PAC</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight text-white">
                El Cuaderno Digital <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">
                  Creado por y para Agricultores.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-white/80 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Olvídate del papeleo. Registra tus tratamientos y labores directamente desde el tractor en tu móvil, <strong>incluso sin cobertura de internet</strong>. Genera informes oficiales (XML / Excel) con un solo clic.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                 <Link href="#planes">
                   <GlowButton variant="primary" className="px-10 py-5 rounded-2xl text-lg w-full sm:w-auto">
                     Ver Planes <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
                   </GlowButton>
                 </Link>
                 <Link href="/login">
                    <GlowButton variant="secondary" className="px-10 py-5 rounded-2xl text-lg w-full sm:w-auto">
                      Iniciar Sesión
                    </GlowButton>
                 </Link>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-emerald-500/20 blur-[120px] rounded-full group-hover:bg-green-600/20 transition-all duration-1000" />
              <GlassCard className="p-2 border-white/20 bg-white/[0.03] shadow-2xl transform hover:scale-[1.02] transition-all duration-700 overflow-hidden">
                <div className="relative h-[480px] w-full rounded-[24px] overflow-hidden">
                   <img 
                     src="/usage_context.png" 
                     alt="Agricultor en olivar tradicional usando InagroSolutions" 
                     className="w-full h-full object-cover"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                   <div className="absolute bottom-6 left-6 right-6 p-4 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl">
                     <p className="text-sm font-bold text-white mb-1">Registro en Campo</p>
                     <p className="text-xs text-white/60">Gestiona tus parcelas directamente desde el olivar, con o sin internet.</p>
                   </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* Features Matrix */}
      <section id="ventajas" className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center mb-16 text-center">
            <h2 className="text-sm font-black uppercase text-emerald-500 tracking-widest mb-4">Por qué elegirnos</h2>
            <p className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6">Diseñado para la realidad del campo</p>
            <p className="text-lg text-white/70 max-w-2xl font-medium">Sabemos que el agricultor no tiene tiempo que perder frente al ordenador. Nuestra tecnología se adapta a tus necesidades diarias.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <WifiOff />, title: "Uso sin Cobertura (Offline)", desc: "Apúntalo todo desde el tractor en la PWA de tu móvil aunque no tengas señal. Se subirá automáticamente al recuperar el internet." },
              { icon: <FileDown />, title: "Reportes Oficiales Automáticos", desc: "Cumple la ley sin esfuerzo. Exporta tu cuaderno oficial al formato XML requerido para la PAC y el SIEX en 1 segundo." },
              { icon: <Tractor />, title: "Fácil de Usar, Textos Grandes", desc: "Interfaz intuitiva, contrastes altos y botones muy grandes. Pensado para usarse rápido y sin conocimientos avanzados." },
              { icon: <Droplets />, title: "Control de Fitosanitarios y Abonos", desc: "Calcula Dosis y mantén el registro estricto legal de tus tratamientos. Incluye validadores para evitar multas." },
              { icon: <MapPin />, title: "Sincronización de Parcelas", desc: "Registra y agrupa las fincas, organiza qué siembras y lleva el Histórico por polígono de forma sencilla." },
              { icon: <BarChart4 />, title: "Control de Costes y Trazabilidad", desc: "Averigua si tu finca es rentable. Sigue todos los gastos por labor y mantén la trazabilidad de tus lotes de cosecha." }
            ].map((feat, i) => (
              <GlassCard key={i} className="p-8 border-white/10 hover:bg-white/[0.06] transition-all group rounded-2xl">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                   {React.cloneElement(feat.icon as React.ReactElement<{ size?: number }>, { size: 32 })}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
                <p className="text-white/70 leading-relaxed font-medium text-base">{feat.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planes" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6">Planes Sencillos y Transparentes</h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto font-medium mb-10">Invierte menos tiempo en burocracia y más tiempo en cultivar.</p>

            {/* Toggle Billing */}
            <div className="flex items-center justify-center gap-4 mb-12">
               <span className={`text-sm font-bold transition-colors ${billingInterval === 'month' ? 'text-white' : 'text-white/40'}`}>Mensual</span>
               <button 
                 onClick={() => setBillingInterval(billingInterval === 'month' ? 'year' : 'month')}
                 className="w-16 h-8 bg-white/10 rounded-full relative p-1 transition-colors hover:bg-white/20 border border-white/10"
               >
                 <div className={`w-6 h-6 bg-emerald-500 rounded-full transition-transform ${billingInterval === 'year' ? 'translate-x-8' : 'translate-x-0'}`} />
               </button>
               <span className={`text-sm font-bold transition-colors flex items-center gap-2 ${billingInterval === 'year' ? 'text-white' : 'text-white/40'}`}>
                 Anual <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded-full">Ahorra 2 Meses</span>
               </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
             {/* Básico */}
             <GlassCard className="p-8 border-white/10 flex flex-col rounded-3xl h-full shadow-2xl">
                <h3 className="text-xl font-black text-white mb-1">Básico</h3>
                <p className="text-white/60 mb-6 font-bold text-[10px] uppercase tracking-widest text-emerald-400">Hasta {prices.basico.ha} HA</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-white">{billingInterval === 'month' ? prices.basico.month : prices.basico.year} €</span>
                  <span className="text-white/50 font-bold text-sm">/{billingInterval === 'month' ? 'mes' : 'año'}</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1 text-white/80 font-medium text-sm">
                   <li className="flex items-start gap-2"><CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> Registro SIEX</li>
                   <li className="flex items-start gap-2"><CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> Fitosanitarios</li>
                   <li className="flex items-start gap-2"><CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> Fertilización</li>
                   <li className="flex items-start gap-2"><CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> Labores Agrícolas</li>
                   <li className="flex items-start gap-2"><CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> Gestión de Parcelas</li>
                </ul>
                <Link href="/login" className="w-full mt-auto">
                  <GlowButton variant="secondary" className="w-full py-4 rounded-xl text-sm">Comenzar</GlowButton>
                </Link>
             </GlassCard>

             {/* Intermedio */}
             <GlassCard className="p-8 border-white/10 flex flex-col rounded-3xl h-full shadow-2xl">
                <h3 className="text-xl font-black text-white mb-1">Intermedio</h3>
                <p className="text-white/60 mb-6 font-bold text-[10px] uppercase tracking-widest text-blue-400">Hasta {prices.intermedio.ha} HA</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-white">{billingInterval === 'month' ? prices.intermedio.month : prices.intermedio.year} €</span>
                  <span className="text-white/50 font-bold text-sm">/{billingInterval === 'month' ? 'mes' : 'año'}</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1 text-white/80 font-medium text-sm">
                   <li className="flex items-start gap-2"><CheckCircle2 size={18} className="text-blue-500 shrink-0" /> Todo lo de Básico</li>
                   <li className="flex items-start gap-2"><CheckCircle2 size={18} className="text-blue-500 shrink-0" /> <b>Control de Costes</b></li>
                   <li className="flex items-start gap-2"><CheckCircle2 size={18} className="text-blue-500 shrink-0" /> <b>Gestión de Cosechas</b></li>
                </ul>
                <Link href="/login" className="w-full mt-auto">
                  <GlowButton variant="secondary" className="w-full py-4 rounded-xl text-sm">Comenzar</GlowButton>
                </Link>
             </GlassCard>

             {/* Avanzado */}
             <GlassCard className="p-8 border-emerald-500/40 bg-emerald-500/5 flex flex-col rounded-3xl relative z-10 h-full shadow-[0_20px_60px_-15px_rgba(16,185,129,0.3)] border-2">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-white text-[10px] uppercase font-black tracking-widest rounded-full shadow-lg">
                  Recomendado
                </div>
                <h3 className="text-xl font-black text-emerald-400 mb-1">Avanzado</h3>
                <p className="text-white/60 mb-6 font-bold text-[10px] uppercase tracking-widest text-emerald-400">Hasta {prices.avanzado.ha} HA</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-white">{billingInterval === 'month' ? prices.avanzado.month : prices.avanzado.year} €</span>
                  <span className="text-emerald-400/50 font-bold text-sm">/{billingInterval === 'month' ? 'mes' : 'año'}</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1 text-white font-medium text-sm">
                   <li className="flex items-start gap-2"><CheckCircle2 size={18} className="text-emerald-400 shrink-0" /> Todo lo de Intermedio</li>
                   <li className="flex items-start gap-2"><CheckCircle2 size={18} className="text-emerald-400 shrink-0" /> <b>Trazabilidad Total</b></li>
                   <li className="flex items-start gap-2"><CheckCircle2 size={18} className="text-emerald-400 shrink-0" /> <b>Dashboards Pro</b></li>
                   <li className="flex items-start gap-2"><CheckCircle2 size={18} className="text-emerald-400 shrink-0" /> <b>Exportación PAC</b></li>
                </ul>
                <Link href="/login" className="w-full mt-auto">
                  <GlowButton variant="primary" className="w-full py-4 rounded-xl text-sm bg-emerald-500 hover:scale-105">Suscribirse</GlowButton>
                </Link>
             </GlassCard>

             {/* Premium */}
             <GlassCard className="p-8 border-amber-500/30 bg-amber-500/5 flex flex-col rounded-3xl h-full shadow-2xl">
                <h3 className="text-xl font-black text-amber-400 mb-1">Premium</h3>
                <p className="text-white/60 mb-6 font-bold text-[10px] uppercase tracking-widest text-amber-400">Hasta {prices.premium.ha} HA</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-white">{billingInterval === 'month' ? prices.premium.month : prices.premium.year} €</span>
                  <span className="text-amber-400/50 font-bold text-sm">/{billingInterval === 'month' ? 'mes' : 'año'}</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1 text-white/80 font-medium text-sm">
                   <li className="flex items-start gap-2"><CheckCircle2 size={18} className="text-amber-400 shrink-0" /> Todo lo de Avanzado</li>
                   <li className="flex items-start gap-2"><CheckCircle2 size={18} className="text-amber-400 shrink-0" /> <b>Sensores IoT</b></li>
                   <li className="flex items-start gap-2"><CheckCircle2 size={18} className="text-amber-400 shrink-0" /> <b>Alertas Inteligentes</b></li>
                   <li className="flex items-start gap-2"><CheckCircle2 size={18} className="text-amber-400 shrink-0" /> Estaciones Climáticas</li>
                </ul>
                <Link href="/login" className="w-full mt-auto">
                  <GlowButton variant="secondary" className="w-full py-4 rounded-xl text-sm">Suscribirse</GlowButton>
                </Link>
             </GlassCard>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-white/5 bg-[#050806]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 text-white rounded-lg flex items-center justify-center border border-emerald-400">
                <Leaf size={24} />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">INAGROSOLUTIONS</span>
           </div>
           
           <div className="flex flex-wrap justify-center gap-10 text-sm font-bold text-white/60">
              <a href="/privacy-policy" className="hover:text-emerald-400 transition-colors">Política de Privacidad</a>
              <a href="/cookie-policy" className="hover:text-emerald-400 transition-colors">Política de Cookies</a>
              <a href="/legal-notice" className="hover:text-emerald-400 transition-colors">Aviso Legal</a>
           </div>
           
           <p className="text-sm font-bold text-white/40">
             © 2026 Inagrosolutions.es
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
