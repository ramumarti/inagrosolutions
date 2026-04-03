'use client';

import React, { useEffect, useState } from 'react';
import { getHarvestIntakes, createHarvestIntake } from '@/lib/actions/cooperative';
import { getTenantUsers } from '@/lib/actions/tenant-users';
import { GlassCard } from '@/components/ui/GlassCard';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Scale, Plus, RefreshCw } from 'lucide-react';

export default function CooperativeHarvestsPage() {
  const [intakes, setIntakes] = useState<any[]>([]);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [newIntake, setNewIntake] = useState({
    farmer_id: '',
    cantidad_kg: '',
    variedad: 'picual',
    calidad: 'extra',
    rendimiento_graso: '',
    albaran: ''
  });

  const load = async () => {
    setLoading(true);
    const [hData, fData] = await Promise.all([getHarvestIntakes(), getTenantUsers()]);
    setIntakes(hData || []);
    // Limit to actual farmers
    setFarmers((fData || []).filter((f: any) => f.platform_role === 'farmer'));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIntake.farmer_id || !newIntake.cantidad_kg) return;
    try {
      await createHarvestIntake({
        ...newIntake,
        cantidad_kg: Number(newIntake.cantidad_kg),
        rendimiento_graso: newIntake.rendimiento_graso ? Number(newIntake.rendimiento_graso) : undefined,
      });
      setNewIntake({ farmer_id: '', cantidad_kg: '', variedad: 'picual', calidad: 'extra', rendimiento_graso: '', albaran: '' });
      setShowForm(false);
      load();
    } catch (e) {
      console.error(e);
      alert('Error guardando la entrega');
    }
  };

  if (loading) return <div className="p-8 text-white/50 font-bold animate-pulse">Cargando albaranes...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <Scale className="w-6 h-6 text-emerald-400" />
          Entradas de Cosecha / Bascula
        </h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
        >
          {showForm ? <RefreshCw className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancelar' : 'Nueva Entrada'}
        </button>
      </div>

      {showForm && (
        <GlassCard className="p-6 border-emerald-500/20 bg-emerald-500/5">
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-white/50 mb-1">Socio / Agricultor</label>
              <select value={newIntake.farmer_id} onChange={e => setNewIntake({...newIntake, farmer_id: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white outline-none" required>
                <option value="">Selecciona Socio...</option>
                {farmers.map(f => (
                  <option key={f.id} value={f.id}>{f.email}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-white/50 mb-1">Kilos Netos (Kg)</label>
              <input type="number" placeholder="Ej: 4500" value={newIntake.cantidad_kg} onChange={e => setNewIntake({...newIntake, cantidad_kg: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/50 mb-1">Albarán / Ticket</label>
              <input type="text" placeholder="ALB-24-001" value={newIntake.albaran} onChange={e => setNewIntake({...newIntake, albaran: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/50 mb-1">Variedad</label>
              <select value={newIntake.variedad} onChange={e => setNewIntake({...newIntake, variedad: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white outline-none">
                <option value="picual">Picual</option>
                <option value="hojiblanca">Hojiblanca</option>
                <option value="arbequina">Arbequina</option>
                <option value="cornicabra">Cornicabra</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-white/50 mb-1">Calidad (Suelo/Vuelo)</label>
              <select value={newIntake.calidad} onChange={e => setNewIntake({...newIntake, calidad: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white outline-none">
                <option value="extra">Vuelo (Extra)</option>
                <option value="virgen">Vuelo (Virgen)</option>
                <option value="lampante">Suelo (Lampante)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-white/50 mb-1">Rendimiento Graso (%) - Opcional</label>
              <input type="number" step="0.01" placeholder="Ej: 21.50" value={newIntake.rendimiento_graso} onChange={e => setNewIntake({...newIntake, rendimiento_graso: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white outline-none" />
            </div>
            <div className="col-span-full flex justify-end">
              <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-colors">Registrar Entrada</button>
            </div>
          </form>
        </GlassCard>
      )}

      <GlassCard className="border-white/5 overflow-x-auto">
        <table className="w-full text-left text-sm text-white/70">
          <thead className="bg-white/[0.02] border-b border-white/5 text-xs uppercase font-bold text-white/50">
            <tr>
              <th className="px-6 py-4">Socio</th>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Albarán</th>
              <th className="px-6 py-4">Kilos</th>
              <th className="px-6 py-4">Clasificación</th>
              <th className="px-6 py-4 text-center">Rendimiento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-white/80 font-medium">
            {intakes.map(inv => (
              <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 font-bold text-emerald-400">{inv.farmer?.email}</td>
                <td className="px-6 py-4">{format(new Date(inv.fecha), 'dd MMM yyyy HH:mm', { locale: es })}</td>
                <td className="px-6 py-4 text-white/50">{inv.albaran || '-'}</td>
                <td className="px-6 py-4 text-lg font-black text-white">{inv.cantidad_kg.toLocaleString('es-ES')} <span className="text-xs text-white/50 font-normal">kg</span></td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${inv.calidad === 'extra' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : inv.calidad === 'virgen' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    {inv.calidad}
                  </span>
                  <span className="ml-2 text-xs text-white/40 capitalize">{inv.variedad}</span>
                </td>
                <td className="px-6 py-4 text-center font-mono">
                  {inv.rendimiento_graso ? `${inv.rendimiento_graso}%` : '-'}
                </td>
              </tr>
            ))}
            {intakes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-white/30 text-sm">
                  No hay entradas registradas en esta campaña.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
