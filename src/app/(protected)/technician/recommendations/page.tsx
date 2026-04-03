'use client';

import React, { useEffect, useState } from 'react';
import { getRecommendationsAsTechnician, createRecommendation, getFarmerParcels } from '@/lib/actions/recommendations';
import { getAssignedFarmers } from '@/lib/actions/technician';
import { GlassCard } from '@/components/ui/GlassCard';
import { Stethoscope, Plus, Clock, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function TechnicianRecommendationsPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [selFarmer, setSelFarmer] = useState('');
  const [selParcela, setSelParcela] = useState('');
  const [parcels, setParcels] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    tipo: 'general',
    titulo: '',
    descripcion: '',
    prioridad: 'media',
    fecha_limite: ''
  });

  const loadAll = () => {
    Promise.all([
      getRecommendationsAsTechnician(),
      getAssignedFarmers()
    ]).then(([recs, fams]) => {
      setRecommendations(recs || []);
      setFarmers(fams || []);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  };

  useEffect(() => { loadAll(); }, []);

  // When farmer changes, fetch their parcels
  useEffect(() => {
    if (selFarmer) {
      getFarmerParcels(selFarmer).then(res => {
        setParcels(res || []);
        setSelParcela(''); // Reset parcel
      });
    } else {
      setParcels([]);
    }
  }, [selFarmer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selFarmer || !formData.titulo || !formData.tipo) return;

    try {
      setIsSubmitting(true);
      await createRecommendation({
        farmer_id: selFarmer,
        parcela_id: selParcela || undefined,
        ...formData
      });
      setModalOpen(false);
      
      // Reset form
      setSelFarmer('');
      setFormData({ tipo: 'general', titulo: '', descripcion: '', prioridad: 'media', fecha_limite: '' });
      
      loadAll(); // Refetch
    } catch (err: any) {
      console.error(err);
      alert('Error creando recomendación: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aceptada': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'rechazada': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-amber-400" />;
    }
  };

  if (loading) return <div className="text-white/50 text-sm font-bold animate-pulse">Cargando prescripciones...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-indigo-400" />
            Emisión de Recetas y Prescripciones
          </h2>
          <p className="text-white/60 text-sm mt-1">Transmite recomendaciones técnicas y tratamientos a tus agricultores.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Prescripción</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map(r => (
          <GlassCard key={r.id} className="p-5 border-white/5 flex flex-col gap-3 group relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${r.estado === 'pendiente' ? 'bg-amber-500' : r.estado === 'aceptada' ? 'bg-emerald-500' : 'bg-red-500'}`} />
            
            <div className="flex justify-between items-start">
              <span className="text-[10px] uppercase font-black tracking-wider text-white/40 bg-white/5 px-2 py-1 rounded-md">
                {r.tipo}
              </span>
              <div className="flex items-center gap-1 text-xs font-bold bg-black/20 px-2 py-1 rounded-full border border-white/5">
                {getStatusIcon(r.estado)}
                <span className={r.estado === 'pendiente' ? 'text-amber-400' : r.estado === 'aceptada' ? 'text-emerald-400' : 'text-red-400'}>
                  {r.estado}
                </span>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white leading-tight">{r.titulo}</h3>
            <p className="text-sm text-white/60 line-clamp-2">{r.descripcion}</p>
            
            <div className="mt-2 pt-3 border-t border-white/5 space-y-1">
              <p className="text-xs text-white/50"><span className="font-bold text-white/70">Para:</span> {r.farmer?.first_name} {r.farmer?.last_name || r.farmer?.email}</p>
              {r.parcela && <p className="text-xs text-white/50"><span className="font-bold text-white/70">Parcela:</span> {r.parcela.nombre}</p>}
              <p className="text-xs text-white/50"><span className="font-bold text-white/70">Fecha Limite:</span> {r.fecha_limite ? format(new Date(r.fecha_limite), 'dd/MM/yyyy') : 'Sin fecha limit.'}</p>
            </div>
          </GlassCard>
        ))}

        {recommendations.length === 0 && (
          <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
            <Stethoscope className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/60 font-bold">No has emitido recomendaciones todavía.</p>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <GlassCard className="w-full max-w-lg p-6 border-white/10 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-6">Redactar Prescripción</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">Agricultor Destino</label>
                  <select
                    required
                    value={selFarmer}
                    onChange={e => setSelFarmer(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium appearance-none"
                  >
                    <option value="">Seleccione...</option>
                    {farmers.map(f => (
                      <option key={f.id} value={f.id}>{f.first_name ? `${f.first_name} ${f.last_name || ''}` : f.email}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">Parcela (Opcional)</label>
                  <select
                    value={selParcela}
                    onChange={e => setSelParcela(e.target.value)}
                    disabled={!selFarmer || parcels.length === 0}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium appearance-none disabled:opacity-50"
                  >
                    <option value="">Aplica a toda la finca</option>
                    {parcels.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre} ({p.cultivo})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">Título Corto</label>
                <input
                  required
                  type="text"
                  value={formData.titulo}
                  onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ej: Aplicación de Cobre Preventiva"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">Tipo de Actuación</label>
                <select
                  required
                  value={formData.tipo}
                  onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium appearance-none"
                >
                  <option value="general">Recomendación General</option>
                  <option value="tratamiento">Fitosanitario (Tratamiento)</option>
                  <option value="fertilizacion">Abonado / Fertilización</option>
                  <option value="labor">Labor Cultural (Poda, Desbroce...)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">Prioridad</label>
                  <select
                    value={formData.prioridad}
                    onChange={e => setFormData({ ...formData, prioridad: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium appearance-none"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">¡Urgente!</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">Fecha Límite</label>
                  <input
                    type="date"
                    value={formData.fecha_limite}
                    onChange={e => setFormData({ ...formData, fecha_limite: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">Instrucciones Detalladas</label>
                <textarea
                  required
                  rows={4}
                  value={formData.descripcion}
                  onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Detallar producto, dosis, condiciones climatológicas recomendadas..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium resize-none"
                />
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
                  className="flex-1 px-4 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Enviando...' : 'Emitir Receta'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
