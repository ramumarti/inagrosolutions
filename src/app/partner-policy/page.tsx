import React from 'react';
import { ShieldCheck, Scale, Gavel, FileText, Ban, AlertTriangle, Users, Building2, TrendingUp, Euro, Receipt, BookOpen } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

const Section = ({ id, icon: Icon, number, title, children }: any) => (
  <section id={id} className="space-y-6">
    <div className="flex items-center gap-3 text-2xl font-bold">
      <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
        <Icon size={20} />
      </div>
      {number}. {title}
    </div>
    {children}
  </section>
);

export default function PartnerPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--color-base-100)] text-[var(--color-base-content)] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm font-bold mb-6">
            <ShieldCheck className="w-4 h-4" />
            Contrato de Licencia y Colaboración Tecnológica
          </div>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tighter mb-4 uppercase">
            Términos y Condiciones para Partners
          </h1>
          <p className="text-white/50 font-medium">Última actualización: 10 de mayo de 2026</p>
          <p className="text-white/30 text-xs mt-2 font-mono">
            Referencia legal: Contrato de Licencia de Software y Servicios Tecnológicos · Art. 1255 CC · Ley 34/2002 LSSI
          </p>
        </div>

        <div className="space-y-14">

          {/* === SECCIÓN 1 === */}
          <Section id="partes" icon={Users} number="1" title="Partes Contratantes">
            <GlassCard className="p-8 space-y-6 text-white/70 leading-relaxed font-medium">
              <p>
                El presente Contrato de Licencia de Software y Servicios Tecnológicos (en adelante, el <strong className="text-white">"Contrato"</strong>) se celebra entre:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-2xl space-y-2">
                  <p className="text-[var(--color-primary)] font-black text-sm uppercase tracking-widest">Licenciante</p>
                  <p className="text-white font-bold">INAGROSOLUTIONS S.L.</p>
                  <p className="text-xs text-white/50">Sociedad española de tecnología agrícola, titular de la plataforma Cuaderno Digital bajo la marca InagroSolutions. (en adelante, <strong className="text-white/80">"INAGROSOLUTIONS"</strong>)</p>
                </div>
                <div className="p-5 bg-white/[0.03] border border-white/10 rounded-2xl space-y-2">
                  <p className="text-white/60 font-black text-sm uppercase tracking-widest">Licenciatario / Partner</p>
                  <p className="text-white font-bold">La Entidad Registrada</p>
                  <p className="text-xs text-white/50">Cooperativa, Asociación, Ingeniería u Organización que acepta los presentes términos en el momento del registro en la plataforma. (en adelante, <strong className="text-white/80">"PARTNER"</strong>)</p>
                </div>
              </div>
              <p className="text-xs text-white/40 italic border-t border-white/5 pt-4">
                La aceptación electrónica de este contrato durante el proceso de registro tiene plena validez jurídica conforme al art. 23 de la Ley 34/2002 (LSSI-CE) y el art. 1262 del Código Civil español.
              </p>
            </GlassCard>
          </Section>

          {/* === SECCIÓN 2 === */}
          <Section id="objeto" icon={FileText} number="2" title="Objeto del Contrato — Licencia de Software">
            <GlassCard className="p-8 space-y-5 text-white/70 leading-relaxed font-medium">
              <p>
                INAGROSOLUTIONS concede al PARTNER una <strong className="text-white">licencia de uso no exclusiva, intransferible y limitada</strong> para acceder y operar la plataforma tecnológica <em>"Cuaderno Digital InagroSolutions"</em>, incluyendo:
              </p>
              <ul className="space-y-3">
                {[
                  'Acceso al panel de administración white-label (personalización de marca)',
                  'Infraestructura SaaS para gestión del Cuaderno de Explotación Digital (RD 1054/2022)',
                  'Integración con el sistema SIEX del Ministerio de Agricultura, Pesca y Alimentación',
                  'Soporte técnico, actualizaciones normativas y mantenimiento de la plataforma',
                  'Sistema de gestión de agricultores asociados al PARTNER',
                  'Pasarela de pagos tecnológica mediante Stripe Connect',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-[var(--color-primary)] font-black mt-0.5">→</span>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="p-4 bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-xl">
                <p className="text-sm text-[var(--color-primary)]/80 font-bold">
                  Base legal: Contrato de licencia de software (art. 99 y ss. TRLPI — Real Decreto Legislativo 1/1996) y prestación de servicios de la sociedad de la información (art. 2 y 23 LSSI-CE).
                </p>
              </div>
            </GlassCard>
          </Section>

          {/* === SECCIÓN 3 — CLAVE LEGAL === */}
          <Section id="contraprestacion" icon={Euro} number="3" title="Contraprestación Económica y Justificación Legal del Reparto">
            <GlassCard className="p-8 space-y-6">
              <p className="text-white/70 leading-relaxed font-medium">
                En contraprestación a la licencia y servicios descritos en la Cláusula 2, el PARTNER abona a INAGROSOLUTIONS una <strong className="text-white">tarifa de licencia variable</strong>, calculada como un porcentaje de los ingresos generados por las suscripciones de los agricultores gestionados a través de la plataforma.
              </p>

              <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-4">
                <h3 className="text-amber-400 font-black text-sm uppercase tracking-widest flex items-center gap-2">
                  <Receipt size={16} />
                  Estructura de Facturación y Justificación del Ingreso de INAGROSOLUTIONS
                </h3>
                <div className="space-y-4 text-sm text-white/70">
                  <p>
                    <strong className="text-white">3.1. Factura del PARTNER al Agricultor:</strong> El PARTNER, en su condición de licenciatario de la plataforma, puede facturar a sus agricultores por el <em>"Servicio de Gestión del Cuaderno Digital de Explotación y acceso al Sistema SIEX"</em> bajo su propia razón social y CIF. Esta factura es emitida y gestionada íntegramente por el PARTNER.
                  </p>
                  <p>
                    <strong className="text-white">3.2. Factura de INAGROSOLUTIONS al PARTNER (Licencia):</strong> Por cada período de facturación (mensual), INAGROSOLUTIONS emitirá al PARTNER una factura en concepto de <em>"Licencia de uso de la plataforma tecnológica InagroSolutions — tarifa variable sobre suscripciones activas"</em>, equivalente al <strong className="text-amber-400">50% del importe neto (sin IVA) de las suscripciones de agricultores gestionadas en dicho período</strong>.
                  </p>
                  <p>
                    <strong className="text-white">3.3. Mecanismo de Liquidación Técnica (Stripe Connect):</strong> A efectos operativos, la distribución de fondos se realiza automáticamente mediante el sistema Stripe Connect Express (Direct Charges), en el que INAGROSOLUTIONS actúa como plataforma y aplica un <em>application fee</em> del 50% sobre cada transacción. Este mecanismo técnico es equivalente al cobro anticipado de la licencia descrita en el punto 3.2, y las facturas mensuales emitidas por INAGROSOLUTIONS al PARTNER documentarán formalmente estas cantidades.
                  </p>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <p className="text-xs text-white/50 font-mono">
                      IMPORTANTE: El <em>application_fee</em> de Stripe NO es el justificante fiscal. El justificante fiscal es la factura mensual que INAGROSOLUTIONS emite al PARTNER según el punto 3.2. Ambas partes deben incluir estas facturas en su contabilidad y declaraciones de IVA.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cuadro resumen */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-white/40">Flujo</th>
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-white/40">Quién emite</th>
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-white/40">A quién</th>
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-white/40">Concepto</th>
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-white/40">IVA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-bold text-white">1. Servicio SIEX</td>
                      <td className="py-3 px-4 text-white/60">PARTNER (cooperativa)</td>
                      <td className="py-3 px-4 text-white/60">Agricultor</td>
                      <td className="py-3 px-4 text-white/60">Cuaderno Digital / Gestión SIEX</td>
                      <td className="py-3 px-4 text-[var(--color-primary)] font-bold">21%</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-bold text-white">2. Licencia SaaS</td>
                      <td className="py-3 px-4 text-[var(--color-primary)] font-bold">INAGROSOLUTIONS</td>
                      <td className="py-3 px-4 text-[var(--color-primary)] font-bold">PARTNER</td>
                      <td className="py-3 px-4 text-white/60">Licencia plataforma (50% s/ suscripciones)</td>
                      <td className="py-3 px-4 text-[var(--color-primary)] font-bold">21%</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02] bg-white/[0.01]">
                      <td className="py-3 px-4 font-bold text-white/40 text-xs">3. (Técnico)</td>
                      <td className="py-3 px-4 text-white/30 text-xs">Stripe Connect</td>
                      <td className="py-3 px-4 text-white/30 text-xs">Automático</td>
                      <td className="py-3 px-4 text-white/30 text-xs">Application fee (mecanismo interno)</td>
                      <td className="py-3 px-4 text-white/30 text-xs">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                <p className="text-sm text-emerald-400/80 leading-relaxed">
                  <strong className="text-emerald-400">Base legal del ingreso de INAGROSOLUTIONS:</strong> Art. 11 de la Ley 37/1992 del IVA (prestación de servicios), arts. 1544 y 1255 del Código Civil (contrato de arrendamiento de servicios / contratos atípicos) y Real Decreto Legislativo 1/1996 (TRLPI) para licencias de software. La tarifa variable sobre ingresos es un modelo de contraprestación legalmente reconocido en el art. 1255 CC (autonomía de la voluntad).
                </p>
              </div>
            </GlassCard>
          </Section>

          {/* === SECCIÓN 4 === */}
          <Section id="obligaciones-fiscales" icon={Receipt} number="4" title="Obligaciones Fiscales de las Partes">
            <GlassCard className="p-8 space-y-5 text-white/70 leading-relaxed font-medium">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-[var(--color-primary)] font-black text-sm uppercase tracking-widest">PARTNER — Obligaciones</h3>
                  <ul className="space-y-2 text-sm">
                    {[
                      'Emitir facturas a sus agricultores conforme al RD 1619/2012',
                      'Declarar el IVA repercutido (21%) — Modelo 303 trimestral',
                      'Registrar como gasto la factura de licencia de INAGROSOLUTIONS',
                      'Completar el KYC de Stripe Connect (identificación fiscal)',
                      'Facilitar IBAN español válido para recibir los payouts',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[var(--color-primary)] mt-0.5 text-xs">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="text-amber-400 font-black text-sm uppercase tracking-widest">INAGROSOLUTIONS — Obligaciones</h3>
                  <ul className="space-y-2 text-sm">
                    {[
                      'Emitir factura mensual al PARTNER por la licencia (50% s/ suscripciones)',
                      'Declarar el IVA repercutido (21%) en sus facturas — Modelo 303',
                      'Declarar el application_fee como ingreso de explotación — IS (Modelo 200)',
                      'Mantener registro contable de todas las transacciones por tenant',
                      'Facilitar informe mensual de liquidación a cada PARTNER',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5 text-xs">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                <p className="text-xs text-red-400/80">
                  <strong className="text-red-400">Retención IRPF:</strong> Si el PARTNER es persona física (autónomo), las facturas de licencia emitidas por INAGROSOLUTIONS llevarán retención del 15% de IRPF (art. 101.5 LIRPF). Si es persona jurídica (SL, cooperativa, asociación), NO aplica retención, aunque sí aplica la retención del 19% sobre el IS si aplica el art. 25 TRLIS.
                </p>
              </div>
            </GlassCard>
          </Section>

          {/* === SECCIÓN 5 === */}
          <Section id="modelo-relacion" icon={Building2} number="5" title="Naturaleza Jurídica de la Relación">
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { title: 'Licenciante', color: 'var(--color-primary)', desc: 'INAGROSOLUTIONS actúa como licenciante de software y prestador de servicios tecnológicos. No es franquiciador ni socio mercantil del PARTNER.' },
                { title: 'Licenciatario', color: '#6366F1', desc: 'El PARTNER opera como licenciatario independiente. Actúa en nombre propio frente a sus agricultores y es responsable de su cumplimiento fiscal y legal.' },
                { title: 'Sin Relación Laboral', color: '#EF4444', desc: 'Este contrato no genera relación laboral, societaria ni de agencia entre las partes. Cada parte mantiene su independencia empresarial.' },
              ].map((card, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                  <div className="font-black text-sm uppercase tracking-widest" style={{ color: card.color }}>{card.title}</div>
                  <p className="text-xs text-white/50 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* === SECCIÓN 6 === */}
          <Section id="responsabilidad" icon={Scale} number="6" title="Marco de Responsabilidad">
            <GlassCard className="p-8 space-y-4 text-white/70 leading-relaxed font-medium">
              <p>La responsabilidad de cada parte queda delimitada conforme a lo siguiente:</p>
              <ul className="space-y-3 text-sm">
                {[
                  { who: 'INAGROSOLUTIONS', resp: 'Responsable de la disponibilidad técnica de la plataforma (SLA 99,5%), actualizaciones normativas SIEX, seguridad de los datos y correcto funcionamiento de la integración con Stripe.' },
                  { who: 'PARTNER', resp: 'Responsable del asesoramiento agrícola prestado a sus socios, de la veracidad de los datos fiscales aportados en el registro, del cumplimiento de sus obligaciones tributarias y de la correcta comunicación con sus agricultores.' },
                  { who: 'Agricultor', resp: 'Responsable de la veracidad de los datos introducidos en el Cuaderno Digital y del cumplimiento del RD 1054/2022 (SIEX).' },
                ].map((item, i) => (
                  <li key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                    <span className="text-[var(--color-primary)] font-black">{item.who}: </span>
                    {item.resp}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </Section>

          {/* === SECCIÓN 7 === */}
          <Section id="datos" icon={ShieldCheck} number="7" title="Protección de Datos (RGPD / LOPDGDD)">
            <GlassCard className="p-8 space-y-4 text-white/70 leading-relaxed font-medium">
              <p>
                En el marco de la ejecución del presente Contrato, INAGROSOLUTIONS actúa como <strong className="text-white">Encargado del Tratamiento</strong> (art. 28 RGPD) de los datos personales de los agricultores, procesándolos por cuenta del PARTNER que actúa como <strong className="text-white">Responsable del Tratamiento</strong>.
              </p>
              <p>
                Respecto a los datos fiscales del PARTNER, INAGROSOLUTIONS actúa como Responsable del Tratamiento conforme a sus obligaciones tributarias (Ley 58/2003, LGT).
              </p>
              <p>
                Stripe, Inc. actúa como Subencargado del Tratamiento para la gestión de los datos de pago, bajo el estándar PCI DSS Level 1. Las transferencias internacionales de datos se realizan bajo las cláusulas contractuales tipo aprobadas por la Comisión Europea.
              </p>
            </GlassCard>
          </Section>

          {/* === SECCIÓN 8 === */}
          <Section id="prohibiciones" icon={Ban} number="8" title="Usos Prohibidos">
            <div className="space-y-3">
              {[
                'Ingeniería inversa, descompilación o extracción del código fuente de la plataforma.',
                'Manipulación de registros de facturación, suscripciones o comisiones.',
                'Introducción deliberada de datos falsos para eludir normativas estatales (SIEX/PAC).',
                'Suplantación de marca o alteración de precios sin autorización escrita de INAGROSOLUTIONS.',
                'Cesión, sublicencia o reventa de la licencia a terceros.',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-xs font-bold text-red-500 uppercase tracking-widest">
                  <Ban className="w-4 h-4 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </Section>

          {/* === SECCIÓN 9 === */}
          <Section id="jurisdiccion" icon={Gavel} number="9" title="Jurisdicción y Ley Aplicable">
            <GlassCard className="p-8 space-y-4 text-white/70 leading-relaxed font-medium">
              <p>
                El presente Contrato se rige por la <strong className="text-white">legislación española</strong>. Las partes, con renuncia a su fuero propio si lo tuvieren, se someten a los Juzgados y Tribunales de <strong className="text-white">Madrid</strong> para la resolución de cualquier controversia derivada de la interpretación o ejecución del presente Contrato.
              </p>
              <p className="text-sm text-white/50">
                Normativa de referencia: Código Civil (arts. 1255, 1544), Ley 34/2002 LSSI-CE, Ley 37/1992 (IVA), RDL 1/1996 (TRLPI), RGPD (UE) 2016/679, Ley Orgánica 3/2018 (LOPDGDD).
              </p>
            </GlassCard>
          </Section>

          {/* === AVISO IMPORTANTE === */}
          <section className="p-8 rounded-3xl bg-yellow-500/5 border border-yellow-500/10 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500 shrink-0 mt-1" />
              <div className="space-y-2">
                <p className="text-yellow-500 font-black uppercase tracking-widest text-sm">Nota Importante</p>
                <p className="text-yellow-500/80 leading-relaxed font-medium text-sm">
                  InagroSolutions es una herramienta técnica de apoyo al cumplimiento normativo. No sustituye el asesoramiento jurídico, fiscal o agronómico especializado. El cumplimiento final del RD 1054/2022 (SIEX) y de las obligaciones tributarias derivadas del presente Contrato es responsabilidad exclusiva de cada parte conforme a sus circunstancias individuales. Se recomienda a cada PARTNER consultar con su asesor fiscal antes de iniciar operaciones.
                </p>
              </div>
            </div>
          </section>

        </div>

        <div className="mt-20 pt-12 border-t border-white/5 text-center space-y-2">
          <p className="text-white/20 text-xs font-black uppercase tracking-widest">
            © 2026 INAGROSOLUTIONS S.L. — Tecnología Agrícola Profesional
          </p>
          <p className="text-white/10 text-xs">
            La aceptación electrónica de este contrato durante el registro tiene plena validez conforme al art. 23 Ley 34/2002 (LSSI-CE)
          </p>
        </div>
      </div>
    </div>
  );
}
