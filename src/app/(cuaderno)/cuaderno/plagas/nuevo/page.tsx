"use client";

import { useState } from "react";
import { ArrowLeft, Save, Bug, AlertCircle, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { addToQueue } from "@/lib/offline-db";
import { useSyncStore } from "@/store/syncStore";

import { ParcelSelector } from "@/components/agriculture/ParcelSelector";

export default function NuevaPlagaPage() {
  const router = useRouter();
  const { isOnline, syncNow } = useSyncStore();

  const [parcelaId, setParcelaId] = useState<string>("");
  const [tipoPlaga, setTipoPlaga] = useState("Mosca del Olivo");
  const [nivel, setNivel] = useState("");
  const [umbral, setUmbral] = useState("5.0"); // Threshold 5% for Integrated
  const [recomendacion, setRecomendacion] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const plagasComunes = [
    "Mosca del Olivo (Bactrocera oleae)",
    "Prays del Olivo (Prays oleae)",
    "Algodoncillo (Euphyllura olivina)",
    "Repilo (Venturia oleaginea)",
    "Aceitunado (Saissetia oleae)",
    "Barrenillo (Phloeotribus scarabaeoides)"
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nivel || !parcelaId) return;

    setIsSaving(true);
    try {
      await addToQueue({
        table: "plagas",
        action: "INSERT",
        payload: {
          parcela_id: parcelaId,
          fecha: new Date().toISOString(),
          tipo_plaga: tipoPlaga,
          nivel: parseFloat(nivel),
          umbral: parseFloat(umbral),
          recomendacion: recomendacion || null,
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

  const isAboveThreshold = parseFloat(nivel) >= parseFloat(umbral);

  return (
    <div className="max-w-lg mx-auto pb-32 relative px-4 sm:px-0 z-10 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8 pt-4">
        <button 
          onClick={() => router.push('/cuaderno/plagas')} 
          className="p-2.5 bg-white/5 rounded-2xl text-white/70 hover:bg-white/10 shadow-sm border border-white/10 transition-all active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-black text-white tracking-tight uppercase">Monitoreo Plaga</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Parcela Selector */}
        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-xl">
          <ParcelSelector 
            onSelect={setParcelaId} 
            selectedId={parcelaId} 
          />
        </div>

        {/* Selector de Plaga */}
        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-xl space-y-4">
          <label className="block text-[10px] font-black text-white/30 mb-4 uppercase tracking-widest pl-1 leading-none">Plaga Detectada</label>
          <div className="grid grid-cols-1 gap-2.5">
            {plagasComunes.map((plaga) => (
              <button
                key={plaga}
                type="button"
                onClick={() => setTipoPlaga(plaga)}
                className={`text-left p-5 rounded-2xl border transition-all flex items-center justify-between group ${
                  tipoPlaga === plaga 
                    ? "bg-rose-500/10 border-rose-500/30 text-white shadow-xl shadow-rose-900/10" 
                    : "bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/5"
                }`}
              >
                <span className={`font-black uppercase tracking-tight text-[12px] ${tipoPlaga === plaga ? "text-rose-400" : ""}`}>{plaga}</span>
                {tipoPlaga === plaga && <Bug size={18} className="text-rose-500 animate-pulse" />}
              </button>
            ))}
          </div>
        </div>

        {/* Nivel de Infestación */}
        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-xl space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-white/30 mb-3 uppercase tracking-widest pl-1">Nivel (%)</label>
              <input 
                type="number" step="0.1" required
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all font-black text-2xl text-white shadow-inner"
                placeholder="0.0"
                value={nivel} onChange={(e) => setNivel(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-white/30 mb-3 uppercase tracking-widest pl-1">Umbral</label>
              <input 
                type="number" step="0.1"
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none text-white/20 font-bold text-lg cursor-not-allowed opacity-50"
                value={umbral} readOnly
              />
            </div>
          </div>

          {nivel && (
            <div className={`p-5 rounded-2xl flex items-start gap-4 transition-all animate-in zoom-in-95 duration-500 border ${
              isAboveThreshold 
                ? "bg-rose-500/10 text-rose-200 border-rose-500/20" 
                : "bg-emerald-500/10 text-emerald-200 border-emerald-500/20"
            }`}>
              {isAboveThreshold ? <AlertCircle className="shrink-0 text-rose-500" size={24} /> : <Info className="shrink-0 text-emerald-500" size={24} />}
              <div>
                <p className="font-black text-[11px] uppercase tracking-widest mb-1">
                  {isAboveThreshold ? "Umbral Superado" : "Nivel Controlado"}
                </p>
                <p className="text-xs font-semibold leading-relaxed opacity-60">
                  {isAboveThreshold 
                    ? "Se recomienda realizar tratamiento fitosanitario inmediato para evitar daños económicos." 
                    : "El nivel de infestación es seguro bajo producción integrada. No es necesario tratar aún."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Observaciones */}
        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-xl">
          <label className="block text-[10px] font-black text-white/30 mb-4 uppercase tracking-widest pl-1 leading-none">Comentarios</label>
          <textarea 
            rows={3}
            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all font-medium text-white/70 placeholder:text-white/10 resize-none shadow-inner"
            placeholder="Ej: Detectado foco en fachada norte..."
            value={recomendacion} onChange={(e) => setRecomendacion(e.target.value)}
          />
        </div>

        <button 
          type="submit" 
          disabled={isSaving || !nivel || !parcelaId}
          className="w-full flex items-center justify-center gap-3 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-black py-6 rounded-[28px] shadow-2xl shadow-rose-900/40 transition-all disabled:opacity-50 disabled:grayscale active:scale-[0.98] text-lg uppercase tracking-widest group mb-12"
        >
          {isSaving ? "Guardando Registro..." : <><Save size={24} className="group-hover:rotate-12 transition-transform" /> Guardar Monitoreo</>}
        </button>
      </form>
    </div>
  );
}
