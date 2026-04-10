"use client";

import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { useAgriProfile } from '@/hooks/useAgriProfile';
import { useI18n } from '@/lib/i18n';
import { 
  Wallet, 
  CreditCard, 
  ArrowUpRight, 
  FileText, 
  Download, 
  ShieldCheck,
  TrendingUp,
  Clock
} from 'lucide-react';

export default function TenantBillingPage() {
  const { tenant, profile } = useAgriProfile();
  const { language } = useI18n();

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-2">
        <h1 className="text-4xl font-black glow-text flex items-center gap-3">
          <Wallet className="w-10 h-10 text-[var(--color-primary)]" />
          {language === 'en' ? 'Billing & Commisions' : 'Facturación y Comisiones'}
        </h1>
        <p className="text-white/60 font-medium italic">
          Gestión económica de la Marca Blanca
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 border-emerald-500/20 bg-emerald-500/5 col-span-1 md:col-span-2">
           <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Próximo Cobro</p>
                <p className="text-4xl font-black text-white">49,90€</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Estado</p>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                  Activo
                </span>
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 truncate">Método de Pago</p>
                <div className="flex items-center gap-2 mt-2">
                  <CreditCard size={18} className="text-white/40" />
                  <span className="text-sm font-bold text-white">VISA •••• 4242</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Fecha Renovación</p>
                <p className="text-sm font-bold text-white mt-2">01 Mayo, 2026</p>
              </div>
           </div>

           <div className="mt-8 flex gap-4">
              <GlowButton className="text-xs px-6 py-3">Actualizar Tarjeta</GlowButton>
              <GlowButton variant="secondary" className="text-xs px-6 py-3 border-white/5">Historial Completo</GlowButton>
           </div>
        </GlassCard>

        <GlassCard className="p-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5">
              <TrendingUp size={80} />
           </div>
           <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">Revenue Sharing</h3>
           <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-2">
                   <span className="text-white/60">Suscripciones Socios</span>
                   <span className="text-white font-bold">1.250€</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-[var(--color-primary)] w-[70%]" />
                </div>
              </div>
              <div className="pt-4 space-y-2">
                 <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-white/30">
                    <span>Comisión Cooperativa (20%)</span>
                    <span className="text-emerald-400">+250€</span>
                 </div>
              </div>
           </div>
           <p className="text-[10px] text-white/40 italic mt-6 border-t border-white/5 pt-4 leading-relaxed">
             Este balance se liquida mensualmente de forma automática en tu cuenta.
           </p>
        </GlassCard>
      </div>

      {/* Invoices List */}
      <GlassCard className="overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
           <h3 className="text-sm font-black uppercase tracking-widest text-white">Facturas Recientes</h3>
           <FileText size={16} className="text-white/20" />
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead className="bg-white/[0.01] text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
                 <tr>
                    <th className="px-6 py-4">Factura</th>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Importe</th>
                    <th className="px-6 py-4 text-right">Descargar</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { ref: 'INV-2026-004', date: '01 Abr 2026', amount: '49,90 €' },
                  { ref: 'INV-2026-003', date: '01 Mar 2026', amount: '49,90 €' },
                  { ref: 'INV-2026-002', date: '01 Feb 2026', amount: '49,90 €' }
                ].map((inv, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors border-l-2 border-transparent hover:border-[var(--color-primary)]">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          <Clock size={14} className="text-white/20" />
                          <span className="text-xs font-bold text-white">{inv.ref}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-white/40">{inv.date}</td>
                    <td className="px-6 py-4 text-xs font-black text-white">{inv.amount}</td>
                    <td className="px-6 py-4 text-right">
                       <button className="p-2 hover:bg-white/10 rounded-lg text-emerald-400 transition-colors">
                          <Download size={14} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>
      </GlassCard>

      <div className="flex items-center gap-3 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/20">
         <ShieldCheck className="text-blue-400 shrink-0" size={20} />
         <p className="text-[10px] text-blue-400/80 font-medium">
           Tus datos de pago están protegidos mediante el estándar PCI Service Provider Level 1. InagroSolutions nunca almacena tu tarjeta completa en sus servidores.
         </p>
      </div>
    </div>
  );
}
