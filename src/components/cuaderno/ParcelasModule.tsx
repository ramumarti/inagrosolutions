'use client';

import React, { useState } from 'react';
import { 
  Plus, MapPin, Search, Filter, Upload, FileJson, 
  Trash2, Edit3, Eye, MoreVertical, Layers, ArrowRight,
  Database, RefreshCcw, Droplets, Leaf, Bug, Zap, Building2
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { createParcela, deleteParcela, importFromSigpac } from '@/lib/actions/agricultural';
import { cn } from '@/lib/utils';

// Types for local component
interface Plot {
  id: string;
  nombre: string;
  referencia_sigpac?: string;
  hectareas: number;
  cultivo?: string;
  variedad?: string;
  sistema_riego?: string;
  provincia?: string;
  municipio?: string;
  poligono?: string;
  parcela?: string;
  recinto?: string;
}

interface ParcelasModuleProps {
  explotacionId?: string;
  parcelas: Plot[];
  tenantId?: string;
  onAction?: (action: string, data?: any) => void;
}

export function ParcelasModule({ explotacionId, parcelas: initialParcelas, tenantId, onAction }: ParcelasModuleProps) {
  const [parcelas, setParcelas] = useState<Plot[]>(initialParcelas);
  const [isAdding, setIsAdding] = useState(false);
  const [importingSigpac, setImportingSigpac] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCultivo, setFilterCultivo] = useState('all');
  
  // Form State
  const [form, setForm] = useState({
    nombre: '',
    referencia_sigpac: '',
    hectareas: 0,
    cultivo: '',
    variedad: '',
    sistema_riego: 'secano',
    provincia: '',
    municipio: '',
    poligono: '',
    parcela: '',
    recinto: '',
    anio_plantacion: new Date().getFullYear()
  });

  const [step, setStep] = useState(1);

  const filteredParcelas = parcelas.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(search.toLowerCase()) || 
                          p.referencia_sigpac?.includes(search);
    const matchesFilter = filterCultivo === 'all' || p.cultivo === filterCultivo;
    return matchesSearch && matchesFilter;
  });

  const cultivosUnicos = Array.from(new Set(parcelas.map(p => p.cultivo).filter(Boolean)));

  const handleImportSigpac = async () => {
    if (!form.referencia_sigpac) return;
    setImportingSigpac(true);
    try {
      const res = await importFromSigpac(form.referencia_sigpac);
      if (res.success) {
        setForm({
          ...form,
          ...res.data,
          hectareas: res.data.superficie,
        });
        setStep(2); // Jump to detailed data
      }
    } catch (err) {
      console.error(err);
    } finally {
      setImportingSigpac(false);
    }
  };

  const handleSave = async () => {
    try {
      const newPlot = await createParcela({
        ...form,
        explotacion_id: explotacionId,
        tenant_id: tenantId
      });
      setParcelas([...parcelas, newPlot as any]);
      setIsAdding(false);
      setStep(1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar esta parcela?')) return;
    try {
      await deleteParcela(id);
      setParcelas(parcelas.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (!explotacionId) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
          <Building2 className="w-10 h-10 text-emerald-400" />
        </div>
        <div className="max-w-sm">
          <h3 className="text-xl font-black text-white">No hay ninguna explotación seleccionada</h3>
          <p className="text-sm text-white/40 mt-2">Para gestionar parcelas primero debes seleccionar o registrar una entidad agrícola.</p>
        </div>
        <GlowButton onClick={() => onAction && onAction('new_farm')}>Registrar Mi Primera Explotación</GlowButton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
          <Search className="w-4 h-4 text-white/40" />
          <input 
            type="text" 
            placeholder="Buscar parcela o SIGPAC..."
            className="bg-transparent border-none outline-none text-white text-sm w-full"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select 
            value={filterCultivo}
            onChange={e => setFilterCultivo(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/70 outline-none"
          >
            <option value="all" className="bg-[#1a1a1a]">Todos los cultivos</option>
            {cultivosUnicos.map(c => (
              <option key={c} value={c!} className="bg-[#1a1a1a]">{c}</option>
            ))}
          </select>
          
          <button 
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all"
            onClick={() => alert('Próximamente: Importación masiva desde Excel/CSV')}
          >
            <Upload className="w-4 h-4" />
            <span className="hidden lg:inline">Importar Excel</span>
          </button>

          <GlowButton 
            className="flex items-center gap-2"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva Parcela</span>
          </GlowButton>
        </div>
      </div>

      {/* Plots Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredParcelas.length === 0 ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
              <Database className="w-8 h-8 text-white/20" />
            </div>
            <div>
              <p className="text-white font-black">No se encontraron parcelas</p>
              <p className="text-sm text-white/40">Comienza añadiendo una nueva parcela o importa desde SIGPAC.</p>
            </div>
            <GlowButton onClick={() => setIsAdding(true)}>Empezar gestión</GlowButton>
          </div>
        ) : (
          filteredParcelas.map((p) => (
            <GlassCard key={p.id} className="p-0 overflow-hidden border-white/5 hover:border-emerald-500/30 transition-all flex flex-col group">
              {/* Card Header (Mini Map or Placeholder) */}
              <div className="h-24 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 flex items-center justify-center relative border-b border-white/5 group-hover:from-emerald-500/20 transition-all">
                <MapPin className="w-8 h-8 text-emerald-400/30 group-hover:text-emerald-400 group-hover:scale-110 transition-all" />
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20"><Edit3 size={14}/></button>
                  <button className="p-1.5 bg-white/10 rounded-lg hover:bg-red-500/20 text-red-400" onClick={() => handleDelete(p.id)}><Trash2 size={14}/></button>
                </div>
                <div className="absolute top-3 left-3 px-2 py-1 bg-emerald-500/20 backdrop-blur-md rounded-md border border-emerald-500/20">
                  <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">{p.sistema_riego || 'Secano'}</span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 space-y-4 flex-1">
                <div>
                  <h4 className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors leading-tight">{p.nombre}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-white/40">{p.cultivo || 'Sin cultivo'}</span>
                    <span className="w-1 h-1 bg-white/10 rounded-full" />
                    <span className="text-xs font-black text-emerald-400/80">{p.hectareas} Ha</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-white/50">
                  <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/5">
                    <Layers size={12} className="text-emerald-400" />
                    <span className="truncate">{p.referencia_sigpac || 'Sin SIGPAC'}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/5">
                    <MapPin size={12} className="text-blue-400" />
                    <span className="truncate">{p.provincia || 'N/A'}</span>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex gap-2 pt-2 border-t border-white/5">
                  <button 
                  onClick={() => onAction && onAction('tratamientos', { parcelaId: p.id })}
                  className="flex-1 flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 active:scale-95 group/btn">
                    <Bug size={16} className="text-red-400/70 group-hover/btn:scale-110 transition-all" />
                    <span className="text-[9px] font-black uppercase text-white/40">Fitos</span>
                  </button>
                  <button 
                  onClick={() => onAction && onAction('labores', { parcelaId: p.id })}
                  className="flex-1 flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 active:scale-95 group/btn">
                    <Leaf size={16} className="text-emerald-400/70 group-hover/btn:scale-110 transition-all" />
                    <span className="text-[9px] font-black uppercase text-white/40">Labores</span>
                  </button>
                  <button 
                  onClick={() => onAction && onAction('fertilizacion', { parcelaId: p.id })}
                  className="flex-1 flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 active:scale-95 group/btn">
                    <Droplets size={16} className="text-blue-400/70 group-hover/btn:scale-110 transition-all" />
                    <span className="text-[9px] font-black uppercase text-white/40">Abono</span>
                  </button>
                  <button 
                  onClick={() => onAction && onAction('inicio', { parcelaId: p.id })} // View history
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 active:scale-95 group/btn">
                    <Eye size={16} className="text-white/40 group-hover/btn:text-white" />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* Add Plot Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsAdding(false)} />
          <GlassCard className="max-w-xl w-full relative p-8 border-white/10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-white glow-text">Nueva Parcela</h3>
                <p className="text-sm text-white/40 font-bold">Añade propiedades agrícolas a tu explotación</p>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2].map(s => (
                  <div key={s} className={cn("w-2 h-2 rounded-full transition-all", s === step ? "bg-emerald-500 w-6" : "bg-white/10")} />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {step === 1 ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2">
                      <RefreshCcw className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Auto-importación SIGPAC</span>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 transition-all"
                        placeholder="Código SIGPAC (Ej: 28;065;0;0;12;45...)"
                        value={form.referencia_sigpac}
                        onChange={e => setForm({...form, referencia_sigpac: e.target.value})}
                      />
                      <button 
                        onClick={handleImportSigpac}
                        disabled={importingSigpac}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {importingSigpac ? 'Cargando...' : 'Importar'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-1">Alias de la Parcela</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/20 transition-all"
                      placeholder="Ej: Olivar del Cerro"
                      value={form.nombre}
                      onChange={e => setForm({...form, nombre: e.target.value})}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button className="px-6 py-3 text-sm font-bold text-white/50 hover:text-white" onClick={() => setIsAdding(false)}>Cancelar</button>
                    <button 
                      className="px-8 py-3 bg-white text-black font-black text-sm rounded-xl hover:bg-white/90 active:scale-95 transition-all"
                      onClick={() => setStep(2)}
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1 pr-3 scrollbar-thin scrollbar-thumb-white/10">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-1">Provincia</label>
                      <input 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                        value={form.provincia}
                        onChange={e => setForm({...form, provincia: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-1">Municipio</label>
                      <input 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                        value={form.municipio}
                        onChange={e => setForm({...form, municipio: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-1">Polígono</label>
                      <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-xs text-white" value={form.poligono} onChange={e => setForm({...form, poligono: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-1">Parcela</label>
                      <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-xs text-white" value={form.parcela} onChange={e => setForm({...form, parcela: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-1">Recinto</label>
                      <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-xs text-white" value={form.recinto} onChange={e => setForm({...form, recinto: e.target.value})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-1">Hectáreas</label>
                      <input 
                        type="number"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                        value={form.hectareas}
                        onChange={e => setForm({...form, hectareas: Number(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-1">Año Plantación</label>
                      <input 
                        type="number"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                        value={form.anio_plantacion}
                        onChange={e => setForm({...form, anio_plantacion: Number(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-1">Cultivo / Variedad</label>
                    <div className="flex gap-2">
                      <input 
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                        placeholder="Cultivo (Ej: Olivar)"
                        value={form.cultivo}
                        onChange={e => setForm({...form, cultivo: e.target.value})}
                      />
                      <input 
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                        placeholder="Variedad (Ej: Picual)"
                        value={form.variedad}
                        onChange={e => setForm({...form, variedad: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-6">
                    <button className="px-6 py-3 text-sm font-bold text-white/50 hover:text-white" onClick={() => setStep(1)}>Volver</button>
                    <button 
                      className="px-10 py-3 bg-emerald-500 text-black font-black text-sm rounded-xl hover:bg-emerald-400 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                      onClick={handleSave}
                    >
                      Guardar Parcela
                    </button>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
