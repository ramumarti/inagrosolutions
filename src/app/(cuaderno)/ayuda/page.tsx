"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Printer, BookOpen, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const MANUAL_CONTENT = `
# MANUAL DE USUARIO: CUADERNO DE CAMPO DIGITAL
**Versión:** 1.0 (Campaña 2026)  
**Solución:** Gestión Avanzada de Olivar (SIEX/PAC Ready)

---

## 1. INTRODUCCIÓN
Este Cuaderno de Campo Digital ha sido diseñado para cumplir estrictamente con los requisitos del **SIEX** y la **PAC**, permitiéndole gestionar su olivar de forma eficiente, legal y sostenible.

## 2. PANEL DE CONTROL (DASHBOARD)
Al acceder a la aplicación, encontrará el panel principal:
*   **Cabecera Inteligente:** Telemetría meteorológica (Temp/Hum) sincronizada.
*   **Asistente Predictivo (IA):** Detecta riesgos de Repilo, estrés hídrico o viento.
*   **Módulos de Registro:** Acceso directo a los 6 módulos críticos.

## 3. GUÍA DE MÓDULOS DE REGISTRO

### 3.1 Tratamientos Fitosanitarios
1. Seleccione la **Parcela**.
2. Busque el producto (MAPA).
3. Indique la **Dosis (L/ha)**.
4. *Ecológico:* El sistema bloquea productos no autorizados.

### 3.2 Monitoreo de Plagas
*   **Umbrales:** Alerta visual si supera el 5% de infestación.

### 3.3 Riegos e Hidratación
*   Registro habitual en **Olivar Superintensivo**.
*   Alertas si pasan >72h sin riego.

### 3.4 Producción y Cosecha
*   Trazabilidad por **Lote** y almazara de destino.

## 4. GESTIÓN DE RESIDUOS
*   Control de envases fitosanitarios (SIGFITO).

## 5. CAPACIDAD OFFLINE
*   **Guardado Local:** Los datos se guardan en la cola si no hay señal.
*   **Sincronización:** Automática al recuperar conexión.

## 6. GENERACIÓN DE INFORMES SIEX
*   Exportación masiva a **Excel (.xlsx)** compatible con la Administración.

---
## 7. SOPORTE TÉCNICO
*   **Email:** soporte@inagrosolutions.es
`;

export default function AyudaPage() {
  const router = useRouter();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto pb-24 px-4 sm:px-6">
      {/* Header Interactivo */}
      <div className="flex items-center justify-between pt-8 mb-8 sticky top-0 bg-gray-50/80 backdrop-blur-md z-10 py-4 -mx-4 px-4 print:hidden">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="p-2.5 bg-white rounded-full text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-100 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <HelpCircle className="text-green-600" size={24} />
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Centro de Ayuda</h1>
          </div>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl text-gray-700 font-bold text-sm border border-gray-100 shadow-sm hover:bg-gray-100 transition-all"
        >
          <Printer size={18} />
          <span>PDF / Imprimir</span>
        </button>
      </div>

      {/* Contenido del Manual */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 prose prose-slate max-w-none 
        prose-headings:font-black prose-headings:tracking-tight prose-h1:text-4xl prose-h2:text-2xl prose-h2:text-green-900 prose-h2:border-b prose-h2:pb-2 prose-h2:mt-12
        prose-p:text-gray-600 prose-p:leading-relaxed
        prose-li:text-gray-600 prose-strong:text-gray-900
        print:shadow-none print:border-none print:p-0">
        
        <div className="flex items-center gap-3 mb-6 bg-green-50 p-6 rounded-2xl border border-green-100 print:hidden">
            <div className="bg-green-600 p-2.5 rounded-xl text-white">
                <BookOpen size={24} />
            </div>
            <div>
                <p className="text-green-900 font-black text-sm uppercase tracking-wide">Documentación Oficial</p>
                <p className="text-green-800/80 text-xs font-semibold">Todo lo que necesitas saber para operar tu cuaderno digital.</p>
            </div>
        </div>

        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {MANUAL_CONTENT}
        </ReactMarkdown>
      </div>

      {/* Footer Support */}
      <div className="mt-12 p-8 bg-gray-900 rounded-3xl text-center shadow-xl print:hidden">
        <h3 className="text-white font-bold text-lg mb-2">¿Necesitas soporte adicional?</h3>
        <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">Nuestro equipo técnico está disponible de Lunes a Viernes de 9:00 a 18:00 para ayudarte.</p>
        <a 
          href="mailto:soporte@inagrosolutions.es"
          className="inline-block bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-2xl shadow-lg shadow-green-600/20 transition-all active:scale-95"
        >
          Contactar Soporte
        </a>
      </div>

      <p className="text-center text-gray-400 text-[10px] font-medium tracking-widest uppercase mt-12 mb-8">
        InagroSolutions • Digital Field Notebook v1.0
      </p>
    </div>
  );
}
