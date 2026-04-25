# 🏗️ Arquitectura del Portal InagroSolutions — Roles y Flujos

> Documento de referencia que describe cómo se articula cada tipo de usuario dentro de la plataforma.

---

## 📋 Resumen de Roles

| Rol | `platform_role` | Descripción | Cantidad esperada |
|-----|-----------------|-------------|-------------------|
| **Superadmin** | `superadmin` | Dueño de la plataforma InagroSolutions. Control global. | 1-2 personas |
| **Admin (Tenant Admin)** | `tenant_admin` | Administrador de una entidad/cooperativa asociada (Partner B2B). | 1 por entidad |
| **Supervisor Técnico** | `technician` | Técnico agrícola o asesor que supervisa cuadernos de agricultores. | N por entidad |
| **Agricultor** | `farmer` | Usuario final que gestiona su Cuaderno Digital. | Ilimitados |

---

## 🌐 Páginas Públicas (Sin Autenticación)

### Landing Page Principal — Captación de Partners B2B
- **Ruta:** `/` → `src/app/page.tsx`
- **Público objetivo:** Cooperativas, asesorías, ingenierías
- **Mensaje principal:** *"Gana el 50% de cada agricultor sin invertir un solo euro"*
- **CTAs:** → `/signup` (Registro de Partner/Entidad)

### Landing Page de Entidad (White-Label) — Captación de Agricultores
- **Ruta:** `/c/[slug]` → `src/app/c/[slug]/page.tsx`
- **Público objetivo:** Agricultores asociados a esa cooperativa/entidad
- **Contenido:** Branding dinámico del tenant (logo, colores, servicios, hero)
- **Mensaje principal:** *"Tu cooperativa te ofrece el Cuaderno Digital"*
- **CTAs:** → `/cuaderno/planes?tenant=[slug]` (Ver planes y registrarse)

### Página del Cuaderno Digital (Pública)
- **Ruta:** `/cuaderno` (fuera de `(protected)`)
- **Público objetivo:** Agricultores sin entidad (venta directa)

```
FLUJO DE CAPTACIÓN:

  inagrosolutions.com /            ──→ Partner B2B ──→ /signup (modo Entidad)
  inagrosolutions.com /c/mi-coop   ──→ Agricultor  ──→ /cuaderno/planes?tenant=mi-coop ──→ /signup?plan=X&tenant=mi-coop
```

---

## 📝 Formularios de Registro

Existe **un único formulario de registro** en `/signup` que se comporta de forma dual según los parámetros URL:

**Ruta:** `/(auth)/signup` → `src/app/(auth)/signup/page.tsx`

### Modo Agricultor (si hay `?plan=` o `?tenant=`)
| Campo | Obligatorio |
|-------|:-----------:|
| Nombre | ✅ |
| Apellidos | ✅ |
| Nombre de la Finca | ❌ |
| Correo electrónico | ✅ |
| Contraseña | ✅ |
| Aceptar Política de Privacidad | ✅ |
| Aceptar Cuaderno SIEX | ✅ |

- **Rol asignado:** `tenant_member` (equivalente a `farmer`)
- **Metadata:** `is_business: false`, `plan_id`, `tenant_slug`
- **Botón:** "CREAR MI CUENTA"

### Modo Partner/Entidad (sin `?plan=` ni `?tenant=`)
| Campo | Obligatorio |
|-------|:-----------:|
| Nombre | ✅ |
| Apellidos | ✅ |
| Nombre de la Entidad / Cooperativa | ✅ |
| Email de Administración | ✅ |
| Contraseña | ✅ |
| Aceptar Política de Privacidad | ✅ |
| Aceptar RD 1054/2022 | ✅ |

- **Rol asignado:** `tenant_admin`
- **Metadata:** `is_business: true`, `is_partner_reg: true`, `company_name`
- **Botón:** "REGISTRAR ENTIDAD GRATIS"

> **NOTA:** El Superadmin NO se registra por formulario. Se crea manualmente en la base de datos.
> Los Técnicos NO se registran solos. El Admin los crea/invita desde `/admin/assignments`.

---

## 🔄 Flujos Post-Registro

