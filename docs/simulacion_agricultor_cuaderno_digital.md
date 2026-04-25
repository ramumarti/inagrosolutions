# 🧑‍🌾 Simulación: Soy Agricultor y Necesito el Cuaderno Digital

> Guía paso a paso desde la perspectiva de un agricultor real que quiere digitalizar su explotación y cumplir con la normativa CUE/SIEX a través de InagroSolutions.

---

## 📖 Contexto de la Simulación

**Personaje:** Antonio García, agricultor con 15 hectáreas de olivar y 3 hectáreas de almendros en Jaén.  
**Situación:** Su cooperativa le ha informado que a partir de 2026 es obligatorio el Cuaderno Digital de Explotación (CUE) conectado al sistema SIEX del Ministerio de Agricultura. Necesita ponerse al día antes de la campaña PAC.  
**Nivel tecnológico:** Usa WhatsApp y poco más. Tiene un smartphone Android.

---

## 🗺️ Mapa General del Proceso

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     VIAJE DEL AGRICULTOR                                │
│                                                                         │
│  1. DESCUBRIMIENTO ──→ 2. REGISTRO ──→ 3. CONFIRMACIÓN EMAIL           │
│          │                                      │                       │
│          │                                      ▼                       │
│          │                              4. PRIMER LOGIN                 │
│          │                                      │                       │
│          │                                      ▼                       │
│          │                              5. ONBOARDING (4 pasos)         │
│          │                                      │                       │
│          │                                      ▼                       │
│          │                              6. SUSCRIPCIÓN Y PAGO           │
│          │                                      │                       │
│          │                                      ▼                       │
│          │                              7. CUADERNO DIGITAL ACTIVO      │
│          │                                      │                       │
│          │                                      ▼                       │
│          │                              8. USO DIARIO                   │
│          │                                      │                       │
│          │                                      ▼                       │
│          │                              9. EXPORTACIÓN PAC / SIEX       │
│          │                                      │                       │
│          │                                      ▼                       │
│          │                             10. SUPERVISIÓN TÉCNICA          │
│          └──────────────────────────────────────────────────────────────┘
```

---

## Paso 1: 🔍 Descubrimiento — ¿Cómo me entero?

Antonio puede llegar a InagroSolutions por dos vías:

### Opción A: A través de su Cooperativa (lo más habitual)

Su cooperativa ya es Partner de InagroSolutions y tiene una **landing page personalizada** con su marca:

```
🌐 URL: https://inagrosolutions.com/c/coop-olivar-jaen
```

**¿Qué ve Antonio?**

| Sección | Contenido |
|---------|-----------|
| **Hero** | Branding de la cooperativa (logo, colores propios). Botón: *"Soy Agricultor"* |
| **Problemas** | Le muestran los 3 miedos del agricultor: falta de tiempo, miedo a multas, trámites liosos |
| **Cómo funciona** | 3 pasos simples: Únete → Configuración SIGPAC → Registra desde el tractor |
| **Servicios** | Cuaderno Digital (CUE), Asesoramiento Técnico, Tranquilidad PAC, Soporte continuo |
| **Planes** | Básico (≤5 ha), Intermedio (≤20 ha), Avanzado (≤50 ha), Premium (≤100 ha) |
| **Testimonios** | Socio agricultor: *"El Cuaderno Digital me quitaba el sueño..."* |
| **Contacto** | Dirección, teléfono y email de la cooperativa |

> [!TIP]
> Esta página es de **marca blanca** — Antonio ve la identidad visual de SU cooperativa, no de InagroSolutions. Esto genera confianza.

### Opción B: Búsqueda directa (venta B2C)

Si Antonio no tiene cooperativa, llega directamente a la **landing pública de planes**:

```
🌐 URL: https://inagrosolutions.com/cuaderno/planes
```

Esta es una página pública completa (`src/app/cuaderno/planes/page.tsx`) con hero, beneficios, los 4 planes, servicios adicionales, testimonios y CTA. Es la misma página que la Opción A pero sin parámetro `?tenant=`, así que se muestra con la marca genérica de InagroSolutions.

---

## Paso 2: 📋 Registro — Creación de la Cuenta

Antonio pulsa **"Soy Agricultor"** o **"Únete ahora"** y es redirigido a:

```
🌐 URL: https://inagrosolutions.com/cuaderno/planes?tenant=coop-olivar-jaen
```

Esta es la **landing pública de planes** (`src/app/cuaderno/planes/page.tsx`), una página completa que incluye:

| Sección | Contenido |
|---------|----------|
| **Hero** | *"Lleva tu explotación al día, sin tocar un solo papel"* + botones "Ver Planes" y "Hablar con un Asesor" |
| **Público objetivo** | Agricultores, Pequeñas Fincas, Cooperativas, Técnicos |
| **Beneficios** | Menos papeleo, Cumple normativas, Desde el campo, Todo en un lugar, Soporte humano, Calculadora de Dosis |
| **4 Planes** | Básico (≤5 ha), Intermedio (≤20 ha), Avanzado (≤50 ha), Premium (≤100 ha) — con toggle mensual/anual |
| **Servicios adicionales** | Alta SIGPAC (desde 50€), Soporte inspecciones (consultar), Asesoramiento agronómico (90€/visita) |
| **Bloque Partner** | Muestra el logo y datos de la cooperativa si hay `?tenant=` en la URL |
| **Testimonios** | Casos reales de agricultores |
| **CTA Final** | *"No te la juegues con la próxima PAC"* |

> [!NOTE]
> Si el parámetro `?tenant=coop-olivar-jaen` está presente, la página carga dinámicamente el logo, nombre y datos de contacto de la cooperativa. Si no, muestra InagroSolutions como marca genérica.

Antonio revisa los módulos incluidos en cada plan:

Antonio decide que el plan **Intermedio** se adapta a sus 18 hectáreas y pulsa **"Seleccionar Intermedio"**, lo que le lleva al **formulario de registro**:

```
🌐 URL: https://inagrosolutions.com/signup?plan=intermedio&tenant=coop-olivar-jaen
```

### Formulario que rellena Antonio:

| Campo | Valor de ejemplo | Obligatorio |
|-------|-------------------|:-----------:|
| **Nombre** | Antonio | ✅ |
| **Apellidos** | García López | ✅ |
| **Nombre de la Finca** | Finca Los Olivos | ❌ (opcional) |
| **Correo Electrónico** | antonio.garcia@gmail.com | ✅ |
| **Contraseña** | ••••••••••• | ✅ |
| **Acepto la Política de Privacidad** | ☑️ | ✅ |
| **Acepto las condiciones del Cuaderno SIEX** | ☑️ | ✅ |

**Botón:** `CREAR MI CUENTA`

> [!IMPORTANT]
> El formulario registra automáticamente en los metadatos:
> - `platform_role: tenant_member` (agricultor)
> - `is_business: false`
> - `plan_id: intermedio`
> - `tenant_slug: coop-olivar-jaen`

---

## Paso 3: 📧 Confirmación de Email

Tras pulsar "Crear mi Cuenta", Antonio ve el mensaje:

> ✅ **¡Cuenta Creada!**
> *Confirma tu email ahora para proceder al pago seguro y activar tus servicios.*

Antonio va a su correo y hace clic en el enlace de confirmación. Es redirigido a:

```
🌐 URL: https://inagrosolutions.com/auth/confirm → /login
```

> [!NOTE]
> Sin confirmar el email, Antonio **no puede iniciar sesión**. Si no recibe el email, debe revisar la carpeta de spam.

---

## Paso 4: 🔐 Primer Login

Antonio introduce su email y contraseña en:

```
🌐 URL: https://inagrosolutions.com/login
```

El sistema detecta:
1. ✅ Email confirmado
2. 🔍 Rol: `farmer`
3. ❓ ¿Tiene explotaciones registradas? → **NO**
4. → Redirige a **Onboarding**

---

## Paso 5: 🚀 Onboarding — Configuración Inicial (4 pasos)

```
🌐 URL: https://inagrosolutions.com/onboarding
```

Antonio ve un asistente guiado con barra de progreso y 4 pasos:

### Paso 5.1: 👤 Perfil — *¿Quién eres?*

| Campo | Valor | Detalle |
|-------|-------|---------|
| **Nombre** | Antonio | Pre-rellenado del registro |
| **Apellidos** | García López | Pre-rellenado del registro |
| **Empresa / Cooperativa** | Coop. Olivar de Jaén | Opcional |

**Botón:** `Continuar →`

### Paso 5.2: 🗺️ Explotación — *Tu Explotación*

| Campo | Valor | Detalle |
|-------|-------|---------|
| **Nombre de la Explotación** * | Finca Los Olivos | Obligatorio |
| **Nº Registro SIEX** | ES-23-00456 | Opcional (se puede añadir después) |
| **Total Hectáreas** * | 18 | Obligatorio — condiciona la sugerencia de plan |

**Botón:** `← Atrás` / `Siguiente →`

> [!TIP]
> El Nº Registro SIEX es el código oficial de la explotación ante el Ministerio. Si Antonio no lo sabe aún, puede añadirlo más tarde desde su perfil.

### Paso 5.3: 👑 Plan — *Selecciona tu Plan*

El sistema auto-sugiere **Intermedio** porque Antonio declaró 18 hectáreas.

| Plan | Max HA | Precio/mes | Módulos extra | Sugerencia |
|------|:------:|:----------:|---------------|:----------:|
| **Básico** | 5 ha | 4,99 €/mes | Solo módulos obligatorios | |
| **Intermedio** | 20 ha | 19,99 €/mes | + Costes, Cosechas, Alertas | ⭐ Recomendado |
| **Avanzado** | 50 ha | 49,99 €/mes | + Trazabilidad, Dashboards | |
| **Premium** | 100 ha | 89,99 €/mes | + Sensores IoT | |

Antonio selecciona **Intermedio**.

**Botón:** `← Atrás` / `Confirmar →`

### Paso 5.4: 🚀 Lanzar — *¡Tu Cuaderno Digital está Listo!*

Antonio ve un resumen de confirmación:

```
🎉 ¡Tu Cuaderno Digital está Listo!

   Finca Los Olivos • 18 ha • Plan Intermedio

   ✓ SIEX           ✓ Fitosanitarios    ✓ Fertilización
   ✓ Labores        ✓ Parcelas          ✓ Exportación PAC
