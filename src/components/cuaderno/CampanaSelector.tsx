'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Campana {
  id: string;
  nombre: string;
  anio_inicio: number;
  anio_fin: number;
  activa: boolean;
}

interface CampanaSelectorProps {
  campanas: Campana[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  className?: string;
}

export function CampanaSelector({ campanas, selectedId, onSelect, className }: CampanaSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selected = campanas.find(c => c.id === selectedId);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 hover:border-emerald-500/20 transition-all cursor-pointer select-none"
      >
        <Calendar className="w-4 h-4 text-emerald-400" />
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-white/30 uppercase tracking-tighter leading-none mb-0.5">Campaña Actual</span>
          <span className="text-xs font-black text-white uppercase tracking-widest">{selected?.nombre || 'Seleccionar...'}</span>
        </div>
        <ChevronDown size={14} className={cn("text-white/20 transition-colors ml-1", isOpen && "text-white")} />
      </div>

      {/* Dropdown Popover */}
      <div className={cn(
        "absolute top-full left-0 mt-2 w-48 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl transition-all z-50 p-1.5",
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      )}>
        {campanas.length === 0 && (
          <div className="px-3 py-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">No hay campañas registradas</div>
        )}
        {campanas.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              onSelect(c.id);
              setIsOpen(false);
            }}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all",
              selectedId === c.id 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" 
                : "text-white/50 hover:bg-white/5 hover:text-white"
            )}
          >
            <span>{c.nombre}</span>
            {selectedId === c.id && <Check size={12} />}
          </button>
        ))}
      </div>
    </div>
  );
}
