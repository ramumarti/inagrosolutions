'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { getInventory, addStock } from '@/lib/actions/inventory';
import { InvoiceScanner } from '@/components/cuaderno/InvoiceScanner';
import { PackageOpen, Plus, Beaker, Leaf, AlertTriangle, XCircle, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

export function InventarioModule({ explotacionId }: { explotacionId: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    tipo: 'fitosanitario',
    nombre_producto: '',
    numero_registro: '',
    lote: '',
    cantidad: '',
    unidad: 'L',
    precio_unitario: ''
  });

  const load = () => {
    getInventory(explotacionId).then(data => {
      setItems(data);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, [explotacionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre_producto || !formData.cantidad) return;

    try {
      setIsSubmitting(true);
      await addStock({
        explotacion_id: explotacionId,
        tipo: formData.tipo,
        nombre_producto: formData.nombre_producto,
        numero_registro: formData.numero_registro,
        lote: formData.lote,
        cantidad: Number(formData.cantidad),
        unidad: formData.unidad,
        precio_unitario: Number(formData.precio_unitario) || 0
      });
      setModalOpen(false);
      setFormData({ tipo: 'fitosanitario', nombre_producto: '', numero_registro: '', lote: '', cantidad: '', unidad: 'L', precio_unitario: '' });
      load();
    } catch (e: any) {
      console.error(e);
      alert('Error añadiendo producto al inventario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvoiceScanned = (data: any) => {
    if (!data || !data.articulos || data.articulos.length === 0) return;
    
    const art = data.articulos[0];
    setFormData(prev => ({
      ...prev,
      tipo: art.tipo === 'abono' || art.tipo === 'fertilizante' ? 'fertilizante' : 'fitosanitario',
      nombre_producto: art.nombre_producto || prev.nombre_producto,
      numero_registro: art.numero_registro_mapa || prev.numero_registro,
      cantidad: art.cantidad ? String(art.cantidad) : prev.cantidad,
      unidad: art.unidad === 'kg' ? 'Kg' : art.unidad === 'ud' ? 'uds' : 'L',
      precio_unitario: art.precio_unitario ? String(art.precio_unitario) : prev.precio_unitario
    }));
  };

  if (loading) return <div className="text-white/50 text-sm font-bold animate-pulse">Cargando almacén...</div>;

  const lowStockThreshold = 5;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/10">
            <PackageOpen className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Almacén de Insumos</h3>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Gestión de Fitosanitarios y Fertilizantes</p>
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] active:scale-95"
        >
          <Plus className="w-4 h-4" /> Registrar Compra
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => {
          const isFito = item.tipo === 'fitosanitario';
          const Icon = isFito ? Beaker : Leaf;
          const color = isFito ? 'text-blue-400' : 'text-emerald-400';
          const bg = isFito ? 'bg-blue-500/10' : 'bg-emerald-500/10';
          const percentage = (item.cantidad_actual / item.cantidad_inicial) * 100;
          const isLowStock = item.cantidad_actual < lowStockThreshold && item.cantidad_actual > 0;
          const isOutOfStock = item.cantidad_actual <= 0;

          return (
            <GlassCard key={item.id} className={`p-5 border-white/5 flex flex-col gap-3 group relative overflow-hidden ${isOutOfStock ? 'opacity-50' : ''}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${bg} ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] uppercase font-black tracking-wider ${color}`}>
                    {item.tipo}
                  </span>
                </div>
                {isOutOfStock ? (
                  <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded uppercase">Agotado</span>
                ) : isLowStock ? (
                  <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded uppercase flex items-center gap-1">
                    <AlertTriangle size={10} /> Bajo Stock
                  </span>
                ) : null}
              </div>

              <h4 className="text-lg font-bold text-white leading-tight">{item.nombre_producto}</h4>
              
              <div className="space-y-1 mb-2">
                <p className="text-xs text-white/50"><span className="font-bold text-white/70">Nº Reg MAPA:</span> {item.numero_registro || 'N/A'}</p>
                <p className="text-xs text-white/50"><span className="font-bold text-white/70">Lote:</span> {item.lote || 'N/A'}</p>
              </div>

              <div className="mt-auto pt-4 border-t border-white/5">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Stock Disponible</span>
                  <span className="text-lg font-black text-white">{item.cantidad_actual} <span className="text-sm font-bold text-white/40">{item.unidad}</span></span>
                </div>
                {/* Value Badge */}
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Valor Stock</span>
                  <span className="text-sm font-black text-emerald-400">{(item.cantidad_actual * (item.precio_unitario || 0)).toFixed(2)} <span className="text-[10px]">€</span></span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-amber-500' : 'bg-indigo-500'}`} 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-[9px] text-right text-white/30 mt-1 uppercase">Inicial: {item.cantidad_inicial} {item.unidad}</p>
              </div>
            </GlassCard>
          );
        })}

        {items.length === 0 && (
          <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
            <PackageOpen className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/60 font-bold">Tu almacén está vacío.</p>
            <p className="text-white/40 text-sm mt-1">Registra tus compras de fitosanitarios y abonos para cumplir con SIEX.</p>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <GlassCard className="w-full max-w-md p-6 border-white/10 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-6">Añadir al Inventario</h3>

            <div className="mb-6">
              <InvoiceScanner onScanComplete={handleInvoiceScanned} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">Tipo de Insumo</label>
                <select
                  required
                  value={formData.tipo}
                  onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 appearance-none font-bold"
                >
                  <option value="fitosanitario">Fitosanitario</option>
                  <option value="fertilizante">Fertilizante / Abono</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">Nombre Comercial</label>
                <input
                  required
                  type="text"
                  value={formData.nombre_producto}
                  onChange={e => setFormData({ ...formData, nombre_producto: e.target.value })}
                  placeholder="Ej: Glyphosato 36%"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">Nº Registro MAPA</label>
                  <input
                    type="text"
                    value={formData.numero_registro}
                    onChange={e => setFormData({ ...formData, numero_registro: e.target.value })}
                    placeholder="Opcional"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">Lote / Batch</label>
                  <input
                    type="text"
                    value={formData.lote}
                    onChange={e => setFormData({ ...formData, lote: e.target.value })}
                    placeholder="Opcional"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">Cantidad Comprada</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={formData.cantidad}
                    onChange={e => setFormData({ ...formData, cantidad: e.target.value })}
                    placeholder="Ej: 50"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">Unidad</label>
                  <select
                    required
                    value={formData.unidad}
                    onChange={e => setFormData({ ...formData, unidad: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 appearance-none font-bold"
                  >
                    <option value="L">Litros (L)</option>
                    <option value="Kg">Kilogramos (Kg)</option>
                    <option value="uds">Unidades (uds)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">Precio Unitario (€)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.precio_unitario}
                    onChange={e => setFormData({ ...formData, precio_unitario: e.target.value })}
                    placeholder="Ej: 14.50"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div className="flex flex-col justify-end pb-3">
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-none">Cotejado con factura anterior</p>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                >
                  {isSubmitting ? 'Guardando...' : 'Añadir al Almacén'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