```

**Botón:** `✨ Abrir Cuaderno Digital`

> [!IMPORTANT]
> Al pulsar "Abrir Cuaderno Digital", el sistema:
> 1. Actualiza los metadatos del usuario (`onboarded: true`)
> 2. Crea la explotación en la tabla `explotaciones`
> 3. Asigna el `agri_tier: intermedio` al usuario
> 4. Activa los módulos correspondientes al plan
> 5. Redirige a `/cuaderno`

---

## Paso 6: 💳 Suscripción y Pago

### ¿Cuándo paga Antonio?

Tras acceder al Cuaderno Digital, el sistema comprueba el estado de suscripción:

- **`subscription_status === 'active'`** → ✅ Acceso completo
- **`subscription_status === 'trialing'`** → ✅ Acceso durante prueba
- **Cualquier otro estado** → 🔒 **Paywall** — bloquea acceso y redirige a planes

### Flujo de pago (Stripe Checkout)

1. Antonio accede a `/cuaderno/planes` (la página **protegida** dentro del dashboard, `src/app/(protected)/cuaderno/planes/`)
2. Selecciona su plan (mensual o anual)
3. Pulsa **"Seleccionar Intermedio"**
4. Se crea una sesión de **Stripe Checkout** vía `POST /api/stripe/checkout`
5. Antonio es redirigido a Stripe para pagar con tarjeta
6. Stripe procesa el pago con **Direct Charges** (revenue sharing 50/50 con la cooperativa)
7. Webhook de Stripe actualiza `subscription_status = 'active'`
8. Antonio es redirigido de vuelta al Cuaderno Digital

> [!IMPORTANT]
> Existen **dos páginas de planes** con rutas similares pero distinto propósito:
> | Página | Ruta real | Archivo | Propósito |
> |--------|----------|---------|----------|
> | **Pública** | `/cuaderno/planes` | `src/app/cuaderno/planes/page.tsx` | Landing de venta para visitantes sin cuenta |
> | **Protegida** | `/cuaderno/suscripcion` | `src/app/(protected)/cuaderno/suscripcion/page.tsx` | Gestión de suscripción para usuarios logueados |

### Opciones de facturación

| Opción | Precio (Intermedio) | Ahorro |
|--------|:-------------------:|:------:|
| **Mensual** | 19,99 €/mes | — |
| **Anual** | 199,90 €/año | 2 meses gratis |

### Servicios adicionales (desde la landing pública)

Además de los planes, Antonio puede contratar servicios extra que aparecen en la landing pública:

| Servicio | Precio | Descripción |
|----------|:------:|-------------|
| **Alta y configuración SIGPAC** | Desde 50 € | InagroSolutions carga sus parcelas desde el sistema oficial |
| **Soporte para inspecciones** | Consultar | Asistencia prioritaria ante requerimientos de la CCAA |
| **Asesoramiento Agronómico** | Desde 90 €/visita | Visita a finca, visado de tratamientos, optimización |

> [!NOTE]
> Una vez suscrito, Antonio puede gestionar su suscripción (cambiar plan, cancelar, actualizar tarjeta) desde el **Portal de Stripe** accesible en `/cuaderno/planes` → botón *"Gestionar Suscripción"*.

---

## Paso 7: 📗 Cuaderno Digital Activo — ¿Qué puede hacer Antonio?

```
🌐 URL: https://inagrosolutions.com/cuaderno
```

Antonio accede a su **Cuaderno Digital** con todos los módulos de su plan desbloqueados:

### Módulos disponibles (Plan Intermedio)

| Módulo | Función | ¿Incluido? |
|--------|---------|:----------:|
| 🏠 **Inicio** | Resumen diario, alertas activas, accesos rápidos | ✅ |
| 🗺️ **Fincas** | Gestión de explotaciones agrícolas | ✅ |
| 📐 **Parcelas** | CRUD de parcelas con integración SIGPAC | ✅ |
| 🧪 **Fitosanitarios** | Registro de tratamientos fitosanitarios | ✅ |
| 🚜 **Labores** | Registro de labores agrícolas | ✅ |
| 🌿 **Fertilización** | Control de abonados y fertilizantes | ✅ |
| 📅 **Calendario** | Vista calendario de actividades | ✅ |
| 📦 **Inventario** | Almacén de insumos | ✅ |
| 💰 **Costes** | Rentabilidad y análisis económico | ✅ *(Intermedio+)* |
| 🌾 **Cosechas** | Trazabilidad de cosechas | ✅ *(Intermedio+)* |
| ⚠️ **Alertas** | Sistema de alertas inteligentes | ✅ *(Intermedio+)* |
| 📊 **Dashboards** | Informes visuales avanzados | 🔒 *(Avanzado+)* |
| 📡 **Sensores** | Integración IoT | 🔒 *(Premium)* |
| 📄 **Exportación PAC** | Exportación oficial SIEX/PAC | ✅ |

### Navegación del sidebar de Antonio

```
└── 🌱 Cuaderno Digital ▸
    ├── Panel / Inicio
    ├── Parcelas
    ├── Fitosanitarios
    ├── Almacén
    ├── Fertilización
    ├── Labores
    ├── Planes
    ├── Registro SIEX
    └── Exportación PAC
