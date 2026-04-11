'use client';

import React, { useEffect, useState } from 'react';
import { getGlobalAuditLogs } from '@/lib/actions/superadmin';
import { GlassCard } from '@/components/ui/GlassCard';
import { ShieldCheck, History, User, Building, Search, FileJson } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SuperadminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getGlobalAuditLogs().then(data => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  const filtered = logs.filter(l => 
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.entity_type.toLowerCase().includes(search.toLowerCase()) ||
    (l.user?.first_name + ' ' + l.user?.last_name).toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8 text-white/50 animate-pulse font-bold">Cargando logs de auditoría...</div>;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
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
            placeholder="Buscar acción, usuario, entidad..."
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
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Entidad Afectada</th>
                <th className="px-6 py-4 text-right">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
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
                    <div className="flex items-center gap-2">
                       <User size={12} className="text-white/20" />
                       <span className="text-xs font-bold text-white/80">{log.user?.first_name || 'Sistema'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{log.entity_type}</span>
                       <span className="text-[10px] font-mono text-white/20">{log.entity_id.slice(0, 8)}...</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-white/10 rounded-lg text-white/20 hover:text-white transition-all">
                       <FileJson size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
