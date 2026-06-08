'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { verifyAndActivateSubscription } from '@/lib/actions/stripe';
import { useAgriProfile } from '@/hooks/useAgriProfile';

export function SuccessModal() {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const { reload } = useAgriProfile();

  useEffect(() => {
    const sessionId = searchParams?.get('session_id');
    if (searchParams?.get('payment') === 'success' && sessionId) {
      setShow(true);
      setVerifying(true);
      
      verifyAndActivateSubscription(sessionId).then((res) => {
        setVerifying(false);
        if (res.success) {
          reload();
        }
      });
      
      const timer = setTimeout(() => setShow(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, reload]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
      <GlassCard className="p-8 max-w-sm w-full text-center border-emerald-500/30 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
        {verifying ? (
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
            <h2 className="text-xl font-black text-white mb-2">Verificando Pago...</h2>
            <p className="text-white/60 text-xs uppercase tracking-wider font-bold">Por favor, no cierres esta ventana</p>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">¡Suscripción Activada!</h2>
            <p className="text-white/60 text-sm mb-6">
              Tu cuaderno digital está listo y conectado con la plataforma.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-500/80">
              <ShieldCheck size={16} /> 100% SIEX Compliant
            </div>
          </>
        )}
      </GlassCard>
    </div>
  );
}
