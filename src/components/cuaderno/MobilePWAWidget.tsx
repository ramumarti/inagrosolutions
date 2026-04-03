'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, DownloadCloud } from 'lucide-react';

export function MobilePWAWidget() {
  const [isOffline, setIsOffline] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Escuchar el estado de la red
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
      setIsOffline(!window.navigator.onLine);
      
      // Detect iOS for manual PWA install prompt
      const ua = window.navigator.userAgent;
      const t_isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      
      // Check if not already installed
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && (navigator as any).standalone);
      
      if (t_isIOS && !isStandalone) {
        setIsIOS(true);
      }
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Escuchar el evento pwa install prompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Renderiza si está offline O si se puede instalar la PWA
  if (!isOffline && !deferredPrompt && !isIOS) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 pb-8 md:pb-4 pointer-events-none">
      <div className="max-w-md mx-auto flex flex-col gap-2 pointer-events-auto">
        {deferredPrompt && !isOffline && (
          <div className="bg-indigo-600/95 backdrop-blur-md border border-indigo-500/50 rounded-xl p-3 shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom-5">
            <div className="flex items-center gap-3 text-white">
              <DownloadCloud size={20} className="text-indigo-200" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest leading-tight">Instalar App Móvil</p>
                <p className="text-[10px] text-indigo-200">Usa el Cuaderno sin conexión.</p>
              </div>
            </div>
            <button 
              onClick={handleInstallClick}
              className="bg-white text-indigo-900 px-3 py-1.5 rounded-lg text-xs font-black shadow-lg"
            >
              Instalar
            </button>
          </div>
        )}

        {isIOS && !isOffline && !deferredPrompt && (
          <div className="bg-indigo-600/95 backdrop-blur-md border border-indigo-500/50 rounded-xl p-3 shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom-5">
             <div className="flex items-center gap-3 text-white">
              <DownloadCloud size={20} className="text-indigo-200" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest leading-tight">Instalar en tu iPhone</p>
                <p className="text-[10px] text-indigo-200">Pulsa <b>Compartir</b> y luego <b>"Añadir a Inicio"</b>.</p>
              </div>
            </div>
            <button onClick={() => setIsIOS(false)} className="text-white/50 hover:text-white px-2">✕</button>
          </div>
        )}

        {isOffline && (
          <div className="bg-red-600/95 backdrop-blur-md border border-red-500/50 rounded-xl p-3 shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom-5">
             <div className="flex items-center gap-3 text-white">
              <WifiOff size={20} className="text-red-200 animate-pulse" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest leading-tight">Sin Conexión</p>
                <p className="text-[10px] text-red-200">Guardado local activado (PWA).</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
