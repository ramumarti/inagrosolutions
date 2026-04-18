"use client";

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/lib/i18n';
import { useAgriProfile } from '@/hooks/useAgriProfile';
import { 
  Users as UsersIcon, 
  Search as SearchIcon, 
  Map as MapIcon, 
  ChevronRight as ChevronIcon,
  Eye as EyeIcon,
  FileText as FileIcon,
  AlertTriangle as WarningIcon,
  CheckCircle as SuccessIcon,
  TrendingUp as TrendIcon,
  ExternalLink as LinkIcon,
  FileText
} from 'lucide-react';
import { getTenantFarmers } from '@/lib/actions/tenant-dashboard';
import Link from 'next/link';

export default function SupervisionPage() {
  const { tenant, loading: profileLoading } = useAgriProfile();
  const { language } = useI18n();
  const { toast } = useToast();

  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFarmers = async () => {
    if (!tenant) return;
    setLoading(true);
    try {
      const data = await getTenantFarmers();
      setFarmers(data || []);
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, [tenant]);

  const filtered = farmers.filter(f => 
    `${f.first_name} ${f.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (profileLoading) return <div className="p-8 animate-pulse text-white/20">Accediendo al registro de productores...</div>;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-emerald-500/10 to-transparent p-8 rounded-3xl border border-emerald-500/10">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
             <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
                <UsersIcon size={32} />
             </div>
             {language === 'en' ? 'Farmer Supervision' : 'Supervisión de Cuadernos'}
          </h1>
          <p className="text-white/60 font-medium ml-12">
             {language === 'en' ? 'Real-time monitoring of all network activity' : 'Monitoreo en tiempo real de actividades y cumplimiento de socios'}
          </p>
        </div>
      </header>

      {/* Search & Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
         <div className="relative w-full md:w-96">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
            <input 
              type="text" 
              placeholder={language === 'en' ? 'Search by name or email...' : 'Filtrar productores...'}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex gap-2">
            <GlassCard className="px-4 py-2 flex items-center gap-2 border-emerald-500/20">
               <TrendIcon size={14} className="text-emerald-400" />
               <span className="text-[10px] font-black text-white/60 uppercase">Volumen Total: {farmers.reduce((acc, f) => acc + (f.total_hectareas || 0), 0).toFixed(1)} ha</span>
            </GlassCard>
         </div>
      </div>

      {/* Grid of Farmers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filtered.map((farmer) => (
           <GlassCard key={farmer.id} className="group hover:border-emerald-500/30 transition-all duration-500 overflow-hidden">
              <div className="p-6 space-y-4">
                 <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                       <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-black text-white/20 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-all">
                          {farmer.first_name?.[0] || '?'}{farmer.last_name?.[0] || ''}
                       </div>
                       <div>
                          <p className="font-bold text-white leading-none mb-1">{farmer.first_name} {farmer.last_name}</p>
                          <p className="text-[10px] text-white/30 font-medium truncate max-w-[140px]">{farmer.email}</p>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <Link href={`/admin/supervision/${farmer.id}/report`}>
                          <button className="p-2 bg-white/5 rounded-xl text-white/40 hover:text-white hover:bg-emerald-500/20 hover:text-emerald-400 transition-all border border-transparent hover:border-emerald-500/20" title="Exportar SIEX Oficial">
                             <FileText size={18} />
                          </button>
                       </Link>
                       <Link href={`/admin/supervision/${farmer.id}`}>
                          <button className="p-2 bg-white/5 rounded-xl text-white/40 hover:text-white hover:bg-emerald-500/20 hover:text-emerald-400 transition-all border border-transparent hover:border-emerald-500/20">
                             <EyeIcon size={18} />
                          </button>
                       </Link>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                       <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Superficie</p>
                       <p className="text-lg font-black text-white">{farmer.total_hectareas || 0}<span className="text-[10px] font-medium text-white/30 ml-1">ha</span></p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                       <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Explotaciones</p>
                       <p className="text-lg font-black text-white">{farmer.explotaciones?.length || 0}</p>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Estado del Cuaderno</p>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400/80">
                       <SuccessIcon size={12} />
                       Cumplimiento SIEX 100%
                    </div>
                 </div>
              </div>

              <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex justify-between items-center group-hover:bg-emerald-500/5 transition-colors">
                 <div className="flex items-center gap-2">
                    <FileIcon size={12} className="text-white/20" />
                    <span className="text-[10px] font-bold text-white/40 uppercase">Último cambio: Hoy</span>
                 </div>
                 <ChevronIcon size={14} className="text-white/20 group-hover:translate-x-1 group-hover:text-emerald-400 transition-all" />
              </div>
           </GlassCard>
         ))}
         
         {loading && [1,2,3].map(i => (
            <GlassCard key={i} className="h-48 animate-pulse bg-white/5 border-white/5" />
         ))}
         
         {!loading && filtered.length === 0 && (
            <div className="col-span-full py-20 text-center">
               <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20 border border-white/5 mb-4">
                  <UsersIcon size={32} />
               </div>
               <p className="text-white/40 font-bold uppercase tracking-widest text-xs">No hay agricultores vinculados a tu cuenta</p>
            </div>
         )}
      </div>
      
      <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center gap-4">
         <WarningIcon size={24} className="text-amber-500 shrink-0" />
         <div className="space-y-1">
            <p className="text-sm font-bold text-white/80">Aviso Legal de Supervisión</p>
            <p className="text-xs text-white/40 leading-relaxed italic">
               Como administrador de la red, tienes permiso de lectura sobre los cuadernos digitales de tus socios para fines de asesoramiento y validación administrativa. Cualquier cambio estructural debe coordinarse con el titular de la explotación.
            </p>
         </div>
      </div>
    </div>
  );
}
