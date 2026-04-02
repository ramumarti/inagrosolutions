"use client";

import React from "react";
import { 
  ArrowLeft, 
  Printer, 
  Smartphone, 
  Map as MapIcon, 
  FileText, 
  ShieldCheck, 
  HelpCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";

export default function ManualPage() {
  const router = useRouter();

  const sections = [
    {
      id: "intro",
      title: "1. Primeros Pasos",
      icon: <Smartphone className="text-blue-400" />,
      content: "Bienvenido a InagroSolutions. Para comenzar, asegúrate de tener activada la geolocalización en tu dispositivo móvil. Esto nos permite identificar automáticamente las parcelas SIGPAC en las que te encuentras trabajando."
    },
    {
      id: "siex",
      title: "2. Registro Obligatorio SIEX",
      icon: <ShieldCheck className="text-emerald-400" />,
      content: "El Sistema de Información de Explotaciones (SIEX) requiere que registres todos los tratamientos fitosanitarios en un plazo máximo de 30 días tras la aplicación. Nuestra herramienta sincroniza estos datos automáticamente con el repositorio oficial."
    },
    {
      id: "mapas",
      title: "3. Gestión de Parcelas",
      icon: <MapIcon className="text-amber-400" />,
      content: "En el mapa interactivo puedes ver el estado de tus cultivos. El color verde indica cumplimiento óptimo, mientras que el naranja o rojo pueden indicar retrasos en los registros obligatorios de riego o fertilización."
    },
    {
      id: "offline",
      title: "4. Modo Offline (Sin Internet)",
      icon: <FileText className="text-rose-400" />,
      content: "InagroSolutions permite registrar labores sin conexión. Los datos se guardarán localmente (en tu dispositivo) y se subirán a la nube automáticamente cuando recuperes la señal 4G/5G."
    }
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Navigation (Hidden on print) */}
      <div className="max-w-3xl mx-auto px-6 py-12 print:hidden relative z-10 animate-in fade-in duration-700">
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={() => router.back()} 
            className="p-3 bg-white/5 rounded-2xl text-white/50 hover:bg-white/10 border border-white/10 transition-all hover:text-white"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex gap-4">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-3 px-6 py-3 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-blue-400 font-black uppercase text-[10px] tracking-widest hover:bg-blue-500/20 transition-all active:scale-95"
            >
              <Printer size={18} /> Imprimir PDF
            </button>
          </div>
        </div>

        <div className="text-center mb-20 text-balance">
          <h1 className="text-[44px] font-black tracking-tighter leading-tight mb-4 glow-text">Manual de <span className="text-blue-400">Usuario</span></h1>
          <p className="text-white/30 font-bold uppercase tracking-[0.4em] text-[11px]">Guía Digital InagroSolutions v2.0</p>
        </div>

        <div className="space-y-12">
          {sections.map((section) => (
            <div key={section.id} id={section.id} className="scroll-mt-24 group">
              <GlassCard className="p-10 border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center text-3xl shadow-inner border border-white/10 group-hover:scale-110 transition-transform duration-500">
                    {section.icon}
                  </div>
                  <h2 className="text-2xl font-black tracking-tight">{section.title}</h2>
                </div>
                <div className="prose prose-invert max-w-none">
                  <p className="text-lg text-white/50 leading-relaxed font-medium">
                    {section.content}
                  </p>
                </div>
              </GlassCard>
            </div>
          ))}
        </div>

        <div className="mt-20 p-12 bg-emerald-500/5 rounded-[48px] border border-emerald-500/10 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-emerald-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity blur-3xl rounded-full translate-y-1/2" />
          <HelpCircle size={48} className="mx-auto mb-6 text-emerald-400 opacity-40" />
          <h3 className="text-xl font-black mb-4">¿Necesitas ayuda extra?</h3>
          <p className="text-white/40 mb-10 max-w-sm mx-auto">Nuestro chat de experto está disponible de Lunes a Viernes de 08:00 a 18:00.</p>
          <GlowButton variant="primary" className="px-10 py-5 rounded-3xl font-black uppercase tracking-widest text-[11px]">
            Hablar con Soporte Técnico
          </GlowButton>
        </div>
      </div>

      {/* Print-only layout */}
      <div className="hidden print:block max-w-none p-12 text-black bg-white">
        <h1 className="text-4xl font-bold mb-10 border-b-4 border-emerald-500 pb-4">Manual de Usuario - InagroSolutions</h1>
        {sections.map((section) => (
          <div key={section.id} className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
            <p className="text-lg text-black">{section.content}</p>
          </div>
        ))}
        <div className="mt-20 pt-10 border-t border-gray-200 text-sm text-gray-400">
          © 2026 InagroSolutions S.L. - Reservados todos los derechos.
        </div>
      </div>
    </div>
  );
}
