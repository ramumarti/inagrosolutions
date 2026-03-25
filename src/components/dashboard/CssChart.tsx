import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';

export function BarChart({ title, data }: { title: string, data: { label: string, value: number, max: number }[] }) {
  return (
    <GlassCard className="p-6 w-full max-w-none flex flex-col gap-6">
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <div className="flex items-end justify-between h-48 gap-2 mt-auto">
        {data.map((item, i) => {
          const height = `${(item.value / item.max) * 100}%`;
          return (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
              <div className="w-full relative bg-white/5 rounded-t-sm h-full flex items-end overflow-hidden">
                <div 
                  className="w-full bg-gradient-to-t from-[var(--color-primary)] to-[var(--color-accent-pink)] transition-all duration-1000 ease-out group-hover:opacity-80"
                  style={{ height }}
                />
              </div>
              <span className="text-xs text-[color:var(--color-base-content)] opacity-50 truncate w-full text-center">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

export function LineChart({ title, dataPoints }: { title: string, dataPoints: number[] }) {
  const max = Math.max(...dataPoints);
  const min = Math.min(...dataPoints);
  const range = max - min || 1;
  
  const points = dataPoints.map((val, i) => {
    const x = (i / (dataPoints.length - 1)) * 100;
    const y = 100 - (((val - min) / range) * 100);
    return `${x},${y}`;
  });

  return (
    <GlassCard className="p-6 w-full max-w-none flex flex-col gap-6">
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <div className="w-full h-48 relative mt-auto">
        <svg viewBox="0 0 100 100" className="w-full h-full preserve-3d overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="100%" stopColor="var(--color-accent-warm)" />
            </linearGradient>
            <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline
            points={`0,100 ${points.join(' ')} 100,100`}
            fill="url(#area-gradient)"
          />
          <polyline
            points={points.join(' ')}
            fill="none"
            stroke="url(#line-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_8px_rgba(124,58,237,0.5)]"
          />
        </svg>
      </div>
    </GlassCard>
  );
}
