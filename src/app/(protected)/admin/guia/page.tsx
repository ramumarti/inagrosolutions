"use client";

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { 
  BookOpen, LayoutGrid, Palette, Link as LinkIcon, Users, 
  Megaphone, ShieldCheck, Zap, ChevronDown, ChevronRight, CheckCircle2 
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function GuidePage() {
  const { language } = useI18n();
  const [activeSection, setActiveSection] = useState<string | null>('panel');

  const toggleSection = (id: string) => {
    if (activeSection === id) {
      setActiveSection(null);
    } else {
      setActiveSection(id);
    }
  };

  const manualSections = [
    {
      id: 'panel',
      title: '1. Descripción del Panel de Administración',
      icon: <LayoutGrid className="text-blue-400" />,
      content: (
        <div className="space-y-4 text-white/70">
          <p>Tu panel lateral izquierdo es el centro de mando de toda la cooperativa. Desde aquí puedes gestionar a tus agricultores y técnicos.</p>
          <ul className="space-y-3 pl-4">
            <li><strong className="text-white">Resumen Empresa (Dashboard):</strong> Un panel visual rápido para ver el número total de socios registrados, hectáreas controladas y la actividad reciente.</li>
            <li><strong className="text-white">Mi Marca Blanca:</strong> El lugar donde configuras tu logotipo oficial, el color principal de la plataforma y el eslogan que verán tus agricultores.</li>
            <li><strong className="text-white">Supervisión Cuadernos:</strong> Una vista de "Gran Hermano" donde puedes entrar a los Cuadernos de Explotación de cualquier socio, revisar si les faltan tratamientos por anotar o si tienen avisos legales de dosis excesivas.</li>
            <li><strong className="text-white">Gestión de Socios:</strong> Lista de todos los agricultores que se han unido a tu Entidad. Desde aquí puedes invitar a nuevos, editar sus datos o darlos de baja.</li>
            <li><strong className="text-white">Asignar Técnicos:</strong> Si cuentas con Ingenieros Agrónomos en tu plantilla, aquí puedes crearles cuentas (rol de "Técnico") y asignarles un grupo concreto de agricultores para que supervisen.</li>
            <li><strong className="text-white">Facturación y Comisiones:</strong> (Si aplica) Muestra los ingresos generados por los agricultores que han contratado planes premium bajo el paraguas de tu Entidad.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'configuracion',
      title: '2. Configuración Inicial y Marca Blanca',
      icon: <Palette className="text-purple-400" />,
      content: (
        <div className="space-y-4 text-white/70">
          <p>Para generar confianza, el agricultor debe sentir que está utilizando un software oficial proporcionado por vosotros, no por terceros.</p>
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <h4 className="font-bold text-white mb-2 flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400"/> Sube tu Logotipo</h4>
            <p className="text-sm">Ve a <strong>Mi Marca Blanca</strong>. Sube el logotipo corporativo (se recomienda un archivo PNG con fondo transparente). Elige el color principal de tu marca. Automáticamente todos los botones y acentos visuales de la plataforma cambiarán a ese color.</p>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <h4 className="font-bold text-white mb-2 flex items-center gap-2"><LinkIcon size={16} className="text-emerald-400"/> Tu Página Pública (Landing Page)</h4>
            <p className="text-sm">El sistema genera automáticamente una web promocional para tu cooperativa: <code>inagrosolutions.com/c/tu-nombre</code>. Puedes personalizar el título, la descripción y los beneficios desde <strong>Mi Marca Blanca</strong>.</p>
          </div>
        </div>
      )
    },
    {
      id: 'promocion',
      title: '3. Promoción y Captación de Agricultores',
      icon: <Megaphone className="text-amber-400" />,
      content: (
        <div className="space-y-4 text-white/70">
          <p>La adopción del Cuaderno Digital Oficial depende de una buena comunicación con tus socios.</p>
          <ul className="space-y-4 list-decimal pl-5">
            <li>
              <strong className="text-white block mb-1">Mensajería y Correo Electrónico</strong>
              Copia el enlace de tu Landing Page pública (ej. <code>/c/tu-cooperativa</code>) y envíalo masivamente. Al entrar a esa web, los agricultores verán los beneficios, tu logotipo y un botón directo de "Registrarse como Socio".
            </li>
            <li>
              <strong className="text-white block mb-1">Alta Manual desde Oficina</strong>
              Si un agricultor acude físicamente a la cooperativa, puedes ir a <strong>Gestión de Socios</strong>, darle a "Nuevo Socio" y crearle tú mismo la cuenta con su correo. El sistema le enviará una contraseña automáticamente.
            </li>
            <li>
              <strong className="text-white block mb-1">Estrategia de Comunicación</strong>
              Explica a tus socios que el uso de esta herramienta garantiza que cumplirán con la legalidad vigente (normativa SIEX) sin dolores de cabeza informáticos, además de contar con la ayuda inteligente del asistente virtual CDC en todo momento.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'roles',
      title: '4. Gestión de Roles y Permisos',
      icon: <Users className="text-emerald-400" />,
      content: (
        <div className="space-y-4 text-white/70">
          <p>Existen distintos tipos de usuario dentro de la plataforma. Es crucial asignar el rol adecuado a cada persona:</p>
          <div className="grid gap-4 mt-2">
            <div className="p-3 bg-white/5 rounded-lg border-l-2 border-blue-400">
              <strong className="text-white block">Administrador (Tú)</strong>
              Control total. Puede ver todos los cuadernos, editar la marca blanca, facturación y dar de alta a técnicos y socios.
            </div>
            <div className="p-3 bg-white/5 rounded-lg border-l-2 border-emerald-400">
              <strong className="text-white block">Técnico Asesor (Ingeniero Agrónomo)</strong>
              Solo tiene acceso a la pantalla "Mis Clientes" y "Dashboard de Técnico". Podrá ver un flujo cronológico de la actividad de los agricultores que se le hayan asignado y corregir errores. No puede ver la facturación ni la marca blanca.
            </div>
            <div className="p-3 bg-white/5 rounded-lg border-l-2 border-orange-400">
              <strong className="text-white block">Agricultor (Socio)</strong>
              Solo ve su propio Cuaderno de Campo Digital. Se encarga de anotar tratamientos, compras y labores.
            </div>
            <div className="p-3 bg-white/5 rounded-lg border-l-2 border-gray-400">
              <strong className="text-white block">Operario de Campo (Tractorista)</strong>
              El agricultor puede crear sub-cuentas para sus tractoristas. Solo pueden abrir la aplicación móvil para indicar que han completado una tarea (ej. "Acabo de aplicar 20L de herbicida"). No ven los costes ni las facturas.
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'supervision',
      title: '5. Supervisión Técnica y Asesoramiento',
      icon: <ShieldCheck className="text-rose-400" />,
      content: (
        <div className="space-y-4 text-white/70">
          <p>El núcleo de valor para la cooperativa reside en poder verificar el trabajo de los socios en tiempo real para evitar sanciones del MAPA.</p>
          <ul className="space-y-3 pl-4">
            <li><strong className="text-white">Alerta de Inactividad:</strong> En tu Dashboard o en el del Técnico, el sistema detecta si un agricultor lleva más de una semana sin registrar actividad. Puedes contactarle para recordarle su obligación legal.</li>
            <li><strong className="text-white">Verificación de Dosis (IA):</strong> El sistema avisa si el socio intenta registrar un tratamiento de Fitosanitario cuya dosis excede los máximos fijados por el Vademécum Oficial.</li>
            <li><strong className="text-white">Aprobación SIEX:</strong> Antes del volcado al ministerio, entra en <strong>Supervisión Cuadernos</strong>, busca al agricultor y revisa su historial de campaña en modo Excel para confirmar que no falten datos obligatorios (ej. N° Registro de maquinaria, Carnet aplicador).</li>
          </ul>
        </div>
      )
    }
  ];

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      <header className="space-y-4 mb-10 border-b border-white/10 pb-8">
        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
            <BookOpen className="w-8 h-8 text-blue-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight glow-text">
          Manual de Instrucciones
        </h1>
        <p className="text-xl text-white/50 font-medium leading-relaxed max-w-3xl">
          Guía operativa completa para la gestión integral de la cooperativa. Aprende a dominar el panel de control, captar agricultores y garantizar el cumplimiento normativo.
        </p>
      </header>

      <div className="space-y-4">
        {manualSections.map((section) => (
          <GlassCard key={section.id} className="border-white/5 bg-white/[0.02] overflow-hidden transition-all duration-300">
            <button 
              onClick={() => toggleSection(section.id)}
              className="w-full p-6 flex items-center justify-between text-left focus:outline-none hover:bg-white/[0.02]"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-xl">
                  {section.icon}
                </div>
                <h2 className="text-xl font-bold text-white">{section.title}</h2>
              </div>
              <div className={`p-2 rounded-full transition-transform duration-300 ${activeSection === section.id ? 'rotate-180 bg-white/10' : 'bg-transparent'}`}>
                <ChevronDown className="w-5 h-5 text-white/50" />
              </div>
            </button>
            
            <div 
              className={`transition-all duration-500 ease-in-out ${
                activeSection === section.id ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="p-6 pt-0 border-t border-white/5 mt-4">
                {section.content}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-black text-white mb-2">¿Necesitas soporte?</h3>
          <p className="text-white/60">Inicialmente, el soporte se dará a través de nuestro asistente virtual. Aquí tienes el asistente virtual CDC para aclarar cualquier duda.</p>
        </div>
        <button 
          onClick={() => window.dispatchEvent(new Event('open-ai-support'))}
          className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] shrink-0"
        >
          Abrir Asistente CDC
        </button>
      </div>

    </div>
  );
}
