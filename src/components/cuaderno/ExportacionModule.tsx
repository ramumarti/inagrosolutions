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

  const handleExportSiex = async () => {
    if (!explotacionId || !campanaId) return;
    setIsExporting(true);
    
    try {
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
      
      const fileName = `SIEX_Export_${data.explotacion?.nombre || 'Finca'}_${new Date().getFullYear()}`;

      // Tratamientos Fitosanitarios
      const tratamientosData = data.tratamientos.map((t: any) => ({
        "ID_EXPLOTACION": data.explotacion?.nif_cif || '---',
        "FECHA_TRATAMIENTO": new Date(t.fecha).toLocaleDateString('es-ES'),
        "NUM_REGISTRO_MAPA": t.producto ? t.producto.match(/\\d{5}/)?.[0] || 'N/A' : 'N/A',
        "NOMBRE_PRODUCTO": t.producto,
        "METODO_APLICACION": t.metodo_aplicacion || 'Pulverización',
        "DOSIS_CANTIDAD": t.dosis_cantidad || 0,
        "DOSIS_UNIDAD": t.dosis_unidad || 'L/ha',
        "MAQUINARIA": t.maquinaria_id || 'Manual',
        "OPERARIO": t.operario_id || 'Propio titular',
        "PLAZO_SEGURIDAD": t.plazo_seguridad_dias || 0
      }));

      // Parcelas
      const parcelasData = data.parcelas.map((p: any) => ({
        "ID_EXPLOTACION": data.explotacion?.nif_cif || '---',
        "PROVINCIA": p.provincia || '00',
        "MUNICIPIO": p.municipio || '000',
        "POLIGONO": p.poligono || '0',
        "PARCELA": p.parcela || '0',
        "RECINTO": p.recinto || 1,
        "SUPERFICIE_HA": p.hectareas || 0,
        "CULTIVO_PRINCIPAL": p.cultivo || 'No especificado',
        "SISTEMA_EXPLOTACION": p.sistema_riego === 'Regadío' ? 'R' : 'S'
      }));

      const wb = XLSX.utils.book_new();
      const wsParcelas = XLSX.utils.json_to_sheet(parcelasData.length > 0 ? parcelasData : [{ "Mensaje": "Sin datos de parcelas" }]);
      const wsTratamientos = XLSX.utils.json_to_sheet(tratamientosData.length > 0 ? tratamientosData : [{ "Mensaje": "Sin tratamientos reportados" }]);

      XLSX.utils.book_append_sheet(wb, wsParcelas, "PARCELAS");
      XLSX.utils.book_append_sheet(wb, wsTratamientos, "TRATAMIENTOS");

      XLSX.writeFile(wb, `${fileName}.xlsx`, { bookType: 'xlsx' });
      
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
                    <div className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-emerald-500/30 transition-all cursor-pointer">
                        <div className="flex justify-between mb-4">
                            <FileBox className="text-emerald-400" size={24} />
                            <div className="w-5 h-5 border-2 border-white/10 rounded-full group-hover:border-emerald-500 transition-colors" />
                        </div>
                        <h5 className="text-sm font-black text-white mb-1">Cuaderno Fitosanitario (CUE)</h5>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Formato MAPA RD 1311/2012</p>
                    </div>

                    <div className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-blue-500/30 transition-all cursor-pointer">
                        <div className="flex justify-between mb-4">
                            <Database className="text-blue-400" size={24} />
                            <div className="w-5 h-5 border-2 border-white/10 rounded-full" />
                        </div>
                        <h5 className="text-sm font-black text-white mb-1">Carga Masiva SIEX</h5>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Formato CSV Delimitado por Comas</p>
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
