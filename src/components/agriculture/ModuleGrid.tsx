"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Leaf, 
  Database, 
  BarChart3, 
  Smartphone, 
  ShieldCheck, 
  Tractor, 
  ClipboardCheck, 
  Lock,
  ArrowRight
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useSubscription, ModuleAccess } from '@/hooks/useSubscription';
import Link from 'next/link';

interface ModuleCardProps {
  title: string;
  description: string;
  icon: any;
  href: string;
  isLocked: boolean;
  color: string;
}

function ModuleCard({ title, description, icon: Icon, href, isLocked, color }: ModuleCardProps) {
  const content = (
    <GlassCard className={cn(
      "p-6 h-full transition-all group border-b-4 active:border-b-0 active:translate-y-1 relative overflow-hidden",
      isLocked 
        ? "opacity-50 grayscale hover:grayscale-0 cursor-not-allowed border-gray-500/10" 
        : cn("hover:bg-white/10 border-white/10 hover:border-emerald-500/30 cursor-pointer", color)
    )}>
      <div className="flex justify-between items-start mb-6">
        <div className={cn(
          "p-3.5 rounded-2xl shadow-lg border",
          isLocked ? "bg-gray-800 border-gray-700 text-gray-400" : "bg-emerald-600 border-emerald-500 text-white"
        )}>
          <Icon className="w-6 h-6" />
        </div>
        {isLocked && (
          <div className="bg-amber-500/20 text-amber-500 p-1.5 rounded-lg border border-amber-500/20">
            <Lock className="w-4 h-4" />
          </div>
        )}
      </div>

      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
        {title}
      </h3>
      <p className="text-white/40 text-xs leading-relaxed line-clamp-3">
        {description}
      </p>

      {!isLocked && (
        <div className="mt-6 flex items-center text-xs font-black text-emerald-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          Entrar ahora <ArrowRight className="w-3 h-3 ml-2" />
        </div>
      )}
      
      {isLocked && (
        <div className="mt-6 text-[10px] font-black text-amber-500 uppercase tracking-widest">
          Mejorar plan
        </div>
      )}
    </GlassCard>
  );

  return isLocked ? <Link href="/plans">{content}</Link> : <Link href={href}>{content}</Link>;
}

export function ModuleGrid() {
  const { access, loading } = useSubscription();

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-white/5 rounded-3xl" />)}
    </div>
  );

  const modules = [
    {
      title: "Cuaderno SIEX",
      description: "Generación automática del cuaderno de campo para inspecciones y trámites PAC.",
      icon: Database,
      href: "/cuaderno/ajustes",
      isLocked: !access.siex,
      color: "border-b-emerald-600"
    },
    {
      title: "Registro Tratamientos",
      description: "Buscador MAPA integrado. Registro de dosis, fechas y superficies tratadas.",
      icon: ShieldCheck,
      href: "/cuaderno/tratamientos",
      isLocked: !access.mapa,
      color: "border-b-green-600"
    },
    {
      title: "Control de Costes",
      description: "Analítica detallada de gastos en semillas, abonos, fitosanitarios y mano de obra.",
      icon: BarChart3,
      href: "/cuaderno/premium",
      isLocked: !access.costes,
      color: "border-b-amber-600"
    },
    {
      title: "Integración Sensores",
      description: "Monitorización en tiempo real de humedad, temperatura y humedad foliar.",
      icon: Smartphone,
      href: "/cuaderno/premium",
      isLocked: !access.sensores,
      color: "border-b-blue-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Leaf className="w-5 h-5 text-emerald-400" />
          Módulos Operativos
        </h2>
        <Link href="/cuaderno" className="text-xs font-bold text-white/40 hover:text-emerald-400 uppercase tracking-widest transition-colors">
          Ver todo el cuaderno
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {modules.map((mod, i) => (
          <ModuleCard key={i} {...mod} />
        ))}
      </div>
    </div>
  );
}
