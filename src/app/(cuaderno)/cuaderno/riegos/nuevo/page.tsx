"use client";

import { useState } from "react";
import { ArrowLeft, Save, Droplets, Clock, Ruler } from "lucide-react";
import { useRouter } from "next/navigation";
import { addToQueue } from "@/lib/offline-db";
import { useSyncStore } from "@/store/syncStore";

import { ParcelSelector } from "@/components/agriculture/ParcelSelector";

export default function NuevoRiegoPage() {
  const router = useRouter();
  const { isOnline, syncNow } = useSyncStore();

  const [parcelaId, setParcelaId] = useState<string>("");
  const [volumen, setVolumen] = useState("");
  const [unidad, setUnidad] = useState("m3");
  const [sistema, setSistema] = useState("Goteo");
  const [frecuencia, setFrecuencia] = useState("Diario");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!volumen || !parcelaId) return;

    setIsSaving(true);
    try {
      await addToQueue({
        table: "riegos",
        action: "INSERT",
        payload: {
          parcela_id: parcelaId,
          fecha: new Date().toISOString(),
          volumen: parseFloat(volumen),
          sistema: `${sistema} (${unidad})`,
          frecuencia: frecuencia,
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
    <div className="max-w-lg mx-auto pb-32 relative px-4 sm:px-0 z-10 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8 pt-4">
        <button 
          onClick={() => router.push('/cuaderno/riegos')} 
          className="p-2.5 bg-white/5 rounded-2xl text-white/70 hover:bg-white/10 shadow-sm border border-white/10 transition-all active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-black text-white tracking-tight uppercase">Registrar Riego</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Parcela Selector */}
        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-xl">
          <ParcelSelector 
            onSelect={setParcelaId} 
            selectedId={parcelaId} 
          />
        </div>

        {/* Volumen de Riego */}
        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-2 text-cyan-400 mb-2">
            <Ruler size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Caudal / Volumen</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-white/30 mb-3 uppercase tracking-widest pl-1 leading-none">Cantidad</label>
              <input 
                type="number" step="0.01" required
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all font-black text-2xl text-white shadow-inner"
                placeholder="0.00"
                value={volumen} onChange={(e) => setVolumen(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-white/30 mb-3 uppercase tracking-widest pl-1 leading-none">Unidad</label>
              <select 
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-cyan-500/50 font-bold text-white text-base appearance-none cursor-pointer"
                value={unidad} onChange={(e) => setUnidad(e.target.value)}
              >
                <option value="m3" className="bg-zinc-900">m³ (Total)</option>
                <option value="L/árbol" className="bg-zinc-900">L / Árbol</option>
                <option value="h" className="bg-zinc-900">Horas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sistema y Frecuencia */}
        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-xl space-y-8">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Clock size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Ajustes de Operación</span>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-white/30 mb-4 uppercase tracking-widest pl-1 leading-none">Sistema de Riego</label>
              <div className="grid grid-cols-2 gap-3">
                {["Goteo", "Aspersión", "Inundación", "Micro"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSistema(s)}
                    className={`py-4 px-4 rounded-2xl border text-[11px] font-black uppercase tracking-widest transition-all ${
                      sistema === s 
                        ? "bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-900/40" 
                        : "bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/5"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-white/30 mb-4 uppercase tracking-widest pl-1 leading-none">Frecuencia</label>
              <select 
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 font-bold text-white appearance-none cursor-pointer"
                value={frecuencia} onChange={(e) => setFrecuencia(e.target.value)}
              >
                <option value="Diario" className="bg-zinc-900">A diario</option>
                <option value="Semanal" className="bg-zinc-900">Semanal</option>
                <option value="Alterno" className="bg-zinc-900">Días alternos</option>
                <option value="Unico" className="bg-zinc-900">Evento único</option>
              </select>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSaving || !volumen || !parcelaId}
          className="w-full flex items-center justify-center gap-3 bg-cyan-600 hover:bg-cyan-500 transition-all active:scale-[0.98] text-white font-black py-6 rounded-[28px] shadow-2xl shadow-cyan-900/40 disabled:opacity-50 disabled:grayscale text-lg uppercase tracking-widest group mb-12"
        >
          {isSaving ? "Guardando Riego..." : <><Droplets size={24} className="group-hover:animate-bounce" /> Confirmar Registro</>}
        </button>
      </form>
    </div>
  );
}
