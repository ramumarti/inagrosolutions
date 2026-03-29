"use client";

import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useI18n } from '@/lib/i18n';
import { Check, X, Copy, Loader2, PlaySquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AppWorkspaceProps {
  appId: string;
  currentExecutionId: string | null;
  schema: any[];
}

export function AppWorkspace({ appId, currentExecutionId, schema }: AppWorkspaceProps) {
  const { language } = useI18n();
  const supabase = createClient();
  const [execution, setExecution] = useState<any>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentExecutionId) {
      setExecution(null);
      return;
    }

    async function fetchExecution() {
      const { data } = await supabase
        .from('app_executions')
        .select('*')
        .eq('id', currentExecutionId)
        .single();
      if (data) setExecution(data);
    }
    fetchExecution();

    const channel = supabase
      .channel(`execution_${currentExecutionId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'app_executions', filter: `id=eq.${currentExecutionId}` },
        (payload) => {
          setExecution(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentExecutionId, supabase]);

  const handleCopy = (type: 'text' | 'markdown' | 'html') => {
    if (!execution?.result?.markdown && type !== 'html') return;
    
    let textToCopy = "";
    if (type === 'markdown') {
      textToCopy = execution.result.markdown;
    } else if (type === 'text' && resultRef.current) {
      textToCopy = resultRef.current.innerText;
    } else if (type === 'html' && resultRef.current) {
      textToCopy = resultRef.current.innerHTML;
    }

    navigator.clipboard.writeText(textToCopy);
  };

  const getLabel = (key: string) => {
    if (key === 'responseLanguage') return language === 'en' ? 'Output Language' : 'Idioma';
    const field = schema.find(f => f.id === key || f.name === key);
    if (!field) return key;
    return language === 'en' ? (field.label_en || field.label_es) : (field.label_es || field.label_en);
  };

  const tCopyText = language === 'en' ? 'Text' : 'Texto';
  const tCopyMd = language === 'en' ? 'Markdown' : 'Markdown';
  const tCopyHtml = language === 'en' ? 'HTML' : 'HTML';

  if (!currentExecutionId || !execution) {
    return (
      <div className="flex-1 w-full h-full min-h-[400px] flex flex-col items-center justify-center opacity-40">
        <PlaySquare className="w-16 h-16 mb-4 text-[var(--color-primary)] opacity-50" />
        <h2 className="text-xl font-bold">{language === 'en' ? 'Ready for your prompt' : 'Listo para tu petición'}</h2>
        <p className="text-sm mt-2">{language === 'en' ? 'Fill out the form to generate AI magic.' : 'Completa el formulario para generar magia con IA.'}</p>
      </div>
    );
  }

  const isGenerating = execution.status === 'pending' || execution.status === 'processing';
  const isError = execution.status === 'error';

  return (
    <div className="flex-1 w-full flex flex-col gap-6 p-0 h-full">
      
      {/* The Petition Block */}
      <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 relative group backdrop-blur-md shrink-0">
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => handleCopy('text')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-black/40 hover:bg-black/60 text-white transition-colors border border-white/10">
            <Copy className="w-3 h-3" /> {tCopyText}
          </button>
          <button onClick={() => handleCopy('markdown')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-black/40 hover:bg-black/60 text-white transition-colors border border-white/10">
            <Copy className="w-3 h-3" /> {tCopyMd}
          </button>
          <button onClick={() => handleCopy('html')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-black/40 hover:bg-black/60 text-white transition-colors border border-white/10">
            <Copy className="w-3 h-3" /> {tCopyHtml}
          </button>
        </div>

        <h3 className="text-sm font-bold text-[color:var(--color-base-content)] opacity-50 uppercase tracking-wider mb-4">
          {language === 'en' ? 'Your Petition' : 'Tu Petición'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
          {Object.entries(execution.inputs).map(([k, v]) => (
            <div key={k} className="flex flex-col gap-1">
              <span className="text-xs text-[color:var(--color-primary)] font-semibold">{getLabel(k)}</span>
              {v === 'true' || v === true ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : v === 'false' || v === false ? (
                <X className="w-4 h-4 text-red-500" />
              ) : (
                <span className="text-sm text-white">{String(v)}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* The Response Block */}
      {isGenerating && (
        <div className="w-full bg-white/5 border border-[var(--color-primary)]/30 rounded-2xl p-12 overflow-hidden relative shadow-[0_0_30px_rgba(124,58,237,0.1)] backdrop-blur-md flex flex-col items-center justify-center flex-1 min-h-[300px]">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[var(--color-primary)]/5" />
          
          <div className="relative flex flex-col items-center z-10">
            <div className="w-16 h-16 relative flex items-center justify-center mb-6">
              <div className="absolute inset-0 rounded-full border-t-2 border-[var(--color-primary)] animate-spin" />
              <div className="absolute inset-2 rounded-full border-r-2 border-[var(--color-accent-pink)] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              <Loader2 className="w-6 h-6 text-white animate-pulse" />
            </div>
            
            <div className="px-6 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              {language === 'en' ? 'Generating your content...' : 'Generando tu contenido...'}
            </div>
          </div>
          
          <div className="w-full max-w-2xl mt-12 flex flex-col gap-4 opacity-30 animate-pulse">
            <div className="h-4 bg-white/20 rounded w-full" />
            <div className="h-4 bg-white/20 rounded w-11/12" />
            <div className="h-4 bg-white/20 rounded w-4/5" />
            <div className="h-4 bg-white/20 rounded w-full" />
            <div className="h-4 bg-white/20 rounded w-3/4" />
          </div>
        </div>
      )}

      {isError && (
        <div className="w-full bg-red-500/10 border border-red-500/30 rounded-2xl p-8 backdrop-blur-md flex-1">
          <h3 className="text-lg font-bold text-red-500 mb-2">{language === 'en' ? 'Error' : 'Error'}</h3>
          <p className="text-white/80">{execution.error_message}</p>
        </div>
      )}

      {execution.status === 'completed' && execution.result?.markdown && (
        <div 
          ref={resultRef}
          className="w-full bg-white text-gray-900 rounded-2xl p-8 flex-1 sm:p-12 shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-y-auto"
        >
          <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[var(--color-primary)]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {execution.result.markdown}
            </ReactMarkdown>
          </div>
        </div>
      )}
      
    </div>
  );
}
