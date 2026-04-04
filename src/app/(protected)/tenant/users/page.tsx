'use client';

import React, { useEffect, useState } from 'react';
import { getTenantUsers, setTenantUserRole, getTenantInvitations, inviteTenantUser, removeTenantInvitation } from '@/lib/actions/tenant-users';
import { GlassCard } from '@/components/ui/GlassCard';
import type { PlatformRole } from '@/lib/auth/tenant-context';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MailPlus, X, Trash2, Clock, CheckCircle2 } from 'lucide-react';

export default function TenantUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<PlatformRole>('farmer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = () => {
    Promise.all([
      getTenantUsers(),
      getTenantInvitations()
    ]).then(([userData, inviteData]) => {
      setUsers(userData || []);
      setInvitations(inviteData || []);
      setLoading(false);
    }).catch(e => {
      console.error(e);
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

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    try {
      setIsSubmitting(true);
      await inviteTenantUser(inviteEmail, inviteRole);
      setInviteModalOpen(false);
      setInviteEmail('');
      setInviteRole('farmer');
      load();
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Error al enviar invitación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelInvite = async (id: string) => {
    if (!confirm('¿Seguro que quieres cancelar esta invitación?')) return;
    try {
      await removeTenantInvitation(id);
      load();
    } catch (e) {
      console.error(e);
      alert('Error al cancelar invitación');
    }
  };

  const roles: { value: PlatformRole; label: string }[] = [
    { value: 'tenant_admin', label: 'Admin. Entidad' },
    { value: 'technician', label: 'Técnico' },
    { value: 'farmer', label: 'Agricultor' },
    { value: 'worker', label: 'Operario' },
  ];

  if (loading) return <div className="text-white/50 text-sm font-bold animate-pulse">Cargando equipo...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Gestión de Equipo</h2>
          <p className="text-white/60 text-sm mt-1">Administra los usuarios y roles de tu organización</p>
        </div>
        <button
          onClick={() => setInviteModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-95"
        >
          <MailPlus className="w-4 h-4" />
          <span>Invitar Usuario</span>
        </button>
      </div>

      {/* Invitaciones Pendientes */}
      {invitations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white/90 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Invitaciones Pendientes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {invitations.map(inv => (
              <GlassCard key={inv.id} className="p-4 border-amber-500/20 bg-amber-500/5 relative group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-white">{inv.email}</p>
                    <p className="text-sm text-amber-400/80 mt-1 capitalize">{inv.role?.replace('_', ' ')}</p>
                    <p className="text-xs text-white/40 mt-2">
                      Expira: {format(new Date(inv.expires_at || new Date()), 'dd MMM yyyy', { locale: es })}
                    </p>
                  </div>
                  {inv.accepted_at ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <button
                      onClick={() => handleCancelInvite(inv.id)}
                      className="text-white/40 hover:text-red-400 transition-colors p-1"
                      title="Cancelar Invitación"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white/90">Usuarios Activos</h3>
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
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold uppercase">
                      {u.first_name?.[0] || u.email?.[0] || '?'}
                    </div>
                    <div>
                      <p className="font-bold text-white">{u.first_name ? `${u.first_name} ${u.last_name || ''}` : u.email}</p>
                      {u.first_name && <p className="text-xs text-white/50">{u.email}</p>}
                    </div>
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

      {/* Modal Invitar Usuario */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <GlassCard className="w-full max-w-md p-6 border-white/10 relative">
            <button
              onClick={() => setInviteModalOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <MailPlus className="w-5 h-5 text-emerald-400" />
                Invitar Nuevo Miembro
              </h3>
              <p className="text-sm text-white/60 mt-1">
                Se registrará la invitación para este usuario en tu Entidad.
              </p>
            </div>
            
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium"
                  placeholder="ejemplo@correo.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">Rol Asignado</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as PlatformRole)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium appearance-none"
                >
                  {roles.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Enviando...' : 'Guardar Invitación'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
