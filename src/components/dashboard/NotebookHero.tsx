"use client";

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { ArrowRight, Leaf, Sprout, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function NotebookHero() {
  return (
    <GlassCard className="relative overflow-hidden group border-emerald-500/20 bg-emerald-950/20 shadow-2xl shadow-emerald-950/10 mb-8 p-0">
      <div className="flex flex-col lg:flex-row gap-8 items-center">
        
        {/* Content Side */}
        <div className="flex-1 p-8 lg:p-12 space-y-6 relative z-10 text-left">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse">
            <Leaf className="w-3.5 h-3.5" />
            Especializado en Olivares
          </div>

          <div className="space-y-3">
            <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Cuaderno de <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">Explotación Digital</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl leading-relaxed">
              Gestión avanzada para el olivar tradicional y sostenible. Controle sus parcelas, tratamientos SIEX y trazabilidad con tecnología de precisión.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/cuaderno">
              <GlowButton variant="primary" className="px-8 py-6 text-lg rounded-2xl bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30">
                Entrar al Cuaderno
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </GlowButton>
            </Link>
            
            <Link href="/cuaderno/labores/nuevo">
              <GlowButton variant="ghost" className="px-8 py-6 text-lg rounded-2xl border-white/10 hover:bg-white/10 text-white flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-emerald-400" />
                Registro Rápido
              </GlowButton>
            </Link>
          </div>

          {/* Quick Stats Overlay */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-white/10">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Parcelas Activas</p>
              <p className="text-2xl font-bold text-white">45 <span className="text-sm font-normal text-slate-400">ha</span></p>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Último Tratamiento</p>
              <p className="text-2xl font-bold text-emerald-400">Hace 3h</p>
            </div>
          </div>
        </div>

        {/* Image Side (Hero) */}
        <div className="w-full lg:w-[45%] h-64 lg:h-[450px] relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 via-transparent to-transparent z-10 hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 to-transparent z-10 lg:hidden" />
          
          <div className="w-full h-full relative overflow-hidden group-hover:scale-105 transition-transform duration-700">
             <Image 
                src="/cuaderno-olivares.png"
                alt="Cuaderno Digital de Olivares Sostenibles"
                fill
                className="object-cover"
                priority
             />
             <div className="absolute inset-0 bg-emerald-900/10 mix-blend-overlay" />
          </div>

          {/* Secondary visual elements */}
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full" />
        </div>

      </div>
    </GlassCard>
  );
}
