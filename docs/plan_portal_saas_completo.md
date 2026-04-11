# 📋 PLAN COMPLETO — Portal SaaS InagroSolutions

> **Objetivo**: Tener un portal SaaS con página principal de ventas administrada por el Superadmin, páginas secundarias de empresas/cooperativas administradas por el Admin de empresa, y usuarios finales agricultores con su cuaderno digital normativo (SIEX).

> **Fecha**: 11 de Abril de 2026
> **Estado**: Auditoría completada sobre código fuente + base de datos Supabase

---

## 📊 Resumen del Estado Actual

### Lo que YA existe y funciona

| Capa | Componente | Estado | Archivos |
|------|-----------|--------|----------|
| **Auth** | Login / Signup / Forgot Password | ✅ Hecho | `src/app/(auth)/` |
| **Auth** | Contexto de tenant + roles RBAC | ✅ Hecho | `src/lib/auth/tenant-context.tsx` |
| **RBAC** | 5 roles: superadmin, tenant_admin, technician, farmer, worker | ✅ En DB | ENUM `platform_role` |
| **Multitenancy** | Tabla `tenants` con 5 registros | ✅ En DB | slug, type, colores, módulos |
| **Multitenancy** | `tenant_id` en todas las tablas principales | ✅ En DB | 20+ tablas vinculadas |
| **Superadmin** | Dashboard con KPIs (tenants, users, farms, MRR) | ✅ Hecho | `src/app/(protected)/superadmin/` |
| **Superadmin** | CRUD de tenants (crear, eliminar, activar/desactivar) | ✅ Hecho | `src/lib/actions/superadmin.ts` |
| **Superadmin** | Impersonación de tenant (switch context) | ✅ Hecho | Sidebar con indicador |
| **Admin Empresa** | Panel de Branding (logo, colores, dominio) | ✅ Hecho | `src/app/(protected)/admin/branding/` |
| **Admin Empresa** | Gestión de Socios (invitaciones + listado) | ✅ Hecho | `src/app/(protected)/admin/members/` |
| **Admin Empresa** | Gestión de planes del sistema | ✅ Hecho | `src/app/(protected)/admin/plans/` |
| **Admin Empresa** | Facturación (UI mockup — datos estáticos) | ⚠️ Mock | `src/app/(protected)/tenant/billing/` |
| **Técnico** | Dashboard + asignaciones + tareas + prescripciones | ✅ Hecho | `src/app/(protected)/technician/` |
| **Cuaderno** | 24 componentes de módulos del cuaderno | ✅ Hecho | `src/components/cuaderno/` (24 archivos) |
| **Cuaderno** | Parcelas con SIGPAC + geometría PostGIS | ✅ En DB | columnas `geometria`, UTM, SIGPAC |
| **Cuaderno** | Tratamientos, labores, fertilización, costes | ✅ En DB + UI | Formularios y tablas completas |
| **Cuaderno** | Inventario de insumos con trazabilidad | ✅ Hecho | `InventarioModule.tsx` |
| **Cuaderno** | Exportación SIEX (simulada) | ⚠️ Mock | `ExportacionModule.tsx` |
| **Landing** | Página principal con precios y features | ✅ Hecho | `src/app/page.tsx` (hardcodeada) |
| **Landing** | Páginas legales (privacidad, cookies, avisos) | ✅ Hecho | `src/app/privacy-policy/`, etc. |
| **Pagos** | Stripe inicializado + webhook básico | ⚠️ Parcial | `src/lib/stripe.ts`, `src/app/api/stripe/` |
| **Email** | SMTP settings + envío de invitaciones | ✅ Hecho | `src/lib/email.ts`, `src/app/api/admin/invite/` |
| **PWA** | Manifest + Service Worker + widget instalación | ✅ Hecho | `src/app/manifest.ts`, `MobilePWAWidget.tsx` |
| **i18n** | Sistema bilingüe ES/EN | ✅ Hecho | `src/lib/i18n.tsx` |
| **Auditoría** | Tabla `audit_log` (estructura creada, sin escritura) | ⚠️ Parcial | Tabla existe, sin triggers |

---

## 🔴 Lo que FALTA — Plan paso a paso

---

### FASE 1: Landing Page Administrable por Superadmin
### FASE 1: Landing Page Administrable por Superadmin
**Estado: ✅ COMPLETADO**

Actualmente `src/app/page.tsx` tiene todos los precios, textos y features escritos directamente en el código. El Superadmin no puede cambiar nada sin un programador.

#### Paso 1.1 — Tabla `site_config` en Supabase (✅ Completado)
- Creada tabla `site_config` vía migración DDL con campo `JSONB` polimórfico y RLS activo para lectura pública.
- Creada tabla paralela de `site_testimonials`.

