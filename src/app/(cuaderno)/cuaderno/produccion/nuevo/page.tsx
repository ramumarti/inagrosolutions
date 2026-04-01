"use client";

import { useState } from "react";
import { ArrowLeft, Save, ShoppingBasket, Truck, Hash } from "lucide-react";
import { useRouter } from "next/navigation";
import { addToQueue } from "@/lib/offline-db";
import { useSyncStore } from "@/store/syncStore";
import { ParcelSelector } from "@/components/agriculture/ParcelSelector";

export default function NuevaProduccionPage() {
  const router = useRouter();
  const { isOnline, syncNow } = useSyncStore();

  const [parcelaId, setParcelaId] = useState<string>("");
  const [cantidad, setCantidad] = useState("");
  const [destino, setDestino] = useState("");
  const [lote, setLote] = useState(`LOT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cantidad || !parcelaId) return;

    setIsSaving(true);
    try {
      await addToQueue({
        table: "produccion",
        action: "INSERT",
        payload: {
          parcela_id: parcelaId,
          fecha_recoleccion: new Date().toISOString(),
          cantidad: parseFloat(cantidad),
          destino: destino,
          lote: lote,
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
        <h1 className="text-xl font-bold text-gray-800">Registrar Cosecha</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Parcela Selector */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <ParcelSelector onSelect={setParcelaId} selectedId={parcelaId} />
        </div>

        {/* Datos de Recolección */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <ShoppingBasket size={18} />
            <span className="text-xs font-black uppercase tracking-widest">Producción Neta</span>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Kilos Recolectados (kg)</label>
            <input 
              type="number" step="1" required
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-black text-2xl text-gray-900"
              placeholder="0"
              value={cantidad} onChange={(e) => setCantidad(e.target.value)}
            />
          </div>
        </div>

        {/* Destino y Trazabilidad */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-2">
                <Truck size={16} /> Destino / Almazara
              </label>
              <input 
                type="text"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 font-bold text-gray-800"
                placeholder="Nombre de la cooperativa..."
                value={destino} onChange={(e) => setDestino(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-2">
                <Hash size={16} /> Lote de Trazabilidad
              </label>
              <input 
                type="text"
                className="w-full px-5 py-4 bg-gray-100 border border-gray-200 rounded-2xl outline-none text-gray-500 font-mono font-bold"
                value={lote} onChange={(e) => setLote(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSaving || !cantidad || !parcelaId}
          className="w-full flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold py-5 rounded-2xl shadow-xl shadow-purple-600/30 transition-all disabled:opacity-70 disabled:scale-[0.98] active:scale-[0.98] text-lg mt-4"
        >
          {isSaving ? "Guardando Cosecha..." : <><Save size={22} /> Confirmar Recolección</>}
        </button>
      </form>
    </div>
  );
}
