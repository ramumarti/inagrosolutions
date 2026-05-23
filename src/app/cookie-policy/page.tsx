"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Cookie, ChevronLeft } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useI18n } from '@/lib/i18n';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function CookiePolicyContent() {
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
              <h1 className="text-3xl font-bold text-white">{t('gdpr.cookiePolicy')} {tenantName ? `de ${tenantName}` : ''}</h1>
              <p className="text-white/40 text-sm">{t('legal.lastUpdated')}: Marzo 2026</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none flex flex-col gap-6 text-white/70">
            {language === 'es' ? (
              <>
                <p>En <strong>{fiscalName}</strong> {tenantData ? '' : '(operando bajo inagrosolutions.com)'}, utilizamos cookies instrumentales y de sesión para garantizar la seguridad y funcionalidad de nuestra plataforma SaaS Multi-Entidad.</p>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">1. Naturaleza de nuestras cookies</h2>
                  <p>Al ser una plataforma B2B (Business-to-Business) orientada a la gestión agronómica en la nube, {entityName} <strong>no emplea cookies publicitarias ni rastreadores de terceros</strong> con fines comerciales. Todas nuestras cookies están orientadas a la operativa y seguridad del sistema.</p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">2. Cookies Estrictamente Necesarias</h2>
                  <p>Son aquellas indispensables para que la plataforma SaaS funcione y mantenga el aislamiento de datos entre entidades:</p>
                  <ul className="list-disc pl-5 flex flex-col gap-2 mt-2">
                    <li><strong>Autenticación y Sesión:</strong> Empleamos cookies seguras gestionadas por Supabase para mantener tu acceso, validar tu rol (Agricultor, Técnico, Administrador) y enrutar tu navegador al panel correcto (Cuaderno Digital, Panel White Label, etc.).</li>
                    <li><strong>Aislamiento Multi-Tenant (RLS):</strong> Cookies técnicas imprescindibles para la aplicación de políticas de seguridad a nivel de base de datos (Row Level Security), asegurando que interactúas en el entorno cerrado de tu Cooperativa o Ingeniería asignada.</li>
                    <li><strong>Preferencias del sistema:</strong> Para recordar selecciones locales como idioma (i18n), el estado de los menús (abierto/cerrado) o la visualización del dashboard.</li>
                  </ul>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">3. Gestión y Desactivación</h2>
                  <p>Dado que nuestras cookies son de naturaleza puramente técnica y de seguridad, la desactivación de las mismas desde su navegador impedirá el acceso a su área privada y al uso del Cuaderno Digital. Puede gestionarlas desde los ajustes de su navegador web habitual.</p>
                </section>
              </>
            ) : (
              <>
                <p>At <strong>{fiscalName}</strong> {tenantData ? '' : '(operating at inagrosolutions.com)'}, we use instrumental and session cookies to ensure the security and functionality of our Multi-Tenant SaaS platform.</p>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">1. Nature of our cookies</h2>
                  <p>Being a B2B (Business-to-Business) platform focused on cloud agronomic management, {entityName} <strong>does not use advertising cookies or third-party trackers</strong> for commercial purposes. All our cookies are oriented towards system operations and security.</p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">2. Strictly Necessary Cookies</h2>
                  <p>These are indispensable for the SaaS platform to function and to maintain data isolation between entities:</p>
                  <ul className="list-disc pl-5 flex flex-col gap-2 mt-2">
                    <li><strong>Authentication & Session:</strong> We employ secure cookies managed by Supabase to maintain your access, validate your role (Farmer, Technician, Administrator), and route your browser to the correct dashboard (Digital Notebook, White Label Panel, etc.).</li>
                    <li><strong>Multi-Tenant Isolation (RLS):</strong> Technical cookies vital for applying database-level security policies (Row Level Security), ensuring you interact securely within your assigned Cooperative or Engineering environment.</li>
                    <li><strong>System Preferences:</strong> Used to remember local selections like language (i18n), menu states (open/closed), or dashboard display settings.</li>
                  </ul>
                </section>
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">3. Management and Deactivation</h2>
                  <p>Since our cookies are purely technical and security-based, disabling them in your browser will prevent access to your private area and the use of the Digital Field Notebook. You can manage them through your standard web browser settings.</p>
                </section>
              </>
            )}
          </div>
        </GlassCard>
      </div>
    </main>
  );
}

export default function CookiePolicyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Cargando...</div>}>
      <CookiePolicyContent />
    </Suspense>
  );
}