```

---

## Paso 8: 📱 Uso Diario — La Vida de Antonio con el Cuaderno

### Escenario: Día normal en la finca

```
07:00 — Antonio sale al campo con su móvil
         (la app está instalada como PWA en su pantalla de inicio)

09:30 — Realiza un tratamiento fitosanitario en la parcela "Olivar Norte"
         → Abre el Cuaderno → Fitosanitarios → Nuevo Registro
         → Selecciona parcela, producto, dosis, método, operario
         → Guarda (funciona incluso SIN COBERTURA - modo offline)

12:00 — Registra una labor de poda en parcela "Almendros Sur"
         → Labores → Nueva Labor → Tipo: Poda → Parcela → Guarda

14:00 — Revisa el inventario de productos fitosanitarios
         → Inventario → Ve stock actual y fechas de caducidad

18:00 — De vuelta en casa, revisa el Panel de Inicio
         → Ve resumen del día: 2 registros, 0 alertas, stock OK
```

### Funcionalidades clave para Antonio

| Funcionalidad | Descripción |
|---------------|-------------|
| **Modo Offline** | Registra sin cobertura. Se sincroniza cuando hay internet |
| **Interfaz con botones grandes** | Pensada para usar con guantes de campo |
| **Alertas automáticas** | Avisa de plazos de seguridad, caducidades, etc. |
| **Cálculo automático de dosis** | Valida dosis de fitosanitarios contra la normativa |
| **Multi-parcela** | Gestiona todas sus parcelas desde un solo sitio |

---

## Paso 9: 📄 Exportación PAC / SIEX — Cuando llega la administración

Cuando Antonio necesita presentar su Cuaderno Digital ante la administración:

```
🌐 URL: https://inagrosolutions.com/cuaderno/report
```

### ¿Qué exporta?

| Documento | Formato | Uso |
|-----------|---------|-----|
| **Cuaderno de Explotación (CUE)** | PDF / XML | Presentación oficial ante SIEX |
| **Registro Fitosanitario** | PDF | Inspecciones de campo |
| **Registro de Fertilización** | PDF | Condicionalidad PAC |
| **Registro de Labores** | PDF | Eco-regímenes PAC |
| **Exportación SIEX completa** | XML oficial | Carga directa en el sistema SIEX del Ministerio |

> [!IMPORTANT]
> La exportación genera documentos en el **formato oficial** requerido por el Ministerio de Agricultura (RD 1054/2022). Antonio puede descargarlos y subirlos directamente al SIEX o bien entregarlos a su técnico.

---

## Paso 10: 👨‍🔬 Supervisión Técnica — No está solo

Si la cooperativa de Antonio tiene **Supervisores Técnicos** asignados:

### ¿Qué hace el técnico de Antonio?

| Acción | Descripción |
|--------|-------------|
| **Revisa registros** | Comprueba que los tratamientos y labores están bien documentados |
| **Emite prescripciones** | Receta tratamientos fitosanitarios oficiales |
| **Genera informes** | Prepara los informes SIEX a nombre de Antonio |
| **Gestiona alertas** | Monitoriza plazos y cumplimiento normativo |
| **Visita la finca** | Si es necesario, coordina visitas presenciales |

### ¿Cómo lo ve Antonio?

Antonio ve en su Panel de Inicio las **prescripciones del técnico** y las **alertas** que este genera. No tiene que hacer nada especial — su cooperativa se encarga del seguimiento técnico.

---

## 📊 Resumen Visual del Viaje Completo

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   🌐 Landing de la Cooperativa                                              │
│   └── /c/coop-olivar-jaen                                                    │
│       └── Botón "Soy Agricultor"                                            │
│                                                                              │
│   📋 Ver Planes                                                              │
│   └── /cuaderno/planes?tenant=coop-olivar-jaen                               │
│       └── Selecciona "Intermedio" (18 ha)                                    │
│                                                                              │
│   📝 Registro                                                                │
│   └── /signup?plan=intermedio&tenant=coop-olivar-jaen                        │
│       └── Rellena formulario + acepta política                               │
│                                                                              │
│   📧 Confirma Email                                                          │
│   └── Clic en enlace del correo → /auth/confirm                             │
│                                                                              │
│   🔐 Login                                                                   │
│   └── /login                                                                 │
│       └── Detecta: farmer + sin explotaciones                                │
│                                                                              │
│   🚀 Onboarding (4 pasos)                                                   │
│   └── /onboarding                                                            │
│       ├── 1. Perfil (nombre, apellidos, empresa)                             │
│       ├── 2. Explotación (nombre, SIEX, hectáreas)                           │
│       ├── 3. Plan (sugerido Intermedio)                                      │
│       └── 4. ¡Listo! → Crea explotación + activa módulos                    │
│                                                                              │
│   💳 Pago (Stripe)                                                           │
│   └── /cuaderno/planes → Stripe Checkout → pago → webhook                   │
│       └── subscription_status = 'active'                                     │
│                                                                              │
│   📗 Cuaderno Digital Operativo                                              │
│   └── /cuaderno                                                              │
│       ├── Fincas, Parcelas, Fitosanitarios                                   │
│       ├── Labores, Fertilización, Calendario                                 │
│       ├── Inventario, Costes, Cosechas                                       │
│       └── Exportación PAC / SIEX                                            │
│                                                                              │
│   👨‍🔬 Supervisión                                                            │
│   └── El técnico de la cooperativa revisa y asesora                          │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## ❓ Preguntas Frecuentes del Agricultor

| Pregunta | Respuesta |
|----------|-----------|
| *¿Necesito ordenador?* | No. El Cuaderno funciona como una app en tu móvil (PWA). |
| *¿Funciona sin internet?* | Sí. Registra datos offline y se sincroniza al tener cobertura. |
| *¿Puedo cambiar de plan?* | Sí, en cualquier momento desde `/cuaderno/planes`. |
| *¿Quién ve mis datos?* | Solo tú, tu técnico asignado y el admin de tu cooperativa. |
| *¿Qué pasa si supero las hectáreas de mi plan?* | Recibirás una notificación para actualizar tu plan. |
| *¿Puedo cancelar?* | Sí, desde el Portal de Stripe. Tus datos se conservan. |
| *¿Sirve para la PAC?* | Sí. Genera los documentos oficiales para SIEX y condicionalidad PAC. |
| *¿Y si no tengo cooperativa?* | Puedes registrarte directamente desde `inagrosolutions.com/cuaderno`. |

---

## 🔗 URLs Clave para el Agricultor

| Página | URL | Descripción |
|--------|-----|-------------|
| Landing de cooperativa | `/c/[slug]` | Página pública de la cooperativa |
| Ver planes | `/cuaderno/planes?tenant=[slug]` | Comparar planes y precios |
| Registro | `/signup?plan=[plan]&tenant=[slug]` | Crear cuenta |
| Login | `/login` | Iniciar sesión |
| Onboarding | `/onboarding` | Configuración inicial (solo primera vez) |
| Cuaderno Digital | `/cuaderno` | Panel principal del cuaderno |
| Planes/Suscripción | `/cuaderno/suscripcion` | Gestionar plan y suscripción |
| Almacén | `/cuaderno/recursos` | Inventario de insumos |
| Informes SIEX | `/cuaderno/report` | Exportación oficial |
| Perfil | `/profile` | Datos personales |

---

## 🏗️ Archivos del Código Relacionados

| Componente | Archivo |
|------------|---------|
| Landing Cooperativa (White-Label) | `src/app/c/[slug]/page.tsx` |
| **Landing Pública de Planes** | `src/app/cuaderno/planes/page.tsx` |
| Layout de la Landing Pública | `src/app/cuaderno/layout.tsx` |
| Formulario de Registro | `src/app/(auth)/signup/page.tsx` |
| Onboarding | `src/app/(protected)/onboarding/page.tsx` |
| Cuaderno Digital | `src/app/(protected)/cuaderno/page.tsx` |
| Planes y Suscripción (protegida) | `src/app/(protected)/cuaderno/suscripcion/page.tsx` |
| Informes SIEX | `src/app/(protected)/cuaderno/report/page.tsx` |
| Configuración de Tiers | `src/lib/modules.ts` |
| Checkout Stripe | `src/app/api/stripe/checkout/route.ts` |
| Auth Callback | `src/app/auth/confirm/route.ts` |
| Contexto de Auth/Tenant | `src/lib/auth/tenant-context.tsx` |

---

*Documento generado el 25/04/2026. Basado en el código fuente actual de InagroSolutions.*