```
REGISTRO COMPLETADO
       │
       ▼
  Confirmar email
       │
       ▼
     /login
       │
       ▼
  ¿Qué rol tiene?
       │
       ├── superadmin ──────────→ /superadmin
       ├── tenant_admin ────────→ /dashboard
       ├── technician ──────────→ /technician
       └── farmer ──────────────→ ¿Tiene explotaciones?
                                      │
                                      ├── No ──→ /onboarding (4 pasos)
                                      └── Sí ──→ ¿Suscripción activa?
                                                      │
                                                      ├── No ──→ Paywall en /cuaderno
                                                      └── Sí ──→ /cuaderno
```

### Onboarding del Agricultor (`/onboarding`)
`src/app/(protected)/onboarding/page.tsx` — Solo para farmers sin explotaciones.

| Paso | Contenido |
|------|-----------|
| 1. Perfil | Nombre, apellidos, empresa (opcional) |
| 2. Explotación | Nombre finca, Nº SIEX, hectáreas totales |
| 3. Plan/Tier | Selección de plan (Básico/Intermedio/Avanzado/Premium) |
| 4. Confirmación | Resumen + botón "Abrir Cuaderno Digital" |

> **IMPORTANTE:** Los admins y superadmins que caigan en `/onboarding` son redirigidos automáticamente a `/dashboard`.

---

## 🖥️ Dashboards por Rol (Zona Protegida)

### 1. SUPERADMIN — Portal Global

**Guard:** `src/app/(protected)/superadmin/layout.tsx` → Requiere `isSuperadmin === true`

| Ruta | Función |
|------|---------|
| `/superadmin` | Dashboard global: KPIs (entidades, usuarios, MRR, conversión), gráfico actividad 7 días, eventos recientes |
| `/superadmin/tenants` | CRUD de todas las entidades/cooperativas. Botón "Gestionar" para impersonar tenant |
| `/superadmin/users` | Lista global de todos los usuarios de la plataforma |
| `/superadmin/plans` | Gestión de planes de suscripción |
| `/superadmin/landing` | CMS para editar la landing principal |
| `/superadmin/audit` | Logs de auditoría globales |

**Capacidad especial: Impersonación de Tenant**
- El Superadmin puede "entrar" en cualquier entidad desde `/superadmin/tenants`
- Al hacerlo, ve las mismas secciones que el Admin de esa entidad
- Un banner amber en el sidebar indica que está gestionando una entidad ajena
- Botón "Salir de Gestión" devuelve al contexto superadmin

**Items adicionales visibles en sidebar cuando impersona:**
- Todos los items del Admin (branding, supervisión, socios, etc.)
- Todos los items del Técnico (clientes, tareas)
- Cuaderno Digital

### 2. ADMIN (TENANT ADMIN) — Consola de la Entidad

**Guard:** `src/app/(protected)/admin/layout.tsx` → Requiere `platform_role IN ('superadmin', 'tenant_admin')`

**Dashboard principal:** `/dashboard` → `src/app/(protected)/dashboard/page.tsx`
- Bienvenida personalizada con nombre del tenant
- KPIs: Socios totales, Hectáreas en red, Alertas, Salud de red
- Analytics Dashboard (gráficos)
- Actividad reciente de la red
- Widget de suscripción y facturación
- Soporte premium

| Ruta | Función |
|------|---------|
| `/dashboard` | Panel principal de la entidad |
| `/admin/branding` | Configuración marca blanca (logo, colores, textos hero) |
| `/admin/supervision` | Supervisión de cuadernos de los agricultores asociados |
| `/admin/supervision/[farmerId]/report` | Informe SIEX de un agricultor concreto |
| `/admin/members` | Gestión de socios/agricultores (invitar, listar) |
| `/admin/workers` | Gestión de operarios de campo |
| `/admin/machinery` | Registro de maquinaria |
| `/admin/assignments` | Asignar técnicos a agricultores |
| `/admin/audit` | Logs de auditoría de la entidad |
| `/admin/billing` | Facturación, comisiones y revenue sharing |
| `/admin/email` | Gestión de plantillas de email |
| `/admin/plans` | Planes del sistema |
| `/admin/guia` | Guía de éxito para partners |
| `/admin/users` | Gestión de usuarios de la entidad |

> **NOTA:** El Admin NO ve el Cuaderno Digital en el sidebar. Solo ve la sección de administración de la entidad.

### 3. SUPERVISOR TÉCNICO — Panel del Técnico

**Guard:** `src/app/(protected)/technician/layout.tsx` → Requiere `hasRole(['technician', 'tenant_admin'])`

**Dashboard principal:** `/technician` → `src/app/(protected)/technician/page.tsx`
- KPIs: Agricultores asignados, Explotaciones supervisadas, Tareas pendientes

