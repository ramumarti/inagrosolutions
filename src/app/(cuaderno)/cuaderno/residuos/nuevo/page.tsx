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
    <div className="max-w-lg mx-auto pb-32 relative px-4 sm:px-0 z-10 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8 pt-4">
        <button 
          onClick={() => router.back()} 
          className="p-2.5 bg-white/5 rounded-2xl text-white/70 hover:bg-white/10 shadow-sm border border-white/10 transition-all active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-black text-white tracking-tight uppercase">Gestión Residuos</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Parcela Selector */}
        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-xl">
          <ParcelSelector onSelect={setParcelaId} selectedId={parcelaId} />
        </div>

        {/* Tipo de Residuo */}
        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 text-white/30 mb-2">
            <Recycle size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Material Retirado</span>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {tiposResiduo.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTipo(t)}
                className={`text-left p-5 rounded-2xl border transition-all group ${
                  tipo === t 
                    ? "bg-white/10 border-white/20 text-white shadow-xl" 
                    : "bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/5"
                }`}
              >
                <span className={`font-black uppercase tracking-tight text-[11px] ${tipo === t ? "text-white" : ""}`}>{t}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Datos de Entrega */}
        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-xl space-y-8">
          <div>
            <label className="block text-[10px] font-black text-white/30 mb-3 uppercase tracking-widest pl-1 leading-none flex items-center gap-2">
              <Trash2 size={14} className="text-white/40" /> Método de Gestión
            </label>
            <input 
              type="text"
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-white/20 font-bold text-white shadow-inner transition-all placeholder:text-white/10"
              value={gestion} onChange={(e) => setGestion(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-white/30 mb-3 uppercase tracking-widest pl-1 leading-none flex items-center gap-2">
              <MapPin size={14} className="text-white/40" /> Punto de Entrega
            </label>
            <input 
              type="text"
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-white/20 font-bold text-white shadow-inner transition-all placeholder:text-white/10"
              placeholder="Ej: Coop. San Isidro Recinto SIGFITO..."
              value={puntoEntrega} onChange={(e) => setPuntoEntrega(e.target.value)}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSaving || !parcelaId}
          className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 transition-all active:scale-[0.98] text-white font-black py-6 rounded-[28px] shadow-2xl shadow-black/40 disabled:opacity-50 disabled:grayscale text-lg uppercase tracking-widest group mb-12 border border-white/5"
        >
          {isSaving ? "Guardando Registro..." : <><Save size={24} className="group-hover:rotate-12 transition-transform" /> Confirmar Gestión</>}
        </button>
      </form>
    </div>
  );
}
