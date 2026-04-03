'use client';

import React, { useEffect, useState } from 'react';
import { getTenantUsers, setTenantUserRole } from '@/lib/actions/tenant-users';
import { GlassCard } from '@/components/ui/GlassCard';
import type { PlatformRole } from '@/lib/auth/tenant-context';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function TenantUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    getTenantUsers().then(data => {
      setUsers(data || []);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleRoleChange = async (userId: string, newRole: PlatformRole) => {
    try {
      await setTenantUserRole(userId, newRole);
      load();
    } catch (e) {
      console.error(e);
      alert('Error updating role');
    }
  };

  const roles: { value: PlatformRole; label: string }[] = [
    { value: 'tenant_admin', label: 'Admin. Tenant' },
    { value: 'technician', label: 'Técnico' },
    { value: 'farmer', label: 'Agricultor' },
    { value: 'worker', label: 'Operario' },
  ];

  if (loading) return <div className="text-white/50 text-sm font-bold animate-pulse">Cargando usuarios...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Usuarios del Tenant</h2>
      </div>

      <GlassCard className="border-white/5 overflow-x-auto">
        <table className="w-full text-left text-sm text-white/70">
          <thead className="bg-white/[0.02] border-b border-white/5 text-xs uppercase font-bold text-white/50">
            <tr>
              <th className="px-6 py-4">Usuario</th>
              <th className="px-6 py-4">Rol</th>
              <th className="px-6 py-4">Registro</th>
              <th className="px-6 py-4 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-white/80 font-medium">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-white">{u.email}</p>
                </td>
                <td className="px-6 py-4">
                  {u.platform_role !== 'superadmin' ? (
                    <select
                      value={u.platform_role || 'farmer'}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as PlatformRole)}
                      className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-emerald-500/50"
                    >
                      {roles.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-indigo-400 font-bold">Superadmin</span>
                  )}
                </td>
                <td className="px-6 py-4 text-white/50">
                  {format(new Date(u.created_at || new Date()), 'dd MMM yyyy', { locale: es })}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${u.is_active !== false ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    {u.is_active !== false ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
