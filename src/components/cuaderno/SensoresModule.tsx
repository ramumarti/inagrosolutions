'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { createClient } from '@/lib/supabase/client';
import { Radio, Activity, Droplets, ThermometerSun, Leaf, Wind, RefreshCw, Plus, ChevronDown, MapPin } from 'lucide-react';

interface SensoresModuleProps {
  explotacionId: string;
  parcelas: any[];
}

export function SensoresModule({ explotacionId, parcelas }: SensoresModuleProps) {
  const [lecturas, setLecturas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const supabase = createClient();

  const [form, setForm] = useState({
    parcela_id: '',
    sensor_id: '',
    tipo_medicion: 'Humedad de Suelo',
    valor: '',
  });

  const tiposMedicion = ['Humedad de Suelo', 'Temperatura', 'Radiación UV', 'Fertilidad NPK', 'Salinidad', 'Pluviómetro'];

  const loadLecturas = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('lecturas_sensores')
        .select('*, parcelas!inner(nombre, explotacion_id)')
        .eq('parcelas.explotacion_id', explotacionId)
        .order('fecha_lectura', { ascending: false })
        .limit(20);
      
      setLecturas(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [explotacionId, supabase]);

  useEffect(() => {
    loadLecturas();
  }, [loadLecturas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.parcela_id || !form.valor || !form.sensor_id) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('lecturas_sensores').insert({
        parcela_id: form.parcela_id,
        sensor_id: form.sensor_id,
        tipo_medicion: form.tipo_medicion,
        valor: Number(form.valor),
      });
      if (error) throw error;
      
      setIsAdding(false);
      setForm({ ...form, valor: '', sensor_id: '' });
      await loadLecturas();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const getIconForType = (tipo: string) => {
    switch (tipo) {
      case 'Humedad de Suelo': return <Droplets className="text-blue-400" size={24} />;
      case 'Temperatura': return <ThermometerSun className="text-amber-400" size={24} />;
      case 'Salinidad': return <Activity className="text-pink-400" size={24} />;
      case 'Nutrientes NPK': return <Leaf className="text-emerald-400" size={24} />;
      default: return <Wind className="text-violet-400" size={24} />;
    }
  };

  const getUnitForType = (tipo: string) => {
    switch (tipo) {
      case 'Humedad de Suelo': return '%';
      case 'Temperatura': return '°C';
      case 'Radiación UV': return 'W/m²';
      case 'Fertilidad NPK': return 'mg/kg';
      case 'Salinidad': return 'dS/m';
      case 'Pluviómetro': return 'mm';
      default: return '';
    }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-white/15";
  const labelClass = "text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2";

  if (isAdding) {
    return (
      <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between pb-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/10">
              <Radio className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Registro Manual de Sonda</h3>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Añadir telemetría</p>
            </div>
          </div>
          <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-xs font-bold text-white/60 hover:text-white transition-colors">
            Cancelar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Parcela *</label>
            <div className="relative">
              <select className={`${inputClass} appearance-none cursor-pointer`} value={form.parcela_id} onChange={e => setForm({...form, parcela_id: e.target.value})}>
                <option value="">Seleccionar parcela...</option>
                {parcelas.map((p: any) => <option key={p.id} value={p.id}>{p.nombre} ({p.hectareas} ha)</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className={labelClass}>ID del Equipo IoT *</label>
            <input className={inputClass} placeholder="Ej: SN-4921-A" value={form.sensor_id} onChange={e => setForm({...form, sensor_id: e.target.value})} required />
          </div>

          <div>
            <label className={labelClass}>Parámetro *</label>
            <div className="relative">
              <select className={`${inputClass} appearance-none cursor-pointer`} value={form.tipo_medicion} onChange={e => setForm({...form, tipo_medicion: e.target.value})}>
                {tiposMedicion.map((p: any) => <option key={p} value={p}>{p}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Lectura ({getUnitForType(form.tipo_medicion)}) *</label>
            <input type="number" step="0.01" className={inputClass} placeholder="0.00" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} required />
          </div>
        </div>

        <GlowButton type="submit" variant="primary" className="w-full py-4 rounded-2xl text-[11px]" isLoading={loading}>
          Guardar Lectura
        </GlowButton>
      </form>
    );
  }

  // Obtenemos último estado por sensor agrupadamente (naive approach for fake dashboard)
  const lastStates = lecturas.reduce((acc, curr) => {
    if (!acc[curr.sensor_id]) {
      acc[curr.sensor_id] = curr;
    }
    return acc;
  }, {} as Record<string, any>);
  const mapSensors = Object.values(lastStates);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/10">
            <Radio className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Sensores IoT Telemétricos</h3>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Estaciones y sondas en campo</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={loadLecturas} className="px-4 py-2.5 text-[10px] bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all font-black uppercase tracking-widest flex items-center gap-2">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Sincronizar
          </button>
          <GlowButton variant="secondary" className="px-4 py-2.5 text-[10px] flex items-center gap-2" onClick={() => setIsAdding(true)}>
            <Plus size={14} /> Entrada Manual
          </GlowButton>
        </div>
      </div>

      {loading && lecturas.length === 0 ? (
        <div className="p-12 text-center text-white/40 animate-pulse">Obteniendo espectro telemétrico...</div>
      ) : lecturas.length === 0 ? (
        <GlassCard className="p-12 text-center border-white/5 flex flex-col items-center">
          <Radio className="w-16 h-16 text-white/10 mb-6" />
          <h4 className="text-sm font-black text-white mb-2">No se han detectado equipos vinculados</h4>
          <p className="text-xs text-white/30 max-w-sm mb-6">Si no posees sensores hardware automatizados puedes simular ingresos manuales desde la plataforma.</p>
          <GlowButton variant="secondary" className="px-6 py-2 text-[10px]" onClick={() => setIsAdding(true)}>Ingresar Sonda Mock</GlowButton>
        </GlassCard>
      ) : (
        <div className="space-y-8">
          {/* Active Sensors Status */}
          <div>
            <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Estado Actual • Red IoT</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mapSensors.map((s: any) => (
                <GlassCard key={s.id} className="p-5 border-white/5 hover:bg-white/[0.03] transition-colors relative group overflow-hidden">
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
                  <div className="flex justify-between items-center mb-4 relative">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Online</span>
                    </div>
                    <span className="text-[10px] font-black text-white/40 font-mono tracking-widest">{s.sensor_id}</span>
                  </div>
                  <div className="flex items-end justify-between relative">
                    <div>
                      <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1">{s.tipo_medicion}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-white tracking-tighter">{s.valor}</span>
                        <span className="text-[10px] font-bold text-white/40">{getUnitForType(s.tipo_medicion)}</span>
                      </div>
                    </div>
                    {getIconForType(s.tipo_medicion)}
                  </div>
                  <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-4 flex items-center gap-1 border-t border-white/5 pt-3">
                    <MapPin size={10} /> {s.parcelas.nombre}
                  </p>
                </GlassCard>
              ))}
            </div>
          </div>
          
          {/* Timeline Feed */}
          <div>
            <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Flujo de Telemetría RAW</h4>
            <GlassCard className="border-white/5 bg-black/20 p-2">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="p-3 text-[9px] font-black text-white/30 uppercase tracking-widest">Fecha y Hora</th>
                      <th className="p-3 text-[9px] font-black text-white/30 uppercase tracking-widest">Equipo</th>
                      <th className="p-3 text-[9px] font-black text-white/30 uppercase tracking-widest">Parámetro</th>
                      <th className="p-3 text-[9px] font-black text-white/30 uppercase tracking-widest text-right">Valor Registrado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lecturas.map(l => (
                      <tr key={l.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                        <td className="p-3 text-xs text-white/60 font-mono">{new Date(l.fecha_lectura).toLocaleString('es-ES')}</td>
                        <td className="p-3 text-xs text-white/80"><span className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-black text-blue-400">{l.sensor_id}</span></td>
                        <td className="p-3 text-xs text-white/60 flex items-center gap-2">{l.tipo_medicion}</td>
                        <td className="p-3 text-[11px] font-black text-white text-right">
                          {l.valor} <span className="text-white/30 font-normal">{getUnitForType(l.tipo_medicion)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
