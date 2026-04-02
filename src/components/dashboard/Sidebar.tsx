"use client";

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Hexagon, LayoutGrid, ChevronLeft, ChevronRight, Home, CreditCard, 
  Shield, Mail, Leaf, Bug, Droplets, MapPin, Wallet, Crown,
  BookOpen, FileDown, Bell
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  isMobileOpen?: boolean;
  closeMobile?: () => void;
}

export function Sidebar({ isCollapsed, toggleCollapse, isMobileOpen = false, closeMobile }: SidebarProps) {
  const { language, t } = useI18n();
  const supabase = createClient();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [cuadernoOpen, setCuadernoOpen] = useState(pathname.startsWith('/cuaderno'));

  useEffect(() => {
    let mounted = true;
    async function loadUserRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
        
      if (mounted && data?.role === 'admin') {
        setIsAdmin(true);
      }
    }
    loadUserRole();
    return () => { mounted = false; };
  }, [supabase]);

  useEffect(() => {
    if (pathname.startsWith('/cuaderno')) setCuadernoOpen(true);
  }, [pathname]);

  const navItems: Array<{ label: string; href: string; icon: any; isActive: boolean; isChild?: boolean; section?: string }> = [
    ...(isAdmin ? [
      {
        label: 'Administración',
        href: '/admin',
        icon: Shield,
        isActive: pathname === '/admin'
      },
      {
        label: 'Gestión de Emails',
        href: '/admin/email',
        icon: Mail,
        isActive: pathname.startsWith('/admin/email'),
        isChild: true
      }
    ] : [])
  ];

  // Cuaderno Digital section
  const cuadernoItems: Array<{ label: string; href: string; icon: any; isActive: boolean }> = [
    { label: language === 'en' ? 'Overview' : 'Panel', href: '/cuaderno', icon: BookOpen, isActive: pathname === '/cuaderno' },
    { label: language === 'en' ? 'Treatments' : 'Tratamientos', href: '/cuaderno', icon: Bug, isActive: false },
    { label: language === 'en' ? 'Tasks' : 'Labores', href: '/cuaderno', icon: Leaf, isActive: false },
    { label: language === 'en' ? 'Fertilization' : 'Fertilización', href: '/cuaderno', icon: Droplets, isActive: false },
    { label: language === 'en' ? 'Parcels' : 'Parcelas', href: '/cuaderno', icon: MapPin, isActive: false },
    { label: language === 'en' ? 'Export' : 'Exportación', href: '/cuaderno', icon: FileDown, isActive: false },
    { label: language === 'en' ? 'Plans' : 'Planes', href: '/cuaderno/planes', icon: Crown, isActive: pathname === '/cuaderno/planes' },
  ];

  const bottomNav: typeof navItems = [];



  const renderNavLink = (item: typeof navItems[0]) => (
    <Link 
      key={item.href + item.label} 
      href={item.href}
      className={cn(
        "group flex items-center gap-3 w-full rounded-lg transition-all active:scale-[0.98]",
        item.isChild && !isCollapsed ? "ml-4 pl-4 py-2 text-xs border-l border-white/10" : "px-3 py-2.5",
        item.isActive 
          ? "bg-[var(--color-primary)]/20 text-white shadow-inner border border-[var(--color-primary)]/30" 
          : "text-white/70 hover:text-white hover:bg-white/10 border border-transparent"
      )}
    >
      <item.icon className={cn(
        "shrink-0 transition-colors",
        item.isChild && !isCollapsed ? "w-4 h-4" : "w-5 h-5",
        item.isActive ? "text-white" : "text-white group-hover:text-[var(--color-primary)]"
      )} />
      {(!isCollapsed || isMobileOpen) && (
        <span className="font-medium whitespace-nowrap overflow-hidden text-sm">
          {item.label}
        </span>
      )}
    </Link>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] md:hidden animate-in fade-in duration-300"
          onClick={closeMobile}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-[var(--color-base-200)]/80 backdrop-blur-2xl border-r border-white/10 transition-all duration-300 flex flex-col",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center h-16 px-4 border-b border-white/10 shrink-0 relative">
          <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent-pink)] flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.5)] shrink-0">
            <Hexagon className="w-5 h-5 text-white" />
          </Link>
          {(!isCollapsed || isMobileOpen) && (
            <Link href="/dashboard" className="ml-3 font-bold text-lg glow-text whitespace-nowrap overflow-hidden">
              {t('app.name')}
            </Link>
          )}
          
          <button
            onClick={toggleCollapse}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--color-base-300)] border border-white/10 flex items-center justify-center text-[color:var(--color-base-content)] hover:text-white hover:border-white/30 transition-colors z-50 shadow-md hidden md:flex"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
          {/* Main nav */}
          {navItems.map(renderNavLink)}

          {/* Cuaderno Digital Section */}
          <div className="mt-2">
            <button
              onClick={() => setCuadernoOpen(!cuadernoOpen)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                pathname.startsWith('/cuaderno')
                  ? "bg-emerald-500/10 text-white border border-emerald-500/20"
                  : "text-white/70 hover:text-white hover:bg-white/10 border border-transparent"
              )}
            >
              <BookOpen className={cn("w-5 h-5 shrink-0", pathname.startsWith('/cuaderno') ? 'text-emerald-400' : 'text-white/50')} />
              {(!isCollapsed || isMobileOpen) && (
                <>
                  <span className="font-medium text-sm flex-1 text-left">Cuaderno Digital</span>
                  <ChevronRight className={cn("w-4 h-4 transition-transform text-white/30", cuadernoOpen && "rotate-90")} />
                </>
              )}
            </button>
            
            {cuadernoOpen && (!isCollapsed || isMobileOpen) && (
              <div className="ml-4 mt-1 space-y-0.5 pl-4 border-l border-white/5 animate-in slide-in-from-top-2 duration-200">
                {cuadernoItems.map(item => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-bold transition-all",
                      item.isActive
                        ? "text-emerald-400 bg-emerald-500/10"
                        : "text-white/30 hover:text-white/60 hover:bg-white/5"
                    )}
                  >
                    <item.icon size={14} />
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="my-4 border-t border-white/5" />

          {/* Bottom nav */}
          {bottomNav.map(renderNavLink)}
        </div>
      </aside>
    </>
  );
}
