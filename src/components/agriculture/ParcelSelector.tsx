"use client";

import { useEffect, useState } from "react";
import { MapPin, Check, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Parcela {
  id: string;
  nombre: string;
  referencia_sigpac: string;
  superficie: number;
}

interface ParcelSelectorProps {
  onSelect: (parcelaId: string) => void;
  selectedId?: string;
}

export function ParcelSelector({ onSelect, selectedId }: ParcelSelectorProps) {
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadParcelas() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("parcelas")
        .select("id, nombre, referencia_sigpac, superficie");
      
      if (!error && data) setParcelas(data);
      setLoading(false);
    }
    loadParcelas();
  }, []);

  const selectedParcela = parcelas.find(p => p.id === selectedId);

  if (loading) return <div className="h-20 animate-pulse bg-white/5 rounded-[24px] border border-white/10" />;

  return (
    <div className="relative">
      <label className="flex items-center gap-2 text-[10px] font-black text-white/30 mb-3 uppercase tracking-[0.2em] pl-1 leading-none">
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
        Parcela de trabajo
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-5 bg-white/[0.03] border rounded-[22px] shadow-sm hover:bg-white/[0.05] transition-all text-left group ${
          isOpen ? "border-emerald-500/50 bg-white/[0.05]" : "border-white/10"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl transition-colors ${selectedParcela ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/20"}`}>
            <MapPin size={22} className={selectedParcela ? "animate-bounce" : ""} />
          </div>
          <div>
            <p className="font-black text-white text-base tracking-tight uppercase">{selectedParcela?.nombre || "Seleccionar..."}</p>
            {selectedParcela && <p className="text-[10px] font-bold text-white/30 mt-0.5 tracking-wider">{selectedParcela.referencia_sigpac}</p>}
          </div>
        </div>
        <ChevronDown size={20} className={`text-white/20 transition-transform duration-300 ${isOpen ? "rotate-180 text-emerald-500" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-3 bg-[#0a0a0b] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[28px] overflow-hidden backdrop-blur-3xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="max-h-72 overflow-y-auto divide-y divide-white/5 scrollbar-hide">
            {parcelas.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  onSelect(p.id);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-6 py-5 hover:bg-white/5 transition-all group"
              >
                <div className="text-left">
                  <p className={`font-black uppercase tracking-tight text-sm ${selectedId === p.id ? "text-emerald-400" : "text-white/80"}`}>{p.nombre}</p>
                  <p className="text-[10px] font-bold text-white/20 truncate max-w-[200px] mt-1 tracking-widest">{p.referencia_sigpac}</p>
                </div>
                {selectedId === p.id && (
                  <div className="bg-emerald-500/20 p-1.5 rounded-lg text-emerald-500 animate-in zoom-in-50 duration-200">
                    <Check size={16} />
                  </div>
                )}
              </button>
            ))}
            {parcelas.length === 0 && <p className="p-6 text-xs text-white/20 font-bold uppercase tracking-widest text-center italic">No hay parcelas creadas.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
