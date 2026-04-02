"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, 
  Settings, 
  Bell, 
  Database, 
  Map, 
  Lock, 
  ChevronRight, 
  CloudRain, 
  Tractor,
  Wifi,
  Package,
  History,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { Badge } from "@/components/ui/Badge";

export default function CuadernoAjustesPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState(true);
  const [offlineSync, setOfflineSync] = useState(true);

  const sections = [
    { 
      label: "Configuración del Olivar", 
      items: [
        { icon: <Map size={18} className="text-emerald-400" />, label: "Parcelas y Referencias SIGPAC", badge: "12" },
        { icon: <Package size={18} className="text-blue-400" />, label: "Productos Almacenados (Vademécum)" }
      ]
    },
    { 
      label: "Sistema y Sincronización", 
      items: [
        { icon: <Wifi size={18} className="text-amber-400" />, label: "Estado del Offline (Modo Campo)", toggle: true, state: offlineSync, onToggle: () => setOfflineSync(!offlineSync) },
        { icon: <Bell size={18} className="text-white/40" />, label: "Alertas PAC (Hitos Críticos)", toggle: true, state: notifications, onToggle: () => setNotifications(!notifications) },
        { icon: <Database size={18} className="text-indigo-400" />, label: "Respaldo y Exportación de Datos" }
      ]
    },
    { 
      label: "Seguridad y Accesos", 
      items: [
        { icon: <Lock size={18} className="text-rose-400" />, label: "Contraseña y Privacidad" },
        { icon: <ShieldCheck size={18} className="text-blue-500" />, label: "Firma Digital Colegiada", badge: "ACTIVA" }
      ]
    }
  ];

  return (
    <div className="max-w-lg mx-auto pb-40 px-4 sm:px-0 relative z-10 animate-in fade-in slide-in-from-right-4 duration-700">
      {/* Header */}
      <div className="flex items-center gap-4 pt-8 mb-10">
        <button 
          onClick={() => router.push('/cuaderno')}
          className="p-2.5 bg-white/5 rounded-2xl text-white/70 hover:bg-white/10 shadow-sm border border-white/10 transition-all active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
           <h1 className="text-2xl font-black text-white tracking-tight uppercase">Dashboard <span className="text-emerald-400">Settings</span></h1>
           <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] mt-1">Gestión del Cuaderno Digital</p>
        </div>
      </div>

       {/* User Info (Glow Style) */}
       <GlassCard className="p-8 mb-12 border-emerald-500/10 bg-emerald-500/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl font-black shadow-2xl">
                RM
             </div>
             <div>
                <h3 className="font-black text-white text-lg">Ramon Martin</h3>
                <div className="flex items-center gap-2 mt-1">
                   <Badge variant="premium" className="px-2 py-0.5 text-[7px] uppercase font-black bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Olivarero</Badge>
                   <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">ID: #AG-77421</span>
                </div>
             </div>
          </div>
          <button className="p-3 bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all">
             <ChevronRight size={20} />
          </button>
       </GlassCard>

      {/* Sections List */}
      <div className="space-y-12">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-4">
            <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.35em] px-2 mb-6">
              {section.label}
            </h3>
            
            <div className="bg-white/5 rounded-[40px] border border-white/10 shadow-2xl shadow-black/20 overflow-hidden divide-y divide-white/5">
              {section.items.map((item, iIdx) => (
                <div 
                  key={iIdx}
                  className="flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors group cursor-pointer"
                  onClick={(item as any).onToggle ? undefined : () => {}}
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl shadow-inner border border-white/5 group-hover:bg-white/10 transition-all">
                      {item.icon}
                    </div>
                    <span className="text-sm font-black text-white/70 group-hover:text-white transition-colors tracking-tight">
                      {item.label}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {(item as any).badge && (
                       <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-white/5 text-white/30 border border-white/10 uppercase tracking-widest leading-none">
                         {(item as any).badge}
                       </span>
                    )}
                    {(item as any).toggle ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); (item as any).onToggle?.(); }}
                        className={`w-14 h-8 rounded-full transition-all flex items-center p-1.5 shadow-inner ${(item as any).state ? 'bg-emerald-500' : 'bg-white/5 border border-white/10'}`}
                      >
                         <div className={`w-5 h-5 rounded-full bg-white shadow-xl transition-all ${(item as any).state ? 'translate-x-6 scale-110' : 'translate-x-0 opacity-20'}`} />
                      </button>
                    ) : (
                      <ChevronRight size={18} className="text-white/10 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Account Footer */}
      <div className="mt-16 text-center space-y-8">
         <div className="inline-flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] uppercase font-black text-white/30 tracking-widest animate-pulse">
            <CheckCircle2 size={12} className="text-emerald-400" /> Versión 2.6.4 (Core Build)
         </div>
         <p className="text-[10px] text-white/10 font-bold uppercase tracking-[0.2em] max-w-[200px] mx-auto">
            Todos los datos se sincronizan con los servidores de MAPA / SIEX cumpliendo con la normativa de privacidad agrícola.
         </p>
         <button className="text-rose-400/40 hover:text-rose-400 text-[10px] font-black uppercase tracking-widest transition-colors py-4">
            Cerrar Sesión Segura
         </button>
      </div>
    </div>
  );
}
