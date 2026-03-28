"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useI18n } from '@/lib/i18n';
import { Clock, History } from 'lucide-react';

interface AppHistoryProps {
  appId: string;
  onSelect: (executionId: string) => void;
  activeExecutionId: string | null;
}

export function AppHistory({ appId, onSelect, activeExecutionId }: AppHistoryProps) {
  const { language } = useI18n();
  const [history, setHistory] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function loadHistory() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('app_executions')
        .select('*')
        .eq('app_id', appId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setHistory(data);
    }
    loadHistory();
  }, [appId, supabase]);

  const extractTopic = (inputs: Record<string, any>) => {
    if (inputs.topic) return inputs.topic;
    if (inputs.query) return inputs.query;
    
    let longest = "";
    Object.values(inputs).forEach(val => {
      if (typeof val === 'string' && val.length > longest.length) {
        longest = val;
      }
    });
    return longest || (language === 'en' ? 'Empty petition' : 'Petición vacía');
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center opacity-50">
        <History className="w-8 h-8 mb-3" />
        <p className="text-sm">{language === 'en' ? 'No history yet' : 'Sin historial aún'}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 overflow-y-auto">
      {history.map(item => {
        const topic = extractTopic(item.inputs);
        const isActive = activeExecutionId === item.id;
        const date = new Date(item.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', { 
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
        });

        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`flex flex-col items-start p-3 w-full text-left rounded-xl border transition-all ${
              isActive 
                ? 'bg-white/10 border-[var(--color-primary)]/50 shadow-[0_0_10px_rgba(124,58,237,0.2)]' 
                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            <p className="text-sm font-medium text-white line-clamp-2" title={topic}>{topic}</p>
            <div className="flex items-center gap-1 mt-2 text-[10px] text-white/50">
              <Clock className="w-3 h-3" />
              <span>{date}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
