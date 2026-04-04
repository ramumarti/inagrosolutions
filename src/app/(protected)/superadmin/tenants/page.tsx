'use client';

import React, { useEffect, useState } from 'react';
import { getTenantsList, toggleTenantStatus, createTenant } from '@/lib/actions/superadmin';
import { TIER_CONFIG, type AgriTier } from '@/lib/modules';
import { GlassCard } from '@/components/ui/GlassCard';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Building2, X, Plus, Loader2 } from 'lucide-react';

export default function SuperadminTenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    type: 'cooperativa' | 'profesional' | 'empresa_servicios' | 'almazara';
    subscription_tier: string;
  }>({
    name: '',
    slug: '',
    type: 'cooperativa',
    subscription_tier: 'basico'
  });

  const load = () => {
    setLoadError('');
    getTenantsList()
      .then(data => {
        setTenants(data || []);
      })
      .catch(err => {
        console.error('Error cargando entidades:', err);
        setLoadError('Error al cargar las entidades');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await toggleTenantStatus(id, !currentStatus);
      load();
    } catch (err) {
      console.error('Error al cambiar estado:', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setCreating(true);
    try {
      await createTenant(formData);
      setIsModalOpen(false);
      setFormData({ name: '', slug: '', type: 'cooperativa', subscription_tier: 'basico' });
      load();
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || 'Error al crear entidad');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="text-white/50 text-sm font-bold animate-pulse">Cargando entidades...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-400" />
          Gestión de Entidades
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Crear Entidad
        </button>
      </div>

      {loadError && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold">
          {loadError}
        </div>
      )}

      <GlassCard className="border-white/5 overflow-x-auto">
        <table className="w-full text-left text-sm text-white/70">
          <thead className="bg-white/[0.02] border-b border-white/5 text-xs uppercase font-bold text-white/50">
            <tr>
              <th className="px-6 py-4">Nombre / Slug</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Suscripción</th>
              <th className="px-6 py-4">Usuarios</th>
              <th className="px-6 py-4">Alta</th>
              <th className="px-6 py-4 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-white/80 font-medium">
            {tenants.map(t => (
              <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-white">{t.name}</p>
                  <p className="text-xs text-white/40">{t.slug}</p>
                </td>
                <td className="px-6 py-4 capitalize">{(t.type || '').replace('_', ' ')}</td>
                <td className="px-6 py-4 capitalize">
                  {(() => {
                    const tierKey = (t.subscription_tier || 'basico') as AgriTier;
                    const cfg = TIER_CONFIG[tierKey];
                    const colorMap: Record<string, string> = {
                      basico: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
                      intermedio: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                      avanzado: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
                      premium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    };
                    return (
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${colorMap[tierKey] || colorMap.basico}`}>
                        {cfg?.label_es || 'Básico'}
                      </span>
                    );
                  })()}
                </td>
                <td className="px-6 py-4">{t.users?.[0]?.count || 0}</td>
                <td className="px-6 py-4 text-white/50">
                  {t.created_at ? format(new Date(t.created_at), 'dd MMM yyyy', { locale: es }) : '—'}
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => handleToggle(t.id, t.is_active)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      t.is_active 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                    }`}
                  >
                    {t.is_active ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
              </tr>
            ))}
            {tenants.length === 0 && !loadError && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-white/30 text-sm">
                  No se encontraron entidades
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </GlassCard>

      {/* Create Entity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md p-6 border-white/10 flex flex-col relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 transition-colors text-white/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              Nueva Entidad
            </h3>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/50 mb-1 uppercase tracking-wider">Nombre de la Empresa / Cooperativa</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    setFormData({...formData, name, slug});
                  }}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50 transition-colors"
                  placeholder="Ej. Cooperativa San Isidro"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/50 mb-1 uppercase tracking-wider">Slug (Identificador Único)</label>
                <input 
                  type="text" 
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white/70 outline-none focus:border-emerald-500/50 transition-colors font-mono text-sm"
                  placeholder="ej-coop-san-isidro"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 mb-1 uppercase tracking-wider">Tipo</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50 transition-colors"
                  >
                    <option value="cooperativa">Cooperativa</option>
                    <option value="profesional">Profesional</option>
                    <option value="empresa_servicios">Empresa de Servicios</option>
                    <option value="almazara">Almazara</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 mb-1 uppercase tracking-wider">Plan</label>
                  <select 
                    value={formData.subscription_tier}
                    onChange={(e) => setFormData({...formData, subscription_tier: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50 transition-colors"
                  >
                    <option value="basico">Básico</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={creating}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Crear Entidad'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
