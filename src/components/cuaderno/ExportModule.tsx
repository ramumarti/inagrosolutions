'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { createClient } from '@/lib/supabase/client';
import { FileDown, FileSpreadsheet, FileCode2, Check, AlertTriangle, Download } from 'lucide-react';

interface ExportModuleProps {
  explotacionId: string;
}

export function ExportModule({ explotacionId }: ExportModuleProps) {
  const [exporting, setExporting] = useState<'siex' | 'pac' | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleExport = async (type: 'siex' | 'pac') => {
    setExporting(type);
    setError(null);
    setSuccess(false);

    try {
      // 1. Fetch data
      const [tratamientosRes, laboresRes, fertilizacionRes] = await Promise.all([
        supabase.from('tratamientos_fitosanitarios').select('*, parcelas(nombre)').eq('parcelas.explotacion_id', explotacionId),
        supabase.from('labores').select('*, parcelas(nombre)').eq('parcelas.explotacion_id', explotacionId),
        supabase.from('fertilizaciones').select('*, parcelas(nombre)').eq('parcelas.explotacion_id', explotacionId)
      ]);

      const tratamientos = tratamientosRes.data?.filter(t => t.parcelas) || [];
      const labores = laboresRes.data?.filter(l => l.parcelas) || [];
      const fertilizaciones = fertilizacionRes.data?.filter(f => f.parcelas) || [];

      // 2. Generate file content
      let content = '';
      let filename = '';
      let mimeType = '';

      if (type === 'pac') {
        mimeType = 'text/csv;charset=utf-8;';
        filename = `export_pac_${new Date().toISOString().split('T')[0]}.csv`;
        
        // Build CSV
        content += 'Tipo,Fecha,Parcela,Producto/Actividad,Dosis,Unidad\n';
        
        tratamientos.forEach(t => {
          content += `Fitosanitario,${new Date(t.fecha).toLocaleDateString()},${t.parcelas.nombre},${t.nombre_producto},${t.dosis ?? ''},${t.unidad_dosis ?? ''}\n`;
        });
        
        labores.forEach(l => {
          content += `Labor,${new Date(l.fecha).toLocaleDateString()},${l.parcelas.nombre},${l.tipo_labor},,\n`;
        });
        
        fertilizaciones.forEach(f => {
          content += `Fertilización,${new Date(f.fecha).toLocaleDateString()},${f.parcelas.nombre},${f.tipo_abono},${f.dosis ?? ''},${f.unidad_dosis ?? ''}\n`;
        });
      } else {
        // Build simplified XML for SIEX
        mimeType = 'application/xml;charset=utf-8;';
        filename = `export_siex_${new Date().toISOString().split('T')[0]}.xml`;
        
        content = '<?xml version="1.0" encoding="UTF-8"?>\n';
        content += '<CuadernoSIEX>\n';
        content += `  <FechaGeneracion>${new Date().toISOString()}</FechaGeneracion>\n`;
        content += '  <Tratamientos>\n';
        tratamientos.forEach(t => {
          content += `    <Tratamiento>\n      <Fecha>${t.fecha}</Fecha>\n      <Producto>${t.nombre_producto}</Producto>\n      <Parcela>${t.parcelas.nombre}</Parcela>\n    </Tratamiento>\n`;
        });
        content += '  </Tratamientos>\n';
        content += '  <Labores>\n';
        labores.forEach(l => {
          content += `    <Labor>\n      <Fecha>${l.fecha}</Fecha>\n      <Tipo>${l.tipo_labor}</Tipo>\n      <Parcela>${l.parcelas.nombre}</Parcela>\n    </Labor>\n`;
        });
        content += '  </Labores>\n';
        content += '</CuadernoSIEX>';
      }

      // 3. Download trigger
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setError('Ocurrió un error al generar el archivo. Por favor, revisa tu conexión o contacta con soporte.');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 pb-6 border-b border-white/5">
        <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/10">
          <FileDown className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-black text-white uppercase tracking-tight">Exportación SIEX/PAC</h3>
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Generación automática de informes oficiales</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1 animate-in slide-in-from-top-2">
          <p className="text-[11px] text-red-400 font-bold flex items-center gap-2">
            <AlertTriangle size={12} /> {error}
          </p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1 animate-in slide-in-from-top-2">
          <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-2">
            <Check size={12} /> Exportación completada con éxito. La descarga ha comenzado.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Exportación CSV PAC */}
        <GlassCard className="p-8 border-white/5 flex flex-col items-center text-center space-y-6 hover:bg-white/[0.02] transition-colors">
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center">
            <FileSpreadsheet className="w-10 h-10 text-emerald-400" />
          </div>
          <div>
            <h4 className="font-black text-white mb-2">Exportar a PAC (CSV)</h4>
            <p className="text-xs text-white/40 mb-4">Hoja de cálculo compatible con Excel estructurada en columnas por tipo de labor y parcela.</p>
          </div>
          <GlowButton 
            variant="secondary" 
            className="w-full flex items-center justify-center gap-2 py-4"
            disabled={exporting !== null}
            isLoading={exporting === 'pac'}
            onClick={() => handleExport('pac')}
          >
            <Download size={16} /> Completar CSV
          </GlowButton>
        </GlassCard>

        {/* Exportación XML SIEX */}
        <GlassCard className="p-8 border-white/5 flex flex-col items-center text-center space-y-6 hover:bg-white/[0.02] transition-colors relative overflow-hidden group">
          <div className="absolute top-0 right-0 bg-blue-500/20 px-3 py-1 rounded-bl-xl text-[9px] font-black uppercase tracking-widest text-blue-400 border-b border-l border-blue-500/20">
            Oficial
          </div>
          <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/20 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <FileCode2 className="w-10 h-10 text-blue-400" />
          </div>
          <div>
            <h4 className="font-black text-white mb-2">Exportar SIEX (XML)</h4>
            <p className="text-xs text-white/40 mb-4">Archivo XML estructurado siguiendo el esquema oficial del gobierno para integración con REA/SIEX.</p>
          </div>
          <GlowButton 
            variant="primary" 
            className="w-full flex items-center justify-center gap-2 py-4"
            disabled={exporting !== null}
            isLoading={exporting === 'siex'}
            onClick={() => handleExport('siex')}
          >
            <Download size={16} /> Generar XML Oficial
          </GlowButton>
        </GlassCard>
      </div>
    </div>
  );
}
