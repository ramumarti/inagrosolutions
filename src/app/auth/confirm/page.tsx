"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, ArrowRight, Loader2, MailCheck } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { useI18n } from '@/lib/i18n';
import { createClient } from '@/lib/supabase/client';

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const tenantSlug = searchParams.get('tenant');
  const [loading, setLoading] = useState(false);
  const [tenant, setTenant] = useState<any>(null);
  const { language } = useI18n();

  useEffect(() => {
    if (tenantSlug) {
      const supabase = createClient();
      supabase.from('tenants').select('*').eq('slug', tenantSlug).single().then(({ data }) => {
        if (data) setTenant(data);
      });
    }
  }, [tenantSlug]);

  const handleConfirm = () => {
    if (!code) return;
    setLoading(true);
    // Redirigimos al callback real con el código
    // Esto asegura que el intercambio sesión/código solo ocurra ante una acción humana
    // Si hay un tenant, lo pasamos al callback por si se necesita para algo, aunque callback
    // usará el token que ya guarda el tenant (o el trigger handle_new_user)
    router.push(`/auth/callback?code=${code}${tenantSlug ? `&tenant=${tenantSlug}` : ''}`);
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

  const primaryColor = tenant?.primary_color || 'var(--color-primary)';
  const logoUrl = tenant?.logo_url;
  const isWhiteLabel = !!tenant;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <GlassCard className="p-8 sm:p-12 text-center space-y-8 max-w-lg mx-auto relative overflow-hidden group">
        {/* Glow effect */}
        <div 
          className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-[80px] transition-all duration-1000" 
          style={{ backgroundColor: isWhiteLabel ? `${primaryColor}4D` : 'var(--color-primary)', opacity: 0.3 }}
        />
        
        <div className="relative z-10 space-y-6">
          {logoUrl ? (
            <div className="mb-8 p-4 bg-white/10 rounded-2xl border border-white/5 backdrop-blur-md shadow-lg flex items-center justify-center mx-auto w-32 h-32">
              <img src={logoUrl} alt={tenant.name} className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div 
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border"
              style={{ backgroundColor: isWhiteLabel ? `${primaryColor}1A` : 'rgba(var(--color-primary-rgb), 0.1)', borderColor: isWhiteLabel ? `${primaryColor}33` : 'rgba(var(--color-primary-rgb), 0.2)', boxShadow: `0 0 20px ${isWhiteLabel ? primaryColor : 'var(--color-primary)'}33` }}
            >
              <MailCheck className="w-10 h-10" style={{ color: isWhiteLabel ? primaryColor : 'var(--color-primary)' }} />
            </div>
          )}

          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter glow-text">
              {language === 'en' ? 'Verify Identity' : 'Verificar Identidad'}
            </h1>
            <p className="text-white/50 font-medium h-12">
              {language === 'en' 
                ? 'To ensure your security, please click the button below to complete your registration.' 
                : isWhiteLabel ? `Para garantizar tu seguridad y acceder a la plataforma de ${tenant.name}, haz clic en el botón inferior para finalizar tu registro.` : 'Para garantizar tu seguridad, haz clic en el botón inferior para finalizar tu registro.'}
            </p>
          </div>

          <div className="pt-8">
            <GlowButton 
              onClick={handleConfirm} 
              isLoading={loading}
              className="w-full py-6 text-lg font-black uppercase tracking-[0.2em] group/btn"
              style={isWhiteLabel ? { backgroundColor: primaryColor, color: '#000', boxShadow: `0 0 20px ${primaryColor}33` } : undefined}
            >
              <span className="flex items-center justify-center gap-3">
                {language === 'en' ? 'Finish Registration' : 'Confirmar y Acceder'}
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </span>
            </GlowButton>
          </div>

          <p className="text-[10px] text-white/20 uppercase font-black tracking-widest pt-4">
            {isWhiteLabel ? `${tenant.name} - Powered by InagroSolutions` : 'Secure Auth Gateway'}
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
