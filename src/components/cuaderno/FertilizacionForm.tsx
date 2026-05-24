'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { createClient } from '@/lib/supabase/client';
import { getInventory } from '@/lib/actions/inventory';
import { VoiceRecorderButton } from '@/components/cuaderno/VoiceRecorderButton';
import { useToast } from '@/components/ui/Toast';
import { useSyncStore } from '@/store/syncStore';
import { Droplets, Check, ChevronDown, PackageOpen, AlertTriangle, WifiOff } from 'lucide-react';

interface FertilizacionFormProps {
  parcelas: any[];
  userProfile: any;
  initialParcelaId?: string;
  onSuccess: () => void;
}

export function FertilizacionForm({ parcelas, userProfile, initialParcelaId, onSuccess }: FertilizacionFormProps) {
  const supabase = createClient();
  const { toast } = useToast();
  const isOffline = useSyncStore(state => state.isOffline);
  const addMutation = useSyncStore(state => state.addMutation);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [savedOffline, setSavedOffline] = useState(false);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);

  React.useEffect(() => {
    if (parcelas.length > 0 && parcelas[0].explotacion_id) {
      getInventory(parcelas[0].explotacion_id).then(data => {
        // En fertilización podemos mostrar abonos o fertilizantes
        setInventory(data.filter((i: any) => i.tipo !== 'fitosanitario' && i.cantidad_actual > 0));
      }).catch(console.error);
    }
  }, [parcelas]);

  React.useEffect(() => {
    if (initialParcelaId) {
      setForm(prev => ({ ...prev, parcela_id: initialParcelaId }));
    }
  }, [initialParcelaId]);
  const [form, setForm] = useState({
    parcela_id: '',
    fecha: new Date().toISOString().split('T')[0],
    inventario_id: '',
    tipo_abono: '',
    dosis: '',
    unidad_dosis: 'kg/ha',
    n_p_k: '',
    superficie_tratada: '',
  });

  const tiposAbono = ['Mineral sólido', 'Mineral líquido', 'Orgánico', 'Organomineral', 'Fertirrigación', 'Foliar'];

  const handleAIDataExtracted = (data: any) => {
    if (!data) return;
    
    let pId = form.parcela_id;
    if (data.parcela) {
      const found = parcelas.find(p => p.nombre.toLowerCase().includes(data.parcela.toLowerCase()));
      if (found) pId = found.id;
    }

    setForm(prev => ({
      ...prev,
      parcela_id: pId,
      fecha: data.fecha || prev.fecha,
      tipo_abono: data.fertilizante || prev.tipo_abono,
      dosis: data.dosis ? String(data.dosis) : prev.dosis,
      unidad_dosis: data.unidad_dosis || prev.unidad_dosis,
      superficie_tratada: data.superficie_tratada ? String(data.superficie_tratada) : prev.superficie_tratada,
    }));
  };

  const handleInventoryChange = (invId: string) => {
    if (!invId) {
      setForm({ ...form, inventario_id: '', tipo_abono: '' });
      return;
    }
    const item = inventory.find(i => i.id === invId);
    if (item) {
      setForm({
        ...form,
        inventario_id: invId,
        tipo_abono: item.nombre_producto
      });
    }
  };

  const validate = (): string[] => {
    const errors: string[] = [];
    if (!form.parcela_id) errors.push('Seleccione una parcela');
    if (!form.tipo_abono && !form.inventario_id) errors.push('Especifique el tipo de abono');
    if (!form.dosis || Number(form.dosis) <= 0) errors.push('La dosis debe ser mayor que 0');
    
    if (form.inventario_id) {
      const item = inventory.find(i => i.id === form.inventario_id);
      const p = parcelas.find(x => x.id === form.parcela_id);
      const usedHa = form.superficie_tratada ? Number(form.superficie_tratada) : (p ? Number(p.hectareas) : 1);
      const totalUsedVolume = usedHa * Number(form.dosis);
      
      if (item && totalUsedVolume > item.cantidad_actual && form.unidad_dosis.startsWith(item.unidad === 'L' ? 'L' : 'kg')) {
        errors.push(`Stock insuficiente. Necesitas ${totalUsedVolume.toFixed(2)} ${item.unidad} pero te quedan ${item.cantidad_actual} ${item.unidad}.`);
      }
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    setValidationErrors(errors);
    if (errors.length > 0) return;

    const dataToSave = {
      parcela_id: form.parcela_id,
      fecha: form.fecha,
      tipo_abono: form.tipo_abono,
      dosis: Number(form.dosis),
      unidad_dosis: form.unidad_dosis,
      n_p_k: form.n_p_k || null,
      superficie_tratada: form.superficie_tratada ? Number(form.superficie_tratada) : null,
      inventario_id: form.inventario_id || null,
      user_id: userProfile?.userId || null,
      tenant_id: userProfile?.tenant_id || null,
    };

    setSaving(true);

    if (isOffline) {
      try {
        await addMutation('fertilizacion', dataToSave, (msg, type) => toast(msg, type === 'error' ? 'error' : 'success'));
        setSavedOffline(true);
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setSavedOffline(false);
          onSuccess();
        }, 2500);
      } catch (err) {
        setValidationErrors(['Error al encolar la fertilización en el almacenamiento local.']);
      } finally {
        setSaving(false);
      }
      return;
    }

    try {
      const { error } = await supabase.from('fertilizaciones').insert({
        ...dataToSave,
        fecha: new Date(form.fecha).toISOString(),
      });
      if (error) throw error;

      setSuccess(true);
      setTimeout(() => { setSuccess(false); onSuccess(); }, 1500);
    } catch (err: any) {
      console.error(err);
      const dbMessage = err.message || err.details || '';
      if (dbMessage.includes('Stock insuficiente') || dbMessage.includes('inventario')) {
        setValidationErrors([dbMessage]);
      } else {
        setValidationErrors(['Error al guardar la fertilización.']);
      }
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-white text-base outline-none focus:ring-2 focus:ring-violet-500/50 transition-all placeholder:text-white/30";
  const labelClass = "text-sm font-bold text-white/80 block mb-2";

  if (success) {
    return (
      <GlassCard className="p-12 flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
        {savedOffline ? (
          <>
            <div className="w-20 h-20 bg-amber-500/20 border border-amber-500/30 rounded-3xl flex items-center justify-center">
              <WifiOff className="w-10 h-10 text-amber-400 animate-pulse" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black text-white mb-2">Guardado Local (Offline)</h3>
              <p className="text-xs text-amber-300/80 font-bold uppercase tracking-widest leading-relaxed">
                Registrado en tu móvil. Se subirá a SIEX automáticamente cuando recuperes cobertura.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-violet-500/20 border border-violet-500/30 rounded-3xl flex items-center justify-center">
              <Check className="w-10 h-10 text-violet-400" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black text-white mb-2">Fertilización Registrada</h3>
              <p className="text-xs text-white/40 font-bold uppercase tracking-widest text-center mt-1">
                Conforme con la normativa SIEX y descontado del stock
              </p>
            </div>
          </>
        )}
      </GlassCard>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 pb-6 border-b border-white/5">
        <div className="w-16 h-16 bg-violet-500/10 rounded-xl flex items-center justify-center border border-violet-500/10 shrink-0">
          <Droplets className="w-8 h-8 text-violet-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-black text-white tracking-tight">Nueva Fertilización</h3>
          <p className="text-sm text-white/60 font-bold">Registro de abonado • Plan de fertilización</p>
        </div>
        <div className="shrink-0">
          <VoiceRecorderButton 
            type="fertilizacion" 
            onDataExtracted={handleAIDataExtracted} 
          />
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 text-red-400">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold">No se puede guardar:</h4>
            <ul className="text-sm list-disc pl-4 space-y-1 opacity-80">
              {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Parcela *</label>
          <div className="relative">
            <select className={`${inputClass} appearance-none cursor-pointer`} value={form.parcela_id} onChange={e => setForm({...form, parcela_id: e.target.value})}>
              <option value="">Seleccionar...</option>
              {parcelas.map((p: any) => <option key={p.id} value={p.id}>{p.nombre} ({p.hectareas} ha)</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className={labelClass}>Fecha *</label>
          <input type="date" className={inputClass} value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>
            <div className="flex items-center gap-2">
              <PackageOpen size={16} className="text-emerald-400" />
              Seleccionar del Almacén (Opcional)
            </div>
          </label>
          <div className="relative">
            <select 
              className={`${inputClass} appearance-none cursor-pointer bg-emerald-500/5 border-emerald-500/20 text-emerald-100`}
              value={form.inventario_id}
              onChange={e => handleInventoryChange(e.target.value)}
            >
              <option value="">-- No usar producto del almacén --</option>
              {inventory.map(i => (
                <option key={i.id} value={i.id}>
                  {i.nombre_producto} ({i.cantidad_actual} {i.unidad} disponibles)
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400/50 pointer-events-none" />
          </div>
          <p className="text-[11px] text-emerald-400/60 mt-2 ml-1">
            Si seleccionas un producto del almacén, se descontará automáticamente el stock al guardar.
          </p>
        </div>

        <div>
          <label className={labelClass}>Tipo de Abono *</label>
          <div className="relative">
            <select className={`${inputClass} appearance-none cursor-pointer`} value={form.tipo_abono} onChange={e => setForm({...form, tipo_abono: e.target.value})}>
              <option value="">Seleccionar tipo...</option>
              {tiposAbono.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Dosis *</label>
            <input type="number" step="0.01" className={inputClass} placeholder="0.00" value={form.dosis} onChange={e => setForm({...form, dosis: e.target.value})} />
          </div>
          <div>
            <label className={labelClass}>Unidad</label>
            <div className="relative">
              <select className={`${inputClass} appearance-none cursor-pointer`} value={form.unidad_dosis} onChange={e => setForm({...form, unidad_dosis: e.target.value})}>
                <option value="kg/ha">kg/ha</option>
                <option value="L/ha">L/ha</option>
                <option value="t/ha">t/ha</option>
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass}>N-P-K (Riqueza)</label>
          <input className={inputClass} placeholder="Ej: 20-10-5" value={form.n_p_k} onChange={e => setForm({...form, n_p_k: e.target.value})} />
        </div>

        <div>
          <label className={labelClass}>Superficie Tratada (ha) - Opcional</label>
          <input type="number" step="0.01" className={inputClass} placeholder="Por defecto toda la parcela" value={form.superficie_tratada} onChange={e => setForm({...form, superficie_tratada: e.target.value})} />
        </div>
      </div>

      <GlowButton type="submit" variant="primary" className="w-full py-5 rounded-2xl text-base font-bold" isLoading={saving}>
        Registrar Fertilización
      </GlowButton>
    </form>
  );
}
