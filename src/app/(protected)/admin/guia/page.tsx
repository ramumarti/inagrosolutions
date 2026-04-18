"use client";

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { BookOpen, CheckCircle2, Star, Rocket, Zap, Users, ShieldCheck, Palette } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function GuidePage() {
  const { language } = useI18n();

  const sections = [
    {
      title: language === 'en' ? 'Branding & Identity' : 'Identidad y Marca Blanca',
      icon: <Palette className="text-emerald-400" />,
      content: language === 'en' 
        ? 'Upload a high-quality logo and match your corporate colors. This builds trust with your farmers as they will see your brand, not ours.' 
        : 'Sube un logo de alta resolución y ajusta los colores corporativos. Esto genera confianza en tus socios, ya que verán tu marca y no la nuestra.',
      items: [
        language === 'en' ? 'Transparent PNG/SVG logo' : 'Logo PNG/SVG transparente',
        language === 'en' ? 'Primary color for buttons' : 'Color primario para botones',
        language === 'en' ? 'Custom domain configuration' : 'Configuración de dominio propio'
      ]
    },
    {
      title: language === 'en' ? 'Farmer Onboarding' : 'Captación de Agricultores',
      icon: <Users className="text-blue-400" />,
      content: language === 'en'
        ? 'Use your personalized landing page to invite farmers via WhatsApp or email. Faster registration means faster compliance.'
        : 'Usa tu página de aterrizaje personalizada para invitar a los socios por WhatsApp o email. Un registro rápido garantiza el cumplimiento normativo.',
      items: [
        language === 'en' ? 'Share your /c/[slug] URL' : 'Comparte tu URL de /c/[slug]',
        language === 'en' ? 'Bulk import from Excel' : 'Carga masiva desde Excel',
        language === 'en' ? 'Onboarding assistance' : 'Asistencia en el registro inicial'
      ]
    },
    {
      title: language === 'en' ? 'Technical Supervision' : 'Supervisión Técnica SIEX',
      icon: <ShieldCheck className="text-amber-400" />,
      content: language === 'en'
        ? 'The real power is monitoring all notebooks from one place. identify who is missing treatments or has warnings.'
        : 'El verdadero potencial está en monitorizar todos los cuadernos desde un solo sitio. Identifica quién no ha anotado tratamientos o tiene avisos.',
      items: [
        language === 'en' ? 'Weekly notebook review' : 'Revisión semanal de cuadernos',
        language === 'en' ? 'MAPA registry validation' : 'Validación de registros del MAPA',
        language === 'en' ? 'Direct technical advising' : 'Asesoramiento técnico directo'
      ]
    },
    {
      title: language === 'en' ? 'Monetization' : 'Monetización (Revenue Share)',
      icon: <Zap className="text-orange-400" />,
      content: language === 'en'
        ? 'Earn 50% of subscriptions from your farmers. We handle the technical part, you handle the professional service.'
        : 'Gana el 50% de las suscripciones de tus agricultores. Nosotros ponemos la tecnología, tú pones el servicio profesional.',
      items: [
        language === 'en' ? 'Automatic commissions' : 'Comisiones automáticas',
        language === 'en' ? 'Zero maintenance costs' : 'Cero costes de mantenimiento',
        language === 'en' ? 'Premium feature upsell' : 'Venta de módulos premium'
      ]
    }
  ];

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group">
            <Rocket className="w-8 h-8 text-emerald-500 group-hover:animate-bounce" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight glow-text">
          {language === 'en' ? 'Partner Success Guide' : 'Guía de Éxito para Partners'}
        </h1>
        <p className="text-xl text-white/50 font-medium leading-relaxed">
          {language === 'en' 
            ? 'Everything you need to know to lead the digital transformation of your farmers.' 
            : 'Todo lo que necesitas para liderar la transformación digital de tus agricultores y sacar el máximo provecho a tu portal.'}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section, idx) => (
          <GlassCard key={idx} className="p-8 space-y-6 hover:border-white/20 transition-all group border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
                {section.icon}
              </div>
              <h3 className="text-2xl font-black text-white">{section.title}</h3>
            </div>
            
            <p className="text-white/60 leading-relaxed font-medium">
              {section.content}
            </p>

            <ul className="space-y-3 pt-4">
              {section.items.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-white/40 group-hover:text-white/60 transition-colors">
                  <CheckCircle2 size={16} className="text-[var(--color-primary)]" />
                  {item}
                </li>
              ))}
            </ul>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-10 border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5">
           <Star size={200} />
        </div>
        <div className="relative z-10 grid md:grid-cols-3 gap-12 items-center text-center md:text-left">
           <div className="md:col-span-2 space-y-4">
              <h2 className="text-3xl font-black text-white">¿Necesitas soporte personalizado?</h2>
              <p className="text-white/60 font-medium">Nuestro equipo técnico está a tu disposición para ayudarte con la configuración avanzada de dominios o integraciones específicas de tu cooperativa.</p>
           </div>
           <div className="flex justify-center md:justify-end">
              <button className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-2xl">
                Contactar soporte
              </button>
           </div>
        </div>
      </GlassCard>

      <footer className="py-12 text-center">
         <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">InagroSolutions Enterprise Program • 2026</p>
      </footer>
    </div>
  );
}
