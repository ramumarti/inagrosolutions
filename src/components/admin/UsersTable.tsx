"use client";

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Search, ChevronLeft, ChevronRight, UserPlus, Eye, Shield, User, Trash2, Loader2 } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { AddUserModal } from './AddUserModal';
import { useToast } from '@/components/ui/Toast';

function timeAgo(dateStr: string, language: 'en' | 'es') {
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const min = Math.floor(diff / 60000);
  const hours = Math.floor(min / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return language === 'en' ? `${days} days ago` : `Hace ${days} días`;
  if (hours > 0) return language === 'en' ? `${hours} hours ago` : `Hace ${hours} horas`;
  if (min > 0) return language === 'en' ? `${min} mins ago` : `Hace ${min} min`;
  return language === 'en' ? 'Just now' : 'Justo ahora';
}

export interface PlanInfo {
  id: string;
  name_en: string;
  name_es: string;
  sort_order: number;
}

export interface UserRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
  plan_id: string | null;
  plans: { name_en: string; name_es: string; slug: string } | null;
}

export function UsersTable({ initialUsers, activePlans }: { initialUsers: UserRow[], activePlans: PlanInfo[] }) {
  const { language } = useI18n();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const pageSize = 10;

  const handleDeleteUser = async (user: UserRow) => {
    if (!confirm(language === 'en' ? `Are you sure you want to delete user ${user.email}? This action is irreversible.` : `¿Estás seguro de que quieres eliminar al usuario ${user.email}? Esta acción es irreversible.`)) return;

    setDeletingId(user.id);
    try {
      const res = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setUsers(users.filter(u => u.id !== user.id));
      toast(language === 'en' ? 'User deleted successfully' : 'Usuario eliminado con éxito', 'success');
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(u => 
      u.email.toLowerCase().includes(q) || 
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(q)
    );
  }, [search, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  
  // Ensure page is in bounds
  if (page > totalPages) setPage(totalPages);

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page]);

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold glow-text">
            {language === 'en' ? 'User Management' : 'Gestión de Usuarios'}
          </h1>
          <p className="text-white/60">
            {language === 'en' ? 'Manage registered portal users' : 'Administra los usuarios registrados en el portal'}
          </p>
        </div>
        <GlowButton onClick={() => setIsModalOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          {language === 'en' ? 'Add User' : 'Agregar Usuario'}
        </GlowButton>
      </div>

      <div className="w-full rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col gap-6 backdrop-blur-md shadow-xl">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input 
            type="text" 
            placeholder={language === 'en' ? 'Search by name or email...' : 'Buscar por nombre o email...'}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/20 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/50 transition-all"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-white/50 text-sm">
                <th className="pb-3 px-4 font-medium">{language === 'en' ? 'User' : 'Usuario'}</th>
                <th className="pb-3 px-4 font-medium">{language === 'en' ? 'Role' : 'Rol'}</th>
                <th className="pb-3 px-4 font-medium">{language === 'en' ? 'Plan' : 'Plan'}</th>
                <th className="pb-3 px-4 font-medium">{language === 'en' ? 'Joined' : 'Se unió'}</th>
                <th className="pb-3 px-4 font-medium text-right">{language === 'en' ? 'Actions' : 'Acciones'}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-white/50">
                    {language === 'en' ? 'No users found.' : 'No se encontraron usuarios.'}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map(user => {
                  const initial = (user.first_name?.[0] || user.email[0]).toUpperCase();
                  const planName = user.plans ? (language === 'en' ? user.plans.name_en : user.plans.name_es) : null;
                  
                  return (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)]/40 to-black/40 border border-white/10 flex items-center justify-center shrink-0">
                            <span className="font-semibold text-white/80">{initial}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-white">{user.first_name} {user.last_name}</span>
                            <span className="text-sm text-white/50">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {user.role === 'admin' ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-xs font-medium border border-[var(--color-primary)]/30">
                            <Shield className="w-3 h-3" />
                            Admin
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white/70 text-xs font-medium border border-white/10">
                            <User className="w-3 h-3" />
                            User
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {planName ? (
                          <span className="text-white font-medium">{planName}</span>
                        ) : (
                          <span className="text-white/30 italic">{language === 'en' ? 'No Plan' : 'Sin Plan'}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-white/50 text-sm">
                        {timeAgo(user.created_at, language)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/users/${user.id}`}>
                            <button className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors" title={language === 'en' ? 'View Details' : 'Ver Detalles'}>
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
                          <button 
                            onClick={() => handleDeleteUser(user)}
                            disabled={deletingId === user.id}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-500/50 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30" 
                            title={language === 'en' ? 'Delete User' : 'Eliminar Usuario'}
                          >
                            {deletingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4 text-sm text-white/50">
          <span>
            {language === 'en' ? `Showing ${paginatedUsers.length > 0 ? (page - 1) * pageSize + 1 : 0} to ${Math.min(page * pageSize, filteredUsers.length)} of ${filteredUsers.length}` : `Mostrando ${paginatedUsers.length > 0 ? (page - 1) * pageSize + 1 : 0} a ${Math.min(page * pageSize, filteredUsers.length)} de ${filteredUsers.length}`}
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded-md hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-2">
              {page} / {totalPages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1 rounded-md hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <AddUserModal 
          activePlans={activePlans}
          onClose={() => setIsModalOpen(false)} 
          onSuccess={(newUser) => {
            // For immediate UI update, append the user with local missing data like plan name.
            // A full refresh happens upon navigating, but this is good for client UX.
            setUsers([newUser, ...users]);
          }} 
        />
      )}
    </div>
  );
}
