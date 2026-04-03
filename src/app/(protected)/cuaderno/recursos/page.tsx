'use client';

import React, { useEffect, useState } from 'react';
import { getWorkers, createWorker, getMachinery, createMachinery } from '@/lib/actions/resources';
import { GlassCard } from '@/components/ui/GlassCard';
import { Users, Truck } from 'lucide-react';

export default function ResourcesPage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [machinery, setMachinery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [newWorker, setNewWorker] = useState({ nombre: '', coste_hora: 0 });
  const [newMachinery, setNewMachinery] = useState({ nombre: '', matricula: '', coste_hora: 0 });

  const load = async () => {
    setLoading(true);
    const [w, m] = await Promise.all([getWorkers(), getMachinery()]);
    setWorkers(w || []);
    setMachinery(m || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorker.nombre) return;
    await createWorker(newWorker);
    setNewWorker({ nombre: '', coste_hora: 0 });
    load();
  };

  const handleAddMachinery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMachinery.nombre) return;
    await createMachinery(newMachinery);
    setNewMachinery({ nombre: '', matricula: '', coste_hora: 0 });
    load();
  };

  if (loading) return <div className="p-8 text-white/50 animate-pulse font-bold">Cargando recursos...</div>;

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white glow-text">Recursos Propios</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Workers Section */}
        <GlassCard className="p-6 border-white/5 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Operarios</h3>
          </div>
          
          <form onSubmit={handleAddWorker} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Nombre del trabajador..." 
              value={newWorker.nombre} 
              onChange={e => setNewWorker({...newWorker, nombre: e.target.value})}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-emerald-500/50 outline-none"
            />
            <input 
              type="number" 
              placeholder="€/h" 
              value={newWorker.coste_hora || ''} 
              onChange={e => setNewWorker({...newWorker, coste_hora: Number(e.target.value)})}
              className="w-20 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-emerald-500/50 outline-none"
            />
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-sm transition-colors">
              Añadir
            </button>
          </form>

          <div className="mt-4 space-y-2">
            {workers.map(w => (
              <div key={w.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="font-bold text-white/80">{w.nombre}</span>
                <span className="text-xs font-bold text-white/40">{w.coste_hora} €/hora</span>
              </div>
            ))}
            {workers.length === 0 && <p className="text-sm text-white/30 text-center py-4">No hay operarios registrados.</p>}
          </div>
        </GlassCard>

        {/* Machinery Section */}
        <GlassCard className="p-6 border-white/5 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Maquinaria</h3>
          </div>
          
          <form onSubmit={handleAddMachinery} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Vehículo / Máquina..." 
              value={newMachinery.nombre} 
              onChange={e => setNewMachinery({...newMachinery, nombre: e.target.value})}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-indigo-500/50 outline-none"
            />
            <input 
              type="text" 
              placeholder="Matrícula" 
              value={newMachinery.matricula} 
              onChange={e => setNewMachinery({...newMachinery, matricula: e.target.value})}
              className="w-24 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-indigo-500/50 outline-none"
            />
             <input 
              type="number" 
              placeholder="€/h" 
              value={newMachinery.coste_hora || ''} 
              onChange={e => setNewMachinery({...newMachinery, coste_hora: Number(e.target.value)})}
              className="w-20 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-indigo-500/50 outline-none"
            />
            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm transition-colors">
              Añadir
            </button>
          </form>

          <div className="mt-4 space-y-2">
            {machinery.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <div>
                  <span className="font-bold text-white/80 block">{m.nombre}</span>
                  <span className="text-xs text-white/40">{m.matricula}</span>
                </div>
                <span className="text-xs font-bold text-white/40">{m.coste_hora} €/hora</span>
              </div>
            ))}
            {machinery.length === 0 && <p className="text-sm text-white/30 text-center py-4">No hay maquinaria registrada.</p>}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
