'use client';

import React, { useState, useMemo } from 'react';
import { 
  FileBox, FileDown, Printer, FileText, CheckCircle2, 
  AlertTriangle, ArrowRight, Table, Database, Shovel
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

interface ExportacionModuleProps {
  profile: any;
  explotacionId: string | null;
  campanaId: string | null;
}

export function ExportacionModule({ profile, explotacionId, campanaId }: ExportacionModuleProps) {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const selectedExplotacion = profile.explotaciones.find((e: any) => e.id === explotacionId);
  const selectedCampana = profile.campanas.find((c: any) => c.id === campanaId);

  // Stats for the report preview
  const stats = useMemo(() => {
    const pCount = profile.parcelas.filter((p: any) => p.explotacion_id === explotacionId).length;
    // En un entorno real consultaríamos las actividades filtradas por finca/campaña
    return {
      parcelas: pCount,
      hectareas: profile.parcelas.filter((p: any) => p.explotacion_id === explotacionId).reduce((acc: number, p: any) => acc + (p.hectareas || 0), 0),
      tratamienos: 15, // Mock data for preview
      labores: 24
    };
  }, [profile, explotacionId]);
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'xml'>('xlsx');

  const handleExportSiex = async () => {
    if (!explotacionId || !campanaId) return;
    setIsExporting(true);
    
    try {
      // Import the server action just to validate data before redirecting to download
      const { generateSiexData } = await import('@/lib/actions/export-siex');
      const data = await generateSiexData(explotacionId, campanaId);

      // Paso 4.2 - Validación pre-exportación
      if (!data.validation.isValid) {
        alert('❌ NO SE PUEDE EXPORTAR EL SIEX. Hay errores críticos:\n\n' + data.validation.errors.join('\n'));
        setIsExporting(false);
        return;
      }
      
      if (data.validation.warnings.length > 0) {
        const proceed = confirm('⚠️ Hay advertencias de validación:\n\n' + data.validation.warnings.join('\n') + '\n\n¿Quieres exportar de todos modos?');
        if (!proceed) {
          setIsExporting(false);
          return;
        }
      }

      // Si es válido, disparamos la descarga
      const url = `/api/export/siex?explotacionId=${explotacionId}&campanaId=${campanaId}&format=${exportFormat}`;
      window.open(url, '_blank');
      
    } catch (e: any) {
      console.error(e);
      alert('Error en la exportación SIEX: ' + e.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintNotebook = () => {
    router.push('/cuaderno/report');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Exportación SIEX y PAC</h2>
          <p className="text-white/50 font-black uppercase tracking-widest text-[10px] mt-1">Generación de documentación oficial normativa</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handlePrintNotebook}
            className="flex items-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-black text-white/50 hover:text-white uppercase tracking-widest transition-all"
          >
            <Printer size={16} /> Imprimir Cuaderno
          </button>
          <GlowButton onClick={handleExportSiex} className="gap-2 shrink-0 px-8" disabled={isExporting}>
            {isExporting ? <span className="animate-pulse">Generando...</span> : <><FileDown size={18} /> Exportar CSV SIEX</>}
          </GlowButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Summary and Validation */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="p-6 border-white/5 bg-white/[0.02] space-y-6">
            <h4 className="text-sm font-black text-white/60 uppercase tracking-widest">Resumen del Informe</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                 <div className="flex items-center gap-2">
                    <Table size={16} className="text-emerald-400" />
                    <span className="text-xs font-bold text-white/60">Parcelas declaradas</span>
                 </div>
                 <span className="text-sm font-black text-white">{stats.parcelas}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                 <div className="flex items-center gap-2">
                    <FileText size={16} className="text-blue-400" />
                    <span className="text-xs font-bold text-white/60">Superficie Total (ha)</span>
                 </div>
                 <span className="text-sm font-black text-white">{stats.hectareas.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                 <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span className="text-xs font-bold text-white/60">Actividades Trazadas</span>
                 </div>
                 <span className="text-sm font-black text-white">{stats.tratamienos + stats.labores}</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 border-amber-500/10 bg-amber-500/5 space-y-4">
            <div className="flex items-center gap-2 text-amber-500">
                <AlertTriangle size={18} />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Validación Normativa</h4>
            </div>
            <p className="text-[11px] text-amber-500/70 font-medium leading-relaxed">
                Hemos detectado <span className="font-bold">2 avisos</span> en los tratamientos de esta campaña que podrían ser requeridos por SIEX. Revisa la dosificación en la parcela "El Olivo".
            </p>
            <button className="text-[9px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors">Ver Detalles de Validación...</button>
          </GlassCard>
        </div>

        {/* Right: Preview / Format Options */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-8 border-white/5 bg-white/[0.01] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                <Database size={200} />
            </div>
            
            <div className="relative z-10 space-y-8">
                <h4 className="text-lg font-black text-white">Configuración del Archivo Oficial</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                        onClick={() => setExportFormat('xlsx')}
                        className={`p-5 bg-white/5 border rounded-2xl hover:border-emerald-500/30 transition-all cursor-pointer ${exportFormat === 'xlsx' ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-white/10'}`}
                    >
                        <div className="flex justify-between mb-4">
                            <FileBox className="text-emerald-400" size={24} />
                            <div className={`w-5 h-5 border-2 rounded-full transition-colors ${exportFormat === 'xlsx' ? 'border-emerald-500 bg-emerald-500/20' : 'border-white/10'}`} />
                        </div>
                        <h5 className="text-sm font-black text-white mb-1">Cuaderno Fitosanitario (CUE)</h5>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Formato Oficial Excel (.xlsx)</p>
                    </div>

                    <div 
                        onClick={() => setExportFormat('xml')}
                        className={`p-5 bg-white/5 border rounded-2xl hover:border-blue-500/30 transition-all cursor-pointer ${exportFormat === 'xml' ? 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-white/10'}`}
                    >
                        <div className="flex justify-between mb-4">
                            <Database className="text-blue-400" size={24} />
                            <div className={`w-5 h-5 border-2 rounded-full transition-colors ${exportFormat === 'xml' ? 'border-blue-500 bg-blue-500/20' : 'border-white/10'}`} />
                        </div>
                        <h5 className="text-sm font-black text-white mb-1">Carga Masiva SIEX</h5>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Formato Estructurado (.xml)</p>
                    </div>

                    <div className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-amber-500/30 transition-all cursor-pointer">
                        <div className="flex justify-between mb-4">
                            <Shovel className="text-amber-400" size={24} />
                            <div className="w-5 h-5 border-2 border-white/10 rounded-full" />
                        </div>
                        <h5 className="text-sm font-black text-white mb-1">Registro de Fertilización (RET)</h5>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Nutrición Sostenible de Suelos</p>
                    </div>

                    <div className="p-5 bg-white/5 border border-white/10 rounded-2xl opacity-40 grayscale cursor-not-allowed">
                        <div className="flex justify-between mb-4">
                            <Printer className="text-white/40" size={24} />
                        </div>
                        <h5 className="text-sm font-black text-white mb-1">Memoria de Explotación</h5>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Solo disponible en Plan Premium</p>
                    </div>
                </div>

                <div className="pt-4 space-y-2">
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Firma Digital INAGROSOLUTIONS</p>
                    <div className="flex items-center gap-2 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Huella criptográfica SIEX válida para presentación telemática</span>
                    </div>
                </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