| Ruta | Función |
|------|---------|
| `/technician` | Dashboard del técnico con KPIs |
| `/technician/farmers` | Lista de agricultores asignados |
| `/technician/farmer/[id]` | Detalle/cuaderno de un agricultor específico |
| `/technician/tasks` | Tablero de tareas agronómicas |
| `/technician/recommendations` | Emisión de prescripciones fitosanitarias |

**También ve en sidebar:** Cuaderno Digital (sección desplegable)

### 4. AGRICULTOR (FARMER) — Cuaderno Digital

**No tiene layout guard propio** — usa el layout protegido general.
**Redirección a onboarding** si no tiene explotaciones registradas.
**Paywall** si `subscription_status !== 'active'` y `!== 'trialing'`.

**Dashboard principal:** `/cuaderno` → `src/app/(protected)/cuaderno/page.tsx`

| Módulo/Tab | Función | Tier mínimo |
|------------|---------|:-----------:|
| Inicio | Resumen diario, alertas, prescripciones, grid de módulos | Todos |
| Fincas | Gestión de explotaciones agrícolas | Todos |
| Parcelas | CRUD de parcelas con SIGPAC | Todos |
| Fitosanitarios | Registro de tratamientos fitosanitarios | Todos |
| Labores | Registro de labores agrícolas | Todos |
| Fertilización | Control de abonados y fertilizantes | Todos |
| Calendario | Vista calendario de actividades | Todos |
| Inventario | Almacén de insumos | Todos |
| Costes | Rentabilidad y análisis económico | Intermedio+ |
| Cosechas/Trazabilidad | Trazabilidad de cosechas | Avanzado+ |
| Dashboards | Informes visuales avanzados | Avanzado+ |
| Sensores | Integración IoT | Premium |
| Exportación PAC | Exportación oficial SIEX/PAC | Todos |

**Subrutas adicionales:**

| Ruta | Función |
|------|---------|
| `/cuaderno/planes` | Ver/cambiar plan de suscripción |
| `/cuaderno/recursos` | Almacén de insumos |
| `/cuaderno/report` | Generar informes SIEX |
| `/profile` | Perfil del usuario |

---

## 🧭 Navegación Sidebar por Rol

### Superadmin (🟡)
```
├── Superadmin Dashboard
├── Entidades
├── Usuarios
├── Planes
├── CMS Landing
├── Logs Auditoría
├── Email
├── Planes Sistema
│
└── [Si impersona una entidad]:
    ├── + Todos los items del Admin
    ├── + Todos los items del Técnico
    └── + Cuaderno Digital
```

### Admin / Tenant Admin (🔵)
```
├── Mi Marca Blanca
├── Resumen Empresa (/dashboard)
├── Supervisión Cuadernos
├── Gestión de Socios
├── Mis Operarios
├── Maquinaria
├── Asignar Técnicos
├── Auditoría
├── Facturación y Comisiones
└── Guía de Éxito
```

### Supervisor Técnico (🟢)
```
├── Técnico (Dashboard)
├── Mis Clientes
├── Tablero Tareas
└── Cuaderno Digital ▸
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

### Agricultor (🌱)
```
└── Cuaderno Digital ▸
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

## 🗂️ Estructura de Rutas (Resumen)

