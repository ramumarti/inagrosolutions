'use client';

import React, { useState } from 'react';
import { 
  X, Search, Download, AlertCircle, 
  CheckCircle2, Loader2, FileSpreadsheet, MapPin
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { importFromSigpac } from '@/lib/actions/agricultural';

interface MassSigpacImporterProps {
  explotacionId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function MassSigpacImporter({ explotacionId, onClose, onSuccess }: MassSigpacImporterProps) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{ref: string, status: 'success' | 'error', message?: string}[]>([]);

  const handleProcess = async () => {
    const refs = input.split(/[\n,;]+/).map(r => r.trim()).filter(r => r.length > 5);
    if (refs.length === 0) return;

    setIsProcessing(true);
    const newResults: typeof results = [];

    for (const ref of refs) {
      try {
        // En un entorno real, esto se haría en lote en el servidor, 
        // pero para el MVP procesamos uno a uno con feedback visual.
        await importFromSigpac(ref); 
        newResults.push({ ref, status: 'success' });
      } catch (err: any) {
        newResults.push({ ref, status: 'error', message: err.message || 'Error desconocido' });
      }
    }

    setResults(newResults);
    setIsProcessing(false);
    if (newResults.some(r => r.status === 'success')) {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <GlassCard className="max-w-2xl w-full relative p-8 border-white/10 overflow-hidden">
        <button onClick={onClose} className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/10 text-emerald-400">
            <Download size={28} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Importación Masiva SIGPAC</h3>
            <p className="text-xs font-black text-white/30 uppercase tracking-widest">Ahorra tiempo sincronizando tus parcelas oficiales</p>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-white/40 tracking-widest ml-1">Referencias SIGPAC (Una por línea o separadas por comas)</label>
              <textarea 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none focus:border-emerald-500/50 transition-all font-mono min-h-[200px]"
                placeholder="Ej: 23;45;0;0;12;1&#10;14;122;0;0;4;12"
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <p className="text-[10px] text-white/20 font-medium italic mt-2">Formato: Provincia;Municipio;Agregado;Zona;Polígono;Parcela</p>
            </div>

            <div className="flex justify-between items-center pt-4">
              <div className="flex items-center gap-4 opacity-40">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-white"><MapPin size={12} /> Geometría Auto</div>
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-white"><CheckCircle2 size={12} /> Validación MAPA</div>
              </div>
              <div className="flex gap-3">
                <button className="px-6 py-3 text-sm font-bold text-white/40" onClick={onClose}>Cancelar</button>
                <GlowButton 
                  onClick={handleProcess}
                  disabled={isProcessing || !input.trim()}
                  className="px-8"
                >
                  {isProcessing ? <Loader2 className="animate-spin" /> : 'Procesar Lista'}
                </GlowButton>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-white/5 rounded-2xl p-4 max-h-[300px] overflow-y-auto space-y-2 scrollbar-none">
              {results.map((res, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    {res.status === 'success' ? <CheckCircle2 className="text-emerald-400" size={16} /> : <AlertCircle className="text-red-400" size={16} />}
                    <span className="text-xs font-mono text-white/80">{res.ref}</span>
                  </div>
                  <span className={`text-[10px] font-black uppercase ${res.status === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {res.status === 'success' ? 'Importado' : 'Error'}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-4">
              <GlowButton onClick={onClose} className="px-12 py-4">Volver al Panel</GlowButton>
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-amber-500/5 rounded-xl border border-amber-500/10 flex items-start gap-3">
            <AlertCircle className="text-amber-500 shrink-0" size={18} />
            <p className="text-[10px] text-amber-500/70 font-medium leading-relaxed">
                Este proceso consulta los servidores oficiales del Ministerio. Dependiendo de la cantidad de referencias, puede tardar unos segundos. Se creará una parcela por cada recinto detectado.
            </p>
        </div>
      </GlassCard>
    </div>
  );
}
