"use client";

import React from 'react';
import Link from 'next/link';
import { Shield, ChevronLeft } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useI18n } from '@/lib/i18n';

export default function PrivacyPolicyPage() {
  const { t, language } = useI18n();
  
  return (
    <main className="min-h-screen w-full bg-[var(--color-base-100)] py-20 px-4 flex justify-center">
      <div className="absolute top-[10%] left-[10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-[var(--color-primary)]/10 blur-[100px]" />
      
      <div className="max-w-4xl w-full relative z-10 flex flex-col gap-8">
        <Link href="/login" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors w-fit">
          <ChevronLeft className="w-4 h-4" />
          {t('forgot.back')}
        </Link>
        
        <GlassCard className="p-10 flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[var(--color-primary)]/20 text-[var(--color-primary)]">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{t('gdpr.privacyPolicy')}</h1>
              <p className="text-white/40 text-sm">{t('legal.lastUpdated')}: Marzo 2026</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none flex flex-col gap-6 text-white/70">
            {language === 'es' ? (
              <>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">1. Responsable del Tratamiento</h2>
                  <p>INAGROSOLUTIONS, con domicilio en España, es el responsable del tratamiento de sus datos personales. Para cualquier consulta sobre la protección de sus datos, puede contactarnos en legal@inagrosolutions.es.</p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">2. Datos que Recopilamos</h2>
                  <p>Recopilamos los datos estrictamente necesarios para la prestación de nuestros servicios: nombre, apellidos, correo electrónico y datos técnicos de uso para mejorar la plataforma.</p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">3. Finalidad del Tratamiento</h2>
                  <p>Tus datos se utilizan para:</p>
                  <ul className="list-disc pl-5 flex flex-col gap-2">
                    <li>Gestionar tu cuenta de usuario.</li>
                    <li>Permitir el uso de nuestras Micro Aplicaciones de IA.</li>
                    <li>Notificar cambios importantes en el servicio.</li>
                    <li>Cumplir con obligaciones legales y fiscales.</li>
                  </ul>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">4. Tus Derechos</h2>
                  <p>Tienes derecho a acceder, rectificar, suprimir, oponerse o solicitar la portabilidad de tus datos enviando un correo a soporte@inagrosolutions.es.</p>
                </section>
              </>
            ) : (
              <>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">1. Data Controller</h2>
                  <p>INAGROSOLUTIONS, based in Spain, is the controller of your personal data. For any questions regarding your data protection, you can contact us at legal@inagrosolutions.es.</p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">2. Data We Collect</h2>
                  <p>We collect only the strictly necessary data for providing our services: first name, last name, email address, and technical usage data to improve the platform.</p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">3. Purpose of Processing</h2>
                  <p>Your data is used to:</p>
                  <ul className="list-disc pl-5 flex flex-col gap-2">
                    <li>Manage your user account.</li>
                    <li>Enable the use of our AI Micro Applications.</li>
                    <li>Notify important service changes.</li>
                    <li>Comply with legal and tax obligations.</li>
                  </ul>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">4. Your Rights</h2>
                  <p>You have the right to access, rectify, delete, object to, or request the portability of your data by sending an email to support@inagrosolutions.es.</p>
                </section>
              </>
            )}
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
