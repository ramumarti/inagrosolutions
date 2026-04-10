'use client';

import React from 'react';
import { useAuthContext } from '@/lib/auth/tenant-context';
import { ShieldAlert } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

export default function TenantAdminLayout({ children }: { children: React.ReactNode }) {
  const { tenant, hasRole, isLoading } = useAuthContext();

  if (isLoading) return <div className="p-8"><div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" /></div>;

  // Use the hasRole helper from context which handles superadmin correctly
  if (!hasRole(['tenant_admin'])) {
    return (
      <div className="flex items-center justify-center p-20 min-h-screen">
        <GlassCard className="p-12 max-w-md text-center border-red-500/20">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4 opacity-80" />
          <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Acceso Denegado</h2>
          <p className="text-sm text-white/50 leading-relaxed italic">Lo sentimos, no tienes los permisos necesarios para gestionar esta sección económica.</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="px-6 md:px-10 py-6 border-b border-white/5 bg-black/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white glow-text">Portal de Administración</h1>
          <p className="text-sm text-white/50 font-medium">Entidad: <span className="text-white/80">{tenant?.name}</span></p>
        </div>
      </div>
      
      <div className="p-6 md:p-10">
        {children}
      </div>
    </div>
  );
}
