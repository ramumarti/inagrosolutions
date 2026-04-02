"use client";

import React from 'react';
import { useI18n } from '@/lib/i18n';
import { UserPlus, CreditCard, Activity, Zap, ArrowRight, Clock } from 'lucide-react';

export interface ActivityItem {
  id: string;
  type: 'user' | 'payment' | 'execution';
  descriptionEn: string;
  descriptionEs: string;
  timestamp: string;
  iconType: 'user' | 'payment' | 'execution';
}

function timeAgo(dateStr: string, language: 'en' | 'es') {
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const min = Math.floor(diff / 60000);
  const hours = Math.floor(min / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return language === 'en' ? `${days}d ago` : `Hace ${days}d`;
  if (hours > 0) return language === 'en' ? `${hours}h ago` : `Hace ${hours}h`;
  if (min > 0) return language === 'en' ? `${min}m ago` : `Hace ${min}m`;
  return language === 'en' ? 'Just now' : 'Justo ahora';
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const { language } = useI18n();

  const getIcon = (type: string) => {
    switch (type) {
      case 'user': return <UserPlus className="w-5 h-5 text-blue-400" />;
      case 'payment': return <CreditCard className="w-5 h-5 text-blue-400" />;
      case 'execution': return <Zap className="w-5 h-5 text-amber-400" />;
      default: return <Activity className="w-5 h-5 text-white/50" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'user': return 'bg-blue-500/10 border-blue-500/20';
      case 'payment': return 'bg-blue-500/10 border-blue-500/20';
      case 'execution': return 'bg-amber-500/10 border-amber-500/20';
      default: return 'bg-white/5 border-white/10';
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-[var(--color-primary)]" />
          {language === 'en' ? 'Recent Activity' : 'Actividad Reciente'}
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {activities.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-white/30 italic backdrop-blur-md">
            {language === 'en' ? 'No recent activity yet.' : 'No hay actividad reciente aún.'}
          </div>
        ) : (
          activities.map((item) => (
            <div 
              key={item.id} 
              className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/[0.08] transition-all backdrop-blur-md group"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${getBg(item.iconType)} shrink-0 shadow-lg`}>
                {getIcon(item.iconType)}
              </div>
              
              <div className="flex-grow min-w-0">
                <p className="text-white font-medium text-sm sm:text-base truncate">
                  {language === 'en' ? item.descriptionEn : item.descriptionEs}
                </p>
                <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {timeAgo(item.timestamp, language as 'en' | 'es')}
                </p>
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                <ArrowRight className="w-4 h-4 text-white/30" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
