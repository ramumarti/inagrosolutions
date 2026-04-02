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
    <div className="max-w-lg mx-auto pb-32 relative px-4 sm:px-0 animate-in fade-in slide-in-from-bottom-4 duration-500 z-10">
      <div className="flex items-center gap-3 mb-8 pt-4">
        <button 
          onClick={() => router.push('/cuaderno/labores')} 
          className="p-2.5 bg-white/5 rounded-2xl text-white/70 hover:bg-white/10 shadow-sm border border-white/10 transition-all active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-black text-white tracking-tight uppercase">Nueva Labor</h1>
      </div>

      {!isOnline && (
        <div className="bg-amber-500/5 border border-amber-500/10 text-amber-500 px-4 py-4 rounded-[24px] flex items-center gap-3 mb-6 shadow-sm backdrop-blur-xl">
          <WifiOff size={22} className="text-amber-500" />
          <p className="text-[10px] font-black leading-tight uppercase tracking-[0.15em]">Modo Offline Activo</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Parcela Selector */}
        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-xl">
          <ParcelSelector 
            onSelect={setParcelaId} 
            selectedId={parcelaId} 
          />
        </div>

        {/* Tipo de Labor */}
        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-xl space-y-4">
          <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest leading-none mb-4 pl-1">Tipo de Actividad</label>
          <div className="grid grid-cols-1 gap-2.5">
            {TIPOS_LABOR.map((tipo) => (
              <button
                key={tipo.id}
                type="button"
                onClick={() => setTipoLabor(tipo.id)}
                className={`flex items-center justify-between p-5 rounded-2xl border transition-all text-left group ${
                  tipoLabor === tipo.id 
                    ? "bg-emerald-500/10 border-emerald-500/30 text-white shadow-xl shadow-emerald-500/5" 
                    : "bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`text-2xl transition-transform group-hover:scale-110 ${tipoLabor === tipo.id ? "grayscale-0" : "grayscale opacity-50"}`}>{tipo.icon}</span>
                  <span className={`font-black uppercase tracking-tight text-[13px] ${tipoLabor === tipo.id ? "text-emerald-400" : ""}`}>{tipo.label}</span>
                </div>
                {tipoLabor === tipo.id && (
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Detalles */}
        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-xl space-y-8">
           <div>
            <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest pl-1 mb-4 leading-none">Superficie (ha)</label>
            <div className="relative group">
              <input 
                type="number" step="0.01"
                className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 font-black text-xl text-white placeholder:text-white/5 shadow-inner transition-all"
                placeholder="Ej: 5.40 (Opcional)"
                value={superficie} onChange={(e) => setSuperficie(e.target.value)}
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-black text-white/20 uppercase tracking-widest group-focus-within:text-emerald-400 transition-colors">Hectáreas</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest pl-1 mb-4 leading-none">Descripción / Notas</label>
            <textarea 
              className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 font-medium text-white/70 text-base min-h-[120px] resize-none shadow-inner transition-all"
              placeholder="Detalles adicionales..."
              value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black py-6 rounded-[28px] shadow-2xl shadow-emerald-900/40 transition-all disabled:opacity-50 disabled:grayscale active:scale-[0.98] text-lg uppercase tracking-widest group mb-12"
        >
          {isSaving ? "Guardando Registro..." : <><Save size={24} className="group-hover:rotate-12 transition-transform" /> Guardar en SIEX</>}
        </button>
      </form>
    </div>
  );
}
