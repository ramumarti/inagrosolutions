'use client';

import React, { useState } from 'react';
import { 
  Building2, Plus, Edit2, Trash2, MapPin, 
  ChevronRight, LayoutGrid, Globe, Shield
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { deleteExplotacion, updateExplotacion } from '@/lib/actions/agricultural';
import { createClient } from '@/lib/supabase/client';

interface FincasModuleProps {
  explotaciones: any[];
  tenantId?: string;
  onRefresh: () => void;
  onSelect: (id: string) => void;
}

export function FincasModule({ explotaciones, tenantId, onRefresh, onSelect }: FincasModuleProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta finca? Se perderán todos sus datos asociados.')) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from('explotaciones')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Error al eliminar la finca');
      }
    }
  };

  const handleUpdate = async () => {
    if (!editingId || !editNombre) return;
    try {
      await updateExplotacion(editingId, { nombre: editNombre });
      setEditingId(null);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Mis Fincas y Explotaciones</h2>
          <p className="text-white/50 font-bold uppercase tracking-widest text-[10px] mt-1">Gestión centralizada de tus entidades agrícolas</p>
        </div>
        <GlowButton className="gap-2 shrink-0">
          <Plus size={18} /> Nueva Explotación
        </GlowButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {explotaciones.map((finca) => (
          <GlassCard key={finca.id} className="group relative overflow-hidden p-6 border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button 
                onClick={() => { setEditingId(finca.id); setEditNombre(finca.nombre); }}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 text-white/50 hover:text-white transition-all"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={() => handleDelete(finca.id)}
                className="p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20 text-red-400 opacity-60 hover:opacity-100 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
                <Building2 className="text-emerald-400" size={28} />
              </div>
              <div>
                {editingId === finca.id ? (
                  <div className="flex gap-2">
                    <input 
                      autoFocus
                      className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-sm outline-none"
                      value={editNombre}
                      onChange={e => setEditNombre(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleUpdate()}
                    />
                    <button onClick={handleUpdate} className="text-emerald-400 text-xs font-bold">OK</button>
                  </div>
                ) : (
                  <h4 className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors">{finca.nombre}</h4>
                )}
                <p className="text-[10px] items-center flex gap-1 font-black text-white/30 uppercase tracking-widest mt-0.5">
                  ID: {finca.id.substring(0, 8)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-tighter">Parcelas</p>
                <p className="text-xl font-black text-white leading-none">{finca.parcelas?.length || 0}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-tighter">Superficie</p>
                <p className="text-xl font-black text-white leading-none">
                  {finca.parcelas?.reduce((acc: number, p: any) => acc + (p.hectareas || 0), 0).toFixed(1)} <span className="text-[10px] text-white/40">ha</span>
                </p>
              </div>
            </div>

            <button 
              onClick={() => onSelect(finca.id)}
              className="w-full py-3 bg-white/5 hover:bg-emerald-500/10 text-white/60 hover:text-emerald-400 border border-white/10 hover:border-emerald-500/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              Gestionar <ChevronRight size={14} />
            </button>
          </GlassCard>
        ))}

        {/* Empty state / placeholder for new one */}
        <button className="border-2 border-dashed border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-emerald-500/20 hover:bg-emerald-500/[0.02] transition-all group">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="text-white/20 group-hover:text-emerald-500" />
          </div>
          <span className="text-xs font-black text-white/20 uppercase tracking-widest group-hover:text-emerald-500/70">Añadir Nueva Finca</span>
        </button>
      </div>

      {/* Info Card */}
      <GlassCard className="p-8 border-emerald-500/10 bg-gradient-to-br from-emerald-500/5 to-transparent">
        <div className="flex gap-6 items-start">
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <Shield size={32} className="text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h5 className="text-lg font-black text-white">Cumplimiento SIEX</h5>
            <p className="text-sm text-white/50 leading-relaxed font-medium">
              Cada finca registrada actúa como una unidad de gestión independiente para el Sistema de Información de Explotaciones (SIEX). 
              Asegúrate de que el nombre comercial coincida con el registro oficial para facilitar las exportaciones automáticas de datos.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
