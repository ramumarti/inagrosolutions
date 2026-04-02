"use client";

import { useState } from "react";
import { ArrowLeft, Save, Tractor, WifiOff, Clipboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { addToQueue } from "@/lib/offline-db";
import { useSyncStore } from "@/store/syncStore";
import { ParcelSelector } from "@/components/agriculture/ParcelSelector";

const TIPOS_LABOR = [
  { id: "poda", label: "Poda y Formación", icon: "✂️" },
  { id: "desbroce", label: "Desbroce / Desvaretado", icon: "🚜" },
  { id: "labrado", label: "Labrado / Arado", icon: "🌾" },
  { id: "picado", label: "Picado de Restos", icon: "🪵" },
  { id: "rastreado", label: "Rastreado / Grada", icon: "🚜" },
  { id: "recogida", label: "Recogida de Fruto", icon: "🌱" },
  { id: "otros", label: "Otros Trabajos", icon: "📋" },
];

export default function NuevaLaborPage() {
  const router = useRouter();
  const { isOnline, syncNow } = useSyncStore();

  const [parcelaId, setParcelaId] = useState<string>("");
  const [tipoLabor, setTipoLabor] = useState(TIPOS_LABOR[0].id);
  const [descripcion, setDescripcion] = useState("");
  const [superficie, setSuperficie] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parcelaId || !tipoLabor) {
      alert("Por favor selecciona una parcela y tipo de labor");
      return;
    }

    setIsSaving(true);
    try {
      await addToQueue({
        table: "labores",
        action: "INSERT",
        payload: {
          parcela_id: parcelaId,
          fecha: new Date().toISOString(),
          tipo_labor: tipoLabor,
          descripcion: descripcion || null,
          superficie_afectada: parseFloat(superficie) || null,
        }
      });

      if (isOnline) {
        await syncNow();
      }

      router.push("/cuaderno");
    } catch (error) {
      console.error(error);
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto pb-24 relative px-4 sm:px-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-6 pt-4">
        <button 
          onClick={() => router.back()} 
          className="p-2.5 bg-white rounded-full text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-100 transition-all active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black text-gray-900 tracking-tight">Nueva Labor Cultural</h1>
      </div>

      {!isOnline && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-4 rounded-3xl flex items-center gap-3 mb-6 shadow-sm">
          <WifiOff size={22} className="text-amber-600" />
          <p className="text-xs font-bold leading-tight uppercase tracking-wider">Modo Offline Activo</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Parcela Selector */}
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <ParcelSelector 
            onSelect={setParcelaId} 
            selectedId={parcelaId} 
          />
        </div>

        {/* Tipo de Labor */}
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-2">Tipo de Actividad</label>
          <div className="grid grid-cols-1 gap-2">
            {TIPOS_LABOR.map((tipo) => (
              <button
                key={tipo.id}
                type="button"
                onClick={() => setTipoLabor(tipo.id)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                  tipoLabor === tipo.id 
                    ? "bg-emerald-50 border-emerald-500/30 text-emerald-900 ring-2 ring-emerald-500/10" 
                    : "bg-gray-50 border-gray-100 text-gray-600 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{tipo.icon}</span>
                  <span className="font-bold text-sm">{tipo.label}</span>
                </div>
                {tipoLabor === tipo.id && (
                  <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Detalles */}
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-5">
           <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-2">Superficie (ha)</label>
            <div className="relative">
              <input 
                type="number" step="0.01"
                className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 font-bold text-gray-900 placeholder:text-gray-300 placeholder:font-normal"
                placeholder="Ej: 5.40 (Opcional)"
                value={superficie} onChange={(e) => setSuperficie(e.target.value)}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400 uppercase tracking-widest">Hectáreas</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-2">Descripción / Notas</label>
            <textarea 
              className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 font-medium text-gray-800 text-sm min-h-[100px] resize-none"
              placeholder="Detalles adicionales sobre el trabajo realizado..."
              value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black py-5 rounded-[28px] shadow-xl shadow-emerald-600/20 transition-all disabled:opacity-70 disabled:scale-[0.98] active:scale-95 text-sm uppercase tracking-widest mt-4"
        >
          {isSaving ? "Guardando Registro..." : <><Save size={20} /> Guardar Labor en SIEX</>}
        </button>
      </form>
    </div>
  );
}
