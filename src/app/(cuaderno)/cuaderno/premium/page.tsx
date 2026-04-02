"use client";

import React from "react";
import { 
  ArrowLeft, 
  Sparkles, 
  Star, 
  CloudRain, 
  Droplets, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  Cpu,
  BarChart4
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { Badge } from "@/components/ui/Badge";

export default function PremiumLandingPage() {
  const router = useRouter();

  const features = [
    { 
      title: "Predictor IA Plagas", 
      desc: "Anticípate a plagas como el Repilo o la Mosca con un 94% de precisión basándonos en tu microclima.",
      icon: <Sparkles className="text-emerald-400" />,
      tag: "VIBRANTE"
    },
    { 
      title: "Optimización de Agua", 
      desc: "Ahorra un 30% de agua recibiendo pautas de riego basadas en la transpiración real del olivar.",
      icon: <Droplets className="text-blue-400" />,
      tag: "ACTIVO"
    },
    { 
      title: "Asistente PAC / SIEX", 
      desc: "Validación automática de registros para asegurar que cumples todos los requisitos de las ayudas del PAC.",
      icon: <ShieldCheck className="text-indigo-400" />,
      tag: "SOPORTE"
    },
    { 
      title: "Sensores Satelitales", 
      desc: "Monitorización de vigor (NDVI) y estrés hídrico de cada parcela desde tu bolsillo.",
      icon: <Cpu className="text-rose-400" />,
      tag: "PREMIUM"
    }
  ];

  return (
    <div className="max-w-lg mx-auto pb-32 px-4 sm:px-0 relative z-10 animate-in fade-in duration-1000">
      {/* Background Decor */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex items-center justify-between mb-10 pt-4">
        <button 
          onClick={() => router.push('/cuaderno')}
          className="p-2.5 bg-white/5 rounded-2xl text-white/70 hover:bg-white/10 shadow-sm border border-white/10 transition-all active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <Badge variant="premium" className="px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/10 border-indigo-500/30">
          Membresía Premium
        </Badge>
      </div>

      {/* Hero Section */}
      <div className="text-center mb-16 px-2">
        <div className="inline-flex p-5 rounded-[40px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 shadow-2xl mb-8 animate-bounce" style={{ animationDuration: '4s' }}>
           <Zap size={40} className="text-indigo-400 animate-pulse" />
        </div>
        <h1 className="text-[42px] font-black text-white tracking-tighter leading-[0.95] mb-6 glow-text">
          Agricultura <br/> <span className="text-indigo-400">Exponencial</span>
        </h1>
        <p className="text-lg text-white/50 font-medium leading-relaxed max-w-[320px] mx-auto mb-10">
          Desbloquea el poder de la Inteligencia Artificial en tu olivar y maximiza tu cosecha.
        </p>
        <GlowButton variant="premium" className="w-full py-6 text-sm font-black uppercase tracking-[0.3em] rounded-[24px] shadow-2xl shadow-indigo-500/20 group">
          Empezar Mi Prueba Gratis 7 Días <ChevronRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" />
        </GlowButton>
      </div>

      {/* Features Grid */}
      <div className="space-y-6 mb-12">
        <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.3em] px-1 mb-6">Ventajas Exclusivas</h3>
        {features.map((f, i) => (
          <div 
            key={i}
            className="group relative bg-white/5 p-6 rounded-[32px] border border-white/5 hover:border-indigo-500/30 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-indigo-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-start gap-4 pr-10">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shadow-inner group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all">
                {f.icon}
              </div>
              <div>
                <h4 className="font-black text-white text-base mb-1 tracking-tight">{f.title}</h4>
                <p className="text-sm text-white/40 font-medium leading-relaxed">{f.desc}</p>
              </div>
            </div>
            <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-100 transition-all">
               <CheckCircle2 size={20} className="text-indigo-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Social Proof / Stats */}
      <GlassCard className="p-10 text-center flex flex-col items-center gap-6 mb-12 bg-indigo-500/[0.03] border-indigo-500/10 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12"><BarChart4 size={120} /></div>
        <div className="flex -space-x-4 mb-2">
           {[1,2,3,4].map(i => (
             <div key={i} className="w-12 h-12 rounded-full border-2 border-indigo-900 bg-indigo-500 flex items-center justify-center text-white font-black text-xs shadow-xl">OL</div>
           ))}
        </div>
        <h4 className="text-lg font-black text-white px-4 leading-tight">Más de 500 agricultores ya optimizan su cosecha con IA</h4>
        <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-xs">
           <Star size={16} fill="currentColor" />
           <Star size={16} fill="currentColor" />
           <Star size={16} fill="currentColor" />
           <Star size={16} fill="currentColor" />
           <Star size={16} fill="currentColor" />
           <span className="text-white ml-2">4.9/5</span>
        </div>
      </GlassCard>

      {/* Final CTA */}
      <div className="text-center py-8">
        <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em] mb-6">Prueba sin compromiso. Cancela en cualquier momento.</p>
        <Link href="/cuaderno" className="text-white/40 hover:text-white font-bold uppercase tracking-widest text-[11px] transition-all">
          No ahora, prefiero el plan gratuito
        </Link>
      </div>
    </div>
  );
}
