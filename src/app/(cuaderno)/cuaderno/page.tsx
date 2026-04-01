"use client";

import { Sprout, Tractor, CloudRain, AlertTriangle, FileText, Droplets, Bug, ShoppingBasket, Trash2, FileSpreadsheet, HelpCircle } from "lucide-react";
import Link from "next/link";
import { SmartAssistant } from "@/components/agriculture/SmartAssistant";

export default function HoyPage() {
  return (
    <div className="space-y-6 max-w-lg mx-auto pb-24 px-4 sm:px-0">
      {/* Cabecera Premium (Mi Cuaderno) */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-black text-slate-900 tracking-tight leading-none">Mi Cuaderno</h1>
          <p className="text-[11px] text-slate-400 font-bold tracking-[0.2em] uppercase mt-2">Campaña 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/cuaderno/ayuda">
            <button className="w-12 h-12 flex items-center justify-center bg-white rounded-full text-blue-500 shadow-sm border border-slate-100 hover:bg-slate-50 transition-all active:scale-90">
              <HelpCircle size={22} />
            </button>
          </Link>
          <button className="w-12 h-12 flex items-center justify-center bg-white rounded-full text-green-600 shadow-sm border border-slate-100 hover:bg-slate-50 transition-all active:scale-90">
            <FileSpreadsheet size={22} />
          </button>
        </div>
      </div>

      {/* Alertas Inteligentes (IA) - Estilo Premium Pink */}
      <SmartAssistant />

      {/* Tarjeta de Clima 'Hoy en la parcela' */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-50">
        <h2 className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.15em] mb-4">Hoy en la Parcela</h2>
        <div className="flex items-center justify-between">
          <p className="text-[34px] font-black text-slate-900 tracking-tighter">12 Abr</p>
          <div className="flex items-center gap-3 bg-blue-50/50 px-4 py-2.5 rounded-3xl border border-blue-100">
            <CloudRain className="text-blue-500" size={20} />
            <span className="text-blue-700 font-black text-sm">22°C</span>
          </div>
        </div>
      </div>

      {/* Alerta de Cumplimiento PAC (Yellow Card) */}
      <div className="bg-amber-50/50 rounded-[32px] p-6 border border-amber-100 flex items-start gap-4">
        <div className="p-3 bg-white rounded-2xl border border-amber-100/50 text-amber-500 shadow-sm">
          <AlertTriangle size={20} />
        </div>
        <div>
          <h4 className="text-sm font-black text-amber-900 mb-1">Cumplimiento SIEX / PAC</h4>
          <p className="text-xs text-amber-800/70 font-medium leading-relaxed">
            Recordatorio: Las parcelas de Olivar Superintensivo requieren registros de riego mensuales para ser elegibles para la ayuda eco-régimen.
          </p>
        </div>
      </div>

      {/* Acceso Rápido a Registros (Lower Grid) */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/cuaderno/tratamientos/nuevo">
          <button className="w-full bg-white p-5 rounded-[28px] border border-slate-50 shadow-sm flex flex-col items-center hover:bg-slate-50 transition-all">
            <div className="bg-emerald-50 p-4 rounded-2xl mb-3 text-emerald-600">
               <Sprout size={24} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-700">Tratamientos</span>
          </button>
        </Link>
        <Link href="/cuaderno/labores/nuevo">
          <button className="w-full bg-white p-5 rounded-[28px] border border-slate-50 shadow-sm flex flex-col items-center hover:bg-slate-50 transition-all">
            <div className="bg-amber-50 p-4 rounded-2xl mb-3 text-amber-600">
               <Tractor size={24} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-700">Labores</span>
          </button>
        </Link>
        <Link href="/cuaderno/riegos/nuevo">
          <button className="w-full bg-white p-5 rounded-[28px] border border-slate-50 shadow-sm flex flex-col items-center hover:bg-slate-50 transition-all">
            <div className="bg-blue-50 p-4 rounded-2xl mb-3 text-blue-600">
               <Droplets size={24} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-700">Riegos</span>
          </button>
        </Link>
        <Link href="/cuaderno/plagas/nuevo">
          <button className="w-full bg-white p-5 rounded-[28px] border border-slate-50 shadow-sm flex flex-col items-center hover:bg-slate-50 transition-all">
            <div className="bg-red-50 p-4 rounded-2xl mb-3 text-red-600">
               <Bug size={24} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-700">Plagas</span>
          </button>
        </Link>
      </div>

      {/* Historial Corto */}
      <div className="pt-4 pb-12">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">Última Actividad</h3>
          <Link href="/cuaderno/historial" className="text-emerald-700 text-[11px] font-black uppercase tracking-widest">Ver todo</Link>
        </div>
        <div className="bg-white rounded-[32px] border border-slate-50 shadow-sm overflow-hidden text-sm">
          <div className="p-5 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-slate-50 p-2.5 rounded-xl text-slate-400 border border-slate-100"><FileText size={18} /></div>
              <div>
                <p className="font-black text-slate-800">Abono Fondo</p>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-0.5">Parcela El Olivar</p>
              </div>
            </div>
            <span className="text-slate-300 text-[10px] font-black uppercase">Ayer</span>
          </div>
          <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-slate-50 p-2.5 rounded-xl text-slate-400 border border-slate-100"><FileText size={18} /></div>
              <div>
                <p className="font-black text-slate-800">Poda</p>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-0.5">Parcela Norte</p>
              </div>
            </div>
            <span className="text-slate-300 text-[10px] font-black uppercase">10 Abr</span>
          </div>
        </div>
      </div>
    </div>
  );
}
