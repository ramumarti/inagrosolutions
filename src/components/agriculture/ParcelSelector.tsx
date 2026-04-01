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

  if (loading) return <div className="h-16 animate-pulse bg-gray-50 rounded-2xl border border-gray-100" />;

  return (
    <div className="relative">
      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Parcela de trabajo</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-green-300 transition-all text-left"
      >
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-xl text-green-600">
            <MapPin size={20} />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">{selectedParcela?.nombre || "Seleccionar..."}</p>
            {selectedParcela && <p className="text-xs text-gray-500">{selectedParcela.referencia_sigpac}</p>}
          </div>
        </div>
        <ChevronDown size={20} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {parcelas.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                onSelect(p.id);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between p-4 hover:bg-green-50 border-b border-gray-50 last:border-0 transition-colors"
            >
              <div>
                <p className="font-bold text-gray-800 text-sm">{p.nombre}</p>
                <p className="text-xs text-gray-500 truncate max-w-[240px] mt-0.5">{p.referencia_sigpac}</p>
              </div>
              {selectedId === p.id && <Check size={18} className="text-green-600" />}
            </button>
          ))}
          {parcelas.length === 0 && <p className="p-4 text-sm text-gray-500 italic">No hay parcelas creadas.</p>}
        </div>
      )}
    </div>
  );
}
