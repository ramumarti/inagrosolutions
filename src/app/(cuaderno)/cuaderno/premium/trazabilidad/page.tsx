"use client";

import { useState } from "react";
import { ArrowLeft, MapPin, Truck, Save, PackageSearch } from "lucide-react";
import { useRouter } from "next/navigation";
import PremiumLock from "@/components/cuaderno/PremiumLock";

export default function TrazabilidadPage() {
  const router = useRouter();
  const [isPremium] = useState(true); // Simulamos que el usuario es Premium para probar

  return (
    <div className="max-w-lg mx-auto pb-24 relative space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => router.back()} className="p-2.5 bg-white rounded-full text-indigo-600 hover:bg-gray-100 shadow-sm border border-indigo-100">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-indigo-950">Trazabilidad y Origen</h1>
      </div>

      <PremiumLock 
        hasAccess={isPremium} 
        moduleName="Trazabilidad Blockchain" 
        description="Genera pasaportes de origen, registra destinos comerciales y cumple con el cuaderno de cadena alimentaria."
      >
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
              <PackageSearch size={24} />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">Nueva Expedición</h2>
              <p className="text-gray-500 text-xs mt-0.5">Asigna el lote de la cosecha a un destino.</p>
            </div>
          </div>

          <form className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Lote / Albarán</label>
              <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium" placeholder="EJ: L-2026-AB" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Cantidad (kg)</label>
                <input type="number" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Finca de Origen</label>
                <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold text-gray-700">
                  <option>Seleccionar...</option>
                  <option>El Olivar</option>
                  <option>Parcela Norte</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Destino Comercial</label>
              <div className="relative">
                <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium" placeholder="Cooperativa, Mayorista o Distribuidor..." />
              </div>
            </div>

            <button type="button" className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-600/30 transition-all">
              <Save size={20} /> Guardar Trazabilidad
            </button>
          </form>
        </div>
      </PremiumLock>
    </div>
  );
}
