"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Activity, Wallet, PieChart, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import PremiumLock from "@/components/cuaderno/PremiumLock";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPremiumPage() {
  const router = useRouter();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();
        
        setIsPremium(profile?.subscription_tier === 'premium');
      }
      setLoading(false);
    }
    checkAccess();
  }, []);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto pt-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-400 font-medium animate-pulse">Verificando suscripción...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pb-24 relative space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2.5 bg-white rounded-full text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-100">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Analítica Avanzada</h1>
        </div>
      </div>

      <PremiumLock 
        hasAccess={isPremium} 
        moduleName="Inteligencia Económica" 
        description="Desbloquea los Dashboards de rendimiento, trazabilidad desde semilla a venta, y control exacto de costes por labor agrícola."
      >
        {/* CONTENIDO PREMIUM */}
        <div className="space-y-6">
          
          {/* Tarjeta ROI Global */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 text-white shadow-lg border border-gray-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"></div>
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">Margen Proyectado</p>
                <h2 className="text-3xl font-extrabold mt-1 tracking-tight">18,450 <span className="text-lg font-medium text-gray-400">€</span></h2>
              </div>
              <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 p-2 rounded-xl flex items-center gap-1">
                <ArrowUpRight size={18} />
                <span className="text-sm font-bold">+12%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 relative z-10 border-t border-gray-800 pt-4">
              <div>
                <p className="text-gray-500 text-xs">Ingresos Estimados</p>
                <p className="font-bold text-gray-200 mt-0.5">24,500 €</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Costes Acumulados</p>
                <p className="font-bold text-red-400 mt-0.5 flex items-center gap-1">
                  6,050 € <ArrowDownRight size={14} />
                </p>
              </div>
            </div>
          </div>

          {/* Gráfico de Costes (CSS Bar Chart Mock) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <PieChart size={20} className="text-indigo-500" />
                Desglose Costes
              </h3>
              <select className="bg-gray-50 border border-gray-100 text-xs font-bold text-gray-600 rounded-lg px-2 py-1 outline-none">
                <option>Campaña 2026</option>
                <option>Campaña 2025</option>
              </select>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-700">Fitosanitarios y Abonos</span>
                  <span className="text-gray-900">3,400 €</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-rose-500 h-3 rounded-full" style={{ width: "55%" }}></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-700">Personal y Mano de Obra</span>
                  <span className="text-gray-900">1,850 €</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-amber-400 h-3 rounded-full" style={{ width: "30%" }}></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-700">Maquinaria (Diésel)</span>
                  <span className="text-gray-900">800 €</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-slate-700 h-3 rounded-full" style={{ width: "15%" }}></div>
                </div>
              </div>
            </div>

            <button className="w-full mt-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-bold rounded-xl transition-colors">
              Ver Reporte Detallado
            </button>
          </div>

          {/* Quick Info Box */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-3 text-sm">
            <Info size={20} className="text-indigo-500 shrink-0" />
            <p className="text-indigo-900 font-medium">El coste por hectárea ha subido un <strong>4%</strong> frente a la temporada anterior, presionado por el precio del Gasoil.</p>
          </div>
        </div>
      </PremiumLock>
    </div>
  );
}
