"use client";

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Hexagon, LayoutGrid, ChevronLeft, ChevronRight, Home, CreditCard, Shield, Mail, Leaf } from 'lucide-react';
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

  const navItems: Array<{ label: string; href: string; icon: any; isActive: boolean; isChild?: boolean }> = [
    {
      label: language === 'en' ? 'Dashboard' : 'Dashboard',
      href: '/dashboard',
      icon: Home,
      isActive: pathname === '/dashboard'
    },
    {
      label: language === 'en' ? 'Micro Apps' : 'Micro Apps',
      href: '/apps',
      icon: LayoutGrid,
      isActive: pathname.startsWith('/apps')
    },
    {
      label: language === 'en' ? 'Digital Notebook' : 'Cuaderno Digital',
      href: '/cuaderno',
      icon: Leaf,
      isActive: pathname.startsWith('/cuaderno')
    },
    {
      label: language === 'en' ? 'Plans' : 'Planes',
      href: '/plans',
      icon: CreditCard,
      isActive: pathname.startsWith('/plans')
    }
  ];

  if (isAdmin) {
    navItems.push(
      {
        label: language === 'en' ? 'Admin' : 'Admin',
        href: '/admin',
        icon: Shield,
        isActive: pathname === '/admin'
      },
      {
        label: language === 'en' ? 'Email' : 'Email',
        href: '/admin/email',
        icon: Mail,
        isActive: pathname.startsWith('/admin/email'),
        isChild: true
      }
    );
  }

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

        <div className="flex-1 py-6 px-3 flex flex-col gap-6 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 w-full rounded-lg transition-all active:scale-[0.98]",
                  (item as any).isChild && !isCollapsed ? "ml-4 pl-4 py-2 text-xs border-l border-white/10" : "px-3 py-2.5",
                  item.isActive 
                    ? "bg-[var(--color-primary)]/20 text-white shadow-inner border border-[var(--color-primary)]/30" 
                    : "text-white/70 hover:text-white hover:bg-white/10 border border-transparent"
                )}
              >
                <item.icon className={cn(
                  "shrink-0 transition-colors",
                  (item as any).isChild && !isCollapsed ? "w-4 h-4" : "w-5 h-5",
                  item.isActive ? "text-white" : "text-white group-hover:text-[var(--color-primary)]"
                )} />
                {(!isCollapsed || isMobileOpen) && (
                  <span className="font-medium whitespace-nowrap overflow-hidden text-sm">
                    {item.label}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
