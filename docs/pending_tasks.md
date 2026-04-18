# Roadmap de Tareas Pendientes - InagroSolutions

Este documento detalla las funcionalidades, mejoras técnicas y correcciones necesarias para alcanzar el estado de producción comercial ("Production-Ready").

## 🛠️ Prioridad Alta: Cumplimiento Legal y Core

### 1. Integración Real API MAPA (Vademécum)
*   **Archivo:** `src/app/api/mapa/productos/route.ts`
*   **Problema:** Actualmente utiliza `mockDatabase`.
*   **Tarea:** 
    *   Conectar con el WebService SOAP/REST oficial del MAPA o importar el DB de fitosanitarios a Supabase.
    *   Implementar caché para evitar latencia en búsquedas repetitivas de productos comunes (Glifosato, Cobre, etc.).

### 2. Motor de Exportación SIEX Robusto
*   **Archivos:** `src/components/cuaderno/ExportacionModule.tsx` y `src/lib/actions/export-siex.ts`
*   **Tarea:**
    *   Mover toda la lógica de construcción del Excel al servidor (Server Actions).
    *   Implementar validaciones de esquema SIEX (códigos de provincia, municipio y REAC) antes de permitir la descarga.
    *   Añadir exportación a formato XML (requerido para carga telemática en algunas CC.AA.).

### 3. Sistema de Liquidación de Partners (Revenue Share)
*   **Problema:** No existe lógica de backend para el reparto del 50%.
*   **Tarea:**
    *   Configurar Stripe Connect para gestionar los pagos automáticos entre el cliente final, el Partner y la plataforma.
    *   Crear panel de "Mis Comisiones" en el área de Superadmin.

---

## 🎨 Prioridad Media: UX y Funcionalidad Extendida

### 4. Finalización de Módulos Placeholder
*   **Módulo Cosechas:** Implementar el formulario de recogida, albaranes de entrega a cooperativa y estimación de rendimiento.
*   **Módulo Inventario:** Lógica de stock. Restar automáticamente producto cuando se registra un tratamiento.
*   **Módulo Sensores:** Integración de API externa para estaciones meteorológicas u otros dispositivos IoT.

### 5. SEO Dinámico por Tenant
*   **Archivo:** `src/app/c/[slug]/page.tsx`
*   **Tarea:**
    *   Implementar la función `generateMetadata` para que el título y la descripción de la página en Google correspondan al nombre de la cooperativa y no sean genéricos.
    *   Añadir sitemap dinámico para los portales de clientes.

### 6. Internacionalización Completa (i18n)
*   **Problema:** Inconsistencia entre español e inglés.
*   **Tarea:** 
    *   Extraer todos los strings hardcodeados en los componentes de `cuaderno/` a los archivos de traducción.
    *   Asegurar que el selector de idioma persista en la sesión del usuario.

---

## 🔧 Deuda Técnica y Estabilidad

### 7. Limpieza de Logs de Errores
*   **Problema:** Existen múltiples archivos `.log` en el root (build_error.log, tsc_errors.log).
*   **Tarea:** Corregir los warnings de TypeScript pendientes para asegurar un deploy limpio en Vercel sin flags de ignorar errores.

### 8. Seguridad y RLS
*   **Tarea:** Revisar las políticas RLS en Supabase para asegurar que un agricultor de un Tenant A no pueda ver por error IDs de un Tenant B mediante manipulación de la URL o peticiones API manuales.

---

**Última actualización:** 18 de Abril, 2026.
