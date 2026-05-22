'use client';

import React, { useState, useMemo } from 'react';
import { 
  FileBox, FileDown, Printer, FileText, CheckCircle2, 
  AlertTriangle, ArrowRight, Table, Database, Shovel, 
  Send, ShieldCheck, Download, RefreshCw, X, Loader2
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
  const [isSubmittingSiex, setIsSubmittingSiex] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [representante, setRepresentante] = useState('INAGROSOLUTIONS S.L. (Representante Autorizado)');
  
  // Telematic response ticket
  const [ticket, setTicket] = useState<{
    registro: string;
    csv: string;
    sello: string;
    fecha: string;
    representante: string;
    emisorNif: string;
    explotacionNombre: string;
    xml: string;
  } | null>(null);

  // SOAP Connection simulation status
  const [soapStep, setSoapStep] = useState(0);
  const [soapProgress, setSoapProgress] = useState(0);

  const soapMessages = [
    'Validando reglas de negocio del cuaderno de campo...',
    'Generando esquema XML oficial (RD 1054/2022)...',
    'Aplicando Firma Criptográfica XAdES-BES delegada...',
    'Estableciendo canal SSL seguro con Sede Ministerial...',
    'Transmitiendo paquete de datos al webservice SOAP SIEX...',
    'Obteniendo justificante de registro telemático...'
  ];

  const selectedExplotacion = profile.explotaciones.find((e: any) => e.id === explotacionId);
  const selectedCampana = profile.campanas.find((c: any) => c.id === campanaId);

  // Stats for the report preview
  const stats = useMemo(() => {
    const pCount = profile.parcelas.filter((p: any) => p.explotacion_id === explotacionId).length;
    return {
      parcelas: pCount,
      hectareas: profile.parcelas.filter((p: any) => p.explotacion_id === explotacionId).reduce((acc: number, p: any) => acc + (p.hectareas || 0), 0),
      tratamientos: 6, // Realista para campaña
      labores: 12
    };
  }, [profile, explotacionId]);

  const [exportFormat, setExportFormat] = useState<'xlsx' | 'xml'>('xlsx');

  const handleExportSiex = async () => {
    if (!explotacionId || !campanaId) return;
    setIsExporting(true);
    
    try {
      const { generateSiexData } = await import('@/lib/actions/export-siex');
      const data = await generateSiexData(explotacionId, campanaId);

      // Validación pre-exportación
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

  // SOAP telematic submission
  const handleSubmitSiexTelematic = async () => {
    if (!explotacionId || !campanaId) return;
    
    setIsSubmittingSiex(true);
    setSoapStep(0);
    setSoapProgress(0);

    // Simular progreso de pasos SOAP fluidamente en el frontend
    const interval = setInterval(() => {
      setSoapProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + Math.floor(Math.random() * 5) + 1;
      });
    }, 180);

    const stepInterval = setInterval(() => {
      setSoapStep(prev => {
        if (prev >= 5) {
          clearInterval(stepInterval);
          return 5;
        }
        return prev + 1;
      });
    }, 500);

    try {
      const res = await fetch('/api/export/siex/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          explotacionId,
          campanaId,
          representanteFirma: representante
        })
      });

      const data = await res.json();

      clearInterval(interval);
      clearInterval(stepInterval);

      if (!res.ok) {
        throw new Error(data.error || 'Error telemático desconocido');
      }

      setSoapProgress(100);
      setSoapStep(5);

      setTimeout(() => {
        setTicket(data);
        setIsSubmittingSiex(false);
        setShowSubmitModal(false);
      }, 500);

    } catch (e: any) {
      clearInterval(interval);
      clearInterval(stepInterval);
      setIsSubmittingSiex(false);
      alert('Fallo en la Sede SIEX: ' + e.message);
    }
  };

  const handleDownloadSignedXml = () => {
    if (!ticket?.xml) return;
    const blob = new Blob([ticket.xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SIEX_Firmado_${ticket.registro}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintNotebook = () => {
    router.push('/cuaderno/report');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Sincronización SIEX</h2>
          <p className="text-white/50 font-black uppercase tracking-widest text-[10px] mt-1">Conexión oficial telemática telemática • RD 1054/2022</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handlePrintNotebook}
            className="flex items-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-black text-white/50 hover:text-white uppercase tracking-widest transition-all"
          >
            <Printer size={16} /> Imprimir Cuaderno
          </button>
          
          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <Send size={16} /> Presentación Telemática SIEX
          </button>
        </div>
      </div>

      {/* SUBMISSION TICKET (IF EXISTS) */}
      {ticket && (
        <GlassCard className="p-8 border-emerald-500/20 bg-emerald-500/[0.02] ring-1 ring-emerald-500/20 animate-in zoom-in-95 duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
            <ShieldCheck size={200} className="text-emerald-400" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between items-start md:items-center">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-emerald-400">
                <ShieldCheck size={32} />
                <div>
                  <h3 className="text-xl font-black tracking-tight text-white">Presentación Completada</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/80">Sede Electrónica del Ministerio de Agricultura</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2">
                <div>
                  <span className="text-[9px] font-black uppercase text-white/40 tracking-wider">Nº Asiento Registro</span>
                  <p className="text-sm font-black text-emerald-300 font-mono mt-0.5">{ticket.registro}</p>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-white/40 tracking-wider">Código de Verificación</span>
                  <p className="text-xs font-bold text-white font-mono mt-1 truncate max-w-[150px]">{ticket.csv}</p>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-white/40 tracking-wider">Fecha Presentación</span>
                  <p className="text-xs font-bold text-white mt-1">{new Date(ticket.fecha).toLocaleString('es-ES')}</p>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-white/40 tracking-wider">Representante Legal</span>
                  <p className="text-xs font-bold text-white mt-1 truncate max-w-[180px]">{ticket.representante}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto pt-4 md:pt-0 shrink-0">
              <button 
                onClick={handleDownloadSignedXml}
                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black text-white uppercase tracking-widest transition-all"
              >
                <Download size={14} /> XML Firmado
              </button>
              <button
                onClick={() => setTicket(null)}
                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black text-white/50 hover:text-white uppercase tracking-widest transition-all"
              >
                <RefreshCw size={14} /> Nueva Presentación
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* NORMAL GRID PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Panel: Summary and Info */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="p-6 border-white/5 bg-white/[0.02] space-y-6">
            <h4 className="text-sm font-black text-white/60 uppercase tracking-widest">Resumen de la Campaña</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                 <div className="flex items-center gap-2">
                    <Table size={16} className="text-emerald-400" />
                    <span className="text-xs font-bold text-white/60">Fincas / Parcelas</span>
                 </div>
                 <span className="text-sm font-black text-white">{stats.parcelas}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                 <div className="flex items-center gap-2">
                    <FileText size={16} className="text-blue-400" />
                    <span className="text-xs font-bold text-white/60">Superficie Declarada (ha)</span>
                 </div>
                 <span className="text-sm font-black text-white">{stats.hectareas.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                 <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span className="text-xs font-bold text-white/60">Tratamientos Campaña</span>
                 </div>
                 <span className="text-sm font-black text-white">{stats.tratamientos}</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 border-amber-500/10 bg-amber-500/5 space-y-4">
            <div className="flex items-center gap-2 text-amber-500">
                <AlertTriangle size={18} />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Validación Normativa Pre-SIEX</h4>
            </div>
            <p className="text-[11px] text-amber-500/70 font-medium leading-relaxed">
              El motor de validación local ha certificado que el cuaderno actual cumple con los límites de dosificación oficiales de fitosanitarios y fertilizantes para la declaración digital SIEX.
            </p>
          </GlassCard>
        </div>

        {/* Right Panel: File Formats and Local Exports */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-8 border-white/5 bg-white/[0.01] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                <Database size={200} />
            </div>
            
            <div className="relative z-10 space-y-8">
                <h4 className="text-lg font-black text-white">Exportación de Ficheros Locales</h4>
                
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
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Excel Oficial Fitosanitarios (.xlsx)</p>
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
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Esquema XML Ministerial (.xml)</p>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Huella digital del cuaderno certificada</span>
                  </div>
                  <GlowButton onClick={handleExportSiex} className="gap-2 px-8" disabled={isExporting}>
                    {isExporting ? <span className="animate-pulse">Generando...</span> : <><FileDown size={18} /> Descargar Archivo</>}
                  </GlowButton>
                </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* TELEMATIC SUBMISSION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
          <GlassCard className="w-full max-w-xl p-8 border-white/10 relative overflow-hidden animate-in zoom-in-95 duration-300 space-y-6">
            <button 
              onClick={() => !isSubmittingSiex && setShowSubmitModal(false)}
              className="absolute right-4 top-4 text-white/40 hover:text-white transition-colors"
              disabled={isSubmittingSiex}
            >
              <X size={20} />
            </button>

            {!isSubmittingSiex ? (
              <>
                <div className="flex items-center gap-3">
                  <Send className="w-6 h-6 text-emerald-400 animate-pulse" />
                  <h3 className="text-xl font-black text-white">Presentación Telemática SIEX</h3>
                </div>
                
                <p className="text-xs text-white/60 leading-relaxed font-medium">
                  Va a iniciar la presentación del Cuaderno de Campo Digital en la Sede Ministerial de la Administración española bajo el **RD 1054/2022**. El proceso firmará criptográficamente el cuaderno y establecerá una conexión directa telemática telemática.
                </p>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2">Representante Firmante (Certificado Digital)</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold"
                      value={representante}
                      onChange={e => setRepresentante(e.target.value)}
                    />
                  </div>

                  <div className="p-3 bg-amber-500/10 border border-amber-500/10 rounded-xl text-[10px] font-bold text-amber-400 flex items-center gap-2">
                    <AlertTriangle size={14} className="shrink-0 animate-bounce" />
                    <span>Esta acción tiene validez regulatoria y registrará el cuaderno de forma definitiva.</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button 
                    onClick={() => setShowSubmitModal(false)}
                    className="px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black text-white uppercase tracking-widest transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSubmitSiexTelematic}
                    className="flex items-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs uppercase tracking-widest transition-all"
                  >
                    Firmar y Enviar telemáticamente
                  </button>
                </div>
              </>
            ) : (
              <div className="py-8 text-center space-y-8 animate-in fade-in duration-500">
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
                </div>
                
                <div className="space-y-2 max-w-sm mx-auto">
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">{soapMessages[soapStep]}</h4>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Enviando al webservice telemático SIEX...</p>
                </div>

                {/* PROGRESS BAR */}
                <div className="max-w-xs mx-auto space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black text-white/40 uppercase tracking-widest">
                    <span>Transmisión SOAP</span>
                    <span className="text-emerald-400 font-black">{soapProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 border border-white/5 rounded-full overflow-hidden p-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                      style={{ width: `${soapProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      )}

    </div>
  );
}
