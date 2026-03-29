"use client";

import React from 'react';
import { useI18n } from '@/lib/i18n';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage } = useI18n();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Globe className="w-4 h-4 text-[color:var(--color-base-content)] opacity-70" />
      <button 
        type="button"
        onClick={() => setLanguage('es')}
        className={cn("text-xs transition-colors", language === 'es' ? "text-[color:var(--color-primary)] font-bold" : "text-[color:var(--color-base-content)] opacity-50 hover:opacity-100")}
      >
        ES
      </button>
      <span className="text-[color:var(--color-base-content)] opacity-30 text-xs">|</span>
      <button 
        type="button"
        onClick={() => setLanguage('en')}
        className={cn("text-xs transition-colors", language === 'en' ? "text-[color:var(--color-primary)] font-bold" : "text-[color:var(--color-base-content)] opacity-50 hover:opacity-100")}
      >
        EN
      </button>
    </div>
  );
}
