'use client';

import React, { useEffect, useState } from 'react';
import { getTenantAssignments, assignFarmerToTechnician, removeAssignment } from '@/lib/actions/tenant-assignments';
import { GlassCard } from '@/components/ui/GlassCard';
import { Users, Link2, Trash2 } from 'lucide-react';

export default function TenantAssignmentsPage() {
  const [data, setData] = useState<{ technicians: any[], farmers: any[], assignments: any[] }>({
    technicians: [], farmers: [], assignments: []
  });
  const [loading, setLoading] = useState(true);

  const [selectedTech, setSelectedTech] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = () => {
    getTenantAssignments().then(res => {
      setData(res);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTech || !selectedFarmer) return;

    // Check if already assigned
    const alreadyAssigned = data.assignments.some(a => a.technician_id === selectedTech && a.farmer_id === selectedFarmer);
    if (alreadyAssigned) {
      alert('Esta agricultor ya está asignado a este técnico.');
      return;
    }

    try {
      setIsSubmitting(true);
      await assignFarmerToTechnician(selectedTech, selectedFarmer);
      setSelectedFarmer('');
      load();
    } catch (e: any) {
      console.error(e);
      alert('Error en la asignación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar esta asignación?')) return;
    try {
      await removeAssignment(id);
      load();
    } catch (e) {
      console.error(e);
      alert('Error quitando asignación.');
    }
  };

  if (loading) return <div className="text-white/50 text-sm font-bold animate-pulse">Cargando relaciones...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Asignaciones de Equipo</h2>
          <p className="text-white/60 text-sm mt-1">Vincula a los Agricultores con sus Técnicos responsables.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario de Asignación */}
        <GlassCard className="p-6 border-white/5 h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Link2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Nueva Asignación</h3>
          </div>

          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">Técnico</label>
              <select
                required
                value={selectedTech}
                onChange={e => setSelectedTech(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium appearance-none"
              >
                <option value="">Selecciona un técnico...</option>
                {data.technicians.map(t => (
                  <option key={t.id} value={t.id}>{t.first_name ? `${t.first_name} ${t.last_name || ''}` : t.email}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">Agricultor</label>
              <select
                required
                value={selectedFarmer}
                onChange={e => setSelectedFarmer(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium appearance-none"
              >
                <option value="">Selecciona un agricultor...</option>
                {data.farmers.map(f => (
                  <option key={f.id} value={f.id}>{f.first_name ? `${f.first_name} ${f.last_name || ''}` : f.email}</option>
                ))}
              </select>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || data.technicians.length === 0 || data.farmers.length === 0}
                className="w-full px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Vinculando...' : 'Vincular'}
              </button>
            </div>
            
            {(data.technicians.length === 0 || data.farmers.length === 0) && (
              <p className="text-xs text-amber-500 text-center mt-2">
                Necesitas tener al menos un Técnico y un Agricultor registrados.
              </p>
            )}
          </form>
        </GlassCard>

        {/* Vista de Asignaciones Actuales */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-white">Relaciones Activas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.assignments.map(a => {
              const tech = data.technicians.find(t => t.id === a.technician_id);
              const farmer = data.farmers.find(f => f.id === a.farmer_id);
              
              if (!tech || !farmer) return null;

              return (
                <GlassCard key={a.id} className="p-4 border-white/5 relative group hover:border-emerald-500/30 transition-colors">
                  <button 
                    onClick={() => handleRemove(a.id)}
                    className="absolute top-4 right-4 text-white/20 hover:text-red-400 transition-colors"
                    title="Eliminar vínculo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-white/40 uppercase">Técnico</p>
                      <p className="text-sm font-bold text-indigo-400">{tech.first_name ? `${tech.first_name} ${tech.last_name || ''}` : tech.email}</p>
                    </div>
                    <div className="border-l-2 border-white/10 pl-3 ml-1">
                      <p className="text-xs font-bold text-white/40 uppercase">Agricultor</p>
                      <p className="text-sm font-bold text-emerald-400">{farmer.first_name ? `${farmer.first_name} ${farmer.last_name || ''}` : farmer.email}</p>
                    </div>
                  </div>
                </GlassCard>
              );
            })}

            {data.assignments.length === 0 && (
              <div className="col-span-full">
                <GlassCard className="p-8 border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                  <Users className="w-10 h-10 text-white/20 mb-4" />
                  <p className="text-white/60 font-bold mb-1">Sin asignaciones registradas</p>
                  <p className="text-white/40 text-sm">Los técnicos no verán agricultores hasta que los vincules usando el formulario.</p>
                </GlassCard>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