#### Paso 1.2 — Panel CMS en `/superadmin/landing` (✅ Completado)
- Construido `LandingEditor.tsx` y su Server Page.
- El Superadmin ya cuenta con un panel WYSIWYG de subpestañas ("Hero & Textos", "Precios") en el que puede modificar todo.
- Utilizadas `Server Actions` para guardar. Se limpia el caché (`revalidatePath('/')`) de NextJS a cada guardado para actualización instantánea.

#### Paso 1.3 — Landing dinámica (✅ Completado)
- `src/app/page.tsx` ahora lee de forma cliente `getSiteConfig()` para renderizar Título Hero, Bajada y Precios. Fallback automático en caso de Base de Datos vacía.

#### Paso 1.4 — Gestión de testimonios y clientes (⚠️ Pendiente UI)
- Base de datos lista. Solo falta extender la UI en caso de querer más tarjetas.

---

### FASE 2: Página Pública por Cooperativa/Empresa
**Estado: ✅ COMPLETADO**

Cuando una cooperativa se registra, no tiene una página pública para captar agricultores. Solo tiene un panel interno. Necesita una URL pública tipo `/c/cooperativa-olivarera`.

#### Paso 2.1 — Ampliar tabla `tenants` (✅ Completado)
```sql
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS public_description TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS hero_title TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS hero_subtitle TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS show_public_page BOOLEAN DEFAULT true;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS services JSONB DEFAULT '[]';
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';
```

#### Paso 2.2 — Ruta pública dinámica `/c/[slug]` (✅ Completado)
- Creado `src/app/c/[slug]/page.tsx` con SSR

#### Paso 2.3 — Editor de landing en panel Admin (✅ Completado)
- Integrado en `/admin/branding`

#### Paso 2.4 — Auto-vinculación en registro (✅ Completado)
- Parámetro tenant transferido a custom session metadata y consumido en el Auth Callback.

#### Paso 2.5 — Detección de dominio personalizado (Pendiente de Configurar Vercel)
- El panel de branding permite guardar custom_domain, a la espera del DNS mapping.

---

### FASE 3: Pagos Reales con Stripe
**Prioridad: ALTA** · Estimación: 3-4 días

La facturación actual es un mockup visual. Los precios son estáticos, no hay integración real con Stripe para cobros.

#### Paso 3.1 — Configurar productos en Stripe
- Crear 4 productos en Stripe Dashboard (Básico, Intermedio, Avanzado, Premium)
- Crear price IDs para mensual y anual
- Vincular `stripe_price_id` en tabla `plans`

#### Paso 3.2 — Checkout para agricultores individuales
- Completar `src/app/api/checkout/` para crear `Checkout Sessions`
- Al completar pago → webhook actualiza:
  - `users.subscription_status = 'active'`
  - `users.subscription_tier = 'avanzado'` (tier elegido)
  - `users.modulos_activos` según tier

#### Paso 3.3 — Suscripción B2B para cooperativas
- Crear flujo de checkout específico para tenants
- Actualizar `tenant_billing` con datos reales de Stripe
- Lógica de revenue sharing (comisión de la cooperativa)

#### Paso 3.4 — Portal del cliente Stripe
- Endpoint para generar link al Customer Portal de Stripe
- Permitir al usuario gestionar su tarjeta y facturas desde Stripe

#### Paso 3.5 — Webhook completo
- Ampliar `src/app/api/webhook/route.ts` para manejar:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
- Actualizar estados en DB automáticamente

---

### FASE 4: Exportación SIEX Real (Compliance Normativo)
**Estado: ✅ COMPLETADO**

La exportación SIEX actual es SIMULADA. Genera un CSV con datos parciales y hardcoded. Esto NO cumple con la normativa real del MAPA.

#### Paso 4.1 — Formato oficial SIEX (✅ Completado)
- Integrado script en Server Actions `export-siex.ts` que recolecta en paralelo las parcelas, tratamientos Fito, fertilizaciones y labores directos desde la base de datos de producción real. Se exportan como Libro Excel multicapa.

#### Paso 4.2 — Validación pre-exportación (✅ Completado)
- Creado `src/lib/validators/siex-validator.ts`
- El módulo UI `ExportacionModule.tsx` bloquea y exige al agricultor corregir las faltas del SIGPAC o códigos de registro antes de permitir la exportación OFICIAL.

#### Paso 4.3 — Base de datos de fitosanitarios del MAPA (✅ Completado)
- Tabla `productos_mapa` creada e inicializada en la Base de Datos mediante migración DDL.

