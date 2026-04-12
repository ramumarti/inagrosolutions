"use client";

import React from 'react';
import Link from 'next/link';
import { Cookie, ChevronLeft } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useI18n } from '@/lib/i18n';

export default function CookiePolicyPage() {
  const { t, language } = useI18n();
  
  return (
    <main className="min-h-screen w-full bg-[var(--color-base-100)] py-20 px-4 flex justify-center">
      <div className="absolute top-[10%] right-[10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-[var(--color-accent-pink)]/10 blur-[100px]" />
      
      <div className="max-w-4xl w-full relative z-10 flex flex-col gap-8">
        <Link href="/login" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors w-fit">
          <ChevronLeft className="w-4 h-4" />
          {t('forgot.back')}
        </Link>
        
        <GlassCard className="p-10 flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[var(--color-accent-pink)]/20 text-[var(--color-accent-pink)]">
              <Cookie className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{t('gdpr.cookiePolicy')}</h1>
              <p className="text-white/40 text-sm">{t('legal.lastUpdated')}: Marzo 2026</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none flex flex-col gap-6 text-white/70">
            {language === 'es' ? (
              <>
                <p>En INAGROSOLUTIONS utilizamos cookies para mejorar tu experiencia de navegación.</p>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">¿Qué son las cookies?</h2>
                  <p>Las cookies son pequeños archivos de texto que se almacenan en su navegador cuando visita casi cualquier página web. Su utilidad es que la web sea capaz de recordar su visita cuando vuelva a navegar por esa página.</p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">Cookies Técnicas (Obligatorias)</h2>
                  <p>Son aquellas que permiten al usuario la navegación a través de una página web y la utilización de las diferentes opciones o servicios que en ella existan (ej: autenticación con Supabase).</p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">¿Cómo puedo gestionar las cookies?</h2>
                  <p>Usted puede restringir, bloquear o borrar las cookies de cualquier sitio web, utilizando su navegador. En cada navegador la operativa es diferente, la función de 'Ayuda' le mostrará cómo hacerlo.</p>
                </section>
              </>
            ) : (
              <>
                <p>At INAGROSOLUTIONS, we use cookies to improve your browsing experience.</p>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">What are cookies?</h2>
                  <p>Cookies are small text files stored in your browser when you visit almost any website. Their usefulness is that the website is able to remember your visit when you browse that page again.</p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">Technical Cookies (Mandatory)</h2>
                  <p>These are those that allow the user to navigate through a website and use the different options or services that exist in it (e.g., Supabase authentication).</p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">How can I manage cookies?</h2>
                  <p>You can restrict, block or delete cookies from any website using your browser. Each browser operates differently; the 'Help' function will show you how to do it.</p>
                </section>
              </>
            )}
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
