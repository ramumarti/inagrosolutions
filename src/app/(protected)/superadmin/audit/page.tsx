'use client';

import React, { useEffect, useState } from 'react';
import { fetchGlobalAuditLogs, getAuditLogDetail } from '@/lib/actions/superadmin';
import { GlassCard } from '@/components/ui/GlassCard';
import { ShieldCheck, History, User, Building, Search, FileJson, X, Globe, Fingerprint } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SuperadminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  useEffect(() => {
    fetchGlobalAuditLogs().then(data => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  const filtered = logs.filter(l => 
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.entity_type.toLowerCase().includes(search.toLowerCase()) ||
    (l.user?.first_name + ' ' + l.user?.last_name).toLowerCase().includes(search.toLowerCase()) ||
    l.tenant?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8 text-white/50 animate-pulse font-bold">Cargando logs de auditoría...</div>;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-black glow-text flex items-center gap-3">
            <History className="w-10 h-10 text-emerald-400" />
            Auditoría Global
          </h1>
          <p className="text-white/60 font-medium italic">Historial inmutable de cambios para cumplimiento SIEX y seguridad</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input 
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50"
            placeholder="Buscar por acción, usuario o tenant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <GlassCard className="border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/[0.02] border-b border-white/5 text-[10px] uppercase font-black tracking-widest text-white/30">
              <tr>
                <th className="px-6 py-4">Fecha y Hora</th>
                <th className="px-6 py-4">Acción</th>
                <th className="px-6 py-4">Entidad / ID</th>
                <th className="px-6 py-4">Usuario / Tenant</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-4 text-[11px] font-mono text-white/40">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest",
                      log.action === 'INSERT' ? "bg-emerald-500/10 text-emerald-400" :
                      log.action === 'UPDATE' ? "bg-blue-500/10 text-blue-400" :
                      "bg-red-500/10 text-red-400"
                    )}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                       <span className="text-xs font-bold text-white/80">{log.entity_type}</span>
                       <span className="text-[10px] font-mono text-white/20">{log.entity_id?.slice(0, 13)}...</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                       <div className="flex items-center gap-2">
                          <User size={10} className="text-white/20" />
                          <span className="text-xs font-bold text-white/80">{log.user?.first_name || 'Sistema'}</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <Building size={10} className="text-white/20" />
                          <span className="text-[10px] font-black text-white/30 truncate max-w-[150px] uppercase">{log.tenant?.name || 'InagroSolutions'}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedLog(log)}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/20 hover:text-white transition-all group-hover:scale-110 active:scale-95"
                    >
                       <FileJson size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* DETAIL MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 animate-in fade-in zoom-in duration-300">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedLog(null)} />
           <GlassCard className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative z-10 border-white/10 shadow-2xl">
              <header className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                 <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-white/5 text-emerald-400">
                       <Fingerprint size={24} />
                    </div>
                    <div>
                       <h2 className="text-xl font-bold text-white">Detalle de Operación</h2>
                       <p className="text-xs text-white/40 font-mono italic">Log ID: {selectedLog.id}</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors">
                    <X size={20} />
                 </button>
              </header>

              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div className="space-y-3">
                       <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest">Metadata</h3>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                             <p className="text-[9px] font-black text-white/40 uppercase mb-1">Acción</p>
                             <p className="text-sm font-bold text-white">{selectedLog.action}</p>
                          </div>
                          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                             <p className="text-[9px] font-black text-white/40 uppercase mb-1">Entidad</p>
                             <p className="text-sm font-bold text-white">{selectedLog.entity_type}</p>
                          </div>
                       </div>
                    </div>

                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-4">
                       <div className="flex items-center gap-3">
                          <Globe size={14} className="text-white/20" />
                          <div>
                             <p className="text-[9px] font-black text-white/40 uppercase">Dirección IP</p>
                             <p className="text-xs font-mono text-white/80">{selectedLog.ip_address || 'Proxy/Server Internal'}</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4 h-full flex flex-col">
                    <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest">Data Diff</h3>
                    <div className="flex-1 bg-[#050505] rounded-2xl border border-white/10 p-4 overflow-hidden flex flex-col">
                       <div className="flex-1 overflow-auto text-[11px] font-mono text-emerald-400/80">
                          <pre>{JSON.stringify({ 
                            old: selectedLog.old_data,
                            new: selectedLog.new_data 
                          }, null, 2)}</pre>
                       </div>
                    </div>
                 </div>
              </div>

              <footer className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-end">
                 <button onClick={() => setSelectedLog(null)} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all">
                    Cerrar Detalle
                 </button>
              </footer>
           </GlassCard>
        </div>
      )}
    </div>
  );
}
