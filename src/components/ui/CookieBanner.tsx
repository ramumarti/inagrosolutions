"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { GlowButton } from './GlowButton';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function CookieBannerContent() {
  const { t, language } = useI18n();
  const [isVisible, setIsVisible] = useState(false);
  const searchParams = useSearchParams();
  const tenantSlug = searchParams.get('tenant');
  const [tenantName, setTenantName] = useState<string | null>(null);

  useEffect(() => {
    if (tenantSlug) {
      const fetchTenant = async () => {
        const supabase = createClient();
        const { data } = await supabase.from('tenants').select('name').eq('slug', tenantSlug).single();
        if (data) {
          setTenantName(data.name);
        }
      };
      fetchTenant();
    }
  }, [tenantSlug]);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-[400px] z-[100] animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="bg-[var(--color-base-300)]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--color-primary)]/10 blur-3xl pointer-events-none" />
        
        <div className="flex items-start gap-4 relative z-10">
          <div className="p-2 rounded-lg bg-[var(--color-primary)]/20 text-[var(--color-primary)] shrink-0">
            <Cookie className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-white leading-none mb-1">
              {t('cookies.title')}
            </h3>
            <p className="text-sm text-white/60 leading-relaxed">
              {tenantName 
                ? (language === 'en' ? `We use cookies from ${tenantName} to improve your experience.` : `Utilizamos cookies de ${tenantName} para mejorar tu experiencia. Al continuar navegando, aceptas nuestro uso de cookies.`)
                : t('cookies.description')}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 relative z-10">
          <GlowButton onClick={handleAccept} className="w-full text-sm py-2">
            {t('cookies.accept')}
          </GlowButton>
          <Link href={`/cookie-policy${tenantSlug ? `?tenant=${tenantSlug}` : ''}`} className="w-full sm:w-auto">
            <button className="w-full h-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 transition-colors">
              {t('cookies.settings')}
            </button>
          </Link>
        </div>

        {/* Close button (Reject implicitly or just dismiss) */}
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function CookieBanner() {
  return (
    <Suspense fallback={null}>
      <CookieBannerContent />
    </Suspense>
  );
}
