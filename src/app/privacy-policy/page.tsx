"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Shield, ChevronLeft } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useI18n } from '@/lib/i18n';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function PrivacyPolicyContent() {
  const { t, language } = useI18n();
  const searchParams = useSearchParams();
  const tenantSlug = searchParams.get('tenant');
  const [tenantName, setTenantName] = useState<string | null>(null);

  useEffect(() => {
    if (tenantSlug) {
      const fetchTenant = async () => {
        const supabase = createClient();
        const { data } = await supabase.from('tenants').select('name').eq('slug', tenantSlug).single();
        if (data) setTenantName(data.name);
      };
      fetchTenant();
    }
  }, [tenantSlug]);

  const entityName = tenantName || 'InagroSolutions';
  
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
              <h1 className="text-3xl font-bold text-white">{t('gdpr.privacyPolicy')} {tenantName ? `de ${tenantName}` : ''}</h1>
              <p className="text-white/40 text-sm">{t('legal.lastUpdated')}: Marzo 2026</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none flex flex-col gap-6 text-white/70">
            {language === 'es' ? (
              <>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">1. Responsable del Tratamiento</h2>
                  <p>{entityName} {tenantName ? '' : '(operando bajo inagrosolutions.com), con domicilio en España,'} es el responsable del tratamiento de sus datos personales. Para cualquier consulta sobre la protección de sus datos o privacidad en nuestra plataforma SaaS, puede contactarnos en {tenantName ? 'los canales oficiales de la entidad' : 'legal@inagrosolutions.com'}.</p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">2. Datos que Recopilamos</h2>
                  <p>Al utilizar nuestra plataforma SaaS agrícola Multi-Entidad, recopilamos diferentes niveles de información:</p>
                  <ul className="list-disc pl-5 flex flex-col gap-2 mt-2">
                    <li><strong>Datos de cuenta y perfil:</strong> Nombre, apellidos, correo electrónico y rol del usuario dentro de la plataforma (ej. Administrador, Técnico, Agricultor).</li>
                    <li><strong>Datos agronómicos:</strong> Información de fincas, parcelas, maquinaria, tratamientos fitosanitarios y registros de actividad agrícola digital para el cumplimiento del SIEX, introducida por el usuario o su entidad gestora.</li>
                    <li><strong>Datos técnicos y de uso:</strong> Información técnica sobre su dispositivo e interacción con la plataforma para garantizar la seguridad y mejorar nuestros servicios cloud.</li>
                  </ul>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">3. Finalidad del Tratamiento</h2>
                  <p>Tus datos se utilizan con los siguientes propósitos operativos:</p>
                  <ul className="list-disc pl-5 flex flex-col gap-2 mt-2">
                    <li>Proveer acceso a la plataforma SaaS para la gestión del Cuaderno Digital Agrícola.</li>
                    <li>Facilitar la infraestructura Cloud Multi-Tenant para que las Entidades (Cooperativas, Ingenierías) puedan gestionar de forma segura los datos de sus asociados bajo sus propias marcas ("White Label").</li>
                    <li>Permitir la generación y exportación segura de datos agronómicos adaptados a normativas públicas (ej. SIEX, PAC).</li>
                    <li>Garantizar los procesos de facturación de suscripciones, reparto de ingresos para Partners y control de accesos de alta disponibilidad.</li>
                  </ul>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">4. Alojamiento y Seguridad</h2>
                  <p>Todos los datos se alojan en servidores de alta seguridad dentro de la Unión Europea (UE), con encriptación avanzada y cumplimiento estricto del RGPD. Mantenemos políticas de aislamiento de datos (RLS) para asegurar que ninguna entidad acceda a información exclusiva de otra.</p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">5. Tus Derechos</h2>
                  <p>Tienes en todo momento derecho a acceder, rectificar, solicitar la portabilidad o supresión de tus datos. Al tratarse de una plataforma SaaS Multi-Entidad, los agricultores vinculados a un Partner podrán canalizar sus solicitudes directamente a su Entidad o contactar con {tenantName ? 'soporte técnico' : 'soporte@inagrosolutions.com'}.</p>
                </section>
              </>
            ) : (
              <>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">1. Data Controller</h2>
                  <p>{entityName} {tenantName ? '' : '(operating at inagrosolutions.com), based in Spain,'} is the controller of your personal data. For any questions regarding your data protection or privacy on our SaaS platform, you can contact us at {tenantName ? 'the official channels of the entity' : 'legal@inagrosolutions.com'}.</p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">2. Data We Collect</h2>
                  <p>When using our Multi-Tenant agricultural SaaS platform, we collect different layers of information:</p>
                  <ul className="list-disc pl-5 flex flex-col gap-2 mt-2">
                    <li><strong>Account and profile data:</strong> First name, last name, email address, and user role within the platform (e.g., Administrator, Technician, Farmer).</li>
                    <li><strong>Agronomic data:</strong> Information regarding farms, plots, machinery, phytosanitary treatments, and digital field records for SIEX compliance, entered by the user or their managing entity.</li>
                    <li><strong>Technical and usage data:</strong> Technical information about your device and interaction with the platform to ensure security and improve our cloud services.</li>
                  </ul>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">3. Purpose of Processing</h2>
                  <p>Your data is processed for the following operational purposes:</p>
                  <ul className="list-disc pl-5 flex flex-col gap-2 mt-2">
                    <li>Providing access to the SaaS platform for Digital Field Notebook management.</li>
                    <li>Facilitating the Multi-Tenant Cloud infrastructure so Entities (Cooperatives, Engineering firms) can securely manage their associates' data under their own brands (White Label).</li>
                    <li>Enabling the secure generation and export of agronomic data adapted to public regulations (e.g., SIEX, CAP).</li>
                    <li>Managing subscription billing processes, revenue sharing for Partners, and ensuring highly available access control.</li>
                  </ul>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">4. Hosting and Security</h2>
                  <p>All data is hosted on high-security servers located within the European Union (EU), featuring advanced encryption and strict GDPR compliance. We maintain strict row-level security (RLS) data isolation policies to guarantee that no entity can access the exclusive data of another.</p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">5. Your Rights</h2>
                  <p>You have the right to access, rectify, request portability, or delete your data at any time. Due to our Multi-Tenant SaaS structure, farmers linked to a Partner may route their requests directly to their managing Entity or contact {tenantName ? 'technical support' : 'support@inagrosolutions.com'}.</p>
                </section>
              </>
            )}
          </div>
        </GlassCard>
      </div>
    </main>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Cargando...</div>}>
      <PrivacyPolicyContent />
    </Suspense>
  );
}
