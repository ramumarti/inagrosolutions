"use client";

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Lock, PenTool, Mail, Briefcase, Share2, Video, LayoutGrid, Sparkles, FileText, MessageSquare, Zap } from 'lucide-react';
import type { ComponentType } from 'react';
import { GlowButton } from '@/components/ui/GlowButton';

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  PenTool, Mail, Briefcase, Share2, Video, LayoutGrid, Sparkles, FileText, MessageSquare, Zap
};

interface MicroApp {
  id: string;
  slug: string;
  name_en: string;
  name_es: string;
  description_en: string;
  description_es: string;
  icon: string;
}

interface AppsGridProps {
  apps: MicroApp[];
  accessibleSlugs: string[];
  hasAnyAccess: boolean;
}

export function AppsGrid({ apps, accessibleSlugs, hasAnyAccess }: AppsGridProps) {
  const { language } = useI18n();

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold glow-text">
          {language === 'en' ? 'My Applications' : 'Mis Aplicaciones'}
        </h1>
        <p className="text-white/60">
          {language === 'en' 
            ? 'Explore the AI tools available in your plan' 
            : 'Explora las herramientas de IA disponibles en tu plan'}
        </p>
      </div>

      {!hasAnyAccess && (
        <div className="w-full p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center gap-6 shadow-xl backdrop-blur-md">
          <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center">
            <Lock className="w-8 h-8 text-[var(--color-primary)]" />
          </div>
          <h2 className="text-xl font-semibold">
            {language === 'en' ? 'Choose a plan to unlock your apps' : 'Elige un plan para desbloquear tus apps'}
          </h2>
          <Link href="/plans">
            <GlowButton>
              {language === 'en' ? 'View Plans' : 'Ver Planes'}
            </GlowButton>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {apps.map((app) => {
          const isAccessible = accessibleSlugs.includes(app.slug);
          const IconComponent = ICON_MAP[app.icon] ?? Sparkles;
          const name = language === 'en' ? app.name_en : app.name_es;
          const description = language === 'en' ? app.description_en : app.description_es;

          if (isAccessible) {
            return (
              <Link key={app.id} href={`/apps/${app.slug}`} prefetch={false}>
                <div className="relative h-full flex flex-col p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[var(--color-primary)]/50 hover:scale-[1.02] transition-all duration-300 group overflow-hidden shadow-lg backdrop-blur-md">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/30 flex items-center justify-center mb-4 text-[var(--color-primary)] shadow-inner">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg text-white mb-2 line-clamp-1">{name}</h3>
                  <p className="text-sm text-white/50 line-clamp-2">{description}</p>
                </div>
              </Link>
            );
          } else {
            return (
              <Link key={app.id} href="/plans" prefetch={false} className="cursor-pointer">
                <div className="relative h-full flex flex-col p-6 rounded-2xl bg-white/2 border border-white/5 opacity-50 pointer-events-auto transition-all duration-300 overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <Lock className="w-4 h-4 text-white/30" />
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/30">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg text-white mb-2 line-clamp-1">{name}</h3>
                  <p className="text-sm text-white/30 line-clamp-2">{description}</p>
                </div>
              </Link>
            );
          }
        })}
      </div>
    </div>
  );
}
