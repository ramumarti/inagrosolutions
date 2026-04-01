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
    <div className="max-w-lg mx-auto pb-24 relative px-4 sm:px-0">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2.5 bg-white rounded-full text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Registrar Riego</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Parcela Selector */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <ParcelSelector 
            onSelect={setParcelaId} 
            selectedId={parcelaId} 
          />
        </div>

        {/* Volumen de Riego */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-cyan-600 mb-2">
            <Ruler size={18} />
            <span className="text-xs font-black uppercase tracking-widest">Caudal / Volumen</span>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Cantidad</label>
              <input 
                type="number" step="0.01" required
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-black text-2xl text-gray-900"
                placeholder="0.00"
                value={volumen} onChange={(e) => setVolumen(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Unidad</label>
              <select 
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 font-bold text-lg"
                value={unidad} onChange={(e) => setUnidad(e.target.value)}
              >
                <option value="m3">m³ (Total)</option>
                <option value="L/árbol">L / Árbol</option>
                <option value="h">Horas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sistema y Frecuencia */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Clock size={18} />
            <span className="text-xs font-black uppercase tracking-widest">Ajustes de Operación</span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Sistema</label>
              <div className="grid grid-cols-2 gap-3">
                {["Goteo", "Aspersión", "Inundación", "Micro"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSistema(s)}
                    className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${
                      sistema === s ? "bg-blue-600 border-blue-700 text-white shadow-lg" : "bg-gray-50 border-gray-100 text-gray-600"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Frecuencia</label>
              <select 
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-gray-800"
                value={frecuencia} onChange={(e) => setFrecuencia(e.target.value)}
              >
                <option value="Diario">A diario</option>
                <option value="Semanal">Semanal</option>
                <option value="Alterno">Días alternos</option>
                <option value="Unico">Evento único</option>
              </select>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSaving || !volumen}
          className="w-full flex items-center justify-center gap-3 bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white font-bold py-5 rounded-2xl shadow-xl shadow-cyan-600/30 transition-all disabled:opacity-70 disabled:scale-[0.98] active:scale-[0.98] text-lg mt-4"
        >
          {isSaving ? "Guardando Riego..." : <><Droplets size={22} /> Confirmar Registro</>}
        </button>
      </form>
    </div>
  );
}
