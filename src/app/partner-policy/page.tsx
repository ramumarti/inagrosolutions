import React from 'react';
import { ShieldCheck, Scale, Gavel, FileText, Ban, AlertTriangle, Users, Building2, TrendingUp } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

export default function PartnerPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--color-base-100)] text-[var(--color-base-content)] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm font-bold mb-6">
            <ShieldCheck className="w-4 h-4" />
            Marco Legal y Operativo
          </div>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tighter mb-4 uppercase">Términos y Condiciones para Partners</h1>
          <p className="text-white/50 font-medium">Última actualización: 12 de abril de 2026</p>
        </div>

        <div className="space-y-12">
          {/* Section 1 */}
          <section id="definicion" className="space-y-6">
            <div className="flex items-center gap-3 text-2xl font-bold">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                <Users />
              </div>
              1. Definición del Modelo
            </div>
            <GlassCard className="p-8 space-y-4 text-white/70 leading-relaxed font-medium">
              <p><strong className="text-white">Inagrosolutions:</strong> Infraestructura tecnológica SaaS para la gestión digital de explotaciones agrícolas y cumplimiento SIEX.</p>
              <p><strong className="text-white">Partner:</strong> Cooperativas, Asociaciones, Ingenierías y Asesorías que operan bajo Marca Blanca.</p>
              <p><strong className="text-white">Naturaleza de la Relación:</strong> Relación mercantil de colaboración tecnológica. No existe vínculo laboral, sociedad ni franquicia.</p>
            </GlassCard>
          </section>

          {/* Section 2 */}
          <section id="inagro-partner" className="space-y-6">
            <div className="flex items-center gap-3 text-2xl font-bold">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                <TrendingUp />
              </div>
              2. Relación Inagro - Partner
            </div>
            <GlassCard className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-[var(--color-primary)] font-black uppercase text-sm tracking-widest">White Label</h3>
                  <p className="text-white/70 text-sm italic">Derecho a personalizar logotipo, identidad visual y dominio propio (ej: portal.tucooperativa.com).</p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-[var(--color-primary)] font-black uppercase text-sm tracking-widest">Comisión 50%</h3>
                  <p className="text-white/70 text-sm italic">Reparto de ingresos del 50% de la facturación neta generada por los agricultores bajo tu plataforma.</p>
                </div>
              </div>
              <div className="pt-6 border-t border-white/5 text-sm text-white/50 leading-relaxed font-medium">
                La liquidación de comisiones se realiza mensualmente. El registro como partner es gratuito de forma indefinida.
              </div>
            </GlassCard>
          </section>

          {/* Section 4 */}
          <section id="responsabilidad" className="space-y-6">
            <div className="flex items-center gap-3 text-2xl font-bold">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                <Scale />
              </div>
              3. Marco de Responsabilidad
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-6 rounded-2xl bg-white/2 border border-white/5">
                <div className="font-bold text-[var(--color-primary)] mb-2">Inagro</div>
                <p className="text-xs text-white/40 italic">Responsable de la infraestructura técnica y actualizaciones normativas.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/2 border border-white/5">
                <div className="font-bold text-[var(--color-primary)] mb-2">Partner</div>
                <p className="text-xs text-white/40 italic">Responsable del asesoramiento técnico y la gestión de sus asociados.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/2 border border-white/5">
                <div className="font-bold text-[var(--color-primary)] mb-2">Agricultor</div>
                <p className="text-xs text-white/40 italic">Responsable de la veracidad de sus datos (SIEX/RD 1054/2022).</p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section id="datos" className="space-y-6">
            <div className="flex items-center gap-3 text-2xl font-bold">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                <ShieldCheck />
              </div>
              4. Protección de Datos (RGPD)
            </div>
            <GlassCard className="p-8 space-y-4 text-white/70 leading-relaxed font-medium">
              <p>Inagrosolutions actúa como <strong className="text-white">Encargado del Tratamiento</strong>, procesando los datos por cuenta del Partner (Responsable) y del Agricultor.</p>
              <p>Garantizamos medidas de seguridad de alto nivel, backups diarios y cifrado de extremo a extremo para asegurar la integridad de los cuadernos digitales.</p>
            </GlassCard>
          </section>

          {/* Section 7 */}
          <section id="prohibiciones" className="space-y-6">
            <div className="flex items-center gap-3 text-2xl font-bold">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                <Ban />
              </div>
              5. Usos Prohibidos
            </div>
            <div className="space-y-4">
              {[
                'Ingeniería inversa sobre la plataforma.',
                'Manipulación de registros de facturación o comisiones.',
                'Introducción deliberada de datos falsos para eludir normativas estatales.',
                'Suplantación de marca o alteración de precios sin autorización.'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-xs font-bold text-red-500 uppercase tracking-widest">
                  <Ban className="w-4 h-4 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </section>

          {/* Section 10 */}
          <section id="disclaimer" className="space-y-6">
            <div className="flex items-center gap-3 text-2xl font-bold text-yellow-500">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <AlertTriangle />
              </div>
              Nota Importante
            </div>
            <div className="p-8 rounded-3xl bg-yellow-500/5 border border-yellow-500/10 backdrop-blur-xl mb-12">
              <p className="text-yellow-500/80 leading-relaxed font-bold italic">
                Inagrosolutions es una herramienta técnica de apoyo. No sustituye el asesoramiento legal especializado ni garantiza la ausencia de sanciones administrativas si el usuario introduce información errónea o incompleta. El cumplimiento final del RD 1054/2022 es responsabilidad del usuario obligado.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-20 pt-12 border-t border-white/5 text-center">
          <p className="text-white/20 text-xs font-black uppercase tracking-widest">© 2026 Inagrosolutions - Tecnología Agrícola Profesional</p>
        </div>
      </div>
    </div>
  );
}
