'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { createClient } from '@/lib/supabase/client';
import { Bug, Calendar, Beaker, Ruler, Tractor, User, Check, AlertTriangle, ChevronDown } from 'lucide-react';

interface TratamientoFormProps {
  parcelas: any[];
  onSuccess: () => void;
}

export function TratamientoForm({ parcelas, onSuccess }: TratamientoFormProps) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [form, setForm] = useState({
    parcela_id: '',
    fecha: new Date().toISOString().split('T')[0],
    nombre_producto: '',
    producto_mapa_id: '',
    dosis: '',
    unidad_dosis: 'L/ha',
    superficie_tratada: '',
    maquinaria_usada: '',
    operario: '',
  });

  const unidades = ['L/ha', 'kg/ha', 'mL/ha', 'g/ha', 'cc/100L'];

  const validate = (): string[] => {
    const errors: string[] = [];
    if (!form.parcela_id) errors.push('Seleccione una parcela');
    if (!form.fecha) errors.push('La fecha es obligatoria');
    if (!form.nombre_producto) errors.push('El nombre del producto es obligatorio');
    if (!form.dosis || Number(form.dosis) <= 0) errors.push('La dosis debe ser mayor que 0');
    
    // Validación normativa: dosis máxima razonable
    if (Number(form.dosis) > 100) {
      errors.push('⚠️ Alerta normativa: La dosis supera los 100 L/ha. Verifique con la ficha técnica del producto.');
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    setValidationErrors(errors);
    if (errors.length > 0) return;

    setSaving(true);
    try {
      const { error } = await supabase.from('tratamientos_fitosanitarios').insert({
        parcela_id: form.parcela_id,
        fecha: new Date(form.fecha).toISOString(),
        nombre_producto: form.nombre_producto,
        producto_mapa_id: form.producto_mapa_id || null,
        dosis: Number(form.dosis),
        unidad_dosis: form.unidad_dosis,
        superficie_tratada: form.superficie_tratada ? Number(form.superficie_tratada) : null,
        maquinaria_usada: form.maquinaria_usada || null,
        operario: form.operario || null,
      });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
      }, 1500);
    } catch (err) {
      console.error(err);
      setValidationErrors(['Error al guardar el tratamiento. Inténtelo de nuevo.']);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all placeholder:text-white/15";
  const labelClass = "text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2";

  if (success) {
    return (
      <GlassCard className="p-12 flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-3xl flex items-center justify-center">
          <Check className="w-10 h-10 text-emerald-400" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-black text-white mb-2">Tratamiento Registrado</h3>
          <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Conforme con la normativa SIEX</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 pb-6 border-b border-white/5">
        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/10">
          <Bug className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-black text-white uppercase tracking-tight">Nuevo Tratamiento Fitosanitario</h3>
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Registro obligatorio SIEX • RD 1311/2012</p>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1">
          {validationErrors.map((err, i) => (
            <p key={i} className="text-[11px] text-red-400 font-bold flex items-center gap-2">
              <AlertTriangle size={12} /> {err}
            </p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Parcela *</label>
          <div className="relative">
            <select
              className={`${inputClass} appearance-none cursor-pointer`}
              value={form.parcela_id}
              onChange={e => setForm({...form, parcela_id: e.target.value})}
            >
              <option value="">Seleccionar parcela...</option>
              {parcelas.map((p: any) => (
                <option key={p.id} value={p.id}>{p.nombre} ({p.hectareas} ha)</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className={labelClass}><Calendar size={10} className="inline mr-1" />Fecha *</label>
          <input
            type="date"
            className={inputClass}
            value={form.fecha}
            onChange={e => setForm({...form, fecha: e.target.value})}
          />
        </div>

        <div>
          <label className={labelClass}><Beaker size={10} className="inline mr-1" />Producto *</label>
          <input
            className={inputClass}
            placeholder="Nombre del producto fitosanitario"
            value={form.nombre_producto}
            onChange={e => setForm({...form, nombre_producto: e.target.value})}
          />
        </div>

        <div>
          <label className={labelClass}>Nº Registro MAPA</label>
          <input
            className={inputClass}
            placeholder="Ej: ES-01234"
            value={form.producto_mapa_id}
            onChange={e => setForm({...form, producto_mapa_id: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}><Ruler size={10} className="inline mr-1" />Dosis *</label>
            <input
              type="number"
              step="0.01"
              className={inputClass}
              placeholder="0.00"
              value={form.dosis}
              onChange={e => setForm({...form, dosis: e.target.value})}
            />
          </div>
          <div>
            <label className={labelClass}>Unidad</label>
            <div className="relative">
              <select
                className={`${inputClass} appearance-none cursor-pointer`}
                value={form.unidad_dosis}
                onChange={e => setForm({...form, unidad_dosis: e.target.value})}
              >
                {unidades.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass}>Superficie Tratada (ha)</label>
          <input
            type="number"
            step="0.01"
            className={inputClass}
            placeholder="0.00"
            value={form.superficie_tratada}
            onChange={e => setForm({...form, superficie_tratada: e.target.value})}
          />
        </div>

        <div>
          <label className={labelClass}><Tractor size={10} className="inline mr-1" />Maquinaria</label>
          <input
            className={inputClass}
            placeholder="Equipo utilizado"
            value={form.maquinaria_usada}
            onChange={e => setForm({...form, maquinaria_usada: e.target.value})}
          />
        </div>

        <div>
          <label className={labelClass}><User size={10} className="inline mr-1" />Operario</label>
          <input
            className={inputClass}
            placeholder="Nombre del aplicador"
            value={form.operario}
            onChange={e => setForm({...form, operario: e.target.value})}
          />
        </div>
      </div>

      <div className="pt-4">
        <GlowButton
          type="submit"
          variant="primary"
          className="w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest"
          isLoading={saving}
        >
          Registrar Tratamiento
        </GlowButton>
      </div>
    </form>
  );
}
