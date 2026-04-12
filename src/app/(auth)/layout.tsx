"use client";

import React from 'react';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useI18n } from '@/lib/i18n';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { t, language } = useI18n();
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen w-full bg-[var(--color-base-100)] overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[10%] left-[10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-[var(--color-primary)]/20 blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[10%] right-[10%] w-[35vw] h-[35vw] max-w-[400px] max-h-[400px] rounded-full bg-[var(--color-accent-pink)]/20 blur-[100px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
      <div className="absolute top-[40%] left-[60%] w-[30vw] h-[30vw] max-w-[300px] max-h-[300px] rounded-full bg-[var(--color-accent-blue)]/20 blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
      
      <div className="absolute top-6 right-6 z-50">
        <LanguageSwitcher />
      </div>

      <div className="relative z-10 w-full px-4 flex flex-col items-center fade-in-section">
        <div className="w-full flex justify-center mb-8">
          {children}
        </div>
        
        {/* Footer */}
        <footer className="w-full text-center py-6 mt-4 border-t border-white/5 flex flex-col gap-2">
          <p className="text-[10px] text-gray-500">
            {language === 'en'
              ? '© 2026 INAGROSOLUTIONS. All rights reserved.'
              : '© 2026 INAGROSOLUTIONS. Todos los derechos reservados.'}
          </p>
          <div className="flex items-center justify-center gap-4 text-[9px] text-gray-600">
            <Link href="/privacy-policy" className="hover:text-[var(--color-primary)] transition-colors">{t('gdpr.privacyPolicy')}</Link>
            <Link href="/cookie-policy" className="hover:text-[var(--color-primary)] transition-colors">{t('gdpr.cookiePolicy')}</Link>
            <Link href="/legal-notice" className="hover:text-[var(--color-primary)] transition-colors">{t('gdpr.legalNotice')}</Link>
            <Link href="/partner-policy" className="hover:text-[var(--color-primary)] transition-colors font-bold uppercase tracking-tighter">Política de Partners</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
