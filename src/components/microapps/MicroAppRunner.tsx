"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useI18n } from '@/lib/i18n';
import { DynamicForm } from './DynamicForm';
import { AutofillBadges } from './AutofillBadges';
import { AppHistory } from './AppHistory';
import { AppWorkspace } from './AppWorkspace';
import { Loader2, LayoutTemplate, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

export function MicroAppRunner({ appSlug }: { appSlug: string }) {
  const { language } = useI18n();
  const { toast } = useToast();
  const supabase = createClient();
  
  const [appData, setAppData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');
  const [currentExecutionId, setCurrentExecutionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [presetValues, setPresetValues] = useState<Record<string, any>>({});

  useEffect(() => {
    async function fetchApp() {
      const { data, error } = await supabase
        .from('micro_apps')
        .select('*')
        .eq('slug', appSlug)
        .single();
      
      if (data) setAppData(data);
      setLoading(false);
    }
    fetchApp();
  }, [appSlug, supabase]);

  const handleSubmit = async (values: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appSlug, inputs: values })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate');
      
      setCurrentExecutionId(data.executionId);
    } catch (error: any) {
      toast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center relative">
        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
      </div>
    );
  }

  if (!appData) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center opacity-50 relative">
        <h2 className="text-xl font-bold">{language === 'en' ? 'App not found' : 'App no encontrada'}</h2>
      </div>
    );
  }

  const appName = language === 'en' ? appData.name_en : appData.name_es;
  const appDesc = language === 'en' ? appData.description_en : appData.description_es;

  // The runner explicitely uses h-full and p-6 as per safeguards
  return (
    <div className="w-full h-full p-6 relative">
      <div className="flex flex-col md:flex-row gap-6 w-full h-full mx-auto items-start">
        
        {/* Left Column (30%, max 320px) */}
        <div className="w-full md:w-[30%] md:max-w-[320px] shrink-0 h-full flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl z-10">
          
          {/* Header & Tabs */}
          <div className="flex flex-col shrink-0 border-b border-white/10 bg-black/20">
            <div className="p-5">
              <h2 className="text-lg font-bold text-white tracking-tight">{appName}</h2>
              {appDesc && <p className="text-xs text-[color:var(--color-base-content)] opacity-70 mt-1 line-clamp-2">{appDesc}</p>}
            </div>
            
            <div className="flex w-full">
              <button 
                onClick={() => setActiveTab('form')}
                className={cn("flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2", activeTab === 'form' ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] bg-white/5" : "text-white/50 hover:text-white/80 border-b-2 border-transparent")}
              >
                <LayoutTemplate className="w-4 h-4" />
                {language === 'en' ? 'Form' : 'Formulario'}
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={cn("flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2", activeTab === 'history' ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] bg-white/5" : "text-white/50 hover:text-white/80 border-b-2 border-transparent")}
              >
                <History className="w-4 h-4" />
                {language === 'en' ? 'History' : 'Historial'}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-white/10 relative">
            {activeTab === 'form' ? (
              <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-300">
                <AutofillBadges 
                  presets={appData.autofill_presets || []} 
                  onSelect={(v) => setPresetValues(v)} 
                />
                <DynamicForm 
                  schema={appData.form_schema || []} 
                  onSubmit={handleSubmit}
                  isLoading={isSubmitting}
                  initialValues={presetValues}
                />
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 h-full">
                <AppHistory 
                  appId={appData.id} 
                  onSelect={(id) => setCurrentExecutionId(id)}
                  activeExecutionId={currentExecutionId}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Remaining space) */}
        <div className="flex-1 w-full h-full overflow-y-auto rounded-2xl flex flex-col z-10 scrollbar-thin scrollbar-thumb-white/10">
          <AppWorkspace 
            appId={appData.id} 
            currentExecutionId={currentExecutionId} 
            schema={appData.form_schema || []} 
          />
        </div>

      </div>
    </div>
  );
}
