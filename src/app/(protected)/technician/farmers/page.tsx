'use client';

import React, { useEffect, useState } from 'react';
import { getAssignedFarmers } from '@/lib/actions/technician';
import { GlassCard } from '@/components/ui/GlassCard';
import Link from 'next/link';
import { Search, User, FileText, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function TechnicianFarmersPage() {
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getAssignedFarmers().then(data => {
      setFarmers(data || []);
      setLoading(false);
    });
  }, []);

  const filteredFarmers = farmers.filter(f => 
    f.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-white/50 text-sm font-bold animate-pulse">Cargando agricultores...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Mis Agricultores</h2>
          <p className="text-sm font-bold text-white/50 mt-1">
            Gestiona los cuadernos de campo de tus clientes asignados
          </p>
        </div>
        
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Buscar por email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-indigo-500/50 outline-none transition-all"
          />
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredFarmers.map(f => {
          const numExplotaciones = f.explotaciones?.[0]?.count || 0;
          const validation = f.validaciones?.[0]; // Última validación
          
          let badgeColor = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
          let badgeLabel = 'Pendiente de Revisión';
          if (validation?.estado === 'validado') {
            badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            badgeLabel = 'Validado por Técnico';
          } else if (validation?.estado === 'con_observaciones') {
            badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            badgeLabel = 'Con Observaciones';
          } else if (validation?.estado === 'rechazado') {
            badgeColor = 'bg-red-500/10 text-red-400 border-red-500/20';
            badgeLabel = 'Rechazado';
          }

          return (
            <GlassCard key={f.id} className="p-0 overflow-hidden border-white/5 hover:border-white/10 transition-colors group">
              <div className="flex flex-col md:flex-row items-center p-5 gap-6">
                
                {/* Farmer Info */}
                <div className="flex items-center gap-4 min-w-[250px] w-full md:w-auto">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/5">
                    <User size={20} className="text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{f.email}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-black mt-0.5">
                      {numExplotaciones} Explotaciones
                    </p>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex-1 flex flex-wrap gap-3 w-full md:w-auto">
                  <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${badgeColor}`}>
                    <CheckCircle2 size={14} />
                    <span className="text-xs font-bold">{badgeLabel}</span>
                  </div>
                  {numExplotaciones === 0 && (
                    <div className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                      <AlertTriangle size={14} className="text-red-400" />
                      <span className="text-xs font-bold text-red-300">Sin fincas</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <Link href={`/technician/farmer/${f.id}/cuaderno`} className="w-full md:w-auto">
                    <button className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all active:scale-95">
                      <FileText size={16} className="text-white/50" />
                      Gestionar Cuaderno
                      <ArrowRight size={16} className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </button>
                  </Link>
                </div>

              </div>
            </GlassCard>
          );
        })}

        {filteredFarmers.length === 0 && (
          <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
            <User size={32} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/60 font-bold">No se encontraron agricultores</p>
            <p className="text-white/40 text-sm mt-1">Busca otro nombre o pide al administrador que te asigne clientes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
