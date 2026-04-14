"use client";

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/lib/i18n';
import { useAgriProfile } from '@/hooks/useAgriProfile';
import { 
  ShieldAlert, 
  Search, 
  History, 
  Eye, 
  User, 
  Calendar,
  Activity,
  Terminal,
  ArrowRight
} from 'lucide-react';
import { getTenantAuditLogs } from '@/lib/actions/tenant-dashboard';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Modal } from '@/components/ui/Modal';

export default function TenantAuditPage() {
  const { tenant, loading: profileLoading } = useAgriProfile();
  const { language } = useI18n();
  const { toast } = useToast();

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const fetchLogs = async () => {
    if (!tenant) return;
    setLoading(true);
    try {
      const data = await getTenantAuditLogs();
      setLogs(data || []);
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [tenant]);

  const filtered = logs.filter(l => 
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (profileLoading) return <div className="p-8 animate-pulse text-white/20">Cargando registros de auditoría...</div>;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-amber-500/10 to-transparent p-8 rounded-3xl border border-amber-500/10">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
             <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400">
                <ShieldAlert size={32} />
             </div>
             {language === 'en' ? 'Internal Audit' : 'Auditoría de Entidad'}
          </h1>
          <p className="text-white/60 font-medium ml-12">
            {language === 'en' ? 'Full traceability of all platform changes' : 'Trazabilidad completa de acciones y cambios en tu red'}
          </p>
        </div>
        <GlowButton onClick={fetchLogs} variant="secondary" className="px-5 py-3 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest">
           <Activity size={18} />
           {language === 'en' ? 'Refresh' : 'Refrescar'}
        </GlowButton>
      </header>

      {/* Main Content */}
      <GlassCard className="overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
              <input 
                type="text" 
                placeholder={language === 'en' ? 'Search by action or user...' : 'Buscar en el historial...'}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        <div className="overflow-x-auto h-[600px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-white/40 sticky top-0 bg-[#0a0a0a] z-10">
              <tr>
                <th className="px-6 py-5">Fecha y Hora</th>
                <th className="px-6 py-5">Usuario</th>
                <th className="px-6 py-5">Acción</th>
                <th className="px-6 py-5">Entidad</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-amber-500/[0.02] transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                       <p className="text-xs font-black text-white">{format(new Date(log.created_at), 'dd MMM yyyy', { locale: es })}</p>
                       <p className="text-[10px] font-medium text-white/30 uppercase tracking-tighter">{format(new Date(log.created_at), 'HH:mm:ss')}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20">
                          <User size={14} />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-white leading-none mb-1">{log.user?.first_name || 'Sistema'}</p>
                          <p className="text-[10px] text-white/30 font-medium truncate max-w-[150px]">{log.user?.email || 'automated@task'}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${
                       log.action.includes('delete') ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                       log.action.includes('create') ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                       'text-blue-400 bg-blue-500/10 border-blue-500/20'
                    }`}>
                       {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                       <Terminal size={12} className="text-amber-400" />
                       <span className="text-xs font-bold text-white">{log.entity_type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button onClick={() => setSelectedLog(log)} className="p-2 border border-white/5 bg-white/5 rounded-xl text-white/20 hover:text-white hover:bg-white/10 transition-colors">
                       <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {loading && <div className="p-20 text-center animate-pulse text-white/20 font-black uppercase tracking-widest text-xs">Escaneando transacciones...</div>}
          {!loading && filtered.length === 0 && (
            <div className="p-20 text-center space-y-4">
               <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
                 <History size={32} />
               </div>
               <p className="text-white/40 font-medium">No se han encontrado registros en este periodo.</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Details Modal */}
      <Modal 
        isOpen={!!selectedLog} 
        onClose={() => setSelectedLog(null)} 
        title="Detalles de la Acción"
      >
        {selectedLog && (
          <div className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                   <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Acción</p>
                   <p className="text-sm font-bold text-amber-400 uppercase">{selectedLog.action}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                   <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Entidad</p>
                   <p className="text-sm font-bold text-white uppercase">{selectedLog.entity_type}</p>
                </div>
             </div>

             <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Cambios (Diff JSON)</p>
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                   {selectedLog.old_data && (
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-red-400/60 uppercase">Dato Anterior:</p>
                        <pre className="text-[10px] bg-red-500/5 text-red-200/60 p-3 rounded-xl border border-red-500/10 overflow-x-auto whitespace-pre-wrap">
                           {JSON.stringify(selectedLog.old_data, null, 2)}
                        </pre>
                     </div>
                   )}
                   <div className="flex justify-center py-2 opacity-20">
                      <ArrowRight size={20} className="text-white" />
                   </div>
                   {selectedLog.new_data && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-emerald-400/60 uppercase">Dato Nuevo:</p>
                        <pre className="text-[10px] bg-emerald-500/5 text-emerald-200/60 p-3 rounded-xl border border-emerald-500/10 overflow-x-auto whitespace-pre-wrap">
                           {JSON.stringify(selectedLog.new_data, null, 2)}
                        </pre>
                     </div>
                   )}
                </div>
             </div>

             <GlowButton className="w-full py-4 text-xs font-black uppercase tracking-widest" onClick={() => setSelectedLog(null)}>
                Cerrar Visor
             </GlowButton>
          </div>
        )}
      </Modal>
    </div>
  );
}
