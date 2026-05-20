'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

type VoiceRecorderState = 'idle' | 'recording' | 'processing' | 'error';

interface VoiceRecorderButtonProps {
  type: 'tratamiento' | 'labor' | 'fertilizacion';
  onDataExtracted: (data: any) => void;
  className?: string;
}

export function VoiceRecorderButton({ type, onDataExtracted, className = '' }: VoiceRecorderButtonProps) {
  const [state, setState] = useState<VoiceRecorderState>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
        await processAudio(audioBlob, mediaRecorder.mimeType);
        
        // Detener todas las pistas de audio para apagar el micrófono en el navegador
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setState('recording');
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 60) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast("Error al acceder al micrófono. Por favor revisa los permisos.", "error");
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      setState('processing');
    }
  };

  const processAudio = async (blob: Blob, mimeType: string) => {
    try {
      // Convertir Blob a Base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        // Quitar el prefijo 'data:audio/webm;base64,'
        const base64Audio = base64data.split(',')[1];

        try {
          const res = await fetch('/api/ai/voice-entry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64Audio,
              mimeType: mimeType,
              type
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            if (data.error === 'CREDITS_EXHAUSTED') {
              toast("No te quedan créditos de IA. Por favor compra un pack.", "error");
              // Emitimos un evento custom que el componente padre pueda capturar para abrir el modal
              document.dispatchEvent(new CustomEvent('ai_credits_exhausted', { detail: { feature: 'IA Voz' } }));
            } else {
              toast(data.error || "Error al procesar el audio", "error");
            }
            setState('idle');
            return;
          }

          toast("Datos extraídos correctamente con IA", "success");
          onDataExtracted(data);
          setState('idle');
        } catch (apiError) {
          console.error("Error en llamada a API:", apiError);
          toast("Error de red al conectar con IA", "error");
          setState('idle');
        }
      };
    } catch (error) {
      console.error("Error procesando audio:", error);
      toast("Error procesando la grabación", "error");
      setState('idle');
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (state === 'recording') {
    return (
      <button
        onClick={stopRecording}
        className={`flex items-center gap-3 px-4 py-3 bg-red-500/20 border border-red-500/50 rounded-xl hover:bg-red-500/30 transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse ${className}`}
      >
        <Square size={18} className="text-red-400 fill-current" />
        <div className="flex flex-col items-start">
          <span className="text-sm font-bold text-red-100">Grabando...</span>
          <span className="text-[10px] font-mono text-red-300">{formatTime(recordingTime)} / 1:00</span>
        </div>
        {/* Simulación visual de onda */}
        <div className="flex gap-1 items-end h-4 ml-2">
          {[1,2,3,4].map(i => (
            <div key={i} className="w-1 bg-red-400 rounded-full animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </button>
    );
  }

  if (state === 'processing') {
    return (
      <button
        disabled
        className={`flex items-center gap-3 px-4 py-3 bg-violet-500/20 border border-violet-500/30 rounded-xl cursor-wait ${className}`}
      >
        <Loader2 size={18} className="text-violet-400 animate-spin" />
        <div className="flex flex-col items-start">
          <span className="text-sm font-bold text-violet-100">Analizando con IA...</span>
          <span className="text-[10px] text-violet-300">Extrayendo datos</span>
        </div>
        <Sparkles size={16} className="text-violet-400 ml-2 animate-pulse" />
      </button>
    );
  }

  if (state === 'error') {
    return (
      <button
        disabled
        className={`flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 ${className}`}
      >
        <AlertCircle size={18} />
        <span className="text-sm font-bold">Error de micrófono</span>
      </button>
    );
  }

  return (
    <button
      onClick={startRecording}
      className={`flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/30 rounded-xl hover:border-violet-500/60 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all group ${className}`}
    >
      <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
        <Mic size={16} className="text-violet-400" />
      </div>
      <div className="flex flex-col items-start text-left">
        <span className="text-sm font-bold text-white group-hover:text-violet-200 transition-colors">
          Rellenar con Voz
        </span>
        <span className="text-[10px] text-white/40 flex items-center gap-1">
          <Sparkles size={10} className="text-violet-400/70" />
          Powered by Gemini IA
        </span>
      </div>
    </button>
  );
}
