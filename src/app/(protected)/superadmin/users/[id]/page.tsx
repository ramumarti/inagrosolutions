'use client';

import React, { useEffect, useState } from 'react';
import { getGlobalUserDetail } from '@/lib/actions/superadmin';
import { GlassCard } from '@/components/ui/GlassCard';
import { User, Mail, Shield, Building2, Phone, MapPin, Calendar, ArrowLeft, Leaf, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function SuperadminUserDetailPage() {
  const { id } = useParams() as { id: string };
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setLoading(true);
    const data = await getGlobalUserDetail(id);
    setUser(data);
    setLoading(false);
  }

  if (loading) return <div className="p-8 text-white/50 animate-pulse font-bold">Cargando detalles...</div>;
  if (!user) return <div className="p-8 text-red-400 font-bold">Usuario no encontrado</div>;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <Link href="/superadmin/users" className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors">
        <ArrowLeft size={16} /> Volver a Usuarios Globales
      </Link>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/40 flex items-center justify-center border border-emerald-500/30">
            <User className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">
              {user.first_name} {user.last_name}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-sm font-medium">
              <span className="text-white/60 flex items-center gap-1"><Mail size={14}/> {user.email}</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-white/50 uppercase text-[10px] tracking-widest">{user.platform_role}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Personal Info & Tenant */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h2 className="text-sm uppercase font-black text-white/40 tracking-widest mb-4 flex items-center gap-2">
              <User size={16} /> Información Personal
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-widest">ID de Usuario</p>
                <p className="font-mono text-xs text-white/70">{user.id}</p>
              </div>
              {user.is_business && (
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest">Empresa / Razón Social</p>
                  <p className="font-medium text-white">{user.company_name || 'N/A'}</p>
                </div>
              )}
              {user.phone && (
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest">Teléfono</p>
                  <p className="text-white/80">{user.phone}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-widest">Fecha de Registro</p>
                <p className="text-white/80">{new Date(user.created_at).toLocaleString()}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="text-sm uppercase font-black text-white/40 tracking-widest mb-4 flex items-center gap-2">
              <Building2 size={16} /> Entidad / Cooperativa
            </h2>
            {user.tenant ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {user.tenant.logo_url ? (
                    <img src={user.tenant.logo_url} className="w-10 h-10 object-contain rounded bg-white/5 p-1" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-indigo-500/20 flex items-center justify-center">
                      <Building2 className="text-indigo-400" size={20} />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-white">{user.tenant.name}</p>
                    <p className="text-xs text-indigo-400 font-mono">{user.tenant.slug}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest">Plan de la Entidad</p>
                  <p className="text-emerald-400 font-bold uppercase text-xs">{user.tenant.subscription_tier}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-white/30 italic">No asociado a ninguna entidad</p>
            )}
          </GlassCard>
        </div>

        {/* Right Column: Farms & Activity */}
        <div className="md:col-span-2 space-y-6">
          <GlassCard className="p-6">
            <h2 className="text-sm uppercase font-black text-white/40 tracking-widest mb-4 flex items-center gap-2">
              <Leaf size={16} /> Explotaciones ({user.farms?.length || 0})
            </h2>
            {user.farms && user.farms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.farms.map((f: any) => (
                  <div key={f.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                    <p className="font-bold text-emerald-400 mb-1">{f.name}</p>
                    <p className="text-xs text-white/40 flex items-center gap-1"><MapPin size={12}/> {f.municipality || 'Sin ubicación'}</p>
                    <p className="text-xs text-white/40 flex items-center gap-1 mt-1"><Leaf size={12}/> {f.cultivation_type || 'Sin cultivo'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/30 italic">Este usuario no ha registrado ninguna explotación todavía.</p>
            )}
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm uppercase font-black text-white/40 tracking-widest flex items-center gap-2">
                <CreditCard size={16} /> Suscripción (Pagos)
              </h2>
            </div>
            
            {user.stripe_customer_id ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div>
                    <p className="text-[10px] text-emerald-400/50 uppercase tracking-widest font-bold">Estado</p>
                    <p className="text-emerald-400 font-bold uppercase">{user.subscription_status || 'ACTIVA'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-emerald-400/50 uppercase tracking-widest font-bold">Plan</p>
                    <p className="text-emerald-400 font-bold">{user.plan_id || 'Básico'}</p>
                  </div>
                </div>
                <div className="text-xs text-white/40 font-mono break-all">
                  Stripe Customer ID: {user.stripe_customer_id}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                <p className="text-sm text-white/40">El usuario no tiene una suscripción de pago directa.</p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
