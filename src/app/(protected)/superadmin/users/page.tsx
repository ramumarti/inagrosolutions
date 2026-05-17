'use client';

import React, { useEffect, useState } from 'react';
import { getGlobalUsers, rotatePlatformRole } from '@/lib/actions/superadmin';
import { GlassCard } from '@/components/ui/GlassCard';
import { Users, Shield, Building2, Search, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function SuperadminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const data = await getGlobalUsers();
    setUsers(data);
    setLoading(false);
  }

  const handleRoleChange = async (userId: string, currentRole: string) => {
    const roles = ['farmer', 'worker', 'technician', 'tenant_admin', 'superadmin'];
    const nextIdx = (roles.indexOf(currentRole) + 1) % roles.length;
    const nextRole = roles[nextIdx];

    setLoadingId(userId);
    const res = await rotatePlatformRole(userId, nextRole);
    if (!res.success) alert(res.error);
    else await load();
    setLoadingId(null);
  };

  const filtered = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.first_name + ' ' + u.last_name).toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8 text-white/50 animate-pulse font-bold">Cargando usuarios globales...</div>;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-black glow-text flex items-center gap-3">
            <Users className="w-10 h-10 text-emerald-400" />
            Usuarios Globales
          </h1>
          <p className="text-white/60 font-medium italic">Monitorización y control de accesos de toda la plataforma</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input 
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50"
            placeholder="Buscar por email o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <GlassCard className="border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/[0.02] border-b border-white/5 text-[10px] uppercase font-black tracking-widest text-white/30">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Entidad (Tenant)</th>
                <th className="px-6 py-4">Rol en Plataforma</th>
                <th className="px-6 py-4">Fecha Registro</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{u.first_name} {u.last_name}</span>
                      <span className="text-xs text-white/30">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <Building2 size={14} className="text-white/20" />
                       <span className="text-xs font-medium text-white/60">{u.tenant?.name || 'Huérfano (Sin Tenant)'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border inline-flex items-center gap-2",
                      u.platform_role === 'superadmin' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      u.platform_role === 'tenant_admin' ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                      u.platform_role === 'technician' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-white/5 text-white/40 border-white/10"
                    )}>
                      <Shield size={10} />
                      {u.platform_role}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-white/30 font-mono">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleRoleChange(u.id, u.platform_role)}
                        disabled={loadingId === u.id}
                        title="Cambiar Rol"
                        className="p-2 hover:bg-white/10 rounded-lg text-white/30 hover:text-white transition-all"
                      >
                        {loadingId === u.id ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                      </button>
                      <Link href={`/superadmin/users/${u.id}`}>
                        <button 
                          title="Ver Perfil"
                          className="p-2 hover:bg-white/10 rounded-lg text-emerald-400/50 hover:text-emerald-400 transition-all flex items-center justify-center"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-white/30 text-sm italic">No se encontraron usuarios</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
