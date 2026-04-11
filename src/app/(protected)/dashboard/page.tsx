"use client";

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { useAgriProfile } from '@/hooks/useAgriProfile';
import { useI18n } from '@/lib/i18n';
import { createClient } from '@/lib/supabase/client';
import { 
  Building2, 
  Users, 
  Map, 
  TrendingUp, 
  Bell, 
  ArrowUpRight, 
  Settings, 
  ShieldCheck,
  Calendar,
  CloudLightning
} from 'lucide-react';
import Link from 'next/link';

export default function TenantDashboard() {
  const { profile, tenant, loading: profileLoading } = useAgriProfile();
  const { language } = useI18n();
  const supabase = createClient();
  
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalHa: 0,
    pendingInvites: 0,
    activeAlerts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!tenant) return;
      
      const [members, invites, plots] = await Promise.all([
        supabase.from('users').select('id, total_hectareas').eq('tenant_id', tenant.id),
        supabase.from('tenant_invitations').select('id').eq('tenant_id', tenant.id).is('accepted_at', null),
        supabase.from('parcelas').select('hectareas').eq('tenant_id', tenant.id)
      ]);

      const totalHa = plots.data?.reduce((acc, p) => acc + (Number(p.hectareas) || 0), 0) || 0;

      setStats({
        totalMembers: members.data?.length || 0,
        totalHa: totalHa,
        pendingInvites: invites.data?.length || 0,
        activeAlerts: 0 // Mock for now
      });
      setLoading(false);
    }
    fetchStats();
  }, [tenant]);

  if (profileLoading || loading) return <div className="p-8 animate-pulse text-white/20">Cargando panel empresarial...</div>;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-[var(--color-primary)]/10 to-transparent p-8 rounded-3xl border border-[var(--color-primary)]/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <Building2 size={120} />
        </div>
        <div className="space-y-2 relative z-10">
          <h1 className="text-3xl font-black text-white">
            {language === 'en' ? 'Welcome,' : 'Bienvenido,'} {profile?.first_name || 'Admin'}
          </h1>
          <p className="text-white/60 font-medium">
            {language === 'en' 
              ? `Management Console for ${tenant?.name}` 
              : `Consola de mando de ${tenant?.name}`}
          </p>
        </div>
        <div className="flex gap-3 relative z-10">
           <Link href="/admin/branding">
             <GlowButton variant="secondary" className="px-5 py-2.5 text-xs">
                <Settings size={14} className="mr-2" /> {language === 'en' ? 'Edit Brand' : 'Editar Marca'}
             </GlowButton>
           </Link>
           <Link href="/admin/members">
             <GlowButton className="px-5 py-2.5 text-xs">
                <Users size={14} className="mr-2" /> {language === 'en' ? 'Add Member' : 'Invitar Socio'}
             </GlowButton>
           </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Socios Totales', val: stats.totalMembers, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Hectáreas Red', val: stats.totalHa.toFixed(1), icon: Map, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Invs. Pendientes', val: stats.pendingInvites, icon: Bell, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Salud de Red', val: 'Óptima', icon: ShieldCheck, color: 'text-purple-400', bg: 'bg-purple-500/10' }
        ].map((s, i) => (
          <GlassCard key={i} className="p-6 flex flex-col justify-between group hover:scale-[1.02] transition-transform cursor-pointer">
            <div className="flex justify-between items-start">
               <div className={`p-3 rounded-2xl ${s.bg} ${s.color}`}>
                  <s.icon size={24} />
               </div>
               <ArrowUpRight size={16} className="text-white/20 group-hover:text-white transition-colors" />
            </div>
            <div className="mt-6">
               <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{s.label}</p>
               <p className="text-3xl font-black text-white mt-1">{s.val}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-8">
            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3">
              <Calendar className="text-[var(--color-primary)]" />
              Actividad Reciente en la Red
            </h2>
            <div className="space-y-6">
               {[
                 { user: 'Socio Nuevo', action: 'se ha unido a la red', time: 'Hace 2 horas', icon: Users, type: 'join' },
                 { user: 'Sector Norte', action: 'alerta por riesgo de mildiu', time: 'Hace 5 horas', icon: CloudLightning, type: 'alert' },
                 { user: 'Configuración', action: 'actualizaste el logo corporativo', time: 'Ayer', icon: Settings, type: 'system' }
               ].map((item, i) => (
                 <div key={i} className="flex gap-4 items-start group">
                    <div className={`p-2 rounded-lg bg-white/5 text-white/40 group-hover:text-[var(--color-primary)] transition-colors`}>
                       <item.icon size={18} />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-white/90">
                         <span className="text-[var(--color-primary)]">{item.user}</span> {item.action}
                       </p>
                       <p className="text-[10px] text-white/30 uppercase font-black tracking-tighter mt-1">{item.time}</p>
                    </div>
                 </div>
               ))}
            </div>
            <GlowButton variant="secondary" className="w-full mt-8 text-[10px] font-black uppercase tracking-widest py-3 border-emerald-500/5 hover:border-emerald-500/20">
               Ver historial completo
            </GlowButton>
          </GlassCard>
        </div>

        {/* Sidebar Mini panels */}
        <div className="space-y-6">
          <GlassCard className="p-6 border-emerald-500/20 bg-emerald-500/5">
             <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">Tu Suscripción</h3>
             <div className="flex items-end gap-2 mb-1">
                <span className="text-4xl font-black text-white">49,90€</span>
                <span className="text-xs text-white/40 mb-1">/mes</span>
             </div>
             <p className="text-[10px] text-emerald-400 font-bold mb-6">Plan Cooperativa • 50% Dto Marca Blanca aplicado</p>
             <Link href="/tenant/billing">
                <GlowButton className="w-full py-3 text-[10px] font-black uppercase tracking-widest">
                  Gestionar Facturas
                </GlowButton>
             </Link>
          </GlassCard>

          <GlassCard className="p-6">
             <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">Soporte Premium</h3>
             <p className="text-xs text-white/60 leading-relaxed mb-6">
                Como entidad B2B, tienes acceso prioritario 24/7 a nuestro equipo de técnicos agrícolas.
             </p>
             <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-xs font-bold text-white/80">Soporte en directo</span>
                </div>
             </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
