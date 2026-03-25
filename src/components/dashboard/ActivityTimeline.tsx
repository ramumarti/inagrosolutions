import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { User, Activity, CheckCircle, Database } from 'lucide-react';

interface TimelineItem {
  id: string;
  content: string;
  time: string;
  iconType: 'user' | 'server' | 'database';
}

export function ActivityTimeline({ title, items }: { title: string, items: TimelineItem[] }) {
  const getIcon = (type: string) => {
    switch(type) {
      case 'user': return <User className="w-4 h-4 text-white" />;
      case 'server': return <CheckCircle className="w-4 h-4 text-white" />;
      case 'database': return <Database className="w-4 h-4 text-white" />;
      default: return <Activity className="w-4 h-4 text-white" />;
    }
  };

  const getColor = (type: string) => {
    switch(type) {
      case 'user': return 'from-[var(--color-primary)] to-[var(--color-accent-blue)]';
      case 'server': return 'from-green-500 to-emerald-400';
      case 'database': return 'from-[var(--color-accent-pink)] to-[var(--color-accent-warm)]';
      default: return 'from-gray-500 to-gray-400';
    }
  };

  return (
    <GlassCard className="p-6 w-full max-w-none flex flex-col h-full">
      <h3 className="text-lg font-bold text-white mb-6">{title}</h3>
      <div className="flex flex-col gap-6">
        {items.map((item, index) => (
          <div key={item.id} className="flex gap-4 relative">
            {index !== items.length - 1 && (
              <div className="absolute left-4 top-8 bottom-[-24px] w-px bg-white/10" />
            )}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br ${getColor(item.iconType)} shadow-lg z-10`}>
              {getIcon(item.iconType)}
            </div>
            <div className="flex flex-col pt-1">
              <p className="text-sm font-medium text-white">{item.content}</p>
              <span className="text-xs text-[color:var(--color-base-content)] opacity-50 mt-1">{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
