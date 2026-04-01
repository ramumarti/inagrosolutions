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
    <div className="max-w-lg mx-auto pb-24 relative px-4 sm:px-0">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2.5 bg-white rounded-full text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Monitoreo de Plaga</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Parcela Selector */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <ParcelSelector 
            onSelect={setParcelaId} 
            selectedId={parcelaId} 
          />
        </div>

        {/* Selector de Plaga */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Plaga Detectada</label>
            <div className="grid grid-cols-1 gap-2">
              {plagasComunes.map((plaga) => (
                <button
                  key={plaga}
                  type="button"
                  onClick={() => setTipoPlaga(plaga)}
                  className={`text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    tipoPlaga === plaga 
                      ? "bg-red-50 border-red-200 text-red-900 ring-2 ring-red-500/20 shadow-sm" 
                      : "bg-gray-50 border-gray-100 text-gray-600 hover:border-gray-200"
                  }`}
                >
                  <span className="font-bold text-sm tracking-tight">{plaga}</span>
                  {tipoPlaga === plaga && <Bug size={18} className="text-red-500 animate-pulse" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Nivel de Infestación */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Nivel (%)</label>
              <input 
                type="number" step="0.1" required
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all font-black text-2xl text-gray-900"
                placeholder="0.0"
                value={nivel} onChange={(e) => setNivel(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Umbral Trat.</label>
              <input 
                type="number" step="0.1"
                className="w-full px-5 py-4 bg-gray-100 border border-gray-200 rounded-2xl outline-none text-gray-500 font-bold text-lg"
                value={umbral} onChange={(e) => setUmbral(e.target.value)}
              />
            </div>
          </div>

          {nivel && (
            <div className={`p-4 rounded-2xl flex items-start gap-4 transition-all animate-in zoom-in-95 duration-300 ${
              isAboveThreshold ? "bg-red-100 text-red-900 border border-red-200" : "bg-green-100 text-green-900 border border-green-200"
            }`}>
              {isAboveThreshold ? <AlertCircle className="shrink-0" size={24} /> : <Info className="shrink-0" size={24} />}
              <div>
                <p className="font-extrabold text-sm uppercase tracking-wide">
                  {isAboveThreshold ? "Umbral Superado" : "Nivel Controlado"}
                </p>
                <p className="text-xs font-semibold mt-1 opacity-80 leading-relaxed">
                  {isAboveThreshold 
                    ? "Se recomienda realizar tratamiento fitosanitario inmediato para evitar daños económicos." 
                    : "El nivel de infestación es seguro bajo producción integrada. No es necesario tratar aún."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Observaciones */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Comentarios / Recomendación</label>
          <textarea 
            rows={3}
            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all font-medium text-gray-800 placeholder:text-gray-400"
            placeholder="Ej: Detectado foco en fachada norte del cerete..."
            value={recomendacion} onChange={(e) => setRecomendacion(e.target.value)}
          />
        </div>

        <button 
          type="submit" 
          disabled={isSaving || !nivel}
          className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-5 rounded-2xl shadow-xl shadow-red-600/30 transition-all disabled:opacity-70 disabled:scale-[0.98] active:scale-[0.98] text-lg mt-4"
        >
          {isSaving ? "Guardando Registro..." : <><Save size={22} /> Guardar Monitoreo</>}
        </button>
      </form>
    </div>
  );
}
