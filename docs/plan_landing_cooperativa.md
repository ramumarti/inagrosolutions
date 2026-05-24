# Plan de Rediseño y Optimización de la Landing Page de Cooperativas para Agricultores (Marca Blanca)

Este documento detalla la estrategia de copywriting, diseño visual y estructuración para transformar la landing page pública de las cooperativas y entidades (`/c/[slug]`) en una herramienta altamente persuasiva de captación, enfocada en olivareros españoles.

## Estrategia de Copywriting y Enfoque de Marketing Agrícola
- **Público Objetivo:** Agricultores y olivareros profesionales de España (con foco en Andalucía) sometidos a regulaciones de fitosanitarios, solicitudes de la PAC, inspecciones del MAPA y la obligatoriedad del SIEX.
- **Tono y Voz:** Cercano, profesional-rural, directo y honesto. Se evitará el lenguaje corporativo excesivo o tecnicismos fríos.
- **Propuesta de Valor:** Tranquilidad absoluta, ahorro de tiempo, inmunidad frente a sanciones de inspección y acompañamiento técnico local.
- **Palabras Clave SEO (Integradas de forma orgánica):** *cuaderno digital olivar, SIEX olivar, PAC olivar, cuaderno de campo digital, gestión agrícola, inspecciones agrícolas, tratamientos fitosanitarios olivar, asesoramiento agrícola.*

---

## Estructura de la Landing Page Propuesta

### 1. HERO SECTION (Sección Principal)
- **Mensaje Principal:** Enfoque inmediato en el alivio. *"Lleva tu Cuaderno Digital de Campo sin papeleos ni dolores de cabeza."*
- **Subtítulo:** Beneficios de cumplir con el SIEX y asegurar la PAC con el respaldo técnico directo de tu cooperativa.
- **Llamadas a la Acción (CTA):** Botón principal llamativo para ver los planes y botón de contacto por WhatsApp/Teléfono.

### 2. BLOQUE DE PROBLEMAS REALES (Puntos de Dolor)
- **Títulos empáticos:** *"Sabemos lo que cuesta llevar una explotación hoy en día..."*
- **Puntos críticos:** Miedo a multas por dosis de fitosanitarios erróneas, horas perdidas los fines de semana en la oficina en vez de en el campo, burocracia interminable por el SIEX y estrés de cara a inspecciones sorpresa.

### 3. LA SOLUCIÓN (Acompañamiento Técnico de la Cooperativa)
- Presentación de la plataforma de la Cooperativa como la solución definitiva.
- Se explica que el cuaderno digital ahora es sencillo, rápido y supervisado por el equipo técnico para garantizar que todo está correcto antes de enviar al SIEX.

### 4. ESPECIALIZACIÓN EXCLUSIVA EN OLIVAR
- Sección dedicada a demostrar que entendemos el olivar (tradicional, intensivo, superintensivo).
- Foco en: control de tratamientos fitosanitarios del olivar (ej. mosca del olivo, repilo), dosificación y registro de maquinaria autorizada, y cálculo de fertilización.

### 5. TRANSPARENCIA EN PRECIOS ("¿Cuánto Cuesta?")
- Tabla interactiva o comparativa con tres modelos de explotación habituales:
  - **Explotación Pequeña / Familiar:** Ideal para agricultores a tiempo parcial o fincas pequeñas.
  - **Explotación Mediana:** Para el agricultor profesional estándar.
  - **Explotación Grande / Profesional:** Para explotaciones extensas con múltiples parcelas y operarios.
- **Mensaje Clave:** *"Estar tranquilo cuesta menos que el gasoil de un solo día. Evita sanciones de miles de euros."*

### 6. CÓMO FUNCIONA (El proceso en 3 pasos)
- **Paso 1:** Sube tus datos de SIGPAC o pídelo en las oficinas.
- **Paso 2:** El sistema CDC (Cuaderno Digital de Campo) genera los registros y calcula las dosis válidas.
- **Paso 3:** Tú te preocupas únicamente de tus olivos. Tu cuaderno está listo ante cualquier inspección.

### 7. TESTIMONIOS REALES Y CREÍBLES
- Testimonios con nombres y localizaciones reales del olivar en España (Jaén, Córdoba, etc.).
- Historias de éxito de agricultores tradicionales que superaron el miedo a la informática.

### 8. SECCIÓN DE PREGUNTAS FRECUENTES (FAQ)
- Respuestas claras a: ¿Es obligatorio en 2026?, ¿Y si no se usar ordenadores?, ¿Cómo me ayuda con la PAC e inspecciones?

### 9. CTA EMOCIONAL FINAL
- Cierre potente apelando al descanso del fin de semana y a la seguridad de la explotación.

---

## Diseño Visual y Estética Premium
- **Paleta de Colores:** Integración dinámica de los colores de la cooperativa (`primary_color` y `secondary_color`) con fondos oscuros súper premium, efectos de desenfoque de cristal (glassmorphism), y bordes elegantes de baja opacidad.
- **Imágenes sugeridas (Placeholder/Renderizado):**
  - Hero: Paisaje de olivar tradicional en Andalucía con una ligera niebla matutina.
  - Sección Fitosanitarios: Detalle de atomizador o tractor trabajando en las calles del olivar.
  - Sección Solución: Interfaz limpia y móvil de la app mostrándose entre olivos.
- **Tipografía:** Moderna y limpia para asegurar una lectura fluida en smartphones (dispositivos que el agricultor utiliza habitualmente).

---

## Plan de Ejecución y Pruebas
1. **Modificar** `src/app/c/[slug]/page.tsx` reemplazando los textos de relleno e interfaces genéricas por el nuevo copywriting persuasivo, tablas de precios claras y la estructura optimizada.
2. **Establecer metadatos SEO dinámicos** basados en el nombre de la cooperativa y términos optimizados.
3. **Subir los cambios** a la rama `main` y verificar que la landing se renderiza y funciona correctamente en Vercel.
