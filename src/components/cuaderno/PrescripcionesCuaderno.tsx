'use client';

import React, { useEffect, useState } from 'react';
import { getRecommendationsAsFarmer, updateRecommendationStatus } from '@/lib/actions/recommendations';
import { GlassCard } from '@/components/ui/GlassCard';
import { Stethoscope, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export function PrescripcionesCuaderno({ userId }: { userId: string }) {
  const [recs, setRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    getRecommendationsAsFarmer()
      .then(data => {
        setRecs(data || []);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  };

  useEffect(() => { load(); }, []);

  const handleUpdate = async (id: string, estado: string) => {
    if (!confirm(`¿Seguro que quieres marcar esta prescripción como ${estado}?`)) return;
    try {
      await updateRecommendationStatus(id, estado);
      load();
    } catch (e) {
      console.error(e);
      alert('Error actualizando la prescripción.');
    }
  };

  const pendingRecs = recs.filter(r => r.estado === 'pendiente');

  if (loading) return null;
  if (recs.length === 0) return null; // No display if never received any prescriptions.

  return (
    <div className="space-y-4 mb-8">
      <h3 className="text-sm font-extrabold text-white/50 uppercase tracking-wide flex items-center gap-2">
        <Stethoscope className="w-4 h-4 text-indigo-400" />
        Prescripciones de tus Técnicos
        {pendingRecs.length > 0 && (
          <span className="bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
            {pendingRecs.length} pendientes
          </span>
        )}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recs.map(r => (
          <GlassCard key={r.id} className={`p-5 relative overflow-hidden group ${r.estado === 'pendiente' ? 'border-indigo-500/30 bg-indigo-500/[0.02]' : 'border-white/5 opacity-80'}`}>
            <div className={`absolute top-0 left-0 w-1 h-full ${r.estado === 'pendiente' ? 'bg-amber-500' : r.estado === 'aceptada' ? 'bg-emerald-500' : 'bg-red-500'}`} />
            
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-white/40 bg-white/5 px-2 py-1 rounded-md mr-2">
                  {r.tipo}
                </span>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                  Del técnico: <span className="text-white/70">{r.technician?.first_name || r.technician?.email}</span>
                </span>
              </div>
            </div>

            <h4 className="text-lg font-bold text-white leading-tight mb-1">{r.titulo}</h4>
            <p className="text-sm text-white/60 mb-4">{r.descripcion}</p>
            
            <div className="text-xs text-white/50 mb-4 flex flex-wrap gap-4">
              {r.parcela && <span><strong className="text-white/70">Parcela:</strong> {r.parcela.nombre}</span>}
              {r.fecha_limite && <span><strong className="text-white/70">Límite:</strong> {format(new Date(r.fecha_limite), 'dd/MM/yyyy')}</span>}
            </div>

            {r.estado === 'pendiente' ? (
              <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                <button
                  onClick={() => handleUpdate(r.id, 'aceptada')}
                  className="flex-1 flex justify-center items-center gap-2 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" /> Aceptar Receta
                </button>
                <button
                  onClick={() => handleUpdate(r.id, 'rechazada')}
                  className="flex-1 flex justify-center items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Descartar
                </button>
              </div>
            ) : (
              <div className="mt-2 pt-3 border-t border-white/5 flex items-center gap-2 text-xs font-bold bg-white/5 w-fit px-3 py-1.5 rounded-lg border border-white/5">
                {r.estado === 'aceptada' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                <span className={r.estado === 'aceptada' ? 'text-emerald-400' : 'text-red-400'}>
                  Marcada como {r.estado}
                </span>
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
