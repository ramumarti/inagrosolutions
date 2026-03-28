"use client";

import React from 'react';
import Link from 'next/link';
import { Info, ChevronLeft } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useI18n } from '@/lib/i18n';

export default function LegalNoticePage() {
  const { t, language } = useI18n();
  
  return (
    <main className="min-h-screen w-full bg-[var(--color-base-100)] py-20 px-4 flex justify-center">
      <div className="absolute bottom-[10%] left-[10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-[var(--color-accent-blue)]/10 blur-[100px]" />
      
      <div className="max-w-4xl w-full relative z-10 flex flex-col gap-8">
        <Link href="/login" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors w-fit">
          <ChevronLeft className="w-4 h-4" />
          {t('forgot.back')}
        </Link>
        
        <GlassCard className="p-10 flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[var(--color-accent-blue)]/20 text-[var(--color-accent-blue)]">
              <Info className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{t('gdpr.legalNotice')}</h1>
              <p className="text-white/40 text-sm">{t('legal.lastUpdated')}: Marzo 2026</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none flex flex-col gap-6 text-white/70">
            {language === 'es' ? (
              <>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">Información Identificativa</h2>
                  <p>De conformidad con el deber de información recogido en el artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico:</p>
                  <ul className="list-disc pl-5 flex flex-col gap-1 mt-2">
                    <li><strong>Titular:</strong> INAGROSOLUTIONS</li>
                    <li><strong>Email:</strong> contacto@iasolutions.ai</li>
                    <li><strong>Nombre Comercial:</strong> IASOLUTIONS</li>
                  </ul>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">Propiedad Intelectual</h2>
                  <p>Todos los derechos de Propiedad Intelectual de los contenidos de la página web y su diseño gráfico son titularidad exclusiva de IASOLUTIONS.</p>
                </section>
              </>
            ) : (
              <>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">Identification Information</h2>
                  <p>In accordance with the duty of information contained in article 10 of Law 34/2002, of July 11, on Services of the Information Society and Electronic Commerce:</p>
                  <ul className="list-disc pl-5 flex flex-col gap-1 mt-2">
                    <li><strong>Owner:</strong> INAGROSOLUTIONS</li>
                    <li><strong>Email:</strong> contact@iasolutions.ai</li>
                    <li><strong>Trade Name:</strong> IASOLUTIONS</li>
                  </ul>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">Intellectual Property</h2>
                  <p>All Intellectual Property rights of the contents of the website and its graphic design are the exclusive property of IASOLUTIONS.</p>
                </section>
              </>
            )}
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
