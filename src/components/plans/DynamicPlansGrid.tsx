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
  'starter': 'from-indigo-600/20 to-indigo-900/40 border-indigo-500/30 text-indigo-400',
  'professional': 'from-blue-600/20 to-blue-900/40 border-blue-500/30 text-blue-400',
  'enterprise': 'from-purple-600/20 to-purple-900/40 border-purple-500/30 text-purple-400',
};

const PLAN_ACCENTS: Record<string, string> = {
  'starter': 'bg-indigo-500',
  'professional': 'bg-blue-500',
  'enterprise': 'bg-purple-500',
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
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          priceId: plan.id,
          successUrl: window.location.origin + '/dashboard',
          cancelUrl: window.location.href 
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      console.error(err);
      toast(language === 'en' ? 'Stripe connection error' : 'Error al conectar con Stripe', 'error');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="w-full flex-col flex items-center gap-12 pt-8 pb-20 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-r from-indigo-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] uppercase">
          {language === 'en' ? 'Choose Your Plan' : 'Elige tu Plan'}
        </h1>
        <p className="text-white/40 text-lg max-w-2xl mx-auto font-medium uppercase tracking-widest text-xs">
          {language === 'en' ? 'Scalable solutions for your business' : 'Soluciones escalables para tu empresa'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {plans.map(plan => {
          const isCurrent = plan.id === currentPlanId;
          const colorClass = PLAN_COLORS[plan.slug] || 'from-white/5 to-white/5 border-white/10';
          const accentClass = PLAN_ACCENTS[plan.slug] || 'bg-white/20';

          return (
            <div 
              key={plan.id} 
              className={cn(
                "relative flex flex-col p-10 rounded-[2.5rem] bg-gradient-to-br border backdrop-blur-xl transition-all duration-500 group",
                colorClass,
                isCurrent ? "ring-2 ring-white/20 shadow-2xl scale-[1.05] z-10" : "hover:scale-[1.02]"
              )}
            >
              {isCurrent && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-2 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap shadow-xl">
                  {language === 'en' ? 'Active' : 'Activo'}
                </div>
              )}

              <div className="space-y-6 mb-8">
                <div className="space-y-1">
                   <h3 className="text-3xl font-black text-white tracking-tighter uppercase">
                     {language === 'en' ? plan.name_en : plan.name_es}
                   </h3>
                   <div className={cn("h-1 w-12 rounded-full opacity-50", accentClass)} />
                </div>
                
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest leading-relaxed">
                  {language === 'en' ? plan.description_en : plan.description_es}
                </p>
                
                <div className="flex items-baseline gap-1 py-4">
                  <span className="text-6xl font-black text-white tracking-tighter">{Math.floor(plan.price_monthly)}</span>
                  <span className="text-2xl font-bold text-white/50">€</span>
                  <span className="text-white/20 text-[10px] font-black uppercase tracking-widest ml-2">/mes</span>
                </div>
              </div>

              <GlowButton 
                onClick={() => handleCTA(plan)} 
                disabled={loadingId === plan.id}
                className={cn(
                  "w-full justify-center py-6 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all",
                  accentClass,
                  "text-white hover:brightness-110 active:scale-95"
                )}
              >
                {loadingId === plan.id ? '...' : (isCurrent ? (language === 'en' ? 'Manage' : 'Gestionar') : (language === 'en' ? 'Select Plan' : 'Elegir Plan'))}
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
