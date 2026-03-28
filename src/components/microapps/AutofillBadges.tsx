"use client";

import React from 'react';
import { useI18n } from '@/lib/i18n';

interface Preset {
  id?: string;
  label_es?: string;
  label_en?: string;
  values: Record<string, any>;
}

interface AutofillBadgesProps {
  presets: Preset[];
  onSelect: (values: Record<string, any>) => void;
}

export function AutofillBadges({ presets, onSelect }: AutofillBadgesProps) {
  const { language } = useI18n();

  if (!presets || presets.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {presets.map((preset, index) => {
        const label = language === 'en' ? (preset.label_en || preset.label_es) : (preset.label_es || preset.label_en);
        const key = preset.id || `preset-${index}`;
        return (
          <button
            key={key}
            onClick={(e) => {
              e.preventDefault();
              onSelect(preset.values);
            }}
            className="px-3 py-1.5 text-xs font-medium rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 shadow-sm overflow-hidden relative overflow-ellipsis whitespace-nowrap max-w-[200px]"
            title={label}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
