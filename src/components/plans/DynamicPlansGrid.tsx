"use client";

import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/components/ui/Toast';
import { Check, Sparkles, PenTool, Mail, Briefcase, Share2, Video, LayoutGrid, FileText, MessageSquare, Zap, Leaf, ShieldCheck, BarChart3, Database } from 'lucide-react';
import type { ComponentType } from 'react';
import { GlowButton } from '@/components/ui/GlowButton';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  PenTool, Mail, Briefcase, Share2, Video, LayoutGrid, Sparkles, FileText, MessageSquare, Zap, Leaf, ShieldCheck, BarChart3, Database
};

const PLAN_COLORS: Record<string, string> = {
  'basico_agri': 'from-emerald-600/20 to-emerald-900/40 border-emerald-500/30 text-emerald-400',
  'avanzado_agri': 'from-blue-600/20 to-blue-900/40 border-blue-500/30 text-blue-400',
  'profesional_agri': 'from-orange-600/20 to-orange-900/40 border-orange-500/30 text-orange-400',
  'premium_agri': 'from-purple-600/20 to-purple-900/40 border-purple-500/30 text-purple-400',
};

const PLAN_ACCENTS: Record<string, string> = {
  'basico_agri': 'bg-emerald-500',
  'avanzado_agri': 'bg-blue-500',
  'profesional_agri': 'bg-orange-500',
  'premium_agri': 'bg-purple-500',
};

interface PlanInfo {
  id: string;
  slug: string;
  name_en: string;
  name_es: string;
  description_en: string;
  description_es: string;
  price_monthly: number;
  items_en: string[];
  items_es: string[];
  plan_apps: any;
}

export function DynamicPlansGrid({ plans, currentPlanId }: { plans: PlanInfo[], currentPlanId: string | null }) {
  const { language } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  const handleCTA = async (plan: PlanInfo) => {
    if (plan.price_monthly === 0) {
      toast(language === 'en' ? 'Free plan activated' : 'Plan gratuito activado', 'success');
      return;
    }

    setLoadingId(plan.id);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: plan.id }), // En producción usar el Price ID real de Stripe
      });
      const data = await res.json();
      if (data.url) router.push(data.url);
    } catch (err) {
      toast('Error al conectar con Stripe', 'error');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="w-full flex-col flex items-center gap-12 pt-8 pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]">
          {language === 'en' ? 'Agricultural Plans' : 'Modelos de la App'}
        </h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto">
          {language === 'en' ? 'Scientific management for crops. Choose the level that matches your farm.' : 'Gestión científica para tus cultivos. Elige el nivel que mejor se adapte a tu explotación.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
        {plans.map(plan => {
          const isCurrent = plan.id === currentPlanId;
          const colorClass = PLAN_COLORS[plan.slug] || 'from-white/5 to-white/5 border-white/10';
          const accentClass = PLAN_ACCENTS[plan.slug] || 'bg-white/20';

          return (
            <div 
              key={plan.id} 
              className={cn(
                "relative flex flex-col p-8 rounded-[2rem] bg-gradient-to-br border backdrop-blur-xl transition-all duration-500 group",
                colorClass,
                isCurrent ? "ring-2 ring-white/20 shadow-2xl scale-[1.05] z-10" : "hover:scale-[1.02]"
              )}
            >
              {isCurrent && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-2 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap shadow-xl">
                  {language === 'en' ? 'Active Subscription' : 'Suscripción Activa'}
                </div>
              )}

              <div className="space-y-6 mb-8">
                <div className="space-y-1">
                   <h3 className="text-3xl font-black text-white italic tracking-tighter">
                     {language === 'en' ? plan.name_en : plan.name_es}
                   </h3>
                   <div className={cn("h-1 w-12 rounded-full", accentClass)} />
                </div>
                
                <p className="text-white/70 text-sm font-medium leading-tight">
                  {language === 'en' ? plan.description_en : plan.description_es}
                </p>
                
                <div className="flex items-baseline gap-1 py-4">
                  <span className="text-5xl font-black text-white">{Math.floor(plan.price_monthly)}</span>
                  <span className="text-2xl font-bold text-white/80">€</span>
                  <span className="text-white/40 text-sm font-medium">/mes</span>
                </div>
              </div>

              <GlowButton 
                onClick={() => handleCTA(plan)} 
                disabled={loadingId === plan.id}
                className={cn(
                  "w-full justify-center py-6 text-sm font-bold uppercase tracking-widest rounded-2xl shadow-lg border-b-4 active:border-b-0 active:translate-y-1 transition-all",
                  accentClass,
                  "text-white border-black/20 hover:brightness-110"
                )}
              >
                {loadingId === plan.id ? '...' : (language === 'en' ? 'Get Access' : 'Acceso Instantáneo')}
              </GlowButton>

              <div className="space-y-6 flex-grow pt-8 border-t border-white/5 mt-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
                    Funcionalidades
                  </h4>
                  <ul className="space-y-4">
                    {(language === 'en' ? plan.items_en : plan.items_es).map((item, i) => {
                      // Ultimo item es el "Modo"
                      const isMode = i === (language === 'en' ? plan.items_en.length - 1 : plan.items_es.length - 1);
                      if (isMode) return (
                         <li key={i} className="pt-4">
                            <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase text-white shadow-lg", accentClass)}>
                               {item}
                            </div>
                         </li>
                      );

                      return (
                        <li key={i} className="flex gap-3 text-sm text-white/90 items-start">
                          <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0", accentClass)}>
                             <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="font-medium">{item}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
