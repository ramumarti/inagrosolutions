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
    <div className="max-w-lg mx-auto pb-32 relative px-4 sm:px-0 z-10 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8 pt-4">
        <button 
          onClick={() => router.back()} 
          className="p-2.5 bg-white/5 rounded-2xl text-white/70 hover:bg-white/10 shadow-sm border border-white/10 transition-all active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-black text-white tracking-tight uppercase">Registrar Cosecha</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Parcela Selector */}
        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-xl">
          <ParcelSelector onSelect={setParcelaId} selectedId={parcelaId} />
        </div>

        {/* Datos de Recolección */}
        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <ShoppingBasket size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Producción Neta</span>
          </div>
          <div>
            <label className="block text-[10px] font-black text-white/30 mb-3 uppercase tracking-widest leading-none">Kilos Recolectados (kg)</label>
            <input 
              type="number" step="1" required
              className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-3xl outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all font-black text-3xl text-white placeholder:text-white/10 shadow-inner"
              placeholder="0"
              value={cantidad} onChange={(e) => setCantidad(e.target.value)}
            />
          </div>
        </div>

        {/* Destino y Trazabilidad */}
        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-xl space-y-8">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-white/30 mb-3 uppercase tracking-widest leading-none flex items-center gap-2">
                <Truck size={14} className="text-purple-400" /> Destino / Almazara
              </label>
              <input 
                type="text"
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/50 font-bold text-white placeholder:text-white/10"
                placeholder="Nombre de la cooperativa..."
                value={destino} onChange={(e) => setDestino(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-white/30 mb-3 uppercase tracking-widest leading-none flex items-center gap-2">
                <Hash size={14} className="text-purple-400" /> Lote de Trazabilidad
              </label>
              <input 
                type="text"
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none text-white/20 font-mono font-bold cursor-not-allowed opacity-50"
                value={lote} readOnly
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSaving || !cantidad || !parcelaId}
          className="w-full flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-black py-6 rounded-[28px] shadow-2xl shadow-purple-900/40 transition-all disabled:opacity-50 disabled:grayscale active:scale-[0.98] text-lg uppercase tracking-widest group"
        >
          {isSaving ? "Guardando Cosecha..." : <><Save size={24} className="group-hover:rotate-12 transition-transform" /> Confirmar Recolección</>}
        </button>
      </form>
    </div>
  );
}
