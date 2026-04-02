"use client";

import { Sprout, Tractor, CloudRain, AlertTriangle, FileText, Droplets, Bug, ShoppingBasket, Trash2, FileSpreadsheet, HelpCircle } from "lucide-react";
import Link from "next/link";
import { SmartAssistant } from "@/components/agriculture/SmartAssistant";

export default function HoyPage() {
  return (
    <div className="space-y-6 max-w-lg mx-auto pb-32 px-4 sm:px-0 relative z-10">
      {/* Cabecera Premium (Mi Cuaderno) */}
      <div className="flex items-center justify-between mb-8 pt-4">
        <div>
          <h1 className="text-[28px] font-black text-white tracking-tight leading-none glow-text">Mi Cuaderno</h1>
          <p className="text-[11px] text-white/30 font-bold tracking-[0.25em] uppercase mt-2">Campaña 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/cuaderno/ayuda">
            <button className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl text-blue-400 shadow-sm border border-white/10 hover:bg-white/10 transition-all active:scale-90">
              <HelpCircle size={22} />
            </button>
          </Link>
          <button className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl text-emerald-400 shadow-sm border border-white/10 hover:bg-white/10 transition-all active:scale-90">
            <FileSpreadsheet size={22} />
          </button>
        </div>
      </div>

      {/* Alertas Inteligentes (IA) - Estilo Premium Pink */}
      <SmartAssistant />

      {/* Tarjeta de Clima 'Hoy en la parcela' */}
      <div className="bg-white/5 backdrop-blur-xl rounded-[32px] p-8 shadow-2xl border border-white/10">
        <h2 className="text-[11px] text-white/30 font-bold uppercase tracking-[0.2em] mb-4">Hoy en la Parcela</h2>
        <div className="flex items-center justify-between">
          <p className="text-[34px] font-black text-white tracking-tighter">12 Abr</p>
          <div className="flex items-center gap-3 bg-blue-500/10 px-4 py-2.5 rounded-3xl border border-blue-500/20">
            <CloudRain className="text-blue-400" size={20} />
            <span className="text-blue-300 font-black text-sm">22°C</span>
          </div>
        </div>
      </div>

      <div className="bg-amber-500/5 rounded-[32px] p-6 border border-amber-500/10 flex items-start gap-4">
        <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-400 shadow-sm">
          <AlertTriangle size={20} />
        </div>
        <div>
          <h4 className="text-sm font-black text-amber-200 mb-1">Cumplimiento SIEX / PAC</h4>
          <p className="text-xs text-white/50 font-medium leading-relaxed">
            Recordatorio: Las parcelas de Olivar Superintensivo requieren registros de riego mensuales para ser elegibles para la ayuda eco-régimen.
          </p>
        </div>
      </div>

      {/* Acceso Rápido a Registros (Lower Grid) */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/cuaderno/tratamientos/nuevo">
          <button className="w-full bg-white/5 p-5 rounded-[28px] border border-white/5 shadow-sm flex flex-col items-center hover:bg-white/10 transition-all active:scale-95 group">
            <div className="bg-emerald-500/10 p-4 rounded-2xl mb-3 text-emerald-400 group-hover:scale-110 transition-transform">
               <Sprout size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">Tratamientos</span>
          </button>
        </Link>
        <Link href="/cuaderno/labores/nuevo">
          <button className="w-full bg-white/5 p-5 rounded-[28px] border border-white/5 shadow-sm flex flex-col items-center hover:bg-white/10 transition-all active:scale-95 group">
            <div className="bg-amber-500/10 p-4 rounded-2xl mb-3 text-amber-400 group-hover:scale-110 transition-transform">
               <Tractor size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">Labores</span>
          </button>
        </Link>
        <Link href="/cuaderno/riegos/nuevo">
          <button className="w-full bg-white/5 p-5 rounded-[28px] border border-white/5 shadow-sm flex flex-col items-center hover:bg-white/10 transition-all active:scale-95 group">
            <div className="bg-blue-500/10 p-4 rounded-2xl mb-3 text-blue-400 group-hover:scale-110 transition-transform">
               <Droplets size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">Riegos</span>
          </button>
        </Link>
        <Link href="/cuaderno/plagas/nuevo">
          <button className="w-full bg-white/5 p-5 rounded-[28px] border border-white/5 shadow-sm flex flex-col items-center hover:bg-white/10 transition-all active:scale-95 group">
            <div className="bg-rose-500/10 p-4 rounded-2xl mb-3 text-rose-400 group-hover:scale-110 transition-transform">
               <Bug size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">Plagas</span>
          </button>
        </Link>
      </div>

      {/* Historial Corto */}
      <div className="pt-4 pb-12">
        <div className="flex items-center justify-between mb-6 px-1">
          <h3 className="font-black text-white text-lg uppercase tracking-tight">Última Actividad</h3>
          <Link href="/cuaderno/historial" className="text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Ver todo</Link>
        </div>
        <div className="bg-white/5 rounded-[32px] border border-white/10 shadow-2xl overflow-hidden text-sm">
          <div className="p-5 border-b border-white/5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-white/5 p-2.5 rounded-xl text-white/30 border border-white/5"><FileText size={18} /></div>
              <div>
                <p className="font-black text-white">Abono Fondo</p>
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider mt-0.5">Parcela El Olivar</p>
              </div>
            </div>
            <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">Ayer</span>
          </div>
          <div className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-white/5 p-2.5 rounded-xl text-white/30 border border-white/5"><FileText size={18} /></div>
              <div>
                <p className="font-black text-white">Poda</p>
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider mt-0.5">Parcela Norte</p>
              </div>
            </div>
            <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">10 Abr</span>
          </div>
        </div>
      </div>
    </div>
  );
}
