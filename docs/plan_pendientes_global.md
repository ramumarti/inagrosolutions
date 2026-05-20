# Roadmap Técnico Final — InagroSolutions

Este documento detalla las funcionalidades, mejoras técnicas y flujos pendientes detectados en la plataforma tras la finalización del bloque de IA Premium y Stripe Connect. El objetivo es alcanzar una versión 1.0 (Production-Ready) robusta, segura y completamente funcional.

---

## 🛠️ Fase 1: Finalización del Core Agrícola (SIEX y Cuaderno)

### 1.1 Motor de Exportación SIEX Robusto (Excel/XML)
*   **Contexto:** Actualmente, el Módulo de Exportación (`ExportacionModule.tsx`) es en gran medida visual.
*   **Tareas Pendientes:**
    *   **Generador Excel:** Implementar la lógica en servidor (Server Actions o API) utilizando librerías como `exceljs` o `xlsx` para estructurar los datos del cuaderno (explotaciones, tratamientos, labores) en las pestañas oficiales requeridas por el SIEX.
    *   **Generador XML:** Añadir soporte para exportar en formato XML, necesario para la carga telemática directa en las plataformas de ciertas Comunidades Autónomas.
    *   **Validación Pre-Exportación:** Asegurar que los registros tienen códigos de provincia, municipio y REGEPA correctos antes de permitir la descarga.

### 1.2 Completar Módulos Placeholder
*   **Módulo de Cosechas:** Desarrollar el formulario de recogida, partes de trabajo diario, albaranes de entrega a cooperativa y gráficas de estimación de rendimiento.
*   **Módulo de Sensores / Clima:** Integrar una API meteorológica externa (ej. OpenWeatherMap o AEMET) para mostrar el clima local en el dashboard del agricultor y registrar la temperatura/viento en los tratamientos (dato obligatorio SIEX).

### 1.3 Lógica de Descuento de Stock en Inventario
*   **Contexto:** Hemos creado el almacén y el escáner de facturas, además de vincular el `TratamientoForm` con el `inventario_id`.
*   **Tareas Pendientes:**
    *   **Trigger o Lógica API:** Modificar el backend al guardar un tratamiento/fertilización para que reste automáticamente la cantidad consumida del `cantidad_actual` en la tabla `inventario`.
    *   **Control de Stock Negativo:** Evitar o alertar si la dosis aplicada supera el stock disponible en el almacén.

---

## 📊 Fase 2: Panel Avanzado para Técnicos y SuperAdmin

### 2.1 Datos Reales en Dashboard Multi-Explotación (Asesores)
*   **Contexto:** El nuevo `technician/dashboard/page.tsx` utiliza simulaciones (`Math.floor`) para mostrar alertas SIEX y la actividad global.
*   **Tareas Pendientes:**
    *   **Queries Agregados:** Crear funciones en Supabase (RPC) o Server Actions complejas que calculen realmente los "Cuadernos Pendientes" basándose en fechas límite y actividad real.
    *   **Feed de Actividad:** Consolidar el historial de actividades (Tratamientos, Labores, Cosechas) de todos los agricultores asignados al técnico en un único feed cronológico real.

### 2.2 UI de Importación del Vademécum (SuperAdmin)
*   **Contexto:** Creamos la API `/api/admin/mapa-import` para subir el CSV oficial del MAPA.
*   **Tareas Pendientes:**
    *   Implementar un panel visual dentro de `/superadmin` (ej. `/superadmin/vademecum`) con un "Drag & Drop" para que el administrador pueda subir el archivo CSV, ver el progreso de importación y gestionar el catálogo de productos fitosanitarios sin usar herramientas externas (como Postman).

---

## 🚀 Fase 3: UX, SEO y Correcciones Menores

### 3.1 SEO Dinámico y Metadatos por Tenant
*   **Contexto:** Las landings de las cooperativas (`/c/[slug]`) necesitan posicionamiento local.
*   **Tareas Pendientes:**
    *   Implementar `generateMetadata` en la página del tenant para inyectar dinámicamente el nombre, descripción y logo de la cooperativa en los meta-tags de Google, Facebook (OG) y Twitter.
    *   Configurar un Sitemap dinámico.

### 3.2 Fixes de UI en Móviles (Responsive)
*   **Contexto:** Los agricultores usan la app principalmente en tractores y fincas.
*   **Tareas Pendientes:**
    *   Revisar la orientación y el escalado de imágenes en dispositivos móviles (Fix de "Mobile Image Orientation").
    *   Asegurar que los botones de grabación de voz (IA) y escáner de facturas sean fácilmente accesibles y funcionen sin problemas de permisos de cámara/micrófono en iOS Safari y Chrome Android.

### 3.3 Auditoría de Seguridad RLS
*   **Contexto:** Las tablas deben estar completamente aisladas por `tenant_id` y `user_id`.
*   **Tareas Pendientes:**
    *   Realizar pruebas de penetración internas para garantizar que un agricultor o técnico nunca pueda acceder (ni por API, ni modificando la URL) a datos de una cooperativa a la que no pertenece.

---

## 📅 Resumen de Ejecución
Este plan está diseñado para ejecutarse de forma secuencial. Las **Fases 1 y 2** son los mayores bloqueos funcionales antes de iniciar una comercialización a gran escala, mientras que la **Fase 3** asegura la calidad final y la optimización para buscadores.

**Estado Actual:** Pendiente de Aprobación.
