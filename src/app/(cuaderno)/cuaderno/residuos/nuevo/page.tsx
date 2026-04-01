"use client";

import { useState } from "react";
import { ArrowLeft, Save, Trash2, MapPin, Recycle } from "lucide-react";
import { useRouter } from "next/navigation";
import { addToQueue } from "@/lib/offline-db";
import { useSyncStore } from "@/store/syncStore";
import { ParcelSelector } from "@/components/agriculture/ParcelSelector";

export default function NuevoResiduoPage() {
  const router = useRouter();
  const { isOnline, syncNow } = useSyncStore();

  const [parcelaId, setParcelaId] = useState<string>("");
  const [tipo, setTipo] = useState("Envases Fitosanitarios Empty (SIGFITO)");
  const [gestion, setGestion] = useState("Punto SIGFITO Autorizado");
  const [puntoEntrega, setPuntoEntrega] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const tiposResiduo = [
    "Envases Fitosanitarios Empty (SIGFITO)",
    "Plástico de Riego",
    "Aceites de Maquinaria",
    "Restos de Poda",
    "Chatarra / Piedras"
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parcelaId) return;

    setIsSaving(true);
    try {
      await addToQueue({
        table: "residuos",
        action: "INSERT",
        payload: {
          parcela_id: parcelaId,
          fecha: new Date().toISOString(),
          tipo: tipo,
          gestion: gestion,
          punto_entrega: puntoEntrega,
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
        <h1 className="text-xl font-bold text-gray-800">Gestión de Residuos</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Parcela Selector */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <ParcelSelector onSelect={setParcelaId} selectedId={parcelaId} />
        </div>

        {/* Tipo de Residuo */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Recycle size={18} />
            <span className="text-xs font-black uppercase tracking-widest">Material Retirado</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {tiposResiduo.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTipo(t)}
                className={`text-left p-4 rounded-2xl border transition-all ${
                  tipo === t 
                    ? "bg-gray-800 border-gray-900 text-white shadow-lg" 
                    : "bg-gray-50 border-gray-100 text-gray-600 hover:border-gray-200"
                }`}
              >
                <span className="font-bold text-sm">{t}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Datos de Entrega */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-2">
              <Trash2 size={16} /> Método de Gestión
            </label>
            <input 
              type="text"
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-gray-500 font-bold text-gray-800"
              value={gestion} onChange={(e) => setGestion(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-2">
              <MapPin size={16} /> Punto de Entrega
            </label>
            <input 
              type="text"
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-gray-500 font-bold text-gray-800"
              placeholder="Ej: Coop. San Isidro Recinto SIGFITO..."
              value={puntoEntrega} onChange={(e) => setPuntoEntrega(e.target.value)}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSaving || !parcelaId}
          className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-900 active:bg-black text-white font-bold py-5 rounded-2xl shadow-xl shadow-gray-600/30 transition-all disabled:opacity-70 disabled:scale-[0.98] active:scale-[0.98] text-lg mt-4"
        >
          {isSaving ? "Guardando Registro..." : <><Save size={22} /> Confirmar Gestión</>}
        </button>
      </form>
    </div>
  );
}
