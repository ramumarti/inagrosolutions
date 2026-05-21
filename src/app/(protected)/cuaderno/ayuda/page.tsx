"use client";

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { 
  HelpCircle, ShieldAlert, CreditCard, LayoutDashboard, Camera, 
  Mic, FileJson, ChevronDown, CheckCircle2, Leaf, AlertTriangle 
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function AyudaAgricultorPage() {
  const { language } = useI18n();
  const [activeSection, setActiveSection] = useState<string | null>('legal');

  const toggleSection = (id: string) => {
    if (activeSection === id) setActiveSection(null);
    else setActiveSection(id);
  };

  const secciones = [
    {
      id: 'legal',
      title: '1. ¿Por qué es obligatorio este Cuaderno? (SIEX)',
      icon: <ShieldAlert className="text-amber-400" />,
      content: (
        <div className="space-y-4 text-white/70 text-sm md:text-base">
          <p>El Ministerio de Agricultura ha implementado la normativa <strong>SIEX</strong> (Sistema de Información de Explotaciones Agrícolas). Esto significa que el antiguo cuaderno de campo en papel ya no es válido para recibir ayudas de la PAC ni para pasar inspecciones.</p>
          <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 text-amber-200">
            <h4 className="font-bold mb-2 flex items-center gap-2"><AlertTriangle size={18}/> ¿Qué te evita esta herramienta?</h4>
            <p>Usar esta aplicación garantiza que todos tus datos están en el formato exacto que exige la ley. Te ahorra multas por errores de cálculo de dosis o por olvidos, ya que nuestro sistema te avisa antes de cometer una infracción.</p>
          </div>
        </div>
      )
    },
    {
      id: 'planes',
      title: '2. Suscripciones y Cambio de Plan',
      icon: <CreditCard className="text-blue-400" />,
      content: (
        <div className="space-y-4 text-white/70 text-sm md:text-base">
          <p>En el menú lateral encontrarás la pestaña <strong>Planes</strong>. Desde ahí puedes gestionar los servicios que tienes contratados.</p>
          <ul className="space-y-3 pl-4">
            <li><strong className="text-white">Plan Básico:</strong> Te permite llevar el control manual de tus parcelas y generar el Excel oficial para entregarlo sin coste adicional.</li>
            <li><strong className="text-white">Planes Premium (Inteligencia Artificial):</strong> Al subir de plan, desbloqueas funciones automáticas que te ahorran horas de trabajo, como escanear facturas de abonos con la cámara del móvil o dictarle los tratamientos por voz al sistema mientras vas en el tractor.</li>
            <li><strong className="text-white">¿Cómo mejorar?</strong> Solo tienes que ir a la pestaña Planes, seleccionar el nivel que necesites (basado en tus hectáreas) y tu cuenta se actualizará en segundos.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'panel',
      title: '3. Tu Panel de Inicio (El Dashboard)',
      icon: <LayoutDashboard className="text-emerald-400" />,
      content: (
        <div className="space-y-4 text-white/70 text-sm md:text-base">
          <p>Al entrar a la app, verás tu panel de control principal. Aquí tienes la visión general de tu explotación.</p>
          <div className="grid gap-3 mt-2">
            <div className="p-3 bg-white/5 rounded-lg border-l-2 border-emerald-500">
              <strong className="text-white block">Clima y Humedad</strong>
              Muestra previsiones climatológicas. Ideal para decidir si es buen día para pulverizar o si hay riesgo de que la lluvia lave el producto.
            </div>
            <div className="p-3 bg-white/5 rounded-lg border-l-2 border-amber-500">
              <strong className="text-white block">Alertas de Cuaderno</strong>
              Si te falta algún dato obligatorio (como el número de registro de tu tractor o el número del carnet de aplicador), el panel te mostrará un aviso rojo para que lo corrijas.
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'almacen',
      title: '4. Almacén de Insumos (Escáner IA)',
      icon: <Camera className="text-purple-400" />,
      content: (
        <div className="space-y-4 text-white/70 text-sm md:text-base">
          <p>Para no volverte loco metiendo datos de garrafas y sacos de abono, usa el Almacén Inteligente.</p>
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <h4 className="font-bold text-white mb-2 flex items-center gap-2">📸 Escanear una Factura</h4>
            <p className="mb-2">1. Ve a la pestaña <strong>Almacén de Insumos</strong>.</p>
            <p className="mb-2">2. Toca en el botón <strong>"Escanear Factura"</strong>. Se abrirá la cámara de tu móvil.</p>
            <p>3. Haz una foto clara al albarán. La Inteligencia Artificial leerá el nombre de los productos, la cantidad en litros/kilos y el coste, y lo meterá solo en tu inventario virtual.</p>
          </div>
        </div>
      )
    },
    {
      id: 'registro',
      title: '5. Apuntar Trabajos en el Campo (Micrófono)',
      icon: <Mic className="text-rose-400" />,
      content: (
        <div className="space-y-4 text-white/70 text-sm md:text-base">
          <p>No esperes a llegar a casa de noche para encender el ordenador. Puedes apuntar los tratamientos desde el mismo tractor usando tu voz.</p>
          <ul className="space-y-4 list-decimal pl-5">
            <li>
              <strong className="text-white block">Abre la pestaña de Fitosanitarios o Fertilización</strong>
              Toca el botón brillante de <strong>"Rellenar con Voz"</strong>.
            </li>
            <li>
              <strong className="text-white block">Habla con naturalidad</strong>
              Puedes decir algo como: <em>"Hoy le he echado 5 litros de Cobre a la parcela de los almendros de arriba con la cuba pequeña"</em>.
            </li>
            <li>
              <strong className="text-white block">La IA hace el resto</strong>
              El sistema entiende lo que has dicho, rellena las casillas correspondientes y, además, descuenta automáticamente esos 5 litros de tu inventario del Almacén. ¡Así de simple!
            </li>
          </ul>
          <div className="p-3 mt-4 bg-emerald-500/10 rounded-xl text-emerald-200 text-sm italic">
            <strong>💡 Consejo:</strong> Si en la finca no tienes buena cobertura de internet, abre la aplicación igual. Los datos se guardan en tu teléfono y se sincronizarán solos cuando pilles WiFi al llegar a casa.
          </div>
        </div>
      )
    },
    {
      id: 'exportacion',
      title: '6. Validación de Dosis y Exportación SIEX',
      icon: <FileJson className="text-blue-400" />,
      content: (
        <div className="space-y-4 text-white/70 text-sm md:text-base">
          <p>El objetivo final es cumplir con el Ministerio de Agricultura y la Junta de forma impecable.</p>
          <div className="grid gap-4 mt-2">
            <div className="p-3 bg-white/5 rounded-lg border-l-2 border-red-500">
              <strong className="text-white block">Avisos del Vademécum</strong>
              Si por error apuntas 10 Litros/Ha de un herbicida cuyo límite legal es de 3 Litros/Ha, el sistema bloqueará la acción y te avisará. La plataforma está conectada en tiempo real a la base de datos oficial del Ministerio (MAPA).
            </div>
            <div className="p-3 bg-white/5 rounded-lg border-l-2 border-emerald-500">
              <strong className="text-white block">Generar el Archivo (Exportación PAC)</strong>
              Cuando acabe la campaña o tengas una inspección, solo tienes que ir a la pestaña <strong>Registro SIEX / Exportación</strong>. Con un solo clic, se generará el documento Excel legal con el formato exacto que piden los inspectores, listo para enviar.
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      
      <header className="space-y-4 mb-8 text-center sm:text-left">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto sm:mx-0 mb-6">
            <HelpCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight glow-text text-white">
          Manual del Agricultor
        </h1>
        <p className="text-lg text-white/50 font-medium leading-relaxed">
          Todo lo que necesitas saber para manejar tu cuaderno digital, ahorrar tiempo usando la IA y cumplir la normativa SIEX fácilmente.
        </p>
      </header>

      <div className="space-y-3">
        {secciones.map((section) => (
          <GlassCard key={section.id} className="border-white/5 bg-white/[0.02] overflow-hidden transition-all duration-300">
            <button 
              onClick={() => toggleSection(section.id)}
              className="w-full p-5 sm:p-6 flex items-center justify-between text-left focus:outline-none hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-4 pr-4">
                <div className="p-3 bg-white/5 rounded-xl shrink-0">
                  {section.icon}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">{section.title}</h2>
              </div>
              <div className={`p-2 rounded-full shrink-0 transition-transform duration-300 ${activeSection === section.id ? 'rotate-180 bg-white/10' : 'bg-transparent'}`}>
                <ChevronDown className="w-5 h-5 text-white/50" />
              </div>
            </button>
            
            <div 
              className={`transition-all duration-500 ease-in-out ${
                activeSection === section.id ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="p-5 sm:p-6 pt-0 border-t border-white/5 mt-2">
                {section.content}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-center">
        <Leaf className="w-8 h-8 text-[var(--color-primary)] mx-auto mb-4" />
        <h3 className="text-xl font-black text-white mb-2">¡Estás listo para empezar!</h3>
        <p className="text-white/60 mb-6 max-w-md mx-auto">Vuelve a tu panel principal o escanea tu primera factura para empezar a rellenar el cuaderno automáticamente.</p>
        <button 
          onClick={() => window.history.back()}
          className="px-8 py-3 bg-[var(--color-primary)] text-black font-bold rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.3)]"
        >
          Volver a mi Cuaderno
        </button>
      </div>

    </div>
  );
}
