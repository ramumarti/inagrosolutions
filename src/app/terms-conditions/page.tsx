"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Scale, ChevronLeft, Shield, FileText, Smartphone, Ban, CheckCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useI18n } from '@/lib/i18n';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function TermsConditionsContent() {
  const { t, language } = useI18n();
  const searchParams = useSearchParams();
  const tenantSlug = searchParams.get('tenant');
  const [tenantData, setTenantData] = useState<any | null>(null);

  useEffect(() => {
    if (tenantSlug) {
      const fetchTenant = async () => {
        const supabase = createClient();
        const { data } = await supabase
          .from('tenants')
          .select('name, fiscal_name, fiscal_cif, fiscal_address, fiscal_email, contact_email, address, dpo_name, legal_email')
          .eq('slug', tenantSlug)
          .single();
        if (data) setTenantData(data);
      };
      fetchTenant();
    }
  }, [tenantSlug]);

  const tenantName = tenantData?.name || null;
  const entityName = tenantData?.name || 'InagroSolutions';
  const fiscalName = tenantData?.fiscal_name || tenantData?.name || 'InagroSolutions';
  const fiscalCif = tenantData?.fiscal_cif || '';
  const fiscalAddress = tenantData?.fiscal_address || tenantData?.address || '';
  const contactEmail = tenantData?.contact_email || '';
  const legalEmail = tenantData?.legal_email || 'legal@inagrosolutions.com';
  
  return (
    <main className="min-h-screen w-full bg-[var(--color-base-100)] py-20 px-4 flex justify-center relative overflow-hidden">
      <div className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-[var(--color-primary)]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl w-full relative z-10 flex flex-col gap-8">
        <Link href="/login" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors w-fit">
          <ChevronLeft className="w-4 h-4" />
          {t('forgot.back')}
        </Link>
        
        <GlassCard className="p-10 flex flex-col gap-8 border-white/10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[var(--color-primary)]/20 text-[var(--color-primary)] shadow-lg shadow-[var(--color-primary)]/10">
              <Scale className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Términos y Condiciones {tenantName ? `de ${tenantName}` : ''}</h1>
              <p className="text-white/40 text-sm">{t('legal.lastUpdated')}: Marzo 2026</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none flex flex-col gap-8 text-white/70">
            {language === 'es' ? (
              <>
                <p className="leading-relaxed">
                  Bienvenido a la plataforma SaaS Multi-Entidad del Cuaderno de Campo Digital. El presente documento regula el uso de los servicios de software para la gestión agrícola proporcionados por <strong>{fiscalName}</strong> {fiscalCif ? `(NIF/CIF ${fiscalCif})` : ''} con domicilio fiscal en {fiscalAddress || 'España'} (en adelante, la "Entidad Gestora"), en colaboración con la infraestructura tecnológica cloud de InagroSolutions.
                </p>

                <hr className="border-white/10" />

                <section className="space-y-3">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[var(--color-primary)]" />
                    1. Objeto del Servicio
                  </h2>
                  <p className="leading-relaxed">
                    La Entidad Gestora pone a disposición del usuario (agricultor, técnico o explotación asociada) el acceso a la plataforma en la nube para la digitalización de registros agronómicos y actividades de campo. La plataforma está especialmente diseñada para facilitar el cumplimiento estricto del Real Decreto 1054/2022 y la normativa del Sistema de Información de Explotaciones Agrícolas (SIEX).
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-[var(--color-primary)]" />
                    2. Acceso y Uso de la Plataforma
                  </h2>
                  <p className="leading-relaxed">
                    El usuario es responsable de mantener la confidencialidad de sus claves de acceso individuales. Se compromete a introducir información veraz y actualizada sobre sus fincas, tratamientos fitosanitarios y fertilizaciones. Queda prohibido cualquier uso de la plataforma que vulnere la legislación vigente o sobrecargue de forma deliberada la infraestructura técnica del sistema.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Ban className="w-5 h-5 text-red-400" />
                    3. Exención de Responsabilidad Agronómica
                  </h2>
                  <p className="leading-relaxed text-amber-200 bg-amber-500/10 p-4 border border-amber-500/20 rounded-xl">
                    <strong>Importante:</strong> La validación legal y corrección de las dosis de tratamientos fitosanitarios y de fertilizantes introducidos en la plataforma recae exclusivamente sobre el agricultor o su asesor técnico facultativo frente al MAPA y las Comunidades Autónomas. Ni la Entidad Gestora ni el proveedor de software se responsabilizan de sanciones derivadas de errores u omisiones en las declaraciones e inspecciones oficiales.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[var(--color-primary)]" />
                    4. Protección de Datos y Privacidad
                  </h2>
                  <p className="leading-relaxed">
                    Los datos de carácter personal y agronómico introducidos se tratarán de forma segura de acuerdo con nuestro reglamento interno, la Ley Orgánica 3/2018 (LOPDGDD) y el RGPD europeo. Puedes consultar de forma detallada las finalidades y ejercer tus derechos a través de nuestra <Link href={`/privacy-policy?tenant=${tenantSlug || ''}`} className="text-[var(--color-primary)] hover:underline font-bold">Política de Privacidad</Link>, o contactando directamente con nosotros en el correo electrónico <strong>{legalEmail || contactEmail}</strong>.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-[var(--color-primary)]" />
                    5. Modificaciones y Jurisdicción
                  </h2>
                  <p className="leading-relaxed">
                    La Entidad Gestora se reserva el derecho a adaptar estos términos para reflejar actualizaciones funcionales del software o cambios en la normativa agrícola estatal y europea. Ante cualquier conflicto de interpretación legal, ambas partes se someten a los juzgados y tribunales correspondientes al domicilio social de la Entidad Gestora.
                  </p>
                </section>
              </>
            ) : (
              <>
                <p className="leading-relaxed">
                  Welcome to our Digital Field Notebook Multi-Tenant SaaS platform. This document governs the use of the agronomic management software services provided by <strong>{fiscalName}</strong> {fiscalCif ? `(ID/CIF ${fiscalCif})` : ''} located at {fiscalAddress || 'Spain'} (hereinafter, the "Managing Entity"), in collaboration with the cloud technological infrastructure of InagroSolutions.
                </p>

                <hr className="border-white/10" />

                <section className="space-y-3">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[var(--color-primary)]" />
                    1. Purpose of Service
                  </h2>
                  <p className="leading-relaxed">
                    The Managing Entity provides the user (associated farmer, technician, or agribusiness) with access to the cloud platform to digitize field activities and agricultural records. The platform is specifically designed to facilitate strict compliance with Royal Decree 1054/2022 and state SIEX agricultural regulations.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-[var(--color-primary)]" />
                    2. Access and Use of the Platform
                  </h2>
                  <p className="leading-relaxed">
                    The user is responsible for maintaining the confidentiality of their individual login credentials. They agree to enter truthful and updated data regarding plots, phytosanitary treatments, and fertilizations. Any misuse of the platform that violates current regulations or deliberately compromises system infrastructure is strictly prohibited.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Ban className="w-5 h-5 text-red-400" />
                    3. Agronomic Disclaimer
                  </h2>
                  <p className="leading-relaxed text-amber-200 bg-amber-500/10 p-4 border border-amber-500/20 rounded-xl">
                    <strong>Important:</strong> The legal validity and accuracy of treatment doses and fertilizers entered into the platform remain the sole responsibility of the farmer or technical advisor towards the MAPA and autonomous communities. Neither the Managing Entity nor the software provider is liable for penalties arising from errors or omissions in official statements or inspections.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[var(--color-primary)]" />
                    4. Data Protection & Privacy
                  </h2>
                  <p className="leading-relaxed">
                    Personal and agronomic data entered will be securely processed in accordance with organic laws, LOPDGDD, and the GDPR. You can consult detailed processing purposes and exercise your rights through our <Link href={`/privacy-policy?tenant=${tenantSlug || ''}`} className="text-[var(--color-primary)] hover:underline font-bold">Privacy Policy</Link>, or by contacting us at <strong>{legalEmail || contactEmail}</strong>.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-[var(--color-primary)]" />
                    5. Modifications & Jurisdiction
                  </h2>
                  <p className="leading-relaxed">
                    The Managing Entity reserves the right to modify these terms to reflect functional software updates or changes in state and European agricultural legislation. In case of any dispute, both parties submit to the courts and tribunals of the Managing Entity's registered corporate address.
                  </p>
                </section>
              </>
            )}
          </div>
        </GlassCard>
      </div>
    </main>
  );
}

export const dynamic = 'force-dynamic';

export default function TermsConditionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Cargando...</div>}>
      <TermsConditionsContent />
    </Suspense>
  );
}
