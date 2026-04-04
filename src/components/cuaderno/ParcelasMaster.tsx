'use client';

import React, { useState, useMemo } from 'react';
import { 
  MapPin, Plus, Search, Filter, MoreHorizontal, 
  Tractor, Bug, Droplets, History, Map as MapIcon,
  ChevronRight, ArrowUpRight, Beaker, Wheat, FileSpreadsheet, Download
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { cn } from '@/lib/utils';
import { MassSigpacImporter } from './MassSigpacImporter';
import { ParcelaHistorico } from './ParcelaHistorico';
import { ExcelParcelImporter } from './ExcelParcelImporter';

interface Parcela {
  id: string;
  nombre: string;
  provincia: string;
  municipio: string;
  poligono: string;
  parcela: string;
  hectareas: number;
  cultivo: string;
  variedad: string;
  sistema_riego: string;
  estado: 'activa' | 'barbecho' | 'inactiva';
}

interface ParcelasMasterProps {
  parcelas: any[];
  campanaId: string | null;
  explotacionId: string;
  onAction: (action: string, parcelaId: string) => void;
}

export function ParcelasMaster({ parcelas, campanaId, explotacionId, onAction }: ParcelasMasterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCultivo, setFilterCultivo] = useState('all');
  const [showMassImporter, setShowMassImporter] = useState(false);
  const [showExcelImporter, setShowExcelImporter] = useState(false);
  const [showHistoricoId, setShowHistoricoId] = useState<string | null>(null);

  const filteredParcelas = useMemo(() => {
    return parcelas.filter(p => {
      const matchSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.referencia_sigpac?.includes(searchTerm);
      const matchCultivo = filterCultivo === 'all' || p.cultivo === filterCultivo;
      return matchSearch && matchCultivo;
    });
  }, [parcelas, searchTerm, filterCultivo]);

  const cultivosUnicos = useMemo(() => {
    const s = new Set(parcelas.map(p => p.cultivo).filter(Boolean));
    return Array.from(s);
  }, [parcelas]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-6 border-b border-white/5">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input 
            type="text"
            placeholder="Buscar por nombre o referencia..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 transition-all font-bold"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-2xl border border-white/10">
            <Filter size={16} className="text-white/40" />
            <select 
              className="bg-transparent border-none outline-none text-xs font-black text-white/70 uppercase tracking-widest cursor-pointer"
              value={filterCultivo}
              onChange={e => setFilterCultivo(e.target.value)}
            >
              <option value="all">Todos los cultivos</option>
              {cultivosUnicos.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          
          <button 
            onClick={() => setShowMassImporter(true)}
            className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black text-white/50 hover:text-white uppercase tracking-widest transition-all"
          >
            <Download size={16} /> SIGPAC
          </button>

          <button 
            onClick={() => setShowExcelImporter(true)}
            className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black text-white/50 hover:text-white uppercase tracking-widest transition-all"
          >
            <FileSpreadsheet size={16} /> Excel Bulk
          </button>
          
          <GlowButton className="gap-2 shrink-0 h-[46px]" onClick={() => onAction('new', '')}>
            <Plus size={18} /> Nueva Parcela
          </GlowButton>
        </div>
      </div>

      {/* Parcel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredParcelas.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-white/20" />
            </div>
            <p className="text-sm font-bold text-white/40 uppercase tracking-widest">No se encontraron parcelas con este filtro</p>
          </div>
        )}

        {filteredParcelas.map((p) => (
          <GlassCard key={p.id} className="p-5 border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/10 text-emerald-400">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors">{p.nombre}</h4>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none mt-1">
                    {p.provincia} • Pol: {p.poligono} Par: {p.parcela}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Activa</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5 text-center">
              <div className="bg-white/5 rounded-xl py-3 border border-white/5">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-tighter mb-1">Cultivo</p>
                <div className="flex items-center justify-center gap-1.5">
                  <Wheat size={12} className="text-amber-400" />
                  <span className="text-xs font-black text-white">{p.cultivo || 'Sin asignar'}</span>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl py-3 border border-white/5">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-tighter mb-1">Superficie</p>
                <p className="text-xs font-black text-white">{Number(p.hectareas).toFixed(2)} <span className="text-[10px] text-white/40">ha</span></p>
              </div>
              <div className="bg-white/5 rounded-xl py-3 border border-white/5">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-tighter mb-1">Campaña</p>
                <p className="text-xs font-black text-emerald-400">2024/25</p>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
              <button 
                onClick={() => onAction('labor', p.id)}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black text-white/60 hover:text-white uppercase tracking-widest transition-all"
              >
                <Tractor size={14} className="text-emerald-500/70" /> Labor
              </button>
              <button 
                onClick={() => onAction('tratamiento', p.id)}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black text-white/60 hover:text-white uppercase tracking-widest transition-all"
              >
                <Beaker size={14} className="text-blue-500/70" /> Tratar
              </button>
              <button 
                onClick={() => setShowHistoricoId(p.id)}
                className="w-12 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-all"
              >
                <History size={16} />
              </button>
              <button 
                onClick={() => onAction('view', p.id)}
                className="w-12 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-all"
              >
                <ArrowUpRight size={16} />
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Modals */}
      {showMassImporter && (
        <MassSigpacImporter 
          explotacionId={explotacionId}
          onClose={() => setShowMassImporter(false)}
          onSuccess={() => { onAction('refresh', ''); setShowMassImporter(false); }}
        />
      )}

      {showExcelImporter && (
        <ExcelParcelImporter 
          explotacionId={explotacionId}
          onClose={() => setShowExcelImporter(false)}
          onSuccess={() => { onAction('refresh', ''); setShowExcelImporter(false); }}
        />
      )}

      {showHistoricoId && (
        <ParcelaHistorico 
          parcelaId={showHistoricoId}
          onClose={() => setShowHistoricoId(null)}
        />
      )}

      {/* Summary Footer */}
      <GlassCard className="p-6 mt-8 border-white/5 bg-gradient-to-r from-emerald-500/5 to-transparent flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Total Hectáreas</p>
            <p className="text-2xl font-black text-white">{parcelas.reduce((acc, p) => acc + Number(p.hectareas), 0).toFixed(1)} <span className="text-sm text-white/40">ha</span></p>
          </div>
          <div className="w-px h-10 bg-white/10 hidden md:block" />
          <div className="space-y-1">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Parcelas Activas</p>
            <p className="text-2xl font-black text-white">{parcelas.length}</p>
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black text-white/60 uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
            <History size={14} /> Histórico
          </button>
          <button className="flex-1 md:flex-none px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black text-white/60 uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
            <MapIcon size={14} /> Vista Mapa
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
