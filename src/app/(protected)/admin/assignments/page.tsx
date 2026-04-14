"use client";

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/lib/i18n';
import { useAgriProfile } from '@/hooks/useAgriProfile';
import { 
  Users, 
  UserCheck, 
  Link, 
  Unlink, 
  Search, 
  ChevronRight,
  ShieldCheck,
  Briefcase,
  Layers
} from 'lucide-react';
import { getTenantAssignments, assignFarmerToTechnician, removeAssignment } from '@/lib/actions/tenant-assignments';

export default function AssignmentsPage() {
  const { tenant, loading: profileLoading } = useAgriProfile();
  const { language } = useI18n();
  const { toast } = useToast();

  const [data, setData] = useState<{ technicians: any[], farmers: any[], assignments: any[] }>({
    technicians: [],
    farmers: [],
    assignments: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [techSearch, setTechSearch] = useState('');
  const [farmerSearch, setFarmerSearch] = useState('');

  const fetchData = async () => {
    if (!tenant) return;
    setLoading(true);
    try {
      const res = await getTenantAssignments();
      setData(res);
      if (res.technicians.length > 0 && !selectedTech) {
        setSelectedTech(res.technicians[0].id);
      }
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenant]);

  const handleToggleAssignment = async (farmerId: string) => {
    if (!selectedTech) return;
    
    const existing = data.assignments.find(a => a.technician_id === selectedTech && a.farmer_id === farmerId);
    
    try {
      if (existing) {
        await removeAssignment(existing.id);
        toast(language === 'en' ? 'Assignment removed' : 'Asignación eliminada', 'success');
      } else {
        await assignFarmerToTechnician(selectedTech, farmerId);
        toast(language === 'en' ? 'Farmer assigned' : 'Agricultor asignado', 'success');
      }
      fetchData();
    } catch (e: any) {
      toast(e.message, 'error');
    }
  };

  const filteredTechs = data.technicians.filter(t => 
    `${t.first_name} ${t.last_name}`.toLowerCase().includes(techSearch.toLowerCase())
  );

  const filteredFarmers = data.farmers.filter(f => 
    `${f.first_name} ${f.last_name}`.toLowerCase().includes(farmerSearch.toLowerCase())
  );

  if (profileLoading) return <div className="p-8 animate-pulse text-white/20">Cargando mapa de técnicos...</div>;

  const currentTech = data.technicians.find(t => t.id === selectedTech);
  const assignedFarmerIds = data.assignments
    .filter(a => a.technician_id === selectedTech)
    .map(a => a.farmer_id);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-indigo-500/10 to-transparent p-8 rounded-3xl border border-indigo-500/10">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
             <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                <Layers size={32} />
             </div>
             {language === 'en' ? 'Technician Assignment' : 'Asignaciones de Técnicos'}
          </h1>
          <p className="text-white/60 font-medium ml-12">
            {language === 'en' ? 'Pair technical advisors with farm owners' : 'Control de supervisión y vinculación de técnicos con agricultores'}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[700px]">
         {/* Left: Technicians List */}
         <div className="lg:col-span-4 flex flex-col gap-4 overflow-hidden">
            <h3 className="text-[10px] font-black uppercase text-white/30 tracking-widest ml-2">Seleccionar Técnico</h3>
            <GlassCard className="flex-1 flex flex-col overflow-hidden">
               <div className="p-4 border-b border-white/5">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 w-3 h-3" />
                    <input 
                       type="text" 
                       placeholder="Buscar técnico..."
                       className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-8 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                       value={techSearch}
                       onChange={(e) => setTechSearch(e.target.value)}
                    />
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                  {filteredTechs.map((tech) => (
                    <button
                      key={tech.id}
                      onClick={() => setSelectedTech(tech.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
                        selectedTech === tech.id 
                          ? 'bg-indigo-500/20 border border-indigo-500/30' 
                          : 'bg-white/5 border border-transparent hover:bg-white/10'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                        selectedTech === tech.id ? 'bg-indigo-500/40 text-white' : 'bg-white/5 text-white/20'
                      }`}>
                         {tech.first_name[0]}{tech.last_name[0]}
                      </div>
                      <div className="text-left flex-1 min-w-0">
                         <p className="text-sm font-bold text-white truncate">{tech.first_name} {tech.last_name}</p>
                         <p className="text-[10px] text-white/40 truncate">{tech.email}</p>
                      </div>
                      {selectedTech === tech.id && <ChevronRight size={16} className="text-indigo-400" />}
                    </button>
                  ))}
                  {filteredTechs.length === 0 && (
                    <div className="py-20 text-center text-white/20 text-xs font-bold uppercase tracking-widest">Sin técnicos</div>
                  )}
               </div>
            </GlassCard>
         </div>

         {/* Right: Farmers Grid */}
         <div className="lg:col-span-8 flex flex-col gap-4 overflow-hidden">
            <div className="flex justify-between items-end px-2">
               <h3 className="text-[10px] font-black uppercase text-white/30 tracking-widest">
                  Agricultores asignados a <span className="text-indigo-400">{currentTech?.first_name}</span>
               </h3>
               <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 w-3 h-3" />
                  <input 
                     type="text" 
                     placeholder="Filtrar agricultores..."
                     className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-8 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                     value={farmerSearch}
                     onChange={(e) => setFarmerSearch(e.target.value)}
                  />
               </div>
            </div>

            <GlassCard className="flex-1 flex flex-col overflow-hidden p-6">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar">
                  {filteredFarmers.map((farmer) => {
                    const isAssigned = assignedFarmerIds.includes(farmer.id);
                    return (
                      <div 
                        key={farmer.id}
                        className={`flex items-center gap-4 p-4 rounded-3xl border transition-all ${
                          isAssigned 
                            ? 'bg-emerald-500/5 border-emerald-500/20' 
                            : 'bg-white/5 border-white/5'
                        }`}
                      >
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-colors ${
                           isAssigned ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/20'
                         }`}>
                           <Users size={20} />
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="font-bold text-white text-sm truncate">{farmer.first_name} {farmer.last_name}</p>
                           <p className="text-[10px] text-white/30 truncate uppercase tracking-tighter">{farmer.email}</p>
                         </div>
                         <button 
                           onClick={() => handleToggleAssignment(farmer.id)}
                           className={`p-3 rounded-2xl transition-all ${
                             isAssigned 
                               ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                               : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20'
                           }`}
                         >
                           {isAssigned ? <Unlink size={18} /> : <Link size={18} />}
                         </button>
                      </div>
                    );
                  })}
                  {filteredFarmers.length === 0 && (
                    <div className="col-span-full py-40 text-center">
                       <p className="text-white/20 font-black uppercase tracking-widest text-xs">No se han encontrado agricultores</p>
                    </div>
                  )}
               </div>
            </GlassCard>
            
            <div className="flex items-center gap-3 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
               <ShieldCheck size={20} className="text-indigo-400" />
               <p className="text-[10px] text-white/40 leading-relaxed italic">
                 Las asignaciones permiten que el técnico designado pueda visualizar y validar el cuaderno digital del agricultor vinculado, actuando bajo su supervisión.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
