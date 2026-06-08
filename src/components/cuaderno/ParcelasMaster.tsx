'use client';

import React, { useState, useMemo } from 'react';
import { 
  MapPin, Plus, Search, Filter, MoreHorizontal, 
  Tractor, Bug, Droplets, History, Map as MapIcon,
  ChevronRight, ArrowUpRight, Beaker, Wheat, FileSpreadsheet, Download, Table, Trash2
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { cn } from '@/lib/utils';
import { MassSigpacImporter } from './MassSigpacImporter';
import { ParcelaHistorico } from './ParcelaHistorico';
import { ExcelParcelImporter } from './ExcelParcelImporter';
import { AgriMapViewer } from './AgriMapViewer';
import { deleteParcela } from '@/lib/actions/agricultural';

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
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('cards');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteParcela(id);
      onAction('refresh', '');
    } catch (err: any) {
      alert(err.message || 'Error al eliminar la parcela');
    }
  };

  const filteredParcelas = useMemo(() => {
    return parcelas.filter(p => {
      const matchSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.referencia_sigpac?.includes(searchTerm);
      const matchCultivo = filterCultivo === 'all' || p.cultivo === filterCultivo;
      return matchSearch && matchCultivo;
    });
  }, [parcelas, searchTerm, filterCultivo]);

  const totalHectareas = useMemo(() => {
    return filteredParcelas.reduce((acc, p) => acc + (Number(p.hectareas) || 0), 0);
  }, [filteredParcelas]);

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

          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 ml-2">
              <button 
                onClick={() => setViewMode('cards')}
                className={cn("p-2 rounded-xl transition-all", viewMode === 'cards' ? "bg-white/10 text-white" : "text-white/20")}
              >
                <Table size={18} />
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={cn("p-2 rounded-xl transition-all", viewMode === 'map' ? "bg-white/10 text-white" : "text-white/20")}
              >
                <MapIcon size={18} />
              </button>
          </div>
          
          <GlowButton className="gap-2 shrink-0 h-[46px]" onClick={() => onAction('new', '')}>
            <Plus size={18} /> Nueva Parcela
          </GlowButton>
        </div>
      </div>

      {/* Main Plot Content: Cards or Map */}
      <div className="min-h-[400px]">
        {viewMode === 'map' ? (
          <div className="animate-in fade-in duration-700">
             <AgriMapViewer 
                parcelas={filteredParcelas} 
                onSelectParcela={(id) => onAction('view', id)}
             />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            {filteredParcelas.map((p) => (
              <GlassCard 
                key={p.id} 
                className={cn(
                    "p-6 group hover:border-emerald-500/30 transition-all cursor-pointer relative overflow-hidden",
                    p.id === selectedId && "ring-2 ring-emerald-500/50"
                )}
                onClick={() => onAction('view', p.id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/10 text-emerald-400">
                    <MapPin size={24} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-white/40 uppercase tracking-widest">
                      {Number(p.hectareas).toFixed(2)} ha
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`¿Estás seguro de que quieres eliminar la parcela "${p.nombre}"?`)) {
                          handleDelete(p.id);
                        }
                      }}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-lg text-red-400 transition-all cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <h4 className="text-xl font-black text-white leading-tight mb-2 group-hover:text-emerald-400 transition-colors uppercase italic">{p.nombre}</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500/5 rounded-xl flex items-center justify-center text-blue-400/70">
                      <Wheat size={14} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest leading-none mb-0.5">Cultivo / Variedad</span>
                      <span className="text-xs font-bold text-white/80">{p.cultivo} <span className="text-[10px] opacity-40">{p.variedad}</span></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-500/5 rounded-xl flex items-center justify-center text-emerald-400/70">
                      <MapIcon size={14} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest leading-none mb-0.5">SIGPAC Pol/Par/Rec</span>
                      <span className="text-xs font-bold text-white/80">{p.poligono} / {p.parcela} / {p.recinto || 1}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-6 mt-6 border-t border-white/5">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onAction('labor', p.id); }}
                    className="flex-1 h-10 bg-white/3 hover:bg-white/10 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black text-white/40 hover:text-white transition-all uppercase tracking-widest"
                  >
                    <Tractor size={14} className="text-emerald-500/70" /> Labor
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onAction('tratamiento', p.id); }}
                    className="flex-1 h-10 bg-white/3 hover:bg-white/10 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black text-white/40 hover:text-white transition-all uppercase tracking-widest"
                  >
                    <Beaker size={14} className="text-blue-500/70" /> Tratar
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowHistoricoId(p.id); }}
                    className="w-12 h-10 bg-white/3 hover:bg-white/10 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-all"
                  >
                    <History size={16} />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
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
