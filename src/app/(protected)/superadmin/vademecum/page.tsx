'use client';

import React, { useState, useRef } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export default function VademecumPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState<{ inserted?: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setStatus('idle');
      } else {
        setStatus('error');
        setMessage('Por favor, selecciona un archivo CSV válido.');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    setMessage('Procesando el archivo CSV e importando registros al Vademécum. Esto puede tardar unos minutos...');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/mapa-import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error desconocido en la importación');
      }

      setStatus('success');
      setMessage('El Vademécum se ha actualizado correctamente.');
      setStats({ inserted: data.inserted });
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setMessage(err.message || 'Ha ocurrido un error al conectar con el servidor.');
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white glow-text">Importación del Vademécum (MAPA)</h1>
        <p className="text-white/40 font-medium">Actualiza el catálogo oficial de productos fitosanitarios subiendo el CSV mensual del Ministerio de Agricultura.</p>
      </header>

      <GlassCard className="p-8 border-white/5 flex flex-col gap-8">
        
        {/* DRAG & DROP ZONE */}
        <div 
          className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all duration-300 ${
            isDragging 
              ? 'border-emerald-500 bg-emerald-500/10' 
              : 'border-white/20 bg-white/[0.02] hover:border-white/40 hover:bg-white/[0.04]'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileSelect}
            disabled={status === 'uploading'}
          />
          
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <UploadCloud className={`w-8 h-8 ${isDragging ? 'text-emerald-400' : 'text-white/50'}`} />
          </div>
          
          <h3 className="text-lg font-bold text-white mb-2">
            {file ? file.name : 'Arrastra el archivo CSV aquí'}
          </h3>
          <p className="text-sm text-white/40 max-w-sm">
            {file 
              ? `Tamaño: ${(file.size / 1024 / 1024).toFixed(2)} MB. Haz clic para cambiar de archivo.` 
              : 'O haz clic para explorar en tu ordenador. Solo se admiten archivos en formato .csv con la estructura del MAPA.'}
          </p>
        </div>

        {/* STATUS MESSAGES */}
        {status === 'uploading' && (
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-4 animate-pulse">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-blue-400">Importando datos...</h4>
              <p className="text-xs text-blue-400/70 mt-1">{message}</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-red-400">Error en la importación</h4>
              <p className="text-xs text-red-400/70 mt-1">{message}</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-emerald-400">{message}</h4>
              <p className="text-xs text-emerald-400/70 mt-1">
                Se han insertado o actualizado exitosamente <strong className="text-emerald-300">{stats?.inserted}</strong> registros en la base de datos de productos fitosanitarios.
              </p>
            </div>
          </div>
        )}

        {/* ACTION BUTTON */}
        <div className="flex justify-end pt-4 border-t border-white/5">
          <button
            onClick={handleUpload}
            disabled={!file || status === 'uploading'}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/30 disabled:text-white/50 text-black font-black rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:shadow-none"
          >
            {status === 'uploading' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Importando...</span>
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                <span>Comenzar Importación</span>
              </>
            )}
          </button>
        </div>

      </GlassCard>
    </div>
  );
}
