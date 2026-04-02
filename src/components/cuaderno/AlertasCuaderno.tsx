'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { createClient } from '@/lib/supabase/client';
import { Bell, AlertTriangle, Info, CheckCircle, Shield, X } from 'lucide-react';

interface AlertasCuadernoProps {
  userId: string;
}

export function AlertasCuaderno({ userId }: AlertasCuadernoProps) {
  const supabase = createClient();
  const [alertas, setAlertas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('alertas_cuaderno')
        .select('*')
        .eq('user_id', userId)
        .eq('leida', false)
        .order('created_at', { ascending: false })
        .limit(10);
      setAlertas(data || []);
      setLoading(false);
    }
    load();
  }, [userId, supabase]);

  const dismiss = async (id: string) => {
    await supabase.from('alertas_cuaderno').update({ leida: true }).eq('id', id);
    setAlertas(prev => prev.filter(a => a.id !== id));
  };

  const iconMap: Record<string, any> = {
    info: <Info size={16} className="text-blue-400" />,
    warning: <AlertTriangle size={16} className="text-amber-400" />,
    error: <Shield size={16} className="text-red-400" />,
    success: <CheckCircle size={16} className="text-emerald-400" />,
  };

  const bgMap: Record<string, string> = {
    info: 'border-blue-500/20 bg-blue-500/5',
    warning: 'border-amber-500/20 bg-amber-500/5',
    error: 'border-red-500/20 bg-red-500/5',
    success: 'border-emerald-500/20 bg-emerald-500/5',
  };

  if (loading) return null;
  if (alertas.length === 0) return null;

  return (
    <div className="space-y-3 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 mb-4">
        <Bell size={14} className="text-amber-400" />
        <h3 className="text-[10px] font-black text-white/60 uppercase tracking-widest">
          Alertas Activas ({alertas.length})
        </h3>
      </div>
      {alertas.map(a => (
        <div key={a.id} className={`flex items-start gap-3 p-4 rounded-xl border ${bgMap[a.nivel] || bgMap.info} animate-in slide-in-from-top-2 duration-300`}>
          <div className="mt-0.5 shrink-0">{iconMap[a.nivel] || iconMap.info}</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white mb-0.5">{a.titulo}</p>
            <p className="text-[10px] text-white/40 leading-relaxed">{a.mensaje}</p>
            {a.tipo && (
              <span className="inline-block mt-2 px-2 py-0.5 bg-white/5 rounded text-[8px] font-black text-white/20 uppercase tracking-widest">
                {a.tipo}
              </span>
            )}
          </div>
          <button onClick={() => dismiss(a.id)} className="text-white/20 hover:text-white/60 transition-colors shrink-0">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
