# Plan Maestro: 4 Funcionalidades IA Premium — InagroSolutions 🚀

> **Objetivo:** Implementar 4 herramientas diferenciadoras basadas en IA (Gemini) que conviertan InagroSolutions en el cuaderno de campo más avanzado del mercado español.

---

## Índice

1. [Estado Actual del Código](#1-estado-actual-del-código)
2. [Función 1: Entrada de Datos por Voz con IA](#2-función-1-entrada-de-datos-por-voz-con-ia)
3. [Función 2: Validador Vademécum en Tiempo Real](#3-función-2-validador-vademécum-en-tiempo-real)
4. [Función 3: Escáner de Albaranes y Facturas](#4-función-3-escáner-de-albaranes-y-facturas)
5. [Función 4: Multi-Explotación para Asesores](#5-función-4-multi-explotación-para-asesores)
6. [Arquitectura Técnica Común](#6-arquitectura-técnica-común)
7. [**💰 Modelo de Monetización IA (Costes + Margen)**](#7-modelo-de-monetización-ia-costes--margen)
8. [Variables de Entorno Necesarias](#8-variables-de-entorno-necesarias)
9. [Cronograma de Implementación](#9-cronograma-de-implementación)
10. [Checklist de Implementación](#10-checklist-de-implementación)

---

## 1. Estado Actual del Código

### ✅ Lo que ya tenemos

| Componente | Archivo | Estado |
|-----------|---------|--------|
| Cliente Gemini (texto) | `src/lib/gemini.ts` | ✅ `callGemini()` funcional con `gemini-flash-latest` |
| API Generate (background) | `src/app/api/generate/route.ts` | ✅ Usa `after()` de Next.js para procesamiento async |
| Formulario Tratamientos | `src/components/cuaderno/TratamientoForm.tsx` | ✅ 15 campos, vinculado a inventario |
| Inventario Fitosanitarios | `src/components/cuaderno/InventarioModule.tsx` | ✅ CRUD con stock, lote, nº registro MAPA |
| Validador SIEX básico | `src/lib/validators/siex-validator.ts` | ✅ Valida parcelas y tratamientos (básico) |
| API MAPA Productos | `src/app/api/mapa/productos/route.ts` | ⚠️ Solo mockDatabase (4 productos) |
| Módulo Técnico | `src/app/(protected)/technician/` | ✅ Dashboard + farmers + recommendations + tasks |
| Roles platform | `users.platform_role` | ✅ farmer, technician, tenant_admin, superadmin |
| Asignaciones técnico-agricultor | `src/lib/actions/tenant-assignments.ts` | ✅ RLS con assign/remove |
| Supervisión Admin | `src/app/(protected)/admin/supervision/` | ✅ Lectura cuadernos de socios |

### ❌ Lo que falta

| Función | Estado |
|---------|--------|
| Transcripción de audio (voz → texto) | ❌ No existe |
| Gemini multimodal (imagen/audio) | ❌ Solo texto plano |
| Validación Vademécum real (dosis, cultivos, plazos) | ❌ Solo check de formato nº registro |
| Base de datos de fitosanitarios MAPA | ❌ Solo 4 mocks |
| OCR / Visión de facturas | ❌ No existe |
| Rol "asesor" independiente de tenant | ❌ Solo `technician` dentro de un tenant |

---

## 2. Función 1: Entrada de Datos por Voz con IA

### Concepto
El agricultor graba un audio desde el móvil describiendo su actividad. La IA transcribe, extrae datos estructurados y pre-rellena el formulario de tratamiento/labor.

### Flujo Técnico

```
1. Agricultor → Pulsa botón 🎙️ en el Cuaderno
2. Browser → MediaRecorder API graba audio (WebM/OGG)
3. Frontend → POST /api/ai/voice-entry { audio: base64, type: 'tratamiento'|'labor'|'fertilizacion' }
4. API Route → Envía audio a Gemini 2.0 Flash (soporta audio nativo)
5. Gemini → Devuelve JSON estructurado con campos extraídos
6. Frontend → Pre-rellena el formulario correspondiente
7. Agricultor → Revisa, corrige si hace falta, pulsa "Confirmar"
```

### Archivos a crear/modificar

#### [NEW] `src/lib/gemini-multimodal.ts`
- Función `transcribeAudioToJSON()` que envía audio a Gemini 2.0 Flash
- Prompt estructurado que devuelve JSON con: parcela, fecha, producto, dosis, unidad, superficie, operario
- Función `analyzeImageWithGemini()` para reutilizar en Función 3

#### [NEW] `src/app/api/ai/voice-entry/route.ts`
- Recibe audio base64 + tipo de registro
- Valida usuario autenticado
- Llama a `transcribeAudioToJSON()`
- Devuelve JSON con campos extraídos + confianza

#### [NEW] `src/components/cuaderno/VoiceRecorderButton.tsx`
- Componente con botón micrófono flotante
- Usa `MediaRecorder` API del navegador
- Indicador visual de grabación (onda de audio animada)
- Estado: idle → recording → processing → done
- Al terminar, emite evento con datos extraídos

#### [MODIFY] `src/components/cuaderno/TratamientoForm.tsx`
- Añadir botón "Dictar por voz" que abre VoiceRecorderButton
- Al recibir datos de la IA, pre-rellenar campos del formulario
- Mostrar badge "✨ Rellenado por IA" en campos auto-completados
- Permitir editar cualquier campo antes de confirmar

#### [MODIFY] `src/components/cuaderno/LaborForm.tsx`
- Mismo patrón: botón de voz + pre-relleno

#### [MODIFY] `src/components/cuaderno/FertilizacionForm.tsx`
- Mismo patrón: botón de voz + pre-relleno

### Prompt de Gemini (ejemplo)

```
Eres un asistente agrícola español experto en cuadernos de campo SIEX.
El agricultor ha dictado la siguiente nota de voz. Extrae los datos en JSON.

AUDIO_TRANSCRIPTION: "{transcripción}"

Devuelve SOLO un JSON con esta estructura:
{
  "parcela_nombre": string | null,
  "fecha": "YYYY-MM-DD" | null,
  "nombre_producto": string | null,
  "dosis": number | null,
  "unidad_dosis": "L/ha" | "kg/ha" | "mL/ha" | "g/ha" | null,
  "superficie_tratada": number | null,
  "maquinaria_usada": string | null,
  "operario": string | null,
  "confianza": number (0-100)
}
```

---

## 3. Función 2: Validador Vademécum en Tiempo Real

### Concepto
Antes de guardar un tratamiento, el sistema valida automáticamente contra la normativa MAPA: producto autorizado para el cultivo, dosis máxima, plazo de seguridad. Si hay un error, salta alerta roja.

### Flujo Técnico

```
1. Agricultor → Selecciona producto + cultivo + dosis en TratamientoForm
2. Frontend → Dispara validación en tiempo real (debounce 500ms)
3. API → POST /api/ai/validate-treatment { producto, cultivo, dosis, unidad }
4. Backend → Busca en tabla `productos_fitosanitarios` de Supabase
5. Si no encuentra → Llama a Gemini como fallback con contexto normativo
6. Backend → Devuelve: { valid: bool, warnings: [], errors: [], info: {} }
7. Frontend → Muestra alertas en tiempo real dentro del formulario
```

### Archivos a crear/modificar

#### [NEW] Migración SQL: `create_productos_fitosanitarios`
Tabla en Supabase con datos del Vademécum del MAPA:

```sql
CREATE TABLE IF NOT EXISTS public.productos_fitosanitarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_registro TEXT NOT NULL UNIQUE,
  nombre_comercial TEXT NOT NULL,
  titular TEXT,
  materia_activa TEXT,
  tipo_formulacion TEXT,
  estado TEXT DEFAULT 'Vigente',
  cultivos_autorizados JSONB DEFAULT '[]',
  dosis_maxima NUMERIC,
  unidad_dosis TEXT,
  plazo_seguridad_dias INTEGER,
  tipo_accion TEXT,
  clasificacion_toxicologica TEXT,
  fecha_registro DATE,
  fecha_caducidad DATE,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_productos_fito_nombre ON public.productos_fitosanitarios 
  USING gin(to_tsvector('spanish', nombre_comercial || ' ' || COALESCE(materia_activa, '')));
CREATE INDEX idx_productos_fito_registro ON public.productos_fitosanitarios(numero_registro);
```

#### [NEW] `src/app/api/ai/validate-treatment/route.ts`
- Recibe: producto, cultivo de la parcela, dosis, unidad
- Busca en `productos_fitosanitarios` por nombre o nº registro
- Valida: producto vigente, cultivo autorizado, dosis ≤ máxima, plazo de seguridad
- Si no encuentra en BD → consulta Gemini como respaldo inteligente
- Devuelve resultado de validación con severidad (error/warning/info)

#### [NEW] `src/components/cuaderno/VademecumAlert.tsx`
- Componente visual de alertas en tiempo real
- Tres niveles: 🔴 Error (bloquea envío), 🟡 Warning (permite pero advierte), 🟢 OK
- Animación de entrada suave
- Muestra: motivo, dosis máxima permitida, plazo seguridad

#### [MODIFY] `src/components/cuaderno/TratamientoForm.tsx`
- Integrar `VademecumAlert` debajo del selector de producto
- Debounce de 500ms para no saturar el backend
- Bloquear envío si hay errores del Vademécum

#### [MODIFY] `src/app/api/mapa/productos/route.ts`
- Reemplazar mockDatabase con consulta real a `productos_fitosanitarios`
- Búsqueda full-text en español
- Caché de resultados frecuentes

#### [NEW] `src/app/api/admin/import-vademecum/route.ts`
- Endpoint para que el SuperAdmin cargue CSV/JSON del Vademécum
- Parsea y hace upsert en `productos_fitosanitarios`
- Reporta productos nuevos / actualizados / errores

---

## 4. Función 3: Escáner de Albaranes y Facturas

### Concepto
El agricultor sube una foto de la factura o albarán de la cooperativa. Gemini Vision extrae los productos, cantidades, lotes y precios, y precarga el inventario automáticamente.

### Flujo Técnico

```
1. Agricultor → Abre módulo Inventario → Botón "📷 Escanear Factura"
2. Frontend → Captura foto (cámara o galería) → Comprime a <4MB
3. Frontend → POST /api/ai/scan-invoice { image: base64, mime: 'image/jpeg' }
4. API Route → Envía imagen a Gemini 2.0 Flash (visión)
5. Gemini → Extrae: proveedor, fecha, líneas de productos con cantidades
6. Frontend → Muestra preview editable con los datos extraídos
7. Agricultor → Revisa → Pulsa "Añadir todo al Almacén"
8. Backend → Inserta en inventario de Supabase (bulk insert)
```

### Archivos a crear/modificar

#### [NEW] `src/app/api/ai/scan-invoice/route.ts`
- Recibe imagen base64 + tipo MIME
- Envía a Gemini con prompt estructurado para extracción de datos
- Devuelve array de productos con: nombre, cantidad, unidad, lote, nº registro, precio

#### [NEW] `src/components/cuaderno/InvoiceScanner.tsx`
- Input de cámara/archivo con preview de la imagen
- Estado: idle → uploading → analyzing → preview → confirmed
- Tabla editable con los productos detectados por la IA
- Botones: "Añadir todo al almacén" / "Descartar"
- Badge "📷 Detectado por IA" en cada fila

#### [MODIFY] `src/components/cuaderno/InventarioModule.tsx`
- Añadir botón "Escanear Factura" junto a "Registrar Compra"
- Al confirmar escaneo → llamar a `addStock()` para cada producto detectado
- Recargar inventario

#### [MODIFY] `src/lib/gemini-multimodal.ts`
- Reutilizar función `analyzeImageWithGemini()` con prompt de factura

### Prompt de Gemini para facturas

```
Eres un OCR agrícola especializado en albaranes y facturas de cooperativas españolas.
Analiza esta imagen de factura/albarán y extrae todos los productos fitosanitarios
o fertilizantes que aparezcan.

Devuelve SOLO un JSON con esta estructura:
{
  "proveedor": string | null,
  "fecha_factura": "YYYY-MM-DD" | null,
  "numero_factura": string | null,
  "productos": [
    {
      "nombre_producto": string,
      "cantidad": number,
      "unidad": "L" | "Kg" | "uds",
      "numero_registro": string | null,
      "lote": string | null,
      "precio_unitario": number | null
    }
  ],
  "total_factura": number | null,
  "confianza": number (0-100)
}
```

---

## 5. Función 4: Multi-Explotación para Asesores

### Concepto
Permitir que un usuario tipo "Asesor" (independiente o de cooperativa) gestione los cuadernos de 50-500 agricultores desde un panel centralizado.

### Estado actual
Ya tenemos un módulo `technician` con asignaciones, pero está limitado a un solo tenant. El objetivo es hacerlo más potente:

### Mejoras a implementar

#### [NEW] `src/app/(protected)/technician/dashboard/page.tsx`
- Vista panorámica de TODOS los agricultores asignados
- KPIs: total explotaciones, tratamientos pendientes de revisar, alertas activas
- Filtros por cooperativa, por estado de cumplimiento SIEX
- Buscador rápido de agricultor

#### [MODIFY] `src/app/(protected)/technician/farmers/page.tsx`
- Añadir tabla mejorada con columnas: nombre, explotaciones, nº parcelas, último tratamiento, estado SIEX
- Indicador visual de compliance (🟢 al día / 🟡 pendiente / 🔴 vencido)
- Acción rápida: "Abrir Cuaderno" → acceso directo al cuaderno del agricultor
- Exportar listado de clientes en CSV

#### [NEW] `src/app/(protected)/technician/bulk-actions/page.tsx`
- Acciones masivas: enviar prescripción a varios agricultores, exportar informes SIEX de todos
- Crear tarea para múltiples agricultores a la vez

#### [MODIFY] `src/lib/actions/technician.ts`
- `getTechnicianStats()` → añadir métricas de compliance SIEX por agricultor
- `getBulkFarmerData()` → obtener datos de múltiples agricultores en una sola query
- `exportBulkSIEX()` → generar informe consolidado

#### [MODIFY] `src/app/(protected)/technician/farmer/[id]/cuaderno/page.tsx`
- Permitir al técnico VER y EDITAR (con permisos) el cuaderno del agricultor
- Añadir barra superior con info del agricultor cuyo cuaderno está viendo
- Botón "Volver a mi panel" para navegar rápido

---

## 6. Arquitectura Técnica Común

### Cliente Gemini Multimodal

```typescript
// src/lib/gemini-multimodal.ts

// Función principal para audio → JSON
export async function transcribeAudioToJSON(
  audioBase64: string,
  mimeType: string,
  promptContext: string
): Promise<any>

// Función principal para imagen → JSON
export async function analyzeImageWithGemini(
  imageBase64: string,
  mimeType: string,
  promptContext: string
): Promise<any>

// Modelo: gemini-2.0-flash (soporta audio + imagen nativamente)
// Endpoint: generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
```

### Estructura de API Routes

```
src/app/api/ai/
├── voice-entry/route.ts       ← Función 1: Audio → Datos de tratamiento
├── validate-treatment/route.ts ← Función 2: Validador Vademécum
├── scan-invoice/route.ts      ← Función 3: Foto factura → Inventario
└── (futuro) smart-report/     ← Informe inteligente con IA
```

### Seguridad
- Todas las rutas de IA requieren autenticación (Supabase session)
- Rate limiting: máximo 20 llamadas IA por usuario/hora
- Tamaño máximo audio: 10MB, imagen: 4MB
- Los datos nunca se almacenan en Google: Gemini API es stateless

---

## 7. 💰 Modelo de Monetización IA (Costes + Margen)

> **PRINCIPIO CLAVE:** Las funciones de IA tienen un coste real por cada llamada a Gemini. Ese coste NO puede comerse el margen de los planes de suscripción. Por tanto, las funciones IA son **opcionales** y se monetizan por separado con un margen mínimo del 300%.

### 7.1 Análisis de Costes Reales por Función

| Función | Modelo Gemini | Coste por llamada (estimado) | Tokens input | Tokens output |
|---------|--------------|------------------------------|-------------|--------------|
| 🎙️ Voz → Datos | gemini-2.0-flash | ~0,003€ (audio 30s + prompt) | ~2.000 | ~500 |
| 🛡️ Validador Vademécum | gemini-2.0-flash | ~0,001€ (solo texto) | ~800 | ~300 |
| 📷 Escáner Factura | gemini-2.0-flash | ~0,005€ (imagen + prompt) | ~3.000 | ~800 |

> **Nota:** Con Gemini 2.0 Flash, los primeros 1.500 req/día son gratuitos (Free Tier). Para un lanzamiento con <100 usuarios activos, el coste real será prácticamente cero. Pero **debemos cobrar igualmente** para: (a) crear percepción de valor premium, (b) tener margen cuando escalemos, (c) evitar abuso.

### 7.2 Modelo Elegido: **Sistema de Créditos IA Mensuales**

Cada función de IA consume **créditos**. Los créditos se incluyen de forma limitada según el plan del agricultor, y se pueden comprar más como add-on.

#### Tabla de Créditos por Plan

| Plan | Precio/mes | Créditos IA incluidos/mes | Coste real IA (máx) | Margen protegido |
|------|-----------|--------------------------|---------------------|-----------------|
| **Básico** (≤5 ha) | 4,99€ | 0 créditos (sin IA) | 0€ | ✅ 100% |
| **Intermedio** (≤20 ha) | 19,99€ | 15 créditos/mes | ~0,05€ | ✅ 99,7% |
| **Avanzado** (≤50 ha) | 49,99€ | 50 créditos/mes | ~0,15€ | ✅ 99,7% |
| **Premium** (≤100 ha) | 89,99€ | 150 créditos/mes | ~0,45€ | ✅ 99,5% |

#### Consumo de Créditos por Función

| Función | Créditos que consume | Justificación |
|---------|---------------------|---------------|
| 🎙️ Entrada por Voz | **2 créditos** | Audio + procesamiento pesado |
| 🛡️ Validador Vademécum | **1 crédito** | Solo texto, rápido |
| 📷 Escáner Factura | **3 créditos** | Imagen + extracción compleja |

#### Ejemplo de uso mensual (Plan Avanzado: 50 créditos)

```
Agricultor con 30 ha de olivar:
├── 10 tratamientos dictados por voz    = 20 créditos
├── 10 validaciones Vademécum           = 10 créditos
├── 3 facturas escaneadas               = 9 créditos
└── TOTAL USADO                         = 39 créditos (de 50 incluidos)
    → Sin coste extra
```

### 7.3 Packs de Créditos Extra (Add-on de Stripe)

Cuando un agricultor agota su cuota mensual, puede comprar packs adicionales:

| Pack | Créditos | Precio | Coste real | Margen |
|------|----------|--------|------------|--------|
| Pack Básico | 25 créditos | 2,99€ | ~0,08€ | **97%** |
| Pack Pro | 75 créditos | 6,99€ | ~0,23€ | **97%** |
| Pack Ilimitado* | 300 créditos | 19,99€ | ~0,90€ | **96%** |

> \*"Ilimitado" = 300 créditos, suficiente para un mes de uso intensivo de cualquier agricultor.

**Revenue Share:** Los packs de créditos IA también pasan por Stripe Connect con el mismo `application_fee_percent: 50`. La cooperativa gana por cada pack que compren sus socios.

### 7.4 Estructura de Base de Datos para Metering

#### Migración: `create_ai_credits_system`

```sql
-- Tabla de cuota de créditos IA por usuario
CREATE TABLE IF NOT EXISTS public.ai_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  credits_included INTEGER NOT NULL DEFAULT 0,     -- Créditos del plan
  credits_purchased INTEGER NOT NULL DEFAULT 0,     -- Créditos comprados extra
  credits_used INTEGER NOT NULL DEFAULT 0,          -- Créditos consumidos este mes
  period_start DATE NOT NULL DEFAULT date_trunc('month', now()),
  period_end DATE NOT NULL DEFAULT (date_trunc('month', now()) + INTERVAL '1 month'),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, period_start)
);

-- Historial detallado de uso (auditoría)
CREATE TABLE IF NOT EXISTS public.ai_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id),
  feature TEXT NOT NULL CHECK (feature IN ('voice_entry', 'vademecum_validate', 'scan_invoice')),
  credits_consumed INTEGER NOT NULL DEFAULT 1,
  input_summary TEXT,                              -- Resumen breve (no datos sensibles)
  success BOOLEAN DEFAULT true,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_ai_credits_user_period ON public.ai_credits(user_id, period_start);
CREATE INDEX idx_ai_usage_user ON public.ai_usage_log(user_id, created_at DESC);
CREATE INDEX idx_ai_usage_tenant ON public.ai_usage_log(tenant_id, created_at DESC);

-- RLS
ALTER TABLE public.ai_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own credits" ON public.ai_credits
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users see own usage" ON public.ai_usage_log
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Superadmins see all credits" ON public.ai_credits
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND platform_role = 'superadmin')
  );

CREATE POLICY "Tenant admins see tenant usage" ON public.ai_usage_log
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid() AND platform_role IN ('tenant_admin', 'superadmin'))
  );
```

### 7.5 Lógica de Control de Cuota (Middleware)

#### [NEW] `src/lib/ai-credits.ts`

```typescript
// Funciones principales:

// 1. Obtener créditos restantes del usuario
async function getAvailableCredits(userId: string): Promise<number>

// 2. Verificar si puede usar una función (antes de llamar a Gemini)
async function canUseAIFeature(userId: string, feature: string): Promise<{
  allowed: boolean;
  creditsRemaining: number;
  creditsNeeded: number;
  upgradeMessage?: string;
}>

// 3. Consumir créditos (después de una llamada exitosa)
async function consumeCredits(userId: string, feature: string, metadata?: object): Promise<void>

// 4. Resetear créditos al inicio de cada mes (cron o webhook Stripe)
async function resetMonthlyCredits(userId: string, tierCredits: number): Promise<void>

// 5. Añadir créditos comprados
async function addPurchasedCredits(userId: string, amount: number): Promise<void>
```

### 7.6 Flujo en el Frontend

```
1. Agricultor pulsa botón de IA (voz/escáner/validador)
2. Frontend → GET /api/ai/credits → ¿tiene créditos?
   ├── SÍ → Ejecuta la función IA normalmente
   │         └── POST consume crédito al finalizar con éxito
   └── NO → Muestra modal:
            ┌─────────────────────────────────┐
            │  ⚡ Créditos IA Agotados         │
            │                                 │
            │  Has usado 50/50 créditos       │
            │  este mes.                      │
            │                                 │
            │  [Comprar Pack 25 — 2,99€]      │
            │  [Comprar Pack 75 — 6,99€]      │
            │  [Mejorar mi Plan ↑]            │
            └─────────────────────────────────┘
```

### 7.7 Productos Stripe a Crear para Créditos IA

| Producto | Tipo | Precio | Stripe Price ID (sugerido) |
|----------|------|--------|---------------------------|
| Pack IA Básico (25 créditos) | `one_time` | 2,99€ | `price_ai_pack_25` |
| Pack IA Pro (75 créditos) | `one_time` | 6,99€ | `price_ai_pack_75` |
| Pack IA Ilimitado (300 créditos) | `one_time` | 19,99€ | `price_ai_pack_300` |

> **NOTA:** Estos productos se cobran como pagos puntuales (`one_time`) a través de Stripe Checkout con el mismo sistema Connect (la cooperativa recibe su 50%).

### 7.8 Tabla Resumen — Impacto en Margen por Plan

| Plan | Precio | Créditos IA gratis | Coste IA máximo | % del precio | Margen tras IA |
|------|--------|-------------------|-----------------|-------------|----------------|
| Básico | 4,99€ | 0 | 0€ | 0% | **100%** |
| Intermedio | 19,99€ | 15 | 0,05€ | 0,25% | **99,75%** |
| Avanzado | 49,99€ | 50 | 0,15€ | 0,30% | **99,70%** |
| Premium | 89,99€ | 150 | 0,45€ | 0,50% | **99,50%** |

> **CONCLUSIÓN:** Incluso regalando créditos en los planes superiores, el impacto en margen es inferior al 0,5%. Los packs extra son puro beneficio (97% de margen). La IA se convierte en una **nueva línea de ingresos** sin canibalizar la suscripción base.

### 7.9 Archivos Nuevos para el Sistema de Créditos

| Archivo | Propósito |
|---------|-----------|
| `src/lib/ai-credits.ts` | Lógica de cuota: check, consume, reset, add |
| `src/app/api/ai/credits/route.ts` | GET créditos restantes, POST comprar pack |
| `src/components/cuaderno/AICreditsWidget.tsx` | Widget visual con barra de créditos en sidebar |
| `src/components/cuaderno/AICreditsModal.tsx` | Modal de "sin créditos" + compra de packs |

### 7.10 Config de Créditos por Tier

Añadir a `TIER_CONFIG` en `src/lib/modules.ts`:

```typescript
// Campo nuevo en cada tier:
ai_credits_monthly: number  // Créditos IA incluidos/mes

// Valores:
basico:     { ai_credits_monthly: 0 }
intermedio: { ai_credits_monthly: 15 }
avanzado:   { ai_credits_monthly: 50 }
premium:    { ai_credits_monthly: 150 }
```

---

## 8. Variables de Entorno Necesarias

```env
# Ya existente
GEMINI_KEY=xxx                    # API Key de Google AI Studio

# Verificar que el modelo gemini-2.0-flash está disponible en la API Key
# No se necesitan variables adicionales
```

> **NOTA:** La misma `GEMINI_KEY` existente sirve para texto, audio e imagen con Gemini 2.0 Flash.

---

## 9. Cronograma de Implementación

| Fase | Función | Duración | Prioridad |
|------|---------|----------|-----------|
| **Fase 0** | Sistema de Créditos IA (metering + BD + UI) | 1 día | 🔴 Crítica (antes que todo) |
| **Fase 1** | Gemini Multimodal + Entrada por Voz | 2-3 días | 🔴 Alta |
| **Fase 2** | Validador Vademécum + Tabla BD | 2-3 días | 🔴 Alta |
| **Fase 3** | Escáner de Facturas | 1-2 días | 🟡 Media |
| **Fase 4** | Multi-Explotación Asesores | 1-2 días | 🟡 Media |

**Total estimado: 7-11 días**

---

## 10. Checklist de Implementación

### Fase 0 — Sistema de Créditos IA (Monetización)
- [ ] **0.1** — Migración SQL: crear tablas `ai_credits` y `ai_usage_log` con RLS
- [ ] **0.2** — Añadir `ai_credits_monthly` a `TIER_CONFIG` en `src/lib/modules.ts`
- [ ] **0.3** — Crear `src/lib/ai-credits.ts` (check, consume, reset, add)
- [ ] **0.4** — Crear `src/app/api/ai/credits/route.ts` (GET saldo, POST comprar)
- [ ] **0.5** — Crear `src/components/cuaderno/AICreditsWidget.tsx` (barra visual en sidebar)
- [ ] **0.6** — Crear `src/components/cuaderno/AICreditsModal.tsx` (modal sin créditos + packs)
- [ ] **0.7** — Integrar check de créditos como middleware en todas las rutas `/api/ai/*`

### Fase 1 — Entrada de Datos por Voz
- [ ] **1.1** — Crear `src/lib/gemini-multimodal.ts` con soporte audio + imagen
- [ ] **1.2** — Crear `src/app/api/ai/voice-entry/route.ts` (con check de créditos)
- [ ] **1.3** — Crear `src/components/cuaderno/VoiceRecorderButton.tsx`
- [ ] **1.4** — Integrar botón de voz en `TratamientoForm.tsx`
- [ ] **1.5** — Integrar botón de voz en `LaborForm.tsx`
- [ ] **1.6** — Integrar botón de voz en `FertilizacionForm.tsx`
- [ ] **1.7** — Testing E2E: grabar audio → ver campos pre-rellenados

### Fase 2 — Validador Vademécum
- [ ] **2.1** — Migración SQL: crear tabla `productos_fitosanitarios`
- [ ] **2.2** — Crear seed de datos (importar CSV del MAPA con productos comunes)
- [ ] **2.3** — Crear `src/app/api/ai/validate-treatment/route.ts` (con check de créditos)
- [ ] **2.4** — Crear `src/components/cuaderno/VademecumAlert.tsx`
- [ ] **2.5** — Integrar validación en `TratamientoForm.tsx` (debounce)
- [ ] **2.6** — Refactorizar `src/app/api/mapa/productos/route.ts` para usar BD real
- [ ] **2.7** — Crear endpoint import CSV para SuperAdmin
- [ ] **2.8** — Testing: probar con dosis excesiva, producto no autorizado

### Fase 3 — Escáner de Facturas
- [ ] **3.1** — Crear `src/app/api/ai/scan-invoice/route.ts` (con check de créditos)
- [ ] **3.2** — Crear `src/components/cuaderno/InvoiceScanner.tsx`
- [ ] **3.3** — Integrar en `InventarioModule.tsx` (botón + flujo)
- [ ] **3.4** — Testing: escanear factura real de cooperativa

### Fase 4 — Multi-Explotación Asesores
- [ ] **4.1** — Mejorar `technician/farmers/page.tsx` con tabla avanzada
- [ ] **4.2** — Crear dashboard panorámico `technician/dashboard/page.tsx`
- [ ] **4.3** — Crear acciones masivas `technician/bulk-actions/page.tsx`
- [ ] **4.4** — Mejorar `technician.ts` actions con métricas SIEX
- [ ] **4.5** — Mejorar vista de cuaderno del agricultor desde el técnico
- [ ] **4.6** — Testing: técnico gestiona múltiples cuadernos

### Final
- [ ] **5.1** — Build de producción sin errores
- [ ] **5.2** — Commit y push a main
- [ ] **5.3** — Verificar deploy en Vercel

---

> **IMPORTANTE:** Todas las funciones de IA usan Gemini 2.0 Flash, que es gratuito hasta 1.500 req/día. El sistema de créditos garantiza que el coste de IA nunca supere el 0,5% del precio de suscripción, y los packs extra generan un margen del 97%.

---

**Última actualización:** 20 de Mayo, 2026
**Estado:** 📋 Planificado — Pendiente de aprobación
