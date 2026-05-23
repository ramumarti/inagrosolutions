"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Info, ChevronLeft } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useI18n } from '@/lib/i18n';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function LegalNoticeContent() {
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
  const entityName = tenantData?.name || 'INAGROSOLUTIONS';
  const fiscalName = tenantData?.fiscal_name || tenantData?.name || 'INAGROSOLUTIONS';
  const fiscalCif = tenantData?.fiscal_cif || '';
  const fiscalAddress = tenantData?.fiscal_address || tenantData?.address || '';
  const contactEmail = tenantData?.contact_email || '';
  const legalEmail = tenantData?.legal_email || 'legal@inagrosolutions.com';
  const dpoName = tenantData?.dpo_name || '';
  
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
              <h1 className="text-3xl font-bold text-white">{t('gdpr.legalNotice')} {tenantName ? `de ${tenantName}` : ''}</h1>
              <p className="text-white/40 text-sm">{t('legal.lastUpdated')}: Marzo 2026</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none flex flex-col gap-6 text-white/70">
            {language === 'es' ? (
              <>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">1. Datos Identificativos</h2>
                  <p>De conformidad con el artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE):</p>
                  <ul className="list-disc pl-5 flex flex-col gap-1 mt-2 text-white/80">
                    <li><strong>Titular / Razón Social:</strong> {fiscalName}</li>
                    <li><strong>NIF / CIF:</strong> {fiscalCif || '—'}</li>
                    <li><strong>Domicilio Social:</strong> {fiscalAddress || 'España'}</li>
                    <li><strong>Contacto / Email Legal:</strong> {legalEmail || contactEmail || 'legal@inagrosolutions.com'}</li>
                    <li><strong>Infraestructura Tecnológica:</strong> {tenantData ? 'Plataforma operada bajo la infraestructura de InagroSolutions (inagrosolutions.com)' : 'inagrosolutions.com'}</li>
                  </ul>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">2. Naturaleza del Servicio</h2>
                  <p>{tenantName ? `${tenantName} utiliza la infraestructura de software (SaaS B2B) de InagroSolutions` : 'InagroSolutions proporciona una infraestructura de software (SaaS B2B)'} orientada a digitalizar la gestión agronómica. Facilitamos a las entidades (cooperativas, asesorías e ingenierías) las herramientas tecnológicas para gestionar el Cuaderno Digital y el cumplimiento de la normativa SIEX bajo un entorno "White Label". Nosotros actuamos únicamente como proveedores tecnológicos.</p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">3. Exención de Responsabilidad</h2>
                  <p>{entityName} no se responsabiliza de la veracidad, exactitud o validez legal de los datos agronómicos introducidos en la plataforma por los agricultores, técnicos o gestores de entidades. La correcta cumplimentación de los registros (ej: Fitosanitarios y Fertilizantes) recae exclusivamente sobre el usuario final frente al MAPA y Comunidades Autónomas.</p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">4. Propiedad Intelectual</h2>
                  <p>El código fuente, los diseños gráficos, la arquitectura de la base de datos, el logotipo y todos los componentes técnicos de software son propiedad exclusiva de la plataforma tecnológica subyacente. La marca y los logotipos de {tenantName ? tenantName : 'InagroSolutions'} que se muestren a los usuarios en sus respectivos paneles privados son propiedad exclusiva de dicha entidad.</p>
                </section>
              </>
            ) : (
              <>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">1. Identification Data</h2>
                  <p>In accordance with article 10 of Law 34/2002, of July 11, on Services of the Information Society and Electronic Commerce (LSSI-CE):</p>
                  <ul className="list-disc pl-5 flex flex-col gap-1 mt-2 text-white/80">
                    <li><strong>Owner / Corporate Name:</strong> {fiscalName}</li>
                    <li><strong>NIF / CIF:</strong> {fiscalCif || '—'}</li>
                    <li><strong>Registered Office:</strong> {fiscalAddress || 'Spain'}</li>
                    <li><strong>Contact / Legal Email:</strong> {legalEmail || contactEmail || 'legal@inagrosolutions.com'}</li>
                    <li><strong>Technological Infrastructure:</strong> {tenantData ? 'Platform operated under InagroSolutions infrastructure (inagrosolutions.com)' : 'inagrosolutions.com'}</li>
                  </ul>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">2. Nature of Service</h2>
                  <p>{tenantName ? `${tenantName} uses the software infrastructure (B2B SaaS) of InagroSolutions` : 'InagroSolutions provides a software infrastructure (B2B SaaS)'} focused on digitizing agronomic management. We equip entities (cooperatives, consultancies, engineering firms) with technological tools to manage the Digital Field Notebook and SIEX compliance under a "White Label" environment. We act strictly as technology providers.</p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">3. Disclaimer of Liability</h2>
                  <p>{entityName} is not responsible for the truthfulness, accuracy, or legal validity of the agronomic data entered into the platform by farmers, technicians, or entity managers. The correct filling of records (e.g., Phytosanitary and Fertilizers) is the sole responsibility of the end user towards the MAPA and Autonomous Communities.</p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">4. Intellectual Property</h2>
                  <p>The source code, graphic designs, database architecture, logotype, and all technical software components are the exclusive property of the underlying technological platform. The brand and logos of {tenantName ? tenantName : 'InagroSolutions'} displayed to users in their respective private dashboards are the exclusive property of said entity.</p>
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

export default function LegalNoticePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Cargando...</div>}>
      <LegalNoticeContent />
    </Suspense>
  );
}