```
src/app/
├── page.tsx                          ← Landing B2B (Partners)
├── c/[slug]/page.tsx                 ← Landing White-Label (Agricultores)
│
├── (auth)/
│   ├── login/page.tsx                ← Login universal
│   ├── signup/page.tsx               ← Registro dual (Partner / Agricultor)
│   └── forgot-password/page.tsx      ← Recuperar contraseña
│
├── (protected)/                      ← Requiere autenticación
│   ├── layout.tsx                    ← Layout global (Sidebar + Header + Branding)
│   │
│   ├── dashboard/page.tsx            ← Dashboard del Admin (tenant_admin)
│   ├── onboarding/page.tsx           ← Onboarding del Agricultor
│   ├── profile/page.tsx              ← Perfil del usuario
│   │
│   ├── superadmin/                   ← Solo superadmin
│   │   ├── page.tsx                  ← Dashboard global
│   │   ├── tenants/page.tsx          ← CRUD entidades
│   │   ├── users/page.tsx            ← Usuarios globales
│   │   ├── plans/page.tsx            ← Planes
│   │   ├── landing/                  ← CMS landing
│   │   └── audit/                    ← Auditoría global
│   │
│   ├── admin/                        ← superadmin + tenant_admin
│   │   ├── branding/                 ← Marca blanca
│   │   ├── supervision/              ← Supervisión cuadernos
│   │   │   └── [farmerId]/report/    ← Informe SIEX por agricultor
│   │   ├── members/                  ← Socios
│   │   ├── workers/                  ← Operarios
│   │   ├── machinery/                ← Maquinaria
│   │   ├── assignments/              ← Asignación técnicos
│   │   ├── audit/                    ← Auditoría entidad
│   │   ├── billing/                  ← Facturación
│   │   ├── email/                    ← Email
│   │   ├── plans/                    ← Planes sistema
│   │   ├── users/                    ← Usuarios entidad
│   │   └── guia/                     ← Guía éxito
│   │
│   ├── technician/                   ← technician + tenant_admin
│   │   ├── page.tsx                  ← Dashboard técnico
│   │   ├── farmers/page.tsx          ← Lista clientes
│   │   ├── farmer/[id]/              ← Detalle agricultor
│   │   ├── tasks/                    ← Tareas
│   │   └── recommendations/          ← Prescripciones
│   │
│   └── cuaderno/                     ← Todos (principalmente farmer)
│       ├── page.tsx                  ← Cuaderno Digital principal (tabs)
│       ├── planes/                   ← Planes/suscripción
│       ├── recursos/                 ← Almacén insumos
│       └── report/                   ← Informes SIEX
│
└── api/                              ← Endpoints API
    ├── auth/                         ← Callbacks auth
    ├── checkout/                     ← Stripe checkout
    ├── stripe/                       ← Webhooks Stripe
    ├── farms/                        ← API fincas
    ├── generate/                     ← Generación IA
    └── mapa/                         ← API mapas SIGPAC
```

---

## 🔐 Resumen de Permisos por Ruta

| Ruta | Superadmin | Admin | Técnico | Agricultor |
|------|:----------:|:-----:|:-------:|:----------:|
| `/` (landing B2B) | ✅ | ✅ | ✅ | ✅ |
| `/c/[slug]` (landing entidad) | ✅ | ✅ | ✅ | ✅ |
| `/signup` | ✅ | ✅ | ✅ | ✅ |
| `/login` | ✅ | ✅ | ✅ | ✅ |
| `/superadmin/*` | ✅ | ❌ | ❌ | ❌ |
| `/dashboard` | ✅* | ✅ | ❌ | ❌ |
| `/admin/*` | ✅* | ✅ | ❌ | ❌ |
| `/technician/*` | ✅* | ✅ | ✅ | ❌ |
| `/cuaderno/*` | ✅* | ❌** | ✅*** | ✅ |
| `/onboarding` | →/dashboard | →/dashboard | ❌ | ✅ |
| `/profile` | ✅ | ✅ | ✅ | ✅ |

> \* Solo cuando impersona una entidad  
> \*\* El Admin no ve el Cuaderno en su sidebar; su foco es la gestión de la entidad  
> \*\*\* El Técnico puede ver el Cuaderno para supervisar agricultores  

---

## 💰 Tiers de Suscripción (Agricultores)

| Tier | Max HA | Precio/mes | Módulos extra |
|------|:------:|:----------:|---------------|
| **Básico** | 5 ha | 4,99 € | Módulos obligatorios (SIEX, Fitosanitarios, Fertilización, Labores, Parcelas, Exportación) |
| **Intermedio** | 20 ha | 19,99 € | + Costes, Cosechas, Alertas |
| **Avanzado** | 50 ha | 49,99 € | + Trazabilidad, Dashboards |
| **Premium** | 100 ha | 89,99 € | + Sensores IoT |

---

## 🔑 Sistema de Autenticación

**Contexto global:** `src/lib/auth/tenant-context.tsx`

El `AuthProvider` envuelve toda la zona protegida y proporciona:
- `user` — Datos del usuario con su `platform_role`
- `tenant` — Datos del tenant al que pertenece (branding, módulos, etc.)
- `isSuperadmin` — Booleano rápido
- `hasRole(roles[])` — Función helper (superadmin siempre retorna `true`)
- **Impersonación**: Si el superadmin tiene un tenant impersonado en cookies, el contexto carga ese tenant

---

*Documento generado el 23/04/2026. Basado en análisis del código fuente actual.*
