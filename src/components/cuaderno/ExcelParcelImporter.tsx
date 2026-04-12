'use client';

import React, { useState, useRef } from 'react';
import { 
  X, FileSpreadsheet, Upload, Download, AlertCircle, 
  CheckCircle2, Loader2, Table, Info
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import * as XLSX from 'xlsx';
import { createParcela } from '@/lib/actions/agricultural';

interface ExcelParcelImporterProps {
  explotacionId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ExcelParcelImporter({ explotacionId, onClose, onSuccess }: ExcelParcelImporterProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [results, setResults] = useState<{name: string, status: 'pending' | 'success' | 'error', message?: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        "Nombre Parcela": "Finca Las Olivas",
        "Provincia": "JaÃ©n",
        "Municipio": "Ãšbeda",
        "PolÃ­gono": "12",
        "Parcela": "34",
        "HectÃ¡reas": "2.5",
        "Cultivo": "Olivo",
        "Variedad": "Picual",
        "Riego": "Localizado"
      }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla Parcelas");
    XLSX.writeFile(wb, "inagrosolutions_plantilla_parcelas.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const parsedData = XLSX.utils.sheet_to_json(ws);
      setData(parsedData);
      setResults(parsedData.map((row: any) => ({ 
        name: row["Nombre Parcela"] || "Sin nombre", 
        status: 'pending' 
      })));
    };
    reader.readAsBinaryString(file);
  };

  const handleProcess = async () => {
    if (data.length === 0) return;
    setIsProcessing(true);

    const updatedResults = [...results];

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        try {
            await createParcela({
                explotacion_id: explotacionId,
                nombre: row["Nombre Parcela"],
                provincia: row["Provincia"],
                municipio: row["Municipio"],
                poligono: row["PolÃ­gono"],
                parcela: row["Parcela"],
                hectareas: Number(row["HectÃ¡reas"]),
                cultivo: row["Cultivo"],
                variedad: row["Variedad"]
            });
            updatedResults[i].status = 'success';
        } catch (err: any) {
            updatedResults[i].status = 'error';
            updatedResults[i].message = err.message || 'Error al guardar';
        }
    }

    setResults([...updatedResults]);
    setIsProcessing(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <GlassCard className="max-w-3xl w-full relative p-8 border-white/10 flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/10 text-blue-400">
                <FileSpreadsheet size={28} />
            </div>
            <div>
                <h3 className="text-xl font-black text-white">Importador Masivo Excel</h3>
                <p className="text-xs font-black text-white/30 uppercase tracking-widest">Migra tus parcelas desde una hoja de cÃ¡lculo</p>
            </div>
        </div>

        {!data.length ? (
            <div className="flex-1 flex flex-col justify-center items-center py-10 space-y-8">
                <div className="text-center space-y-4">
                    <p className="text-white/60 text-sm max-w-sm mx-auto font-medium">
                        Sube tu archivo .xlsx o .csv con la lista de tus parcelas. Si no tienes una hoja, descarga nuestra plantilla.
                    </p>
                    <button 
                        onClick={downloadTemplate}
                        className="flex items-center gap-2 mx-auto text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:text-emerald-300 transition-colors"
                    >
                        <Download size={14} /> Descargar Plantilla Excel
                    </button>
                </div>

                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full max-w-md border-2 border-dashed border-white/10 rounded-3xl p-12 flex flex-col items-center gap-4 hover:border-emerald-500/20 hover:bg-emerald-500/[0.02] transition-all cursor-pointer group"
                >
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="text-white/20 group-hover:text-emerald-500" size={24} />
                    </div>
                    <span className="text-xs font-black text-white/40 uppercase tracking-widest">Seleccionar Archivo Excel</span>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".xlsx, .xls, .csv" 
                        onChange={handleFileUpload} 
                    />
                </div>
            </div>
        ) : (
            <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 space-y-3 pb-6">
                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Vista Previa: {data.length} parcelas detectadas</h4>
                    {results.map((res, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5 transition-all">
                            <div className="flex items-center gap-3">
                                {res.status === 'pending' ? <Table className="text-white/20" size={16} /> : 
                                 res.status === 'success' ? <CheckCircle2 className="text-emerald-400" size={16} /> : 
                                 <AlertCircle className="text-red-400" size={16} />}
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-white">{res.name}</span>
                                    {res.message && <span className="text-[9px] text-red-500/80 font-black uppercase tracking-tighter">{res.message}</span>}
                                </div>
                            </div>
                            <span className={`text-[10px] font-black uppercase ${res.status === 'success' ? 'text-emerald-400' : 'text-white/20'}`}>
                                {res.status}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="pt-6 border-t border-white/5 flex gap-3">
                    <button 
                        onClick={() => setData([])}
                        className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-all"
                    >
                        Cambiar Archivo
                    </button>
                    <GlowButton 
                        onClick={handleProcess}
                        disabled={isProcessing}
                        className="flex-[2] py-4 rounded-2xl"
                    >
                        {isProcessing ? <Loader2 className="animate-spin mx-auto" /> : `Importar ${data.length} Parcelas`}
                    </GlowButton>
                </div>
            </div>
        )}

        <div className="mt-8 p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 flex gap-3 shrink-0">
            <Info className="text-blue-500 shrink-0" size={18} />
            <p className="text-[10px] text-blue-500/70 font-medium leading-relaxed">
                AsegÃºrate de que los encabezados de las columnas coincidan exactamente con la plantilla INAGROSOLUTIONS para una importaciÃ³n correcta.
            </p>
        </div>
      </GlassCard>
    </div>
  );
}