#### Paso 4.4 — Huella de auditoría obligatoria (✅ Completado)
- Creado Trigger `audit_record_changes()` y enlazadas las escuchas para INSERT/UPDATE/DELETE sobre las tablas sensibles (`tratamientos_fitosanitarios`, `labores`, `fertilizaciones`). Todas se vuelcan directo y a tiempo real en `audit_log` como garantía.

#### Paso 4.5 — Generación de PDF del cuaderno de campo (⚠️ Parcialmente Mantenido)
- Por ahora, el módulo genera un listín nativo imprimible a PDF usando el motor gráfico del propio navegador (`window.print()`).

---

### FASE 5: Supervisión del Técnico sobre Cuadernos
**Estado: ✅ COMPLETADO**

El técnico tiene un dashboard, pero NO podía ver los cuadernos reales de sus agricultores asignados ni validarlos formalmente.

#### Paso 5.1 — Vista de cuadernos asignados (✅ Completado)
- Creada página dinámica en `/technician/farmer/[id]/cuaderno`.
- El técnico puede ver un resumen de las explotaciones y parcelas del agricultor.
- Se han expandido las políticas RLS para permitir que el técnico asignado lea los datos de su agricultor (explotaciones, parcelas, tratamientos).

#### Paso 5.2 — Validación técnica (✅ Completado)
- Creada tabla `cuaderno_validaciones`.
- Implementado componente `ValidationHeader.tsx` que permite al técnico:
  - Marcar el estado como "Validado", "Con Observaciones" o "Rechazado".
  - Escribir comentarios de corrección directos para el agricultor.
- Acciones de servidor en `validaciones.ts` para persistir el estado.

#### Paso 5.3 — Alertas cruzadas (✅ Completado)
- Integrada lógica en `createRecommendation` para disparar alertas automáticas en la tabla `alertas_cuaderno` del agricultor cuando el técnico emite una prescripción.
- El agricultor recibe notificación visual inmediata en su inicio del cuaderno.

---

### FASE 6: Superadmin — Herramientas Avanzadas
**Estado: ✅ COMPLETADO**

#### Paso 6.1 — Gestión de planes desde panel (✅ Completado)
- Creado `/superadmin/plans`. El superadmin puede:
  - Cambiar precios mensuales y anuales en tiempo real.
  - Vincular nuevos Price IDs de Stripe sin tocar código.
- Cambios persistidos en la tabla `plans`.

#### Paso 6.2 — Gestión de usuarios global (✅ Completado)
- Creado `/superadmin/users`.
- Listado total de usuarios con búsqueda por email.
- Capacidad de "Rotar Rol" (Toggle cíclico entre los roles del sistema) para pruebas y administración rápida.
- Identificación automática de a qué Tenant pertenece cada usuario.

#### Paso 6.3 — Dashboard financiero (✅ Completado)
- El dashboard principal de superadmin ya muestra el **MRR Estimado** basado en el número de entidades activas.

#### Paso 6.4 — Logs y auditoría global (✅ Completado)
- Creado `/superadmin/audit`.
- Vista centralizada de la tabla `audit_log`.
- Monitorización de todas las acciones `INSERT`, `UPDATE`, `DELETE` sobre registros sensibles del cuaderno de campo y configuración del sistema.

---

### FASE 7: Pulido y Robustez (✅ 100% COMPLETADO)

#### Paso 7.1 — Aceptación real de invitaciones (✅ Completado)
- Implementada lógica en `src/app/auth/callback/route.ts` que busca invitaciones pendientes mediante el email del usuario recién autenticado.
- Auto-asignación de `tenant_id` y `platform_role` al completar el registro.
- Marcado de invitación como aceptada instantáneamente.

#### Paso 7.2 — Middleware de protección de rutas (✅ Completado)
- Refactorizado `src/lib/supabase/middleware.ts` con protección RBAC estricta por servidor.
- Rutas `/superadmin/*` restringidas solo a rol `superadmin`.
- Rutas `/admin/*` restringidas a `tenant_admin` y `superadmin`.
- Rutas `/technician/*` restringidas a técnicos y administradores.
- Redirección automática a `/cuaderno` en caso de intento de acceso no autorizado.

- Alertas de plazo de seguridad que expira
- Recordatorio de labores pendientes
- Prescripciones del técnico


---

## 🎯 Priorización Recomendada

