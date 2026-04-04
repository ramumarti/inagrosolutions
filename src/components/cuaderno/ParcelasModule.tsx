'use client';

import React, { useState } from 'react';
import { 
  Plus, MapPin, Search, Filter, Upload, FileJson, 
  Trash2, Edit3, Eye, MoreVertical, Layers, ArrowRight,
  Database, RefreshCcw, Droplets, Leaf, Bug, Zap, Building2,
  CheckSquare, Square, Check
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { createParcela, deleteParcela, importFromSigpac, getSigpacInfoByCoords } from '@/lib/actions/agricultural';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const ParcelaMap = dynamic(() => import('./ParcelaMap').then(m => m.ParcelaMap), { 
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-white/5 animate-pulse rounded-2xl border border-white/10 flex items-center justify-center text-white/20 text-xs font-black uppercase">Cargando Mapas...</div>
});

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
  agregado?: number;
  zona?: number;
  referencia_catastral?: string;
  crs?: string;
  x_utm?: number;
  y_utm?: number;
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
  const [editingPlotId, setEditingPlotId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [importingSigpac, setImportingSigpac] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCultivo, setFilterCultivo] = useState('all');
  const [selectedPlots, setSelectedPlots] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  
  const initialForm = {
    nombre: '',
    referencia_sigpac: '',
    hectareas: 0,
    cultivo: '',
    variedad: '',
    sistema_riego: 'secano',
    provincia: '',
    municipio: '',
    agregado: 0,
    zona: 0,
    poligono: '',
    parcela: '',
    recinto: '',
    referencia_catastral: '',
    crs: 'EPSG:ETRS89 / UTM zone 30N',
    x_utm: 0,
    y_utm: 0,
    anio_plantacion: new Date().getFullYear()
  };

  // Form State
  const [form, setForm] = useState(initialForm);

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
      if (editingPlotId) {
        // En un caso real llamaríamos a updateParcela(editingPlotId, form)
        // Por ahora simulamos la actualización en el estado local
        setParcelas(parcelas.map(p => p.id === editingPlotId ? { ...p, ...form } : p));
        setEditingPlotId(null);
      } else {
        const newPlot = await createParcela({
          ...form,
          explotacion_id: explotacionId,
          tenant_id: tenantId
        });
        setParcelas([...parcelas, newPlot as any]);
      }
      setIsAdding(false);
      setStep(1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (plot: Plot) => {
    setForm({
      nombre: plot.nombre,
      referencia_sigpac: plot.referencia_sigpac || '',
      hectareas: plot.hectareas,
      cultivo: plot.cultivo || '',
      variedad: plot.variedad || '',
      sistema_riego: plot.sistema_riego || 'secano',
      provincia: plot.provincia || '',
      municipio: plot.municipio || '',
      agregado: plot.agregado || 0,
      zona: plot.zona || 0,
      poligono: plot.poligono || '',
      parcela: plot.parcela || '',
      recinto: plot.recinto || '',
      referencia_catastral: plot.referencia_catastral || '',
      crs: plot.crs || 'EPSG:ETRS89 / UTM zone 30N',
      x_utm: plot.x_utm || 0,
      y_utm: plot.y_utm || 0,
      anio_plantacion: (plot as any).anio_plantacion || new Date().getFullYear()
    });
    setEditingPlotId(plot.id);
    setIsAdding(true);
    setStep(2); // Ir directo a los detalles para editar
  };

  const handleToggleIrrigation = async (id: string, current: string) => {
    const next = current === 'regadío' ? 'secano' : 'regadío';
    // En un caso real llamaríamos a updateParcela(id, { sistema_riego: next })
    setParcelas(parcelas.map(p => p.id === id ? { ...p, sistema_riego: next } : p));
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

          {/* Selection Toggle */}
          <button 
            onClick={() => {
              setSelectionMode(!selectionMode);
              if (selectionMode) setSelectedPlots([]);
            }}
            className={cn(
              "px-4 py-2.5 rounded-xl border flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all",
              selectionMode 
                ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" 
                : "bg-white/5 border-white/10 text-white/40 hover:text-white"
            )}
          >
            {selectionMode ? <CheckSquare size={14} /> : <Square size={14} />}
            {selectionMode ? `Seleccionadas (${selectedPlots.length})` : 'Seleccionar'}
          </button>

          <GlowButton 
            className="flex items-center gap-2"
            onClick={() => {
              setForm(initialForm);
              setEditingPlotId(null);
              setStep(1);
              setIsAdding(true);
            }}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva Parcela</span>
          </GlowButton>
        </div>
      </div>

      {/* Floating Mass Action Bar */}
      {selectionMode && selectedPlots.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-[45%] z-[1000] animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-black/80 backdrop-blur-2xl border border-white/20 p-2 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4">
            <div className="px-4 border-r border-white/10 py-1">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Acción Masiva</p>
              <p className="text-[14px] font-black text-white">{selectedPlots.length} parcelas</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => onAction && onAction('tratamientos', { parcelaIds: selectedPlots })}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group"
                title="Tratamiento Masivo"
              >
                <Bug size={20} className="text-red-400" />
              </button>
              <button 
                onClick={() => onAction && onAction('labores', { parcelaIds: selectedPlots })}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group"
                title="Labor Masiva"
              >
                <Leaf size={20} className="text-emerald-400" />
              </button>
              <button 
                onClick={() => onAction && onAction('fertilizacion', { parcelaIds: selectedPlots })}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group"
                title="Fertilización Masiva"
              >
                <Droplets size={20} className="text-blue-400" />
              </button>
            </div>
            <button 
              onClick={() => { setSelectionMode(false); setSelectedPlots([]); }}
              className="ml-4 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-black uppercase rounded-xl transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

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
            <GlassCard 
              key={p.id} 
              className={cn(
                "p-0 overflow-hidden border-white/5 hover:border-emerald-500/30 transition-all flex flex-col group relative",
                selectedPlots.includes(p.id) && "ring-2 ring-emerald-500 border-emerald-500/50"
              )}
              onClick={() => {
                if (selectionMode) {
                  setSelectedPlots(prev => 
                    prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]
                  );
                }
              }}
            >
              {/* Card Header (Mini Map or Placeholder) */}
              <div className="h-24 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 flex items-center justify-center relative border-b border-white/5 group-hover:from-emerald-500/20 transition-all">
                {selectionMode && (
                  <div className={cn(
                    "absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    selectedPlots.includes(p.id) 
                      ? "bg-emerald-500 border-emerald-500 text-black" 
                      : "bg-white/10 border-white/20"
                  )}>
                    {selectedPlots.includes(p.id) && <Check size={14} strokeWidth={4} />}
                  </div>
                )}
                {!selectionMode && (
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20" onClick={(e) => { e.stopPropagation(); handleEdit(p); }}><Edit3 size={14}/></button>
                    <button className="p-1.5 bg-white/10 rounded-lg hover:bg-red-500/20 text-red-400" onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}><Trash2 size={14}/></button>
                  </div>
                )}
                <MapPin className="w-8 h-8 text-emerald-400/30 group-hover:text-emerald-400 group-hover:scale-110 transition-all" />
                <div 
                  className={cn(
                    "absolute top-3 left-3 px-2 py-1 backdrop-blur-md rounded-md border transition-all cursor-pointer hover:scale-105 active:scale-95",
                    p.sistema_riego?.toLowerCase() === 'regadío' 
                      ? "bg-blue-500/20 border-blue-500/30 text-blue-400" 
                      : "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleIrrigation(p.id, p.sistema_riego || 'secano');
                  }}
                  title="Haz clic para cambiar el sistema de riego"
                >
                  <span className="text-[10px] font-black tracking-widest uppercase">{p.sistema_riego || 'Secano'}</span>
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
                  <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/5" title="Polígono / Parcela">
                    <Layers size={12} className="text-emerald-400" />
                    <span className="truncate">P{p.poligono} / P{p.parcela}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/5" title="Localización">
                    <MapPin size={12} className="text-blue-400" />
                    <span className="truncate">{p.provincia || 'S/P'} - {p.municipio || 'S/M'}</span>
                  </div>
                  {p.referencia_catastral && (
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/5 col-span-2" title="Referencia Catastral">
                      <Search size={12} className="text-blue-400" />
                      <span className="truncate">{p.referencia_catastral}</span>
                    </div>
                  )}
                  {p.agregado !== 0 && (
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/5">
                      <span className="text-emerald-400">AG:</span>
                      <span className="truncate">{p.agregado}</span>
                    </div>
                  )}
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
                <h3 className="text-2xl font-black text-white glow-text">{editingPlotId ? 'Editar Parcela' : 'Nueva Parcela'}</h3>
                <p className="text-sm text-white/40 font-bold">{editingPlotId ? 'Actualiza los datos de tu terreno' : 'Añade propiedades agrícolas a tu explotación'}</p>
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
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 transition-all font-mono"
                        placeholder="Código SIGPAC (Ej: 23;46;0;0;13;333...)"
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

                    <div className="pt-2">
                      <button 
                        onClick={() => setShowMap(!showMap)}
                        className={cn(
                          "w-full py-3 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                          showMap ? "bg-white/10 text-white" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <MapPin size={14} />
                        {showMap ? 'Ocultar Identificador en Mapa' : 'Identificar en Mapa interactivo'}
                      </button>
                    </div>

                    {showMap && (
                      <div className="pt-2 animate-in fade-in slide-in-from-top-4 duration-500">
                        <ParcelaMap 
                          onPlotSelect={async (data) => {
                            setImportingSigpac(true);
                            try {
                              const res = await getSigpacInfoByCoords(data.lat, data.lng);
                              if (res.success && res.data) {
                                setForm({
                                  ...form,
                                  ...res.data,
                                  referencia_sigpac: `${res.data.provincia};${res.data.municipio};${res.data.agregado};${res.data.zona};${res.data.poligono};${res.data.parcela};${res.data.recinto}`
                                });
                                setStep(2); // Auto-navigate to review
                              }
                            } catch (e) {
                              console.error(e);
                            } finally {
                              setImportingSigpac(false);
                            }
                          }}
                        />
                        <div className="flex items-center justify-between mt-3 px-2">
                          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                            Haz clic en el mapa para extraer los datos
                          </p>
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                            <span className="text-[9px] font-black text-white/30 uppercase">Parcelas SIGPAC</span>
                          </div>
                        </div>
                      </div>
                    )}
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
                    <button className="px-6 py-3 text-sm font-bold text-white/50 hover:text-white" onClick={() => {
                      setIsAdding(false);
                      setEditingPlotId(null);
                    }}>Cancelar</button>
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
                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-1">Sistema de Riego</label>
                      <div className="flex gap-2">
                        {['secano', 'regadío'].map(type => (
                          <button
                            key={type}
                            onClick={() => setForm({...form, sistema_riego: type})}
                            className={cn(
                              "flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                              form.sistema_riego === type 
                                ? type === 'regadío' ? "bg-blue-500 border-blue-400 text-black" : "bg-emerald-500 border-emerald-400 text-black"
                                : "bg-white/5 border-white/10 text-white/30 hover:bg-white/10"
                            )}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

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

                  <div className="grid grid-cols-4 gap-2">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-1">Polígono</label>
                      <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-xs text-white" value={form.poligono} onChange={e => setForm({...form, poligono: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-1">Parcela</label>
                      <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-xs text-white" value={form.parcela} onChange={e => setForm({...form, parcela: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-1">Agregado</label>
                      <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-xs text-white" value={form.agregado} onChange={e => setForm({...form, agregado: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-1">Zona</label>
                      <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-xs text-white" value={form.zona} onChange={e => setForm({...form, zona: Number(e.target.value)})} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-1">Referencia Catastral</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none uppercase font-mono"
                      placeholder="23046A013003330000JP"
                      value={form.referencia_catastral}
                      onChange={e => setForm({...form, referencia_catastral: e.target.value})}
                    />
                  </div>

                  <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Coordenadas del Punto (UTM)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-white/20">Coordenada X</label>
                        <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none" value={form.x_utm} placeholder="455097.60" onChange={e => setForm({...form, x_utm: Number(e.target.value)})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-white/20">Coordenada Y</label>
                        <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none" value={form.y_utm} placeholder="4209681.58" onChange={e => setForm({...form, y_utm: Number(e.target.value)})} />
                      </div>
                    </div>
                    <p className="text-[9px] text-white/20 font-bold">Sistema de Referencia (CRS): {form.crs}</p>
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
