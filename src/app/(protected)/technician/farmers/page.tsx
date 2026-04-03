'use client';

import React, { useEffect, useState } from 'react';
import { getAssignedFarmers } from '@/lib/actions/technician';
import { GlassCard } from '@/components/ui/GlassCard';

export default function TechnicianFarmersPage() {
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAssignedFarmers().then(data => {
      setFarmers(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-white/50 text-sm font-bold animate-pulse">Cargando agricultores...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Mis Clientes Asignados</h2>
      </div>

      <GlassCard className="border-white/5 overflow-x-auto">
        <table className="w-full text-left text-sm text-white/70">
          <thead className="bg-white/[0.02] border-b border-white/5 text-xs uppercase font-bold text-white/50">
            <tr>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Explotaciones</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-white/80 font-medium">
            {farmers.map(f => (
              <tr key={f.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-white">{f.email}</p>
                </td>
                <td className="px-6 py-4">{f.explotaciones?.[0]?.count || 0} explotaciones</td>
                <td className="px-6 py-4 text-center">
                  <button className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 mr-2">
                    Ver Cuaderno
                  </button>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all border bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20">
                    Nueva Tarea
                  </button>
                </td>
              </tr>
            ))}
            {farmers.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-white/30 text-sm">
                  No tienes agricultores asignados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
