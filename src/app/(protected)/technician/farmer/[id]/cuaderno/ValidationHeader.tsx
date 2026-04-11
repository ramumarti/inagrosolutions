'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { CheckCircle2, AlertTriangle, XCircle, MessageSquare, Save } from 'lucide-react';
import { validateCuaderno } from '@/lib/actions/validaciones';
import { cn } from '@/lib/utils';

interface ValidationHeaderProps {
  farmerId: string;
  campanaId: string;
  initialStatus: any;
  farmerEmail: string;
}

export default function ValidationHeader({ farmerId, campanaId, initialStatus, farmerEmail }: ValidationHeaderProps) {
  const [status, setStatus] = useState(initialStatus?.estado || 'pendiente');
  const [obs, setObs] = useState(initialStatus?.observaciones || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async (newStatus: any) => {
    setLoading(true);
    const res = await validateCuaderno({
      farmer_id: farmerId,
      campana_id: campanaId,
      estado: newStatus,
      observaciones: obs
    });
    if (res.success) {
      setStatus(newStatus);
    } else {
      alert('Error al validar: ' + res.error);
    }
    setLoading(false);
  };

  const states = [
    { id: 'validado', label: 'Validar', icon: CheckCircle2, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { id: 'con_observaciones', label: 'Observaciones', icon: AlertTriangle, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { id: 'rechazado', label: 'Rechazar', icon: XCircle, color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  ];

  return (
    <GlassCard className="p-6 border-white/5 space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Supervisión Técnica</p>
           <h2 className="text-xl font-bold text-white flex items-center gap-2">
             Revisando Cuaderno de: <span className="text-emerald-400">{farmerEmail}</span>
           </h2>
        </div>

        <div className="flex items-center gap-2">
           {states.map((s) => (
             <button
               key={s.id}
               disabled={loading}
               onClick={() => handleSave(s.id as any)}
               className={cn(
                 "px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2",
                 status === s.id ? s.color : "bg-white/5 border-white/5 text-white/40 grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
               )}
             >
               <s.icon size={14} />
               {status === s.id ? 'Estado: ' + s.label : s.label}
             </button>
           ))}
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t border-white/5">
         <label className="text-xs font-bold text-white/40 flex items-center gap-2">
           <MessageSquare size={12} /> Observaciones para el agricultor
         </label>
         <textarea 
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="Introduce correcciones necesarias..."
            className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-sm focus:outline-none focus:border-emerald-500/50 text-white/80 min-h-[80px]"
         />
         <div className="flex justify-end">
            <GlowButton onClick={() => handleSave(status)} className="text-[10px] py-2" isLoading={loading}>
              <Save size={12} className="mr-2" /> Actualizar Observaciones
            </GlowButton>
         </div>
      </div>
    </GlassCard>
  );
}
