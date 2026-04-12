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
                  <h2 className="text-xl font-semibold text-white mb-3">1. Datos Identificativos</h2>
                  <p>De conformidad con el artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE):</p>
                  <ul className="list-disc pl-5 flex flex-col gap-1 mt-2">
                    <li><strong>Plataforma SaaS:</strong> inagrosolutions.com</li>
                    <li><strong>Servicio Comercial:</strong> INAGROSOLUTIONS</li>
                    <li><strong>Email Legal y Contacto:</strong> legal@inagrosolutions.com</li>
                  </ul>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">2. Naturaleza del Servicio</h2>
                  <p>InagroSolutions proporciona una infraestructura de software (SaaS B2B) orientada a digitalizar la gestión agronómica. Facilitamos a las entidades (cooperativas, asesorías e ingenierías) las herramientas tecnológicas para gestionar el Cuaderno Digital y el cumplimiento de la normativa SIEX bajo un entorno "White Label". Nosotros actuamos únicamente como proveedores tecnológicos.</p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">3. Exención de Responsabilidad</h2>
                  <p>InagroSolutions no se responsabiliza de la veracidad, exactitud o validez legal de los datos agronómicos introducidos en la plataforma por los agricultores, técnicos o gestores de entidades. La correcta cumplimentación de los registros (ej: Fitosanitarios y Fertilizantes) recae exclusivamente sobre la entidad firmante o el usuario final frente al MAPA y Comunidades Autónomas.</p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">4. Propiedad Intelectual</h2>
                  <p>El código fuente, los diseños gráficos, la arquitectura de la base de datos, el logotipo y todos los componentes técnicos de software de InagroSolutions son propiedad exclusiva de la plataforma. La marca adaptada ("White Label") que se muestre a los usuarios en sus respectivos paneles privados es propiedad de la entidad contratante.</p>
                </section>
              </>
            ) : (
              <>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">1. Identification Data</h2>
                  <p>In accordance with article 10 of Law 34/2002, of July 11, on Services of the Information Society and Electronic Commerce (LSSI-CE):</p>
                  <ul className="list-disc pl-5 flex flex-col gap-1 mt-2">
                    <li><strong>SaaS Platform:</strong> inagrosolutions.com</li>
                    <li><strong>Commercial Service:</strong> INAGROSOLUTIONS</li>
                    <li><strong>Legal and Contact Email:</strong> legal@inagrosolutions.com</li>
                  </ul>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">2. Nature of Service</h2>
                  <p>InagroSolutions provides a software infrastructure (B2B SaaS) focused on digitizing agronomic management. We equip entities (cooperatives, consultancies, engineering firms) with technological tools to manage the Digital Field Notebook and SIEX compliance under a "White Label" environment. We act strictly as technology providers.</p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">3. Disclaimer of Liability</h2>
                  <p>InagroSolutions is not responsible for the truthfulness, accuracy, or legal validity of the agronomic data entered into the platform by farmers, technicians, or entity managers. The correct filling of records (e.g., Phytosanitary and Fertilizers) is the sole responsibility of the signing entity or end user towards the MAPA and Autonomous Communities.</p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">4. Intellectual Property</h2>
                  <p>The source code, graphic designs, database architecture, logotype, and all technical software components of InagroSolutions are the exclusive property of the platform. The adapted "White Label" branding displayed to users in their respective private dashboards is the property of the contracting entity.</p>
                </section>
              </>
            )}
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
