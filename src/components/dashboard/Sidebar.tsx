import React from 'react';
import { cn } from '@/lib/utils';
import { Hexagon, LayoutGrid, Languages, ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export function Sidebar({ isCollapsed, toggleCollapse }: SidebarProps) {
  const { t } = useI18n();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 bg-[var(--color-base-200)]/40 backdrop-blur-xl border-r border-white/10 transition-all duration-300 flex flex-col",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center h-16 px-4 border-b border-white/10 shrink-0 relative">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent-pink)] flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/20 shrink-0">
          <Hexagon className="w-5 h-5 text-white" />
        </div>
        {!isCollapsed && (
          <span className="ml-3 font-bold text-lg glow-text whitespace-nowrap overflow-hidden">
            {t('app.name')}
          </span>
        )}
        
        {/* Toggle Button */}
        <button
          onClick={toggleCollapse}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--color-base-300)] border border-white/10 flex items-center justify-center text-[color:var(--color-base-content)] hover:text-white hover:border-white/30 transition-colors z-50 shadow-md"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 py-6 px-3 flex flex-col gap-6 overflow-y-auto">
        <div className="flex flex-col gap-1">
          {!isCollapsed && (
            <div className="px-3 mb-2 text-xs font-semibold text-[color:var(--color-base-content)] opacity-50 uppercase tracking-wider">
              {t('dashboard.microApps')}
            </div>
          )}
          
          <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg bg-[var(--color-primary)]/10 text-[color:var(--color-primary)] border border-[var(--color-primary)]/20 transition-all hover:bg-[var(--color-primary)]/20">
            <Languages className="w-5 h-5 shrink-0" />
            {!isCollapsed && (
              <span className="font-medium whitespace-nowrap overflow-hidden">
                {t('dashboard.app1')}
              </span>
            )}
          </button>

          {/* Dummy extra nav item */}
          <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[color:var(--color-base-content)] opacity-70 hover:opacity-100 hover:bg-white/5 transition-all outline-transparent">
            <LayoutGrid className="w-5 h-5 shrink-0" />
            {!isCollapsed && (
              <span className="font-medium whitespace-nowrap overflow-hidden">
                Dashboard
              </span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
