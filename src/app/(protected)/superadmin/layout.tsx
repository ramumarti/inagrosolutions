'use client';

import React from 'react';
import { useAuthContext } from '@/lib/auth/tenant-context';
import { ShieldAlert } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const { user, isSuperadmin, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSuperadmin) {
    return (
      <div className="flex items-center justify-center p-8">
        <GlassCard className="p-12 max-w-md text-center">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4 opacity-80" />
          <h2 className="text-xl font-bold text-white mb-2">Acceso Denegado</h2>
          <p className="text-sm text-white/50">No tienes permisos de superadministrador para ver esta sección.</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {/* Sub-header or Superadmin specific overlay could go here */}
      <div className="px-6 md:px-10 py-6 border-b border-white/5 bg-black/20 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white glow-text">Portal Superadmin</h1>
          <p className="text-sm text-white/50 font-medium">Gestión global de la plataforma</p>
        </div>
      </div>
      
      <div className="p-6 md:p-10">
        {children}
      </div>
    </div>
  );
}
