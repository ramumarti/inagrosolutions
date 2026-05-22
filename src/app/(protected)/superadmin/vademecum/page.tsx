'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { 
  UploadCloud, FileText, CheckCircle2, AlertTriangle, 
  Loader2, ArrowRight, Database, Sparkles, BookOpen, Layers
} from 'lucide-react';

export default function VademecumPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Analizando estructura del archivo...');
  const [stats, setStats] = useState<{ inserted?: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingMessages = [
    'Analizando estructura del archivo...',
    'Validando cabeceras del Ministerio...',
    'Indexando catálogo de fitosanitarios...',
    'Comprobando números de registro duplicados...',
    'Guardando en base de datos Supabase...',
    'Consolidando el Vademécum activo...'
  ];

  // Efecto para cambiar el texto de carga gradualmente
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'uploading') {
      let idx = 0;
      interval = setInterval(() => {
        idx = (idx + 1) % loadingMessages.length;
        setLoadingText(loadingMessages[idx]);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [status]);

  // Efecto para animar el progreso telemático
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'uploading') {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 88) {
            clearInterval(interval);
            return 88; // Se detiene en 88% hasta que responda el server
          }
          return prev + Math.floor(Math.random() * 8) + 2;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [status]);

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
        setProgress(0);
        setCurrentStep(1);
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
      setProgress(0);
      setCurrentStep(1);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    setCurrentStep(2);
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

      // Completar barra de progreso rápidamente
      setProgress(100);
      
      setTimeout(() => {
        setStatus('success');
        setCurrentStep(3);
        setMessage('El Vademécum se ha consolidado correctamente.');
        setStats({ inserted: data.inserted });
      }, 600);

    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setCurrentStep(1);
      setMessage(err.message || 'Ha ocurrido un error al conectar con el servidor.');
    }
  };

  const resetImporter = () => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setCurrentStep(1);
    setStats(null);
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-emerald-400" />
          <h1 className="text-3xl font-black text-white glow-text tracking-tight">Vademécum MAPA</h1>
        </div>
        <p className="text-white/40 font-medium">Panel de control del superadministrador para actualizar el catálogo oficial de fitosanitarios del Ministerio de Agricultura.</p>
      </header>

      {/* STEPPER VISUAL */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { step: 1, label: 'Seleccionar Archivo', desc: 'Arrastrar CSV oficial' },
          { step: 2, label: 'Indexación Telemática', desc: 'Sincronizar Supabase' },
          { step: 3, label: 'Consolidación', desc: 'Catálogo listo' }
        ].map((s) => (
          <div 
            key={s.step}
            className={`p-4 rounded-2xl border transition-all duration-300 ${
              currentStep === s.step 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-white' 
                : currentStep > s.step
                  ? 'bg-emerald-500/5 border-emerald-500/10 text-white/50'
                  : 'bg-white/[0.01] border-white/5 text-white/30'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${
                currentStep === s.step 
                  ? 'bg-emerald-500 text-black'
                  : currentStep > s.step
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-white/10 text-white/40'
              }`}>
                {s.step}
              </span>
              <span className="text-xs font-black uppercase tracking-wider">{s.label}</span>
            </div>
            <p className="text-[10px] font-medium opacity-60 hidden sm:block">{s.desc}</p>
          </div>
        ))}
      </div>

      <GlassCard className="p-8 border-white/5 flex flex-col gap-8">
        
        {/* PASO 1: SELECCION DE ARCHIVOS */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div 
              className={`relative border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer ${
                isDragging 
                  ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]' 
                  : 'border-white/10 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.02]'
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
              
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center mb-6 shadow-inner transition-transform group-hover:scale-105">
                <UploadCloud className={`w-10 h-10 ${isDragging ? 'text-emerald-400 animate-bounce' : 'text-white/40'}`} />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">
                {file ? file.name : 'Arrastra el catálogo de fitosanitarios aquí'}
              </h3>
              <p className="text-sm text-white/40 max-w-md font-medium leading-relaxed">
                {file 
                  ? `Tamaño del archivo: ${(file.size / 1024 / 1024).toFixed(2)} MB. Haz clic si deseas reemplazarlo.` 
                  : 'O haz clic para explorar en tus carpetas. Solo se admite formato .csv codificado con estructura del MAPA.'}
              </p>
            </div>

            {status === 'error' && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-red-400">Error detectado</h4>
                  <p className="text-xs text-red-400/80 mt-1">{message}</p>
                </div>
              </div>
            )}

            {file && (
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center justify-between animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-sm font-bold text-white">{file.name}</p>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Preparado para indexación</p>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/10">CSV Valido</span>
              </div>
            )}

            {/* ACTION BUTTON */}
            <div className="flex justify-end pt-4 border-t border-white/5">
              <GlowButton
                onClick={handleUpload}
                disabled={!file || status === 'uploading'}
                className="gap-2 shrink-0 px-8"
              >
                <span>Siguiente Paso</span>
                <ArrowRight className="w-4 h-4" />
              </GlowButton>
            </div>
          </div>
        )}

        {/* PASO 2: INDEXACIÓN EN CURSO */}
        {currentStep === 2 && (
          <div className="py-8 text-center space-y-8 animate-in fade-in duration-500">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
            </div>
            
            <div className="space-y-2 max-w-sm mx-auto">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">{loadingText}</h3>
              <p className="text-xs text-white/40 font-medium">{message}</p>
            </div>

            {/* BARRA DE PROGRESO */}
            <div className="max-w-md mx-auto space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-white/50">
                <span>Progreso de indexación</span>
                <span className="text-emerald-400 font-black">{progress}%</span>
              </div>
              <div className="w-full h-3 bg-white/5 border border-white/5 rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* PASO 3: EXITO DE CONSOLIDACIÓN */}
        {currentStep === 3 && (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            <div className="text-center py-6 space-y-4">
              <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">Actualización Exitosa</h3>
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">El Vademécum MAPA está al día en la base de datos</p>
              </div>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <Database size={20} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Registros Afectados</h4>
                  <p className="text-xl font-black text-white">{stats?.inserted}</p>
                </div>
              </div>

              <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                  <Layers size={20} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Base de Datos</h4>
                  <p className="text-xl font-black text-white">PostgreSQL</p>
                </div>
              </div>

              <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Estado Catálogo</h4>
                  <p className="text-xl font-black text-white">Vigente Live</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-white/5">
              <button
                onClick={resetImporter}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black text-white uppercase tracking-widest transition-all"
              >
                Volver a Importar
              </button>
            </div>
          </div>
        )}

      </GlassCard>
    </div>
  );
}
