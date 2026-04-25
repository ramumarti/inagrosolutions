'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShieldCheck, 
  TrendingUp, 
  Shield, 
  Layout, 
  Users, 
  ArrowRight, 
  Zap, 
  Globe, 
  BarChart4,
  ChevronRight,
  DollarSign,
  Monitor,
  Clock,
  Target
} from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProfitCalculator } from '@/components/ProfitCalculator';

import { LegalFooter } from '@/components/ui/LegalFooter';

export default function HomePage() {
  const [isCalcOpen, setIsCalcOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-base-100)] text-[var(--color-base-content)] scroll-smooth">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[var(--color-base-100)]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[var(--color-primary)] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,255,102,0.3)]">
              <TrendingUp className="text-black w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Inagro<span className="text-[var(--color-primary)]">Solutions</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <a href="#modelo" className="hover:text-[var(--color-primary)] transition-colors">Modelo de Negocio</a>
            <a href="#beneficios" className="hover:text-[var(--color-primary)] transition-colors">Beneficios</a>
            <a href="#normativa" className="hover:text-[var(--color-primary)] transition-colors">Normativa</a>
            <a href="#faqs" className="hover:text-[var(--color-primary)] transition-colors">FAQs</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <GlowButton variant="secondary" className="hidden sm:flex">
                Acceso Partner
              </GlowButton>
            </Link>
            <Link href="/signup">
              <GlowButton variant="primary">
                Crear mi plataforma gratis
              </GlowButton>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/hero_olivos.png" 
            alt="AgTech Background" 
            fill 
            className="object-cover opacity-30 scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-base-100)] via-[var(--color-base-100)]/60 to-[var(--color-base-100)]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm font-medium mb-8 animate-fade-in">
            <Target className="w-4 h-4" />
            <span>Para Cooperativas, Empresas y Técnicos</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black tracking-tighter mb-6 leading-[1.1]">
            El motor tecnológico para el <span className="glow-text">Cuaderno Digital</span> de tus agricultores
          </h1>
          
          <p className="text-xl lg:text-2xl text-white/90 max-w-4xl mx-auto mb-6 leading-relaxed font-bold">
            InagroSolutions es un desarrollo tecnológico al servicio de cooperativas, empresas y técnicos que quieren ayudar con la gestión del Cuaderno Digital de la Explotación Agrícola.
          </p>

          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Tú pones la marca, nosotros ponemos la tecnología. Gana el 50% de cada agricultor y genera ingresos recurrentes ayudando a tus asociados a cumplir la ley.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/signup" className="w-full sm:w-auto">
              <GlowButton className="text-xl px-12 py-8 h-auto shadow-[0_0_50px_rgba(0,255,102,0.3)] hover:scale-105 active:scale-95 transition-transform w-full sm:w-auto">
                CREAR MI PLATAFORMA GRATIS
                <ArrowRight className="ml-2 w-6 h-6" />
              </GlowButton>
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto py-12 bg-white/5 rounded-3xl border border-white/10">
            {[
              { label: 'Inversión Inicial', value: '0,00€' },
              { label: 'Tu Comisión', value: '50% TOTAL' },
              { label: 'Riesgo Técnico', value: 'CERO' },
              { label: 'Marca Blanca', value: '100% REAL' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-black text-[var(--color-primary)] mb-1">{stat.value}</div>
                <div className="text-xs text-white/40 uppercase tracking-widest font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Bar (Simplified) */}
      <section className="py-8 border-y border-white/5 bg-black/40">
        <div className="flex justify-center flex-wrap gap-12 opacity-30 text-xs font-black tracking-tighter uppercase grayscale">
          <span>COOPERATIVAS</span>
          <span>ASOCIACIONES</span>
          <span>INGENIERÍAS</span>
          <span>ASESORÍAS</span>
        </div>
      </section>

      {/* Modelo de Negocio (Section 3 - More Direct) */}
      <section id="modelo" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-6xl font-black mb-6 tracking-tight">Tu negocio, <span className="text-[var(--color-primary)]">en automático</span></h2>
            <p className="text-white/80 text-xl max-w-2xl mx-auto font-medium">
              Te entregamos una plataforma lista para facturar en menos de 5 minutos.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {[
                {
                  title: '1. Te registras GRATIS',
                  desc: 'Sin tarjetas, sin permanencia, sin cuotas de alta.',
                  icon: <Zap className="w-6 h-6 text-black" />
                },
                {
                  title: '2. Subes tu logo',
                  desc: 'Automáticamente toda la plataforma adopta tu identidad visual.',
                  icon: <Globe className="w-6 h-6 text-black" />
                },
                {
                  title: '3. Invitas a tus socios',
                  desc: 'Ellos ven una herramienta premium recomendada por TI.',
                  icon: <Users className="w-6 h-6 text-black" />
                },
                {
                  title: '4. Cobras el 50%',
                  desc: 'Enviamos tu comisión a tu cuenta cada mes. Así de simple.',
                  icon: <DollarSign className="w-6 h-6 text-black" />
                }
              ].map((step, i) => (
                <div key={i} className="flex gap-5 p-8 rounded-3xl bg-white/2 hover:bg-white/5 border border-white/5 transition-all group relative overflow-hidden">
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center group-hover:rotate-12 transition-transform shadow-[0_0_20px_rgba(0,255,102,0.4)]">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black mb-1">{step.title}</h3>
                    <p className="text-white/60 font-medium">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-[var(--color-primary)]/20 blur-3xl rounded-full opacity-30"></div>
              <GlassCard className="p-0 overflow-hidden border-white/10">
                <div className="bg-white/5 p-4 flex items-center justify-between border-b border-white/10">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                  </div>
                  <div className="px-3 py-1 bg-white/5 rounded text-xs text-white/40">app.tucooperativa.com</div>
                </div>
                <Image 
                  src="/images/dashboard_mockup.png" 
                  alt="Plataforma White Label Mockup" 
                  width={800} 
                  height={600}
                  className="w-full h-auto"
                />
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios (Section 4 & 5) */}
      <section id="beneficios" className="py-24 bg-white/2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-4xl font-bold mb-8">Control total sobre tus <span className="text-[var(--color-primary)]">asociados</span></h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  {
                    title: 'Panel centralizado',
                    desc: 'Visualiza el estado de cumplimiento de todas tus explotaciones desde un único monitor.',
                    icon: <Monitor className="w-5 h-5" />
                  },
                  {
                    title: 'Fidelización real',
                    desc: 'Ofrece una herramienta profesional que aporta valor diario al agricultor bajo tu marca.',
                    icon: <ShieldCheck className="w-5 h-5" />
                  },
                  {
                    title: 'Diferenciación',
                    desc: 'Posiciónate como una entidad digitalizada a la vanguardia del sector agrario.',
                    icon: <Zap className="w-5 h-5" />
                  },
                  {
                    title: 'Soporte Técnico',
                    desc: 'Accede a los cuadernos de tus asociados para asesorarles en tiempo real.',
                    icon: <Users className="w-5 h-5" />
                  }
                ].map((item, i) => (
                  <GlassCard key={i} className="p-6">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] mb-4">
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                    <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                  </GlassCard>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[var(--color-primary)]/20 to-transparent p-1 rounded-3xl h-full">
              <div className="bg-[var(--color-base-200)] p-8 rounded-[1.4rem] h-full flex flex-col justify-center border border-white/5">
                <div className="text-6xl font-bold text-[var(--color-primary)] mb-4">50%</div>
                <h3 className="text-2xl font-bold mb-4">Ingresos Compartidos</h3>
                <p className="text-white/50 mb-8 leading-relaxed">
                  No es un descuento. Es una comisión directa por cada gestión realizada. Sin cuotas de mantenimiento, sin gastos de entrada.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-white/70">
                    <ShieldCheck className="w-4 h-4 text-[var(--color-primary)]" />
                    Pagos mensuales automáticos
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/70">
                    <ShieldCheck className="w-4 h-4 text-[var(--color-primary)]" />
                    Transparencia total en el panel
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Normativa (Section 6) */}
      <section id="normativa" className="py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-3 py-1 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-bold uppercase tracking-wider mb-6">
                Cumplimiento SIEX
              </div>
              <h2 className="text-4xl font-bold mb-6">Anticípate al RD 1054/2022</h2>
              <p className="text-white/60 text-lg mb-8 leading-relaxed">
                El Cuaderno de Explotación Digital será obligatorio para todos los agricultores entre 2027 y 2028. No esperes a que sea tarde: conviértelo hoy en una ventaja competitiva para tu entidad.
              </p>
              <div className="space-y-6">
                {[
                  'Preparado para la integración con SIEX',
                  'Gestión automática de PAC y fertilización',
                  'Reducción de riesgos en inspecciones',
                  'Validación técnica de tratamientos fitosanitarios'
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3 font-medium">
                    <div className="w-5 h-5 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></div>
                    </div>
                    {text}
                  </div>
                ))}
              </div>
            </div>
            
            <GlassCard className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Shield className="w-32 h-32 text-[var(--color-primary)]" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Tranquilidad para tus agricultores</h3>
              <p className="text-white/40 mb-8">
                Al usar una plataforma supervisada por su cooperativa o asesoría, el agricultor reduce drásticamente el "papeleo" y se asegura de estar siempre dentro de la ley.
              </p>
              <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                <div className="text-sm font-bold uppercase tracking-widest text-white/30 mb-4 text-center">Hoja de ruta obligatoriedad</div>
                <div className="flex justify-between items-end gap-2 h-32">
                  <div className="flex-1 bg-white/10 rounded-t-lg h-1/4 relative group/bar">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-white/40">2024</div>
                  </div>
                  <div className="flex-1 bg-white/10 rounded-t-lg h-1/3 relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-white/40">2025</div>
                  </div>
                  <div className="flex-1 bg-white/20 rounded-t-lg h-1/2 relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-white/40">2026</div>
                  </div>
                  <div className="flex-1 bg-[var(--color-primary)]/50 rounded-t-lg h-full relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-[var(--color-primary)] font-bold">2027</div>
                    <div className="absolute inset-0 bg-[var(--color-primary)] blur-lg opacity-20"></div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Caso de Uso (Section 9) */}
      <section className="py-24 bg-gradient-to-b from-transparent to-[var(--color-primary)]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GlassCard className="p-12 border-[var(--color-primary)]/20 shadow-[0_0_50px_rgba(0,255,102,0.1)]">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">El potencial de tu entidad en números</h2>
                <div className="space-y-6">
                  <div className="flex justify-between text-lg border-b border-white/10 pb-4">
                    <span className="text-white/60">Número de asociados</span>
                    <span className="font-bold">200 agricultores</span>
                  </div>
                  <div className="flex justify-between text-lg border-b border-white/10 pb-4">
                    <span className="text-white/60">Ingreso estimado/año p.p.</span>
                    <span className="font-bold">120 €</span>
                  </div>
                  <div className="flex justify-between text-2xl pt-2 text-[var(--color-primary)]">
                    <span className="font-bold">Tu beneficio recurrente/año</span>
                    <span className="font-extrabold text-white">12.000 €</span>
                  </div>
                </div>
                <p className="mt-8 text-sm text-white/40 leading-relaxed italic">
                  * Basado en un modelo de facturación del 50% de ingresos compartidos. Los asociados obtienen una herramienta premium y tú obtienes una nueva línea de negocio sin costes operativos.
                </p>
              </div>
              <div className="relative group">
                <div className="aspect-square bg-[var(--color-primary)]/5 rounded-full absolute -inset-10 animate-pulse blur-3xl lg:block hidden"></div>
                <div className="text-center relative">
                  <div className="w-24 h-24 bg-[var(--color-primary)] rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,255,102,0.4)]">
                    <BarChart4 className="text-black w-12 h-12" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Escalabilidad Garantizada</h3>
                  <p className="text-white/50">
                    A medida que tus asociados crecen o que la normativa se vuelve más estricta, tu plataforma se revaloriza automáticamente.
                  </p>
                  <GlowButton className="mt-8" onClick={() => setIsCalcOpen(true)}>
                    Calcular mi beneficio
                  </GlowButton>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* CTA Intermedio */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold mb-8">¿Listo para lanzar tu propia plataforma?</h2>
        <Link href="/signup">
          <GlowButton className="text-xl px-12 py-8 h-auto shadow-[0_0_40px_rgba(0,255,102,0.2)]">
            Empezar ahora (Gratis)
          </GlowButton>
        </Link>
        <p className="mt-4 text-white/40 flex items-center justify-center gap-2">
          <Clock className="w-4 h-4" />
          Configuración en menos de 5 minutos
        </p>
      </section>

      {/* FAQs (Section 12) */}
      <section id="faqs" className="py-24 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-5xl font-bold mb-12 text-center tracking-tight">Preguntas frecuentes</h2>
          <div className="space-y-6">
            {[
              { q: '¿Tiene algún coste de mantenimiento para la entidad?', a: 'Ninguno. El registro, la personalización white label y el acceso al panel centralizado son totalmente gratuitos para cooperativas, ingenierías y asesores.' },
              { q: '¿Cómo recibo mis ingresos?', a: 'De cada pago que realiza un agricultor en tu plataforma, el sistema separa automáticamente el 50% para ti. Liquidamos tus beneficios de forma mensual directamente en tu cuenta.' },
              { q: '¿Es realmente White Label?', a: 'Sí. Puedes usar tu propio dominio (ej: cuaderno.tudominio.com), subir el logo de tu entidad y elegir los colores corporativos. Inagrosolutions desaparece de la vista del agricultor.' },
              { q: '¿Necesito conocimientos técnicos?', a: 'No. Nosotros nos encargamos de todo el despliegue técnico, actualizaciones legales y servidores. Tú solo te preocupas de tu negocio.' },
              { q: '¿Cumple con el SIEX?', a: 'Totalmente. La plataforma está diseñada bajo los requerimientos del RD 1054/2022 y se actualiza en tiempo real con cada cambio normativo del Ministerio.' }
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/2 border border-white/5 hover:border-white/10 transition-colors">
                <h4 className="text-lg font-bold mb-3 flex items-start gap-3">
                  <span className="text-[var(--color-primary)]">Q.</span>
                  {item.q}
                </h4>
                <p className="text-white/40 pl-7 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA (Section 13) */}
      <footer className="py-24 bg-black/60 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-[var(--color-primary)]/5 blur-[120px] rounded-full translate-y-1/2"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-6xl font-extrabold mb-8 tracking-tighter leading-tight">
            Convierte la normativa en una <br /> <span className="text-[var(--color-primary)]">nueva fuente de ingresos</span>
          </h2>
          <p className="text-xl text-white/50 mb-12 max-w-2xl mx-auto">
            Únete a la red de partners de Inagrosolutions y lidera la digitalización del campo en tu zona.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/signup" className="w-full sm:w-auto">
              <GlowButton className="text-lg px-8 py-6 h-auto w-full sm:w-auto">
                Crear mi plataforma gratis
              </GlowButton>
            </Link>
            <Link href="/signup" className="w-full sm:w-auto">
              <GlowButton variant="secondary" className="text-lg px-8 py-6 h-auto w-full sm:w-auto">
                Solicitar demo técnica
              </GlowButton>
            </Link>
          </div>
          
          <LegalFooter />
        </div>
      </footer>

      {/* Floating CTA (Mobile) */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
        <Link href="/signup">
          <GlowButton className="w-full shadow-2xl py-4 font-bold">
            Unirse como Partner
          </GlowButton>
        </Link>
      </div>
      <ProfitCalculator isOpen={isCalcOpen} onClose={() => setIsCalcOpen(false)} />
    </div>
  );
}
