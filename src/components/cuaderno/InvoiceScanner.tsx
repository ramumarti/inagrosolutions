'use client';

import React, { useRef, useState } from 'react';
import { Camera, Upload, Loader2, Sparkles, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { GlassCard } from '@/components/ui/GlassCard';

async function compressImageFile(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            resolve(blob || file);
          },
          'image/jpeg',
          0.75
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

interface InvoiceScannerProps {
  onScanComplete: (data: any) => void;
  className?: string;
}

type ScannerState = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

export function InvoiceScanner({ onScanComplete, className = '' }: InvoiceScannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<ScannerState>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast('Por favor, selecciona una imagen (JPG, PNG)', 'error');
      return;
    }

    setState('uploading');

    try {
      const compressedBlob = await compressImageFile(file);
      const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });

      // Crear preview
      const objectUrl = URL.createObjectURL(compressedFile);
      setPreviewUrl(objectUrl);

      // Convertir a base64
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const base64Image = base64data.split(',')[1];

        await processImage(base64Image, 'image/jpeg');
      };
    } catch (err) {
      console.error('Error compressing image, uploading original:', err);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const base64Image = base64data.split(',')[1];

        await processImage(base64Image, file.type);
      };
    }
  };

  const processImage = async (base64Image: string, mimeType: string) => {
    setState('processing');
    try {
      const res = await fetch('/api/ai/scan-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          mimeType: mimeType
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'CREDITS_EXHAUSTED') {
          toast("No te quedan créditos IA. Compra un pack para escanear facturas.", "error");
          document.dispatchEvent(new CustomEvent('ai_credits_exhausted', { detail: { feature: 'Escáner Facturas' } }));
        } else {
          toast(data.error || "Error al procesar la factura", "error");
        }
        setState('error');
        setTimeout(() => setState('idle'), 3000);
        return;
      }

      setState('success');
      toast("Factura escaneada correctamente", "success");
      
      setTimeout(() => {
        onScanComplete(data.data);
        setState('idle');
        setPreviewUrl(null);
      }, 1500);

    } catch (error) {
      console.error("Error calling scan-invoice:", error);
      toast("Error de conexión con la IA", "error");
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  };

  if (state === 'processing') {
    return (
      <GlassCard className={`p-6 flex flex-col items-center justify-center text-center gap-4 ${className}`}>
        <div className="relative">
          {previewUrl && (
            <img src={previewUrl} alt="Factura preview" className="w-24 h-32 object-cover rounded-lg opacity-40 grayscale" style={{ imageOrientation: 'from-image' }} />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={32} className="text-violet-400 animate-spin" />
          </div>
        </div>
        <div>
          <h4 className="text-sm font-bold text-white flex items-center justify-center gap-2">
            <Sparkles size={16} className="text-violet-400" />
            Leyendo Factura con IA
          </h4>
          <p className="text-xs text-white/50 mt-1">Extrayendo artículos y cantidades...</p>
        </div>
      </GlassCard>
    );
  }

  if (state === 'success') {
    return (
      <GlassCard className={`p-6 flex flex-col items-center justify-center text-center gap-3 bg-emerald-500/10 border-emerald-500/20 ${className}`}>
        <CheckCircle2 size={32} className="text-emerald-400" />
        <h4 className="text-sm font-bold text-emerald-300">¡Factura Procesada!</h4>
      </GlassCard>
    );
  }

  if (state === 'error') {
    return (
      <GlassCard className={`p-6 flex flex-col items-center justify-center text-center gap-3 bg-red-500/10 border-red-500/20 cursor-pointer ${className}`} onClick={() => setState('idle')}>
        <AlertCircle size={32} className="text-red-400" />
        <h4 className="text-sm font-bold text-red-300">Error al leer la factura</h4>
        <p className="text-xs text-red-400/60">Haz clic para intentar de nuevo</p>
      </GlassCard>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      <input
        type="file"
        accept="image/*"
        capture="environment" // Intentar abrir cámara en móviles
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/10 hover:border-violet-500/50 transition-all"
      >
        <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
          <Camera size={20} />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-white flex items-center gap-2">
            Escanear Factura <Sparkles size={14} className="text-violet-400" />
          </p>
          <p className="text-[10px] text-white/50 uppercase tracking-widest mt-0.5">
            Sube una foto y la IA extrae los productos
          </p>
        </div>
      </button>
    </div>
  );
}
