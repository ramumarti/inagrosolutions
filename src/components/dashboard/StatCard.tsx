import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: number;
  trendText?: string;
  className?: string;
}

export function StatCard({ title, value, icon, trend, trendText, className }: StatCardProps) {
  const isPositive = trend && trend >= 0;

  return (
    <GlassCard className={cn("p-6 flex flex-col gap-4 w-full max-w-none hover:bg-white/[0.05] transition-colors", className)}>
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-[color:var(--color-base-content)] opacity-70">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-white tracking-tight">
            {value}
          </h3>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[color:var(--color-primary)]">
          {icon}
        </div>
      </div>
      
      {trend !== undefined && (
        <div className="flex items-center gap-2 mt-2">
          <div className={cn(
            "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
            isPositive ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400"
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
          {trendText && (
            <span className="text-xs text-[color:var(--color-base-content)] opacity-50">
              {trendText}
            </span>
          )}
        </div>
      )}
    </GlassCard>
  );
}
