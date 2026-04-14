# 🔍 Auditoría Completa — Portal InagroSolutions

> **Fecha:** 14 Abril 2026  
> **Auditor:** Antigravity AI  
> **Proyecto:** `cezsxcrazgskecrisaas` (Supabase EU-West-1)  
> **Estado BD:** ACTIVE_HEALTHY · Postgres 17.6

---

## Índice

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Panel Superadmin — Hallazgos](#3-panel-superadmin)
4. [Panel Admin (Tenant) — Hallazgos](#4-panel-admin-tenant)
5. [Panel Agricultor (Cuaderno) — Hallazgos](#5-panel-agricultor)
6. [Panel Técnico — Hallazgos](#6-panel-técnico)
7. [Seguridad — Alertas Críticas](#7-seguridad--alertas-críticas)
8. [Rendimiento — Alertas](#8-rendimiento--alertas)
9. [Brechas Funcionales Detectadas](#9-brechas-funcionales-detectadas)
10. [Plan de Acción Priorizado](#10-plan-de-acción-priorizado)

---

## 1. Resumen Ejecutivo

| Métrica | Valor |
|---|---|
| Tablas en `public` | 38 |
| Tablas con RLS activo | 37/38 |
| Tablas SIN políticas RLS | 2 (`actividades_agricolas`, `parcelas_campana`) |
| Alertas de seguridad (Supabase) | **14** (2 ERROR, 7 WARN, 5 INFO) |
| Alertas de rendimiento (Supabase) | **60+** (FK sin índice, RLS subóptimo, políticas duplicadas) |
| Roles definidos | 5 (`superadmin`, `tenant_admin`, `technician`, `farmer`, `worker`) |
| Server Actions protegidos | 15 archivos |
| Módulos del Cuaderno | 13 |

### Veredicto General

> **IMPORTANTE:** El portal es **funcional y la arquitectura es sólida**, pero tiene **deuda técnica significativa en seguridad RLS y rendimiento** que DEBE resolverse antes de escalar a producción real con múltiples tenants.

---

## 2. Arquitectura del Sistema

### Flujo RBAC

| Rol | Ruta Principal | Dashboard | Acceso Admin | Acceso Cuaderno |
|---|---|---|---|---|
| `superadmin` | `/superadmin` | KPIs globales | ✅ Total | ✅ Via impersonation |
| `tenant_admin` | `/dashboard` | KPIs del tenant | ✅ Su tenant | ✅ Lectura |
| `technician` | `/technician` | Clientes asignados | ❌ | ✅ Lectura asignados |
| `farmer` | `/cuaderno` | Cuaderno digital | ❌ | ✅ Su data |
| `worker` | `/cuaderno` | Vista limitada | ❌ | ✅ Tareas asignadas |

### Archivos Clave

- **Middleware RBAC:** `src/lib/supabase/middleware.ts`
- **Roles Config:** `src/lib/auth/rbac.ts`
- **Auth Context:** `src/lib/auth/tenant-context.tsx`
- **Agri Profile:** `src/hooks/useAgriProfile.ts`
- **Server Actions:** `src/lib/actions/superadmin.ts`
- **Sidebar Nav:** `src/components/dashboard/Sidebar.tsx`

---

## 3. Panel Superadmin

### ✅ Lo que funciona bien

- **KPIs globales**: Total tenants, usuarios, explotaciones, MRR estimado
- **Gestión de tenants**: Crear, activar/desactivar, eliminar, cambiar contexto (impersonation)
- **Gestión de usuarios**: Lista global con rotación de roles
- **Gestión de planes**: CRUD con sincronización TIER_CONFIG + Stripe
- **Audit logs**: Visualización de cambios con joins a `users` y `tenants`
- **Protección server-side**: `verifySuperadmin()` en TODOS los server actions

### ⚠️ Hallazgos que necesitan trabajo

| # | Problema | Severidad | Archivo |
|---|---|---|---|
| SA-1 | **MRR calculado como `totalTenants * 89`** — valor hardcodeado, no refleja planes reales | 🟡 Media | `src/lib/actions/superadmin.ts:58` |
| SA-2 | **Audit logs sin filtro por tenant** — solo muestra últimos 200 registros sin paginación ni filtro por fecha/tenant | 🟡 Media | `src/app/(protected)/superadmin/audit/page.tsx` |
| SA-3 | **`switchContext()` muta `tenant_id` del superadmin** — al impersonar un tenant, se cambia el `tenant_id` del propio superadmin en la tabla `users`, lo cual es un side-effect peligroso | 🔴 Alta | `src/lib/actions/superadmin.ts:136-156` |
| SA-4 | **`deleteTenant()` sin soft-delete** — elimina directamente de la BD. Si hay FK cascading, se pierde toda la data del tenant | 🔴 Alta | `src/lib/actions/superadmin.ts:158-171` |
| SA-5 | **Sin dashboard de métricas financieras reales** — no hay integración con Stripe para mostrar MRR/ARR real, churn, etc. | 🟡 Media | — |
| SA-6 | **Sin gestión de SMTP global** — la tabla `smtp_settings` no tiene `tenant_id`, es singleton global | 🟡 Media | — |

---

## 4. Panel Admin (Tenant)

### ✅ Lo que funciona bien

- **Dashboard empresarial**: Socios totales, hectáreas, invitaciones pendientes
- **Branding completo**: Logo, colores primario/secundario, módulos activos, favicon
- **Gestión de miembros**: Invitaciones por email con role selector, lista de usuarios del tenant
- **Facturación**: Integración con Stripe Customer Portal
- **Configuración SMTP**: Formulario completo con verificación
- **Vista de planes**: Sincronización forzada con `TIER_CONFIG`

### ⚠️ Hallazgos que necesitan trabajo

| # | Problema | Severidad | Archivo |
|---|---|---|---|
| AD-1 | **Actividad reciente es MOCK** — los 3 items del feed son hardcodeados, no datos reales | 🔴 Alta | `src/app/(protected)/dashboard/page.tsx:124-128` |
| AD-2 | **Suscripción hardcodeada a "49,90€/mes"** — no lee el precio real del plan del tenant | 🔴 Alta | `src/app/(protected)/dashboard/page.tsx:153` |
| AD-3 | **"Salud de Red" siempre dice "Óptima"** — no hay lógica real detrás | 🟡 Media | `src/app/(protected)/dashboard/page.tsx:98` |
| AD-4 | **`activeAlerts: 0` siempre** — comentario dice "Mock for now" | 🟡 Media | `src/app/(protected)/dashboard/page.tsx:52` |
| AD-5 | **Sin gestión de workers/maquinaria desde admin** — las tablas `workers` y `machinery` existen pero no hay UI en el panel admin | 🟡 Media | — |
| AD-6 | **Sin log de actividad del tenant** — el `audit_log` existe pero no hay vista para que el admin vea cambios dentro de su tenant | 🟡 Media | — |
| AD-7 | **Sin gestión de técnicos** — no hay UI para asignar técnicos a agricultores (`technician_assignments`) | 🟡 Media | — |

---

## 5. Panel Agricultor

### ✅ Lo que funciona bien

- **Onboarding 4 pasos**: Perfil → Explotación → Plan → Lanzar. Con auto-sugerencia de tier por hectáreas
- **Cuaderno Digital completo**: 13 módulos con sidebar, mobile tabs, module gating por tier
- **Selector de explotación/campaña**: Persistente en header sticky
- **Gate de módulos**: `ModuleGate` bloquea acceso a módulos fuera del tier del usuario
- **Gestión de parcelas**: SIGPAC integrado, importación Excel
- **Perfil de usuario**: Avatar upload, edición de nombre, vista de plan

### ⚠️ Hallazgos que necesitan trabajo

| # | Problema | Severidad | Archivo |
|---|---|---|---|
| AG-1 | **`useAgriProfile` hace 5 queries paralelas** en cada carga — sin caché ni optimistic updates | 🟡 Media | `src/hooks/useAgriProfile.ts:48-101` |
| AG-2 | **`resumen` solo toma la primera explotación** — si el user tiene varias, las métricas son parciales | 🟡 Media | `src/hooks/useAgriProfile.ts:136-146` |
| AG-3 | **Cuaderno: `tratamientos_hoy` y `labores_hoy` siempre 0** — hardcodeados en el resumen | 🟡 Media | `src/hooks/useAgriProfile.ts:142-143` |
| AG-4 | **Profile page usa campo `role` (legacy)** — muestra "Admin" o "User" basado en el campo antiguo `user_role` en vez de `platform_role` | 🟡 Media | `src/app/(protected)/profile/page.tsx:228-233` |
| AG-5 | **Onboarding no persiste `tenant_id`** en la explotación creada | 🟡 Media | `src/app/(protected)/onboarding/page.tsx:86-91` |
| AG-6 | **Sin notificaciones push/email** — el sistema de alertas usa solo polling en cliente | 🟢 Baja | — |

---

## 6. Panel Técnico

### ✅ Lo que funciona bien

- **Dashboard con KPIs**: Agricultores asignados, explotaciones supervisadas, tareas pendientes
- **Navegación a clientes**: Link a `/technician/farmers`
- **Emisión de prescripciones**: Link a `/technician/recommendations`
- **Protección RBAC**: Solo accesible por `technician` y `tenant_admin`

### ⚠️ Hallazgos que necesitan trabajo

| # | Problema | Severidad | Archivo |
|---|---|---|---|
| TE-1 | **`stats` tipado como `any`** — sin tipado TypeScript | 🟢 Baja | `src/app/(protected)/technician/page.tsx:10` |
| TE-2 | **Sin vista de tareas propias** — el técnico no tiene dashboard de sus tareas pendientes en la vista principal | 🟡 Media | — |
| TE-3 | **Sin validación de cuadernos** — la tabla `cuaderno_validaciones` existe pero no hay evidencia de uso en la UI del técnico | 🟡 Media | — |

---

## 7. Seguridad — Alertas Críticas

> **⛔ PRECAUCIÓN:** Estos son hallazgos directos del **Supabase Security Advisor** que requieren acción inmediata.

### 🔴 ERROR (2)

| Hallazgo | Tabla/Vista | Impacto |
|---|---|---|
| **Vista `resumen_diario` con SECURITY DEFINER** | `public.resumen_diario` | Ejecuta con permisos del creador, no del usuario. Puede exponer datos cross-tenant |
| **RLS deshabilitado en `spatial_ref_sys`** | `public.spatial_ref_sys` | Tabla PostGIS expuesta sin restricciones. Riesgo bajo pero viola best practices |

### 🟡 WARN (7)

| Hallazgo | Entidades | Remediación |
|---|---|---|
| **5 funciones con `search_path` mutable** | `get_auth_platform_role`, `is_superadmin`, `get_auth_tenant_id`, `audit_record_changes`, `check_user_access_parcela` | Añadir `SET search_path = ''` a cada función |
| **RLS policy `USING(true)` en `cuaderno_validaciones`** | Policy "Technicians can read/write..." | Bypass total de RLS — restricir por `technician_id = auth.uid()` |
| **2 storage buckets con listing público** | `avatars`, `branding` | Eliminar políticas SELECT broad, usar solo URLs públicas |
| **Leaked password protection deshabilitada** | Auth global | Habilitar en Dashboard → Auth → Security |

### ℹ️ INFO (2)

| Hallazgo | Tabla |
|---|---|
| **RLS activo pero SIN políticas** | `actividades_agricolas` |
| **RLS activo pero SIN políticas** | `parcelas_campana` |

> **ADVERTENCIA:** Las tablas `actividades_agricolas` y `parcelas_campana` tienen RLS activo pero **CERO políticas**, lo que significa que **nadie puede leer ni escribir** en ellas via PostgREST/cliente. Esto puede causar errores silenciosos.

---

## 8. Rendimiento — Alertas

### Foreign Keys sin índice (60+ alertas)

Las siguientes tablas tienen FKs sin índice de cobertura, lo cual impacta JOINs y cascading deletes:

| Tablas Afectadas (selección) |
|---|
| `alertas_cuaderno` (3 FKs) |
| `audit_log` (2 FKs) |
| `campanas` (2 FKs) |
| `cosechas` (3 FKs) |
| `costes` (3 FKs) |
| `explotaciones` (2 FKs) |
| `fertilizaciones` (3 FKs) |
| `harvest_intakes` (3 FKs) |
| `labores` (5 FKs) |
| `parcelas` (2 FKs) |
| `recommendations` (4 FKs) |
| `tasks` (4 FKs) |
| `tratamientos_fitosanitarios` (5 FKs) |
| `users` (2 FKs) |

> **Acción:** Crear índices masivos en una sola migración. Consultar [docs](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys).

### RLS con `auth.uid()` sin subquery (20+ alertas)

Muchas políticas RLS usan `auth.uid()` directamente en vez de `(SELECT auth.uid())`, causando re-evaluación por cada fila:

**Tablas Afectadas:** `users`, `explotaciones`, `parcelas`, `tratamientos_fitosanitarios`, `labores`, `fertilizaciones`, `costes`, `cosechas`, `trazabilidad`, `lecturas_sensores`, `subscriptions`, `alertas_cuaderno`, `inventario_insumos`, `campanas`, `cuaderno_validaciones`, `tenants`

### Políticas RLS duplicadas (masivas)

Las tablas `alertas_cuaderno`, `cosechas`, `costes`, `cuaderno_validaciones`, `audit_log`, `campanas` tienen **múltiples políticas permisivas** para el mismo rol+acción, causando evaluación redundante.

---

## 9. Brechas Funcionales Detectadas

### Matriz de Funcionalidad por Rol

| Funcionalidad | Superadmin | Admin | Técnico | Agricultor |
|---|---|---|---|---|
| Gestión de tenants | ✅ | ❌ | ❌ | ❌ |
| Gestión de usuarios globales | ✅ | ❌ | ❌ | ❌ |
| Gestión de miembros del tenant | ✅ (via impersonation) | ✅ | ❌ | ❌ |
| Branding/marca blanca | ❌ | ✅ | ❌ | ❌ |
| Facturación Stripe | ❌ | ✅ | ❌ | ❌ |
| Configuración SMTP | ❌ | ✅ | ❌ | ❌ |
| Gestión de workers | ❌ | ⚠️ Sin UI | ❌ | ❌ |
| Gestión de maquinaria | ❌ | ⚠️ Sin UI | ❌ | ❌ |
| Asignar técnico a agricultor | ❌ | ⚠️ Sin UI | ❌ | ❌ |
| Ver cuadernos de agricultores | ✅ (impersonation) | ⚠️ Parcial | ✅ | Solo propio |
| Emitir prescripciones | ❌ | ❌ | ✅ | ❌ |
| Validar cuadernos | ❌ | ❌ | ⚠️ Sin UI | ❌ |
| Actividad reciente (feed real) | ⚠️ Audit log | ⚠️ Mock | ❌ | ❌ |
| Alertas reales | ❌ | ⚠️ Mock | ❌ | ✅ (polling) |
| MRR/Finanzas reales | ⚠️ Hardcoded | ⚠️ Hardcoded | ❌ | ❌ |

### Contextos de Datos Duplicados

> **NOTA:** Existen **2 sistemas de contexto de auth paralelos** que cargan datos similares:
> - `AuthProvider` en `src/lib/auth/tenant-context.tsx` — usado por Sidebar y layouts
> - `useAgriProfile` en `src/hooks/useAgriProfile.ts` — usado por Cuaderno y Dashboard
>
> Ambos hacen queries a `users` + `tenants`. Deberían unificarse.

---

## 10. Plan de Acción Priorizado

### Fase 1 — 🔴 Seguridad Crítica (Sprint 1)

- [ ] **SEC-1** Corregir vista `resumen_diario` — Cambiar de SECURITY DEFINER a SECURITY INVOKER
- [ ] **SEC-2** Añadir políticas RLS a `actividades_agricolas` y `parcelas_campana`
- [ ] **SEC-3** Corregir policy `USING(true)` en `cuaderno_validaciones` — restringir por `technician_id`
- [ ] **SEC-4** Fijar `search_path` en las 5 funciones reportadas
- [ ] **SEC-5** Habilitar leaked password protection en Auth
- [ ] **SEC-6** Restringir listing público en buckets `avatars` y `branding`
- [ ] **SEC-7** Refactorizar `switchContext()` — usar cookie/session en vez de mutar `users.tenant_id`
- [ ] **SEC-8** Cambiar `deleteTenant()` a soft-delete (`is_active = false`)

### Fase 2 — 🟡 Rendimiento DB (Sprint 2)

- [ ] **PERF-1** Crear migración masiva de índices para 60+ FKs sin índice
- [ ] **PERF-2** Optimizar RLS: reemplazar `auth.uid()` por `(SELECT auth.uid())` en 20+ policies
- [ ] **PERF-3** Consolidar políticas RLS duplicadas (especialmente en `alertas_cuaderno`, `cosechas`, `costes`)
- [ ] **PERF-4** Mover extensión PostGIS de `public` a schema `extensions`

### Fase 3 — 🟡 Datos Reales en Dashboards (Sprint 3)

- [ ] **DASH-1** Admin Dashboard: reemplazar feed mock con datos reales de `audit_log` filtrado por `tenant_id`
- [ ] **DASH-2** Admin Dashboard: leer precio real del plan desde `plans` + `tenant_billing`
- [ ] **DASH-3** Admin Dashboard: implementar "Salud de Red" con métricas reales (compliance SIEX, alertas)
- [ ] **DASH-4** Admin Dashboard: conectar `activeAlerts` a query real de `alertas_cuaderno`
- [ ] **DASH-5** Superadmin: calcular MRR real desde `tenant_billing` + `subscriptions`
- [ ] **DASH-6** Cuaderno: calcular `tratamientos_hoy` y `labores_hoy` reales

### Fase 4 — 🟡 Funcionalidad Admin Completa (Sprint 4)

- [ ] **ADM-1** Admin: crear UI de gestión de Workers (CRUD sobre tabla `workers`)
- [ ] **ADM-2** Admin: crear UI de gestión de Maquinaria (CRUD sobre tabla `machinery`)
- [ ] **ADM-3** Admin: crear UI de asignación Técnico ↔ Agricultor (`technician_assignments`)
- [ ] **ADM-4** Admin: crear vista de Audit Log del tenant (filtrada por su `tenant_id`)
- [ ] **ADM-5** Admin: vista de supervisión de cuadernos de sus agricultores (readonly)

### Fase 5 — 🟢 Mejoras UX y Técnicas (Sprint 5)

- [ ] **UX-1** Unificar `AuthProvider` y `useAgriProfile` en un solo contexto
- [ ] **UX-2** Profile page: usar `platform_role` en vez del legacy `role`
- [ ] **UX-3** Onboarding: persistir `tenant_id` del usuario en la explotación creada
- [ ] **UX-4** Technician: añadir vista de validación de cuadernos
- [ ] **UX-5** Technician: dashboard de tareas propias pendientes
- [ ] **UX-6** Tipar correctamente `stats` en technician page (eliminar `any`)

### Fase 6 — 🟢 Escalabilidad (Futuro)

- [ ] **SCALE-1** Implementar caché client-side para `useAgriProfile` (React Query / SWR)
- [ ] **SCALE-2** Implementar notificaciones push/realtime con Supabase Realtime
- [ ] **SCALE-3** Añadir paginación server-side en audit logs, users, y tenants lists
- [ ] **SCALE-4** Implementar rate limiting en server actions críticos

---

## Anexo: Tablas Principales y Relaciones

```
tenants ──┬── users (tenant_id)
          ├── explotaciones (tenant_id)
          ├── tenant_invitations (tenant_id)
          ├── audit_log (tenant_id)
          ├── tenant_billing (tenant_id)
          ├── workers (tenant_id)
          ├── machinery (tenant_id)
          └── technician_assignments (tenant_id)

users ──┬── explotaciones (user_id)
        └── plans (plan_id)

explotaciones ──┬── parcelas (explotacion_id)
                ├── campanas (explotacion_id)
                └── inventario_insumos (explotacion_id)

parcelas ──┬── tratamientos_fitosanitarios (parcela_id)
           ├── labores (parcela_id)
           ├── fertilizaciones (parcela_id)
           ├── cosechas (parcela_id)
           └── costes (parcela_id)

users ──┬── recommendations (technician_id)
        ├── tasks (assigned_to)
        └── technician_assignments (technician_id)
```

---

> **TIP:** Para ejecutar este plan, se recomienda abordar las **Fases 1 y 2 de forma inmediata** (seguridad y rendimiento) ya que son bloqueantes para producción. Las fases 3-6 pueden priorizarse según las necesidades del negocio.