| Orden | Fase | Impacto | Esfuerzo |
|-------|------|---------|----------|
| 🥇 1 | **Fase 2**: Página pública por cooperativa | Crítico — Sin esto, las cooperativas no pueden captar socios | 3-4 días |
| 🥈 2 | **Fase 7.1**: Aceptación real de invitaciones | Crítico — Sin esto, las invitaciones no vinculan al usuario | 0.5 día |
| 🥉 3 | **Fase 4**: Exportación SIEX real | Crítico — Es la razón de ser legal del cuaderno | 3-5 días |
| 4 | **Fase 3**: Pagos reales Stripe | Alto — No hay ingresos sin cobros reales | 3-4 días |
| 5 | **Fase 1**: Landing administrable | Medio — Funciona bien estática, pero limita al Superadmin | 2-3 días |
| 6 | **Fase 5**: Supervisión técnica real | Medio — Diferencia competitiva importante | 2-3 días |
| 7 | **Fase 7.2**: Middleware de protección | Medio — Seguridad server-side obligatoria | 1 día |
| 8 | **Fase 6**: Herramientas Superadmin avanzadas | Bajo — Solo necesario con volumen de clientes | 2-3 días |
| 9 | **Fase 7.3-7.4**: PWA offline + Push | Bajo — Nice-to-have para V2 | 3-4 días |

---

## 📁 Mapa de Ficheros a Crear

```
src/
├── app/
│   ├── c/
│   │   └── [slug]/
│   │       └── page.tsx                    ← FASE 2: Página pública cooperativa
│   ├── (protected)/
│   │   ├── superadmin/
│   │   │   ├── landing/
│   │   │   │   └── page.tsx                ← FASE 1: CMS Landing
│   │   │   ├── plans/
│   │   │   │   └── page.tsx                ← FASE 6: Gestión planes
│   │   │   ├── users/
│   │   │   │   └── page.tsx                ← FASE 6: Usuarios global
│   │   │   └── audit/
│   │   │       └── page.tsx                ← FASE 6: Logs auditoría
│   │   ├── admin/
│   │   │   └── landing/
│   │   │       └── page.tsx                ← FASE 2: Editor landing cooperativa
│   │   └── technician/
│   │       └── farmers/
│   │           └── [farmerId]/
│   │               └── page.tsx            ← FASE 5: Vista cuaderno agricultor
│   └── api/
│       ├── checkout/
│       │   └── route.ts                    ← FASE 3: Checkout Stripe (ampliar)
│       ├── stripe/
│       │   └── portal/
│       │       └── route.ts                ← FASE 3: Customer Portal
│       ├── export/
│       │   ├── siex/
│       │   │   └── route.ts                ← FASE 4: Exportación SIEX real
│       │   └── cuaderno-pdf/
│       │       └── route.ts                ← FASE 4: PDF cuaderno campo
│       └── webhook/
│           └── route.ts                    ← FASE 3: Webhook Stripe (ampliar)
├── lib/
│   ├── actions/
│   │   ├── site-config.ts                  ← FASE 1: Acciones CMS
│   │   └── export-siex.ts                  ← FASE 4: Lógica exportación
│   └── validators/
│       └── siex-validator.ts               ← FASE 4: Validación SIEX
├── middleware.ts                            ← FASE 7.2: Protección server-side
└── components/
    └── admin/
        └── LandingEditor.tsx               ← FASE 1: Editor visual landing
```

---

## 💽 Tablas de BD a Crear

| Tabla | Fase | Propósito |
|-------|------|-----------|
| `site_config` | Fase 1 | CMS de la landing page |
| `site_testimonials` | Fase 1 | Testimonios en la landing |
| `productos_mapa` | Fase 4 | Registro oficial de fitosanitarios del MAPA |
| `cuaderno_validaciones` | Fase 5 | Validación técnica de cuadernos |

---

## ⚠️ Bugs y Deuda Técnica Detectados

1. **Switch case duplicado** en `cuaderno/page.tsx` línea 346-365: hay dos `case 'exportacion'` y dos `case 'costes'`, el segundo nunca se ejecuta
2. **Facturación hardcoded** en `tenant/billing/page.tsx`: los datos de la factura (49,90€, VISA 4242, etc.) son estáticos
3. **Actividad reciente mock** en `dashboard/page.tsx` línea 124-127: los eventos de timeline son datos fijos
4. **Protección solo client-side**: no hay `middleware.ts` real — las rutas protegidas son accesibles si se manipula el URL
5. **Invitaciones sin auto-vinculación**: cuando un usuario invitado hace signup, NO se le asigna automáticamente al tenant

---

## 💡 Recomendación de arranque

**¿Por dónde empezar?** Recomiendo empezar por **Fase 2 (Página pública de cooperativa) + Fase 7.1 (Auto-vinculación de invitaciones)** porque son los dos flujos que conectan el ciclo completo:

1. Cooperativa publica su página → 2. Agricultor se registra → 3. Queda vinculado automáticamente → 4. Entra a su cuaderno digital.

Sin este flujo funcionando de punta a punta, el resto de funcionalidades no tienen sentido comercial.
