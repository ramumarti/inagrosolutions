'use client';

import React, { useEffect, useState } from 'react';
import { getTenantsList, toggleTenantStatus } from '@/lib/actions/superadmin';
import { GlassCard } from '@/components/ui/GlassCard';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

export default function SuperadminTenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    getTenantsList().then(data => {
      setTenants(data || []);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    await toggleTenantStatus(id, !currentStatus);
    load();
  };

  if (loading) return <div className="text-white/50 text-sm font-bold animate-pulse">Cargando tenants...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Gestión de Tenants</h2>
        {/* We can add a "Crear Tenant" button later */}
      </div>

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
                <td className="px-6 py-4 capitalize">{t.type.replace('_', ' ')}</td>
                <td className="px-6 py-4 capitalize">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${t.subscription_tier === 'starter' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                    {t.subscription_tier}
                  </span>
                </td>
                <td className="px-6 py-4">{t.users?.[0]?.count || 0}</td>
                <td className="px-6 py-4 text-white/50">
                  {format(new Date(t.created_at), 'dd MMM yyyy', { locale: es })}
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
            {tenants.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-white/30 text-sm">
                  No se encontraron tenants
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
