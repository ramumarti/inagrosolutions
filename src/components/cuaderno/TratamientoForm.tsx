'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { createClient } from '@/lib/supabase/client';
import { getInventory, deductStock } from '@/lib/actions/inventory';
import { VoiceRecorderButton } from '@/components/cuaderno/VoiceRecorderButton';
import { VademecumAlert, type VademecumValidationResult } from '@/components/cuaderno/VademecumAlert';
import { Bug, Calendar, Beaker, Ruler, Tractor, User, Check, AlertTriangle, ChevronDown, PackageOpen } from 'lucide-react';

interface TratamientoFormProps {
  parcelas: any[];
  userProfile: any; // Add this
  initialParcelaId?: string;
  onSuccess: () => void;
}

export function TratamientoForm({ parcelas, userProfile, initialParcelaId, onSuccess }: TratamientoFormProps) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  
  const [form, setForm] = useState({
    parcela_id: '',
    fecha: new Date().toISOString().split('T')[0],
    inventario_id: '',
    nombre_producto: '',
    producto_mapa_id: '',
    dosis: '',
    unidad_dosis: 'L/ha',
    superficie_tratada: '',
    maquinaria_usada: '',
    operario: '',
  });

  const [vademecumResult, setVademecumResult] = useState<VademecumValidationResult | null>(null);

  const unidades = ['L/ha', 'kg/ha', 'mL/ha', 'g/ha', 'cc/100L'];

  useEffect(() => {
    if (parcelas.length > 0 && parcelas[0].explotacion_id) {
      getInventory(parcelas[0].explotacion_id).then(data => {
        // Solo fitosanitarios con stock
        setInventory(data.filter((i: any) => i.tipo === 'fitosanitario' && i.cantidad_actual > 0));
      }).catch(console.error);
    }
  }, [parcelas]);

  useEffect(() => {
    if (initialParcelaId) {
      setForm(prev => ({ ...prev, parcela_id: initialParcelaId }));
    }
  }, [initialParcelaId]);

  // Vademecum Real-time Validation (Debounced)
  useEffect(() => {
    const validateVademecum = async () => {
      if (!form.parcela_id || !form.nombre_producto || !form.dosis) {
        setVademecumResult(null);
        return;
      }

      setVademecumResult(prev => prev ? { ...prev, loading: true } : { valid: true, warnings: [], errors: [], info: {}, loading: true });

      const parcela = parcelas.find(p => p.id === form.parcela_id);
      // Extraemos posible nombre de cultivo de la parcela, si no existe usamos "Cultivo genérico"
      const cultivoStr = parcela?.cultivos && parcela.cultivos.length > 0 ? parcela.cultivos[0].nombre : 'Desconocido';

      try {
        const res = await fetch('/api/ai/validate-treatment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            producto_nombre: form.nombre_producto,
            producto_registro: form.producto_mapa_id,
            cultivo: cultivoStr,
            dosis: Number(form.dosis),
            unidad_dosis: form.unidad_dosis
          })
        });
        const data = await res.json();
        
        if (data.error && data.error === 'CREDITS_EXHAUSTED') {
          // Si no hay créditos, se ignora la validación IA
          setVademecumResult(null);
        } else {
          setVademecumResult({ ...data, loading: false });
        }
      } catch (err) {
        setVademecumResult(null);
      }
    };

    const timeoutId = setTimeout(validateVademecum, 800);
    return () => clearTimeout(timeoutId);
  }, [form.parcela_id, form.nombre_producto, form.dosis, form.unidad_dosis, form.producto_mapa_id, parcelas]);

  // Si seleccionan del inventario, auto-rellenar producto y MAPA id
  const handleInventoryChange = (invId: string) => {
    if (!invId) {
      setForm({ ...form, inventario_id: '', nombre_producto: '', producto_mapa_id: '' });
      return;
    }
    const item = inventory.find(i => i.id === invId);
    if (item) {
      setForm({
        ...form,
        inventario_id: invId,
        nombre_producto: item.nombre_producto,
        producto_mapa_id: item.numero_registro || ''
      });
    }
  };

  const handleAIDataExtracted = (data: any) => {
    if (!data) return;
    
    // Buscar parcela por nombre si viene
    let pId = form.parcela_id;
    if (data.parcela) {
      const found = parcelas.find(p => p.nombre.toLowerCase().includes(data.parcela.toLowerCase()));
      if (found) pId = found.id;
    }

    // Actualizar formulario con datos detectados
    setForm(prev => ({
      ...prev,
      parcela_id: pId,
      fecha: data.fecha || prev.fecha,
      nombre_producto: data.producto || prev.nombre_producto,
      dosis: data.dosis ? String(data.dosis) : prev.dosis,
      unidad_dosis: data.unidad_dosis || prev.unidad_dosis,
      superficie_tratada: data.superficie_tratada ? String(data.superficie_tratada) : prev.superficie_tratada,
      maquinaria_usada: data.maquinaria || prev.maquinaria_usada,
      operario: data.operario || prev.operario,
    }));
  };

  const validate = (): string[] => {
    const errors: string[] = [];
    if (!form.parcela_id) errors.push('Seleccione una parcela');
    if (!form.fecha) errors.push('La fecha es obligatoria');
    if (!form.nombre_producto && !form.inventario_id) errors.push('Seleccione un producto del almacén o escriba su nombre');
    if (!form.dosis || Number(form.dosis) <= 0) errors.push('La dosis debe ser mayor que 0');
    
    // Check stock logically
    if (form.inventario_id) {
      const item = inventory.find(i => i.id === form.inventario_id);
      const p = parcelas.find(x => x.id === form.parcela_id);
      const usedHa = form.superficie_tratada ? Number(form.superficie_tratada) : (p ? Number(p.hectareas) : 1);
      const totalUsedVolume = usedHa * Number(form.dosis);
      
      if (item && totalUsedVolume > item.cantidad_actual && form.unidad_dosis.startsWith(item.unidad === 'L' ? 'L' : 'kg')) {
        errors.push(`Stock insuficiente. Necesitas ${totalUsedVolume.toFixed(2)} ${item.unidad} pero te quedan ${item.cantidad_actual} ${item.unidad}.`);
      }
    }

    if (Number(form.dosis) > 100) {
      errors.push('⚠️ Alerta normativa: La dosis supera los 100 L/ha. Verifique con la ficha técnica del producto.');
    }
    
    if (vademecumResult && !vademecumResult.loading && !vademecumResult.valid) {
      errors.push('Bloqueado por Vademécum: ' + vademecumResult.errors[0]);
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
        user_id: userProfile?.userId || null,
        tenant_id: userProfile?.tenant_id || null,
      });
      if (error) throw error;

      // Restar del inventario SI aplica
      if (form.inventario_id) {
        const p = parcelas.find(x => x.id === form.parcela_id);
        const usedHa = form.superficie_tratada ? Number(form.superficie_tratada) : (p ? Number(p.hectareas) : 1);
        let totalUsedVolume = usedHa * Number(form.dosis);
        
        // Conversión guarra en MVP (Si dosis es mL o cc, pasar a L)
        if (form.unidad_dosis.startsWith('mL') || form.unidad_dosis.startsWith('cc')) totalUsedVolume /= 1000;
        if (form.unidad_dosis.startsWith('g')) totalUsedVolume /= 1000;

        await deductStock(form.inventario_id, totalUsedVolume).catch(err => {
          console.error("No se pudo descontar del stock: ", err);
          // Opcional: mostrar un warning pero no petar el flujo
        });
      }

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

  const inputClass = "w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-white text-base outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-white/30";
  const labelClass = "text-sm font-bold text-white/80 block mb-2";

  if (success) {
    return (
      <GlassCard className="p-12 flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-3xl flex items-center justify-center">
          <Check className="w-10 h-10 text-emerald-400" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-black text-white mb-2">Tratamiento Registrado</h3>
          <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Conforme con la normativa SIEX y descontado del stock</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 pb-6 border-b border-white/5">
        <div className="w-16 h-16 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/10 shrink-0">
          <Bug className="w-8 h-8 text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-black text-white tracking-tight">Nuevo Tratamiento</h3>
          <p className="text-sm text-white/60 font-bold">Fitosanitarios • Vinculado al Almacén</p>
        </div>
        <div className="shrink-0">
          <VoiceRecorderButton 
            type="tratamiento" 
            onDataExtracted={handleAIDataExtracted} 
          />
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1">
          {validationErrors.map((err, i) => (
             <p key={i} className="text-[11px] text-red-400 font-bold flex items-center gap-2">
               <AlertTriangle size={12} className="shrink-0" /> <span className="leading-tight">{err}</span>
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
          <label className={labelClass}><Calendar size={14} className="inline mr-1" />Fecha *</label>
          <input
            type="date"
            className={inputClass}
            value={form.fecha}
            onChange={e => setForm({...form, fecha: e.target.value})}
          />
        </div>

        {/* INVENTORY SELECTOR */}
        <div className="md:col-span-2 p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
          <label className={labelClass}><PackageOpen size={14} className="inline mr-1 text-indigo-400" />Producto del Almacén</label>
          <div className="relative mb-3">
            <select
              className={`${inputClass} appearance-none cursor-pointer border-indigo-500/30 focus:ring-indigo-500/50`}
              value={form.inventario_id}
              onChange={e => handleInventoryChange(e.target.value)}
            >
              <option value="">-- No usar almacén (escribir manualmente) --</option>
              {inventory.map((item: any) => (
                <option key={item.id} value={item.id}>
                  {item.nombre_producto} (Stock: {item.cantidad_actual} {item.unidad})
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
          </div>
          
          {!form.inventario_id && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-[10px] text-white/40 font-bold uppercase block mb-1">Nombre Comercial</label>
                <input
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                  placeholder="Ej: Score"
                  value={form.nombre_producto}
                  onChange={e => setForm({...form, nombre_producto: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] text-white/40 font-bold uppercase block mb-1">Nº Registro MAPA</label>
                <input
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                  placeholder="Opcional"
                  value={form.producto_mapa_id}
                  onChange={e => setForm({...form, producto_mapa_id: e.target.value})}
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}><Ruler size={14} className="inline mr-1" />Dosis *</label>
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

        <div className="md:col-span-2">
          <VademecumAlert result={vademecumResult} />
        </div>

        <div>
          <label className={labelClass}>Superficie Tratada (ha)</label>
          <input
            type="number"
            step="0.01"
            className={inputClass}
            placeholder="Opcional (Usa la total)"
            value={form.superficie_tratada}
            onChange={e => setForm({...form, superficie_tratada: e.target.value})}
          />
        </div>

        <div>
          <label className={labelClass}><Tractor size={14} className="inline mr-1" />Maquinaria</label>
          <input
            className={inputClass}
            placeholder="Equipo utilizado"
            value={form.maquinaria_usada}
            onChange={e => setForm({...form, maquinaria_usada: e.target.value})}
          />
        </div>

        <div>
          <label className={labelClass}><User size={14} className="inline mr-1" />Operario</label>
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
          className="w-full py-5 rounded-2xl text-base font-bold"
          isLoading={saving}
        >
          Registrar Tratamiento
        </GlowButton>
      </div>
    </form>
  );
}
