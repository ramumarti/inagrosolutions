'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, DownloadCloud, RefreshCw, Trash2, Database, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useSyncStore } from '@/store/syncStore';
import { useToast } from '@/components/ui/Toast';

export function MobilePWAWidget() {
  const { toast: originalToast } = useToast();
  const {
    isOffline,
    pendingMutations,
    syncing,
    initOfflineSync,
    syncPendingMutations,
    removePendingMutation,
  } = useSyncStore();

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Inicializar store de sincronización offline con toast envuelto
  useEffect(() => {
    const wrappedToast = (msg: string, type?: 'success' | 'error' | 'info') => {
      originalToast(msg, type === 'error' ? 'error' : 'success');
    };
    initOfflineSync(wrappedToast);
  }, [initOfflineSync, originalToast]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Detect iOS for manual PWA install prompt
      const ua = window.navigator.userAgent;
      const t_isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      
      // Check if not already installed
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && (navigator as any).standalone);
      
      if (t_isIOS && !isStandalone) {
        setIsIOS(true);
      }
    }

    // Escuchar el evento pwa install prompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
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

  const handleManualSync = async () => {
    const wrappedToast = (msg: string, type?: 'success' | 'error' | 'info') => {
      originalToast(msg, type === 'error' ? 'error' : 'success');
    };
    await syncPendingMutations(wrappedToast);
  };

  const hasPending = pendingMutations.length > 0;

  // Renderiza si está offline O si se puede instalar la PWA O si hay labores pendientes
  if (!isOffline && !deferredPrompt && !isIOS && !hasPending) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 pb-8 md:pb-4 pointer-events-none">
      <div className="max-w-md mx-auto flex flex-col gap-2 pointer-events-auto">
        
        {/* PWA Install Promo (Android/Chrome) */}
        {deferredPrompt && !isOffline && (
          <div className="bg-indigo-600/95 backdrop-blur-md border border-indigo-500/50 rounded-xl p-3 shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom-5">
            <div className="flex items-center gap-3 text-white">
              <DownloadCloud size={20} className="text-indigo-200 animate-bounce" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest leading-tight">Instalar App Móvil</p>
                <p className="text-[10px] text-indigo-200 font-medium">Usa el Cuaderno sin conexión en tu campo.</p>
              </div>
            </div>
            <button 
              onClick={handleInstallClick}
              className="bg-white text-indigo-900 px-3 py-1.5 rounded-lg text-xs font-black shadow-lg hover:bg-indigo-50 active:scale-95 transition-all"
            >
              Instalar
            </button>
          </div>
        )}

        {/* PWA Install Promo (iOS) */}
        {isIOS && !isOffline && !deferredPrompt && (
          <div className="bg-indigo-600/95 backdrop-blur-md border border-indigo-500/50 rounded-xl p-3 shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom-5">
             <div className="flex items-center gap-3 text-white">
              <DownloadCloud size={20} className="text-indigo-200" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest leading-tight">Instalar en tu iPhone</p>
                <p className="text-[10px] text-indigo-200">Pulsa el botón de <b>Compartir</b> de Safari y luego <b>"Añadir a Inicio"</b>.</p>
              </div>
            </div>
            <button onClick={() => setIsIOS(false)} className="text-white/50 hover:text-white px-2 text-sm font-bold">✕</button>
          </div>
        )}

        {/* Offline Status Indicator */}
        {isOffline && (
          <div className="bg-red-600/95 backdrop-blur-md border border-red-500/50 rounded-xl p-3 shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom-5">
             <div className="flex items-center gap-3 text-white">
              <WifiOff size={20} className="text-red-200 animate-pulse" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest leading-tight">Sin Conexión</p>
                <p className="text-[10px] text-red-200 font-medium">Modo offline activado. Tus labores se guardarán localmente.</p>
              </div>
            </div>
          </div>
        )}

        {/* Pending Offline Sync Badge/Card */}
        {hasPending && (
          <div className="bg-emerald-600/95 backdrop-blur-md border border-emerald-500/50 rounded-xl shadow-2xl text-white overflow-hidden animate-in slide-in-from-bottom-5">
            {/* Header */}
            <div className="p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="bg-white/20 p-1.5 rounded-lg">
                  <Database size={18} className="text-emerald-100" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider leading-tight">
                    {pendingMutations.length} {pendingMutations.length === 1 ? 'Labor local pendiente' : 'Labores locales pendientes'}
                  </p>
                  <p className="text-[10px] text-emerald-100 font-medium">
                    {isOffline ? 'Guardadas en tu dispositivo. Esperando conexión...' : 'Listas para subir al servidor.'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {!isOffline && (
                  <button
                    onClick={handleManualSync}
                    disabled={syncing}
                    className="bg-white text-emerald-900 px-2.5 py-1.5 rounded-lg text-xs font-black shadow-md hover:bg-emerald-50 disabled:opacity-50 active:scale-95 transition-all flex items-center gap-1.5 pointer-events-auto"
                  >
                    <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
                    {syncing ? 'Sincronizando...' : 'Subir'}
                  </button>
                )}
                
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-colors pointer-events-auto"
                  aria-label="Ver detalles de sincronización"
                >
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>

            {/* Expanded List */}
            {isExpanded && (
              <div className="border-t border-emerald-500/30 bg-emerald-950/20 max-h-48 overflow-y-auto divide-y divide-emerald-500/20 text-xs">
                {pendingMutations.map((m) => {
                  const label = m.type === 'tratamiento' ? 'Tratamiento' : 'Fertilización';
                  const prod = m.data.nombre_producto || m.data.tipo_abono || 'Labor sin nombre';
                  const dateStr = m.data.fecha ? new Date(m.data.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) : 'Hoy';
                  
                  return (
                    <div key={m.id} className="p-2.5 flex flex-col gap-1 hover:bg-white/5 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="bg-white/25 px-1.5 py-0.5 rounded-[4px] text-[9px] uppercase font-black tracking-wide">
                              {label}
                            </span>
                            <span className="font-bold text-white/90">{prod}</span>
                          </div>
                          <span className="text-[10px] text-emerald-200/90 block mt-0.5">
                            Fecha: {dateStr}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => m.id && removePendingMutation(m.id)}
                          className="text-white/40 hover:text-red-200 p-1 rounded transition-colors pointer-events-auto"
                          title="Eliminar labor local"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      {/* Error message from previous try */}
                      {m.error && (
                        <div className="mt-1 bg-red-950/40 border border-red-500/25 rounded p-1.5 flex items-start gap-1 text-[10px] text-red-200">
                          <AlertTriangle size={12} className="shrink-0 mt-0.5 text-red-300" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-red-300">Fallo de sincronización:</p>
                            <p className="truncate" title={m.error}>{m.error}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
