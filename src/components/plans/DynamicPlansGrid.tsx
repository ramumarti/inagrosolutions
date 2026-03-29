"use client";

import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/components/ui/Toast';
import { Check, Sparkles, PenTool, Mail, Briefcase, Share2, Video, LayoutGrid, FileText, MessageSquare, Zap } from 'lucide-react';
import type { ComponentType } from 'react';
import { GlowButton } from '@/components/ui/GlowButton';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  PenTool, Mail, Briefcase, Share2, Video, LayoutGrid, Sparkles, FileText, MessageSquare, Zap
};

interface PlanInfo {
  id: string;
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

  const handleCTA = () => {
    toast(language === 'en' ? 'Contact us to upgrade' : 'Contáctanos para actualizar', 'success');
  };

  return (
    <div className="w-full flex-col flex items-center gap-12 pt-8 pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold glow-text">
          {language === 'en' ? 'Choose Your Plan' : 'Elige Tu Plan'}
        </h1>
        <p className="text-white/60 text-lg max-w-xl mx-auto">
          {language === 'en' ? 'Unlock the full potential of our AI micro-apps with a plan tailored to you.' : 'Desbloquea todo el potencial de nuestras micro-apps de IA con un plan adaptado a ti.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
        {plans.map(plan => {
          const isCurrent = plan.id === currentPlanId;
          const apps = (plan.plan_apps || []).map((pa: any) => {
             // Extract embedded micro_apps safely depending on PostgREST shape returning array vs object
             const ma = Array.isArray(pa.micro_apps) ? pa.micro_apps[0] : pa.micro_apps;
             return ma;
          }).filter(Boolean);

          return (
            <div 
              key={plan.id} 
              className={cn(
                "relative flex flex-col p-8 rounded-3xl bg-white/5 border backdrop-blur-md transition-all duration-300",
                isCurrent ? "border-[var(--color-primary)] shadow-[0_0_30px_rgba(124,58,237,0.3)] scale-[1.02]" : "border-white/10 hover:border-white/20"
              )}
            >
              {isCurrent && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold uppercase tracking-wider whitespace-nowrap shadow-lg">
                  {language === 'en' ? 'Current Plan' : 'Plan Actual'}
                </div>
              )}

              <div className="space-y-4 mb-8">
                <h3 className="text-2xl font-bold text-white">
                  {language === 'en' ? plan.name_en : plan.name_es}
                </h3>
                <p className="text-white/50 text-sm h-10">
                  {language === 'en' ? plan.description_en : plan.description_es}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">{plan.price_monthly} €</span>
                  <span className="text-white/50">/mo</span>
                </div>
              </div>

              <GlowButton 
                onClick={handleCTA} 
                className="w-full justify-center mb-8"
              >
                {language === 'en' ? 'Instant Access' : 'Acceso Instantáneo'}
              </GlowButton>

              <div className="space-y-6 flex-grow">
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                    {language === 'en' ? 'Features' : 'Características'}
                  </h4>
                  <ul className="space-y-3">
                    {(language === 'en' ? plan.items_en : plan.items_es).map((item, i) => (
                      <li key={i} className="flex gap-3 text-sm text-white/80 items-start">
                        <Check className="w-4 h-4 text-[var(--color-primary)] mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3 pt-6 border-t border-white/10">
                  <h4 className="text-xs font-semibold text-[color:var(--color-primary)] uppercase tracking-wider">
                    {language === 'en' ? 'Included Apps' : 'Apps Incluidas'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {apps.map((app: any, i: number) => {
                      const IconComp = ICON_MAP[app.icon] || Sparkles;
                      return (
                        <div 
                          key={i} 
                          className="px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium border bg-white/5 text-white/70 border-white/10"
                        >
                          <IconComp className="w-3 h-3 text-[var(--color-primary)]" />
                          <span>{language === 'en' ? app.name_en : app.name_es}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
