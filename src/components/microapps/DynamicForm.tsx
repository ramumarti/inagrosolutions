"use client";

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/Input';

interface FormFieldSchema {
  id?: string;
  name?: string;
  type: 'text' | 'textarea' | 'select' | 'toggle';
  label_es?: string;
  label_en?: string;
  placeholder_es?: string;
  placeholder_en?: string;
  options_es?: string[];
  options_en?: string[];
  default?: any;
}

interface DynamicFormProps {
  schema: FormFieldSchema[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
  isLoading?: boolean;
}

export function DynamicForm({ schema, initialValues = {}, onSubmit, isLoading }: DynamicFormProps) {
  const { language } = useI18n();
  const [values, setValues] = useState<Record<string, any>>({});

  useEffect(() => {
    // Merge defaults from schema with initialValues. Spreading initialValues last to overwrite.
    const defaults: Record<string, any> = {};
    schema.forEach(field => {
      const key = field.id || field.name;
      if (key) {
        defaults[key] = field.default !== undefined ? field.default : (field.type === 'toggle' ? "false" : "");
      }
    });
    // Add the default response language
    defaults['responseLanguage'] = 'Español';
    
    setValues(prev => ({ ...prev, ...defaults, ...initialValues }));
  }, [schema, initialValues]);

  const handleChange = (key: string, value: any) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  const getTranslated = (es?: string, en?: string) => language === 'en' ? (en || es) : (es || en);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {schema.map(field => {
        const key = field.id || field.name;
        if (!key) return null;
        
        const label = getTranslated(field.label_es, field.label_en);
        const placeholder = getTranslated(field.placeholder_es, field.placeholder_en);
        
        return (
          <div key={key} className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[color:var(--color-base-content)] opacity-90">
              {label}
            </label>
            
            {field.type === 'text' && (
              <Input
                type="text"
                value={values[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={placeholder}
                className="bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-[var(--color-primary)]"
              />
            )}

            {field.type === 'textarea' && (
              <textarea
                value={values[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={placeholder}
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/50 transition-all resize-none shadow-inner"
              />
            )}

            {field.type === 'select' && (
              <select
                value={values[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-base-200)] border border-white/10 text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/50 transition-all appearance-none"
              >
                <option value="" disabled className="text-white/30">{placeholder || '...'}</option>
                {field.options_es?.map((optEs, i) => {
                  const optEn = field.options_en?.[i] || optEs;
                  const displayOpt = language === 'en' ? optEn : optEs;
                  return (
                    <option key={optEs} value={optEs}>{displayOpt}</option>
                  );
                })}
              </select>
            )}

            {field.type === 'toggle' && (
              <button
                type="button"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-base-100)] ${values[key] === 'true' ? 'bg-[var(--color-primary)]' : 'bg-white/10'}`}
                onClick={() => handleChange(key, values[key] === 'true' ? 'false' : 'true')}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${values[key] === 'true' ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            )}
          </div>
        );
      })}

      {/* Mandatory language radio group */}
      <div className="flex flex-col gap-2 mt-2">
        <label className="text-sm font-medium text-[color:var(--color-base-content)] opacity-90">
          {language === 'en' ? 'Output Language' : 'Idioma de Respuesta'}
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-[color:var(--color-base-content)] hover:text-white transition-colors">
            <input 
              type="radio" 
              name="responseLanguage" 
              value="Español"
              checked={values['responseLanguage'] === 'Español'}
              onChange={(e) => handleChange('responseLanguage', e.target.value)}
              className="accent-[var(--color-primary)]"
            />
            Español
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-[color:var(--color-base-content)] hover:text-white transition-colors">
            <input 
              type="radio" 
              name="responseLanguage" 
              value="English"
              checked={values['responseLanguage'] === 'English'}
              onChange={(e) => handleChange('responseLanguage', e.target.value)}
              className="accent-[var(--color-primary)]"
            />
            English
          </label>
        </div>
      </div>

      <div className="mt-4">
        <GlowButton type="submit" variant="primary" className="w-full justify-center" disabled={isLoading}>
          {isLoading ? (language === 'en' ? 'Processing...' : 'Procesando...') : (language === 'en' ? 'Generate' : 'Generar')}
        </GlowButton>
      </div>
    </form>
  );
}
