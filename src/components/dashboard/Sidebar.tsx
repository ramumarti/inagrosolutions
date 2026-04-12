"use client";

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Hexagon, LayoutGrid, ChevronLeft, ChevronRight, Home, CreditCard, 
  Shield, Mail, Leaf, Bug, Droplets, MapPin, Wallet, Crown, 
  BookOpen, FileDown, Bell, Users, Building2, Scale, Package, FileJson, History
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/lib/auth/tenant-context';

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  isMobileOpen?: boolean;
  closeMobile?: () => void;
}

export function Sidebar({ isCollapsed, toggleCollapse, isMobileOpen = false, closeMobile }: SidebarProps) {
  const { language, t } = useI18n();
  const { user, hasRole, isSuperadmin, tenant } = useAuthContext();
  const pathname = usePathname();
  const [cuadernoOpen, setCuadernoOpen] = useState(pathname.startsWith('/cuaderno'));

  const handleExitImpersonation = async () => {
    try {
      const { switchContext } = await import('@/lib/actions/superadmin');
      const res = await switchContext(null); // Clear context
      if (res.success) {
        window.location.href = '/superadmin/tenants';
      }
    } catch (err) {
      console.error(err);
    }
  };

  const navItems: Array<{ label: string; href: string; icon: any; isActive: boolean; isChild?: boolean; section?: string }> = [
    ...(isSuperadmin ? [
      {
        label: 'Superadmin',
        href: '/superadmin',
        icon: Crown,
        isActive: pathname === '/superadmin'
      },
      {
        label: 'Entidades',
        href: '/superadmin/tenants',
        icon: Building2,
        isActive: pathname.startsWith('/superadmin/tenants')
      },
      {
        label: 'Usuarios',
        href: '/superadmin/users',
        icon: Users,
        isActive: pathname.startsWith('/superadmin/users')
      },
      {
        label: 'Planes',
        href: '/superadmin/plans',
        icon: CreditCard,
        isActive: pathname.startsWith('/superadmin/plans')
      },
      {
        label: 'CMS Landing',
        href: '/superadmin/landing',
        icon: LayoutGrid,
        isActive: pathname.startsWith('/superadmin/landing')
      },
      {
        label: 'Logs Auditoría',
        href: '/superadmin/audit',
        icon: History,
        isActive: pathname.startsWith('/superadmin/audit')
      },
      {
        label: 'Email',
        href: '/admin/email',
        icon: Mail,
        isActive: pathname.startsWith('/admin/email')
      },

      {
        label: 'Planes Sistema',
        href: '/admin/plans',
        icon: CreditCard,
        isActive: pathname.startsWith('/admin/plans')
      }
    ] : []),
    ...(hasRole(['tenant_admin']) && (!isSuperadmin || tenant) ? [
      {
        label: language === 'en' ? 'White Label Brand' : 'Mi Marca Blanca',
        href: '/admin/branding',
        icon: Hexagon,
        isActive: pathname === '/admin/branding'
      },
      {
        label: language === 'en' ? 'Company Overview' : 'Resumen Empresa',
        href: '/dashboard',
        icon: LayoutGrid,
        isActive: pathname === '/dashboard'
      },
      {
        label: language === 'en' ? 'Member Management' : 'Gestión de Socios',
        href: '/admin/members',
        icon: Users,
        isActive: pathname === '/admin/members'
      },
      {
        label: language === 'en' ? 'Revenue Sharing' : 'Facturación y Comisiones',
        href: '/admin/billing',
        icon: Wallet,
        isActive: pathname.startsWith('/admin/billing')
      }
    ] : []),
    ...(hasRole(['technician', 'tenant_admin']) && (!isSuperadmin || tenant) ? [
      {
        label: 'Técnico',
        href: '/technician',
        icon: BookOpen,
        isActive: pathname === '/technician'
      },
      {
        label: 'Mis Clientes',
        href: '/technician/farmers',
        icon: Users,
        isActive: pathname.startsWith('/technician/farmers')
      },
      {
        label: 'Tablero Tareas',
        href: '/technician/tasks',
        icon: Bell,
        isActive: pathname.startsWith('/technician/tasks')
      }
    ] : [])
  ];

  // Cuaderno Digital section
  const cuadernoItems: Array<{ label: string; href: string; icon: any; isActive: boolean }> = [
    { label: language === 'en' ? 'Overview' : 'Panel / Inicio', href: '/cuaderno', icon: BookOpen, isActive: pathname === '/cuaderno' },
    { label: language === 'en' ? 'Parcels' : 'Gestión de Parcelas', href: '/cuaderno', icon: MapPin, isActive: false },
    { label: language === 'en' ? 'Treatments' : 'Fitosanitarios', href: '/cuaderno', icon: Bug, isActive: false },
    { label: language === 'en' ? 'Inventory' : 'Almacén de Insumos', href: '/cuaderno/recursos', icon: Package, isActive: pathname === '/cuaderno/recursos' },
    { label: language === 'en' ? 'Fertilization' : 'Fertilización', href: '/cuaderno', icon: Droplets, isActive: false },
    { label: language === 'en' ? 'Agricultural Tasks' : 'Labores Agrícolas', href: '/cuaderno', icon: Leaf, isActive: false },
    { label: language === 'en' ? 'Plans' : 'Planes', href: '/cuaderno/planes', icon: Crown, isActive: pathname === '/cuaderno/planes' },
    { label: language === 'en' ? 'SIEX Registry' : 'Registro SIEX', href: '/cuaderno', icon: FileJson, isActive: false },
    { label: language === 'en' ? 'Export' : 'Exportación PAC', href: '/cuaderno', icon: FileDown, isActive: false },
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
          <Link href="/cuaderno" className="flex items-center group overflow-hidden w-full">
            <div className={cn(
              "w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--color-primary)] to-black/40 flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:scale-105",
              !tenant?.logo_url && "bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent-pink)]"
            )}>
              {tenant?.logo_url ? (
                <img 
                  src={tenant.logo_url} 
                  alt={tenant.name} 
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <Hexagon className="w-6 h-6 text-white" />
              )}
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <span className="ml-3 font-bold text-sm glow-text whitespace-nowrap overflow-hidden transition-all duration-300">
                {tenant?.name || t('app.name')}
              </span>
            )}
          </Link>
          
          <button
            onClick={toggleCollapse}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--color-base-300)] border border-white/10 flex items-center justify-center text-[color:var(--color-base-content)] hover:text-white hover:border-white/30 transition-colors z-50 shadow-md hidden md:flex"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
          {/* Impersonation Indicator */}
          {isSuperadmin && tenant && (
            <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 animate-pulse-subtle">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Manejando Entidad</span>
              </div>
              <div className="text-xs font-bold text-white truncate mb-2">{tenant.name}</div>
              <button 
                onClick={handleExitImpersonation}
                className="w-full py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 text-[10px] font-bold rounded-lg transition-all"
              >
                Salir de Gestión
              </button>
            </div>
          )}

          {/* Primary Business Navigation (Hiding others for clarity if admin) */}
          {navItems.map(renderNavLink)}

          {/* Only show Cuaderno Digital if NOT a tenant admin OR if is Superadmin */}
          {(!hasRole(['tenant_admin']) || isSuperadmin) && (
            <div className="mt-2">
              <button
                onClick={() => setCuadernoOpen(!cuadernoOpen)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                  pathname.startsWith('/cuaderno')
                    ? "bg-[var(--color-primary)]/10 text-white border border-[var(--color-primary)]/20"
                    : "text-white/70 hover:text-white hover:bg-white/10 border border-transparent"
                )}
              >
                <BookOpen className={cn("w-5 h-5 shrink-0", pathname.startsWith('/cuaderno') ? 'text-[var(--color-primary)]' : 'text-white/50')} />
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
                          ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10"
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
          )}

          {/* Separator */}
          <div className="my-4 border-t border-white/5" />

          {/* Bottom nav */}
          {bottomNav.map(renderNavLink)}
        </div>
      </aside>
    </>
  );
}
