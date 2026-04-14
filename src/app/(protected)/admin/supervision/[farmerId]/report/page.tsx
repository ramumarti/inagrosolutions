"use client";

import { useState, useEffect } from 'react';
import { getFullNotebookData } from '@/lib/actions/reports';
import { SIEXReportTemplate } from '@/components/reports/SIEXReportTemplate';
import { GlowButton } from '@/components/ui/GlowButton';
import { 
  Printer, 
  ArrowLeft, 
  ShieldCheck, 
  Download,
  Terminal,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function AdminSupervisionReportPage() {
  const { farmerId } = useParams();
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (farmerId) {
       getFullNotebookData(farmerId as string).then(data => {
         setReportData(data);
         setLoading(false);
       });
    }
  }, [farmerId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-8 p-8 text-center animate-in fade-in duration-500">
       <div className="relative">
          <div className="w-24 h-24 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
             <Terminal className="text-amber-500 w-8 h-8 animate-pulse" />
          </div>
       </div>
       <div className="space-y-1">
          <p className="text-xl font-black text-white glow-text">COMPILANDO REPORTE DE SUPERVISIÓN</p>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] italic">Tratando datos del productor ({farmerId})...</p>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col overflow-y-auto print:bg-white print:overflow-visible">
      
      {/* Utility Bar (Hidden on print) */}
      <div className="sticky top-0 z-[100] w-full bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-amber-500/10 p-4 flex justify-between items-center shadow-2xl print:hidden">
        <Link href="/admin/supervision">
           <button className="p-3 bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all hover:bg-white/10 flex items-center gap-2">
              <ArrowLeft size={18} />
              <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Volver a Supervisión</span>
           </button>
        </Link>
        
        <div className="flex gap-3">
           <GlowButton onClick={handlePrint} className="px-6 py-3 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest">
              <Printer size={18} />
              Exportar SIEX Oficial
           </GlowButton>
           <button className="px-6 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 font-black text-xs uppercase tracking-widest hover:bg-amber-500/20 transition-all flex items-center gap-2">
              <Download size={18} />
              XML Transmisión
           </button>
        </div>
      </div>

      {/* Main Report Area */}
      <div className="flex-1 py-12 p-4 print:p-0">
        <div className="max-w-[1000px] mx-auto space-y-8 print:space-y-0">
           {/* Report Notice */}
           <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl flex items-center gap-5 shadow-sm print:hidden">
              <div className="p-4 bg-amber-500/10 text-amber-600 rounded-2xl">
                 <ShieldCheck size={32} />
              </div>
              <div className="space-y-1">
                 <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Copia de Supervisión Administrativa</p>
                 <p className="text-xs text-slate-500 leading-relaxed italic">
                    Este reporte es una copia de sólo lectura del cuaderno digital del socio. La integridad de la firma corresponde al titular de la explotación.
                 </p>
              </div>
           </div>

           {/* The Template */}
           {reportData && <SIEXReportTemplate data={reportData} />}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          @page {
            margin: 1cm;
            size: A4 portrait;
          }
        }
      `}</style>
    </div>
  );
}
