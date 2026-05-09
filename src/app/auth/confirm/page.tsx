"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, ArrowRight, Loader2, MailCheck } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { useI18n } from '@/lib/i18n';

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const [loading, setLoading] = useState(false);
  const { language } = useI18n();

  const handleConfirm = () => {
    if (!code) return;
    setLoading(true);
    // Redirigimos al callback real con el código
    // Esto asegura que el intercambio sesión/código solo ocurra ante una acción humana
    router.push(`/auth/callback?code=${code}`);
  };

  useEffect(() => {
    // Si no hay código, redirigir al login después de un momento
    if (!code) {
      const timer = setTimeout(() => router.push('/login'), 3000);
      return () => clearTimeout(timer);
    }
  }, [code, router]);

  if (!code) {
    return (
      <GlassCard className="p-10 text-center space-y-6 max-w-md mx-auto">
        <ShieldCheck className="w-16 h-16 text-red-500 mx-auto opacity-50" />
        <h1 className="text-2xl font-black uppercase tracking-tighter">Enlace Inválido</h1>
        <p className="text-white/50 text-sm">No se ha detectado ningún código de verificación válido. Redirigiendo al inicio de sesión...</p>
      </GlassCard>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <GlassCard className="p-8 sm:p-12 text-center space-y-8 max-w-lg mx-auto relative overflow-hidden group">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[var(--color-primary)]/20 rounded-full blur-[80px] group-hover:bg-[var(--color-primary)]/30 transition-all duration-1000" />
        
        <div className="relative z-10 space-y-6">
          <div className="w-20 h-20 bg-[var(--color-primary)]/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[var(--color-primary)]/20 border border-[var(--color-primary)]/20">
            <MailCheck className="w-10 h-10 text-[var(--color-primary)]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter glow-text">
              {language === 'en' ? 'Verify Identity' : 'Verificar Identidad'}
            </h1>
            <p className="text-white/50 font-medium h-12">
              {language === 'en' 
                ? 'To ensure your security, please click the button below to complete your registration.' 
                : 'Para garantizar tu seguridad, haz clic en el botón inferior para finalizar tu registro.'}
            </p>
          </div>

          <div className="pt-8">
            <GlowButton 
              onClick={handleConfirm} 
              isLoading={loading}
              className="w-full py-6 text-lg font-black uppercase tracking-[0.2em] group/btn"
            >
              <span className="flex items-center justify-center gap-3">
                {language === 'en' ? 'Finish Registration' : 'Finalizar Registro'}
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </span>
            </GlowButton>
          </div>

          <p className="text-[10px] text-white/20 uppercase font-black tracking-widest pt-4">
            Secure Auth Gateway
          </p>
        </div>
      </GlassCard>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div className="text-white text-center p-20 animate-pulse uppercase font-black tracking-widest">Cargando Gateway...</div>}>
      <ConfirmContent />
    </Suspense>
  );
}
