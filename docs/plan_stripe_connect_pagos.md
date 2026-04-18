# Plan Maestro: Sistema de Pagos InagroSolutions

> **IMPORTANTE:**
> Este documento define la arquitectura completa de monetización de InagroSolutions como marketplace B2B agrícola en España, usando **Stripe Connect Express + Stripe Billing**. Diseñado como CTO + CFO + Consultor Legal + Growth Strategist.

---

## Índice

1. [Decisiones de Arquitectura](#1-decisiones-de-arquitectura)
2. [Modelo de Precios Definitivo](#2-modelo-de-precios-definitivo)
3. [Modelo Fiscal y Legal España](#3-modelo-fiscal-y-legal-españa)
4. [Estructura de Base de Datos](#4-estructura-de-base-de-datos)
5. [Inventario del Estado Actual](#5-inventario-del-estado-actual)
6. [Flujos Operativos](#6-flujos-operativos)
7. [APIs y Endpoints](#7-apis-y-endpoints)
8. [Paneles de Usuario](#8-paneles-de-usuario)
9. [Seguridad y Compliance](#9-seguridad-y-compliance)
10. [Estrategia de Conversión y Anti-Churn](#10-estrategia-de-conversión-y-anti-churn)
11. [Costes Stripe Estimados](#11-costes-stripe-estimados)
12. [Riesgos Críticos](#12-riesgos-críticos)
13. [Cronograma de Implementación](#13-cronograma-de-implementación)
14. [Checklist de Implementación](#14-checklist-de-implementación)

---

## 1. Decisiones de Arquitectura

### ¿Por qué Stripe Connect Express + Direct Charges?

| Opción | Veredicto | Motivo |
|--------|-----------|--------|
| WordPress + WooCommerce | ❌ Rechazado | No escala, riesgo de seguridad masivo, imposible multitenant |
| Backend custom puro | ❌ Rechazado | Re-inventar la rueda en cumplimiento PCI, SCA, facturación |
| Stripe Checkout solo (sin Connect) | ❌ Rechazado | No permite reparto automático a cooperativas |
| Stripe Connect Standard | ⚠️ Viable | Demasiado control para la cooperativa, riesgo operativo |
| **Stripe Connect Express + Direct Charges** | ✅ **Elegido** | KYC automático, reparto nativo, facturación delegada |

### Modelo "Direct Charges" — Cómo funciona

```
Flujo de Direct Charges:

1. Agricultor → Paga 19€ → Stripe Checkout (3D Secure/SCA)
2. Stripe → Cobra a la tarjeta del agricultor
3. El pago entra en la CUENTA CONNECT de la COOPERATIVA
4. Stripe retiene application_fee_percent = 50% → va a InagroSolutions
5. El 50% restante → se transfiere a la cooperativa (payout automático)
6. Stripe → Envía webhook checkout.session.completed → InagroSolutions activa plan
```

> **CLAVE:** Con Direct Charges, **la cooperativa es el Merchant of Record** (emisor de la factura). InagroSolutions solo retiene su comisión. Esto simplifica enormemente el modelo fiscal.

### Stack Tecnológico

| Capa | Tecnología | Rol |
|------|-----------|-----|
| Frontend | Next.js (Antigravity) | UI, Checkout redirect |
| Backend / API | Next.js API Routes | Crear sesiones, webhooks |
| Base de datos | Supabase PostgreSQL + RLS | Estado usuarios, suscripciones |
| Pagos | Stripe Connect Express | Cobros, reparto, facturación |
| Suscripciones | Stripe Billing | Recurrencia, dunning, upgrades |
| Facturación | Stripe Invoicing + Tax | PDFs legales, IVA automático |
| Portal cliente | Stripe Customer Portal | Gestión tarjeta, facturas, cancelación |
| KYC Cooperativas | Stripe Account Links | Onboarding verificación identidad |

---

## 2. Modelo de Precios Definitivo

### Análisis de opciones anuales

| Opción | Precio Anual | Descuento vs Mensual | Ahorro percibido | Veredicto |
|--------|-------------|----------------------|-------------------|-----------|
| Sin descuento (19×12) | 228€ | 0% | Nulo | ❌ Sin incentivo |
| 199€/año | 12,7% | "Menos de 200€" | ⚠️ Bueno pero débil |
| **190€/año (10 meses)** | **16,7%** | **"2 meses gratis"** | **✅ Ganador** |
| 180€/año | 21% | Agresivo | ❌ Demasiado margen perdido |

### Decisión: **19€/mes — 190€/año**

**Justificación (como CFO):**
- **Psicología del "2 meses gratis":** Es el mensaje más potente y fácil de comunicar en el marketing agro.
- **Cash flow:** Cobrar 190€ de golpe = 10 cobros mensuales adelantados. Reduce el riesgo de impago a cero durante 12 meses.
- **Reducción de comisiones Stripe:** De 12 transacciones (12 × 0,25€ fijo = 3€) a 1 transacción (0,25€). **Ahorro de 2,75€/usuario/año** en fees fijos.
- **Churn:** Un usuario que paga anual tiene 3x menos probabilidad de abandonar vs mensual (dato industria SaaS).

### Tabla de Productos Stripe a Crear

| Producto | Price ID (sugerido) | Importe | Intervalo | IVA |
|----------|-------------------|---------|-----------|-----|
| Plan InagroSolutions Mensual | `price_inagro_monthly` | 19,00€ | monthly | 21% incluido |
| Plan InagroSolutions Anual | `price_inagro_annual` | 190,00€ | yearly | 21% incluido |

> **NOTA:** Solo mantenemos **1 producto con 2 precios**. Los tiers (Básico, Intermedio, etc.) se gestionan en la lógica de la app según hectáreas, no en Stripe. Esto simplifica enormemente la gestión de productos.
> 
> **Alternativa futura:** Si se quiere diferenciar precios por tier, se crean 8 prices (4 tiers × 2 intervalos). Pero para MVP, un solo precio es suficiente dado que el tier se asigna por superficie.

### Actualización de TIER_CONFIG

El archivo `src/lib/modules.ts` ya define precios por tier. Para el MVP con un precio unificado:

```
Opción A: Precio único (MVP recomendado)
→ Todos los tiers comparten el mismo precio base
→ El tier se asigna por hectáreas, no por precio

Opción B: Precios diferenciados (futuro)
→ Crear 8 Stripe Prices y mapearlos en TIER_CONFIG
→ Añadir stripe_price_monthly y stripe_price_annual a cada tier
```

**Recomendación ejecutiva:** Arrancar con **Opción A** (precio único 19€/190€) para validar el modelo. Diferenciar por tier una vez tengamos >50 usuarios activos.

---

## 3. Modelo Fiscal y Legal España

### Estructura de facturación

```
Agricultor paga 19€
  ├── Stripe cobra tarjeta
  ├── 9.50€ - fees → Cooperativa (Merchant of Record)
  └── 9.50€ application_fee → InagroSolutions

Facturación:
  ├── Cooperativa → emite factura 19€ (con IVA) al Agricultor
  └── InagroSolutions → emite factura comisión a la Cooperativa
```

### ¿Quién factura a quién?

| Emisor | Receptor | Concepto | Importe | IVA |
|--------|----------|----------|---------|-----|
| **Cooperativa** | Agricultor | "Suscripción Cuaderno Digital InagroSolutions" | 19€ (IVA incl.) → Base 15,70€ + IVA 3,30€ | 21% |
| **InagroSolutions** | Cooperativa | "Comisión plataforma tecnológica" | 9,50€ (IVA incl.) → Base 7,85€ + IVA 1,65€ | 21% |

> **IMPORTANTE:** Con **Direct Charges**, Stripe genera automáticamente la factura del agricultor con los datos fiscales de la cooperativa (que se configuran en su cuenta Express). InagroSolutions **no necesita emitir factura al agricultor**.

### IVA en España

- **Tipo general 21%** aplica a servicios digitales/software.
- Los agricultores en régimen de estimación objetiva (módulos) **NO pueden deducir IVA**, pero Hacienda igualmente exige factura con desglose.
- Activar **Stripe Tax** para cálculo automático basado en la ubicación del agricultor.

### Requisitos de factura legal (RD 1619/2012)

Stripe Invoicing cumple todos los campos obligatorios:

- [x] Número de factura secuencial
- [x] Fecha de emisión
- [x] Datos fiscales del emisor (CIF cooperativa)
- [x] Datos del destinatario (nombre/NIF agricultor)
- [x] Base imponible
- [x] Tipo y cuota de IVA
- [x] Importe total

### Numeración de facturas

Stripe genera secuencias automáticas por cuenta Connect. Formato: `INV-XXXX-YYYY`. La cooperativa puede personalizar el prefijo desde su dashboard Stripe.

---

## 4. Estructura de Base de Datos

### Migraciones SQL necesarias

#### 4.1 Añadir campos Stripe a `tenants`

```sql
-- Migración: add_stripe_connect_to_tenants
ALTER TABLE public.tenants 
  ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_onboarding_status TEXT DEFAULT 'pending' 
    CHECK (stripe_onboarding_status IN ('pending', 'restricted', 'completed')),
  ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS fiscal_name TEXT,
  ADD COLUMN IF NOT EXISTS fiscal_cif TEXT,
  ADD COLUMN IF NOT EXISTS fiscal_address TEXT,
  ADD COLUMN IF NOT EXISTS fiscal_email TEXT,
  ADD COLUMN IF NOT EXISTS fiscal_phone TEXT,
  ADD COLUMN IF NOT EXISTS fiscal_iban TEXT,
  ADD COLUMN IF NOT EXISTS fiscal_representative TEXT,
  ADD COLUMN IF NOT EXISTS stripe_onboarding_completed_at TIMESTAMPTZ;
```

#### 4.2 Añadir/verificar campos Stripe en `users`

```sql
-- Migración: add_stripe_billing_to_users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive'
    CHECK (subscription_status IN ('inactive', 'active', 'past_due', 'cancelled', 'trialing', 'paused')),
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'basico',
  ADD COLUMN IF NOT EXISTS billing_interval TEXT DEFAULT 'monthly'
    CHECK (billing_interval IN ('monthly', 'annual')),
  ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_cancel_at_period_end BOOLEAN DEFAULT false;
```

#### 4.3 Tabla de transacciones/comisiones (auditoría)

```sql
-- Migración: create_payment_transactions
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  amount_total INTEGER NOT NULL,       -- en céntimos (1900 = 19€)
  amount_platform INTEGER NOT NULL,    -- comisión InagroSolutions en céntimos
  amount_tenant INTEGER NOT NULL,      -- parte cooperativa en céntimos
  currency TEXT DEFAULT 'eur',
  status TEXT DEFAULT 'succeeded'
    CHECK (status IN ('succeeded', 'failed', 'refunded', 'disputed')),
  billing_interval TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_transactions_tenant ON public.payment_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON public.payment_transactions(created_at DESC);

-- RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins ven todas las transacciones"
  ON public.payment_transactions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND platform_role = 'superadmin')
  );

CREATE POLICY "Tenant admins ven transacciones de su tenant"
  ON public.payment_transactions FOR SELECT
  USING (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid() AND platform_role = 'tenant_admin')
  );

CREATE POLICY "Usuarios ven sus propias transacciones"
  ON public.payment_transactions FOR SELECT
  USING (user_id = auth.uid());
```

### Diagrama ERD

```
TENANTS (cooperativas)
├── id UUID PK
├── name TEXT
├── slug TEXT
├── stripe_account_id TEXT         ← Cuenta Connect Express
├── stripe_onboarding_status TEXT  ← pending|restricted|completed
├── stripe_charges_enabled BOOL
├── stripe_payouts_enabled BOOL
├── fiscal_name TEXT
├── fiscal_cif TEXT
├── fiscal_address TEXT
├── fiscal_email TEXT
├── fiscal_iban TEXT
└── (otros campos existentes...)

USERS (agricultores)
├── id UUID PK
├── email TEXT
├── tenant_id UUID FK → TENANTS
├── stripe_customer_id TEXT        ← Cliente Stripe
├── stripe_subscription_id TEXT    ← Suscripción activa
├── subscription_status TEXT       ← active|past_due|cancelled
├── subscription_tier TEXT         ← basico|intermedio|avanzado|premium
├── billing_interval TEXT          ← monthly|annual
├── subscription_current_period_end TIMESTAMPTZ
└── subscription_cancel_at_period_end BOOL

PAYMENT_TRANSACTIONS (auditoría)
├── id UUID PK
├── user_id UUID FK → USERS
├── tenant_id UUID FK → TENANTS
├── stripe_payment_intent_id TEXT
├── stripe_invoice_id TEXT
├── amount_total INTEGER           ← céntimos
├── amount_platform INTEGER        ← 50% InagroSolutions
├── amount_tenant INTEGER          ← 50% cooperativa
├── currency TEXT
├── status TEXT
├── billing_interval TEXT
└── created_at TIMESTAMPTZ
```

---

## 5. Inventario del Estado Actual

### ✅ Ya implementado

| Componente | Archivo | Estado |
|-----------|---------|--------|
| SDK Stripe (server) | `src/lib/stripe.ts` | ✅ Configurado, apiVersion 2025-01-27 |
| Checkout simple (sin Connect) | `/api/stripe/checkout/route.ts` | ✅ Funcional pero sin `stripe_account` |
| Checkout legacy (duplicado) | `/api/checkout/route.ts` | ⚠️ Duplicado, ELIMINAR |
| Customer Portal | `/api/stripe/portal/route.ts` | ✅ Funcional |
| Webhook principal | `/api/webhook/route.ts` | ✅ 5 eventos manejados |
| Webhook secundario (tenants) | `/api/webhooks/stripe/route.ts` | ⚠️ Duplicado parcial, CONSOLIDAR |
| Billing UI (tenant admin) | `/admin/billing/page.tsx` | ✅ UI base con portal link |
| Campo `stripe_customer_id` en users | tenant-context + hooks | ✅ Integrado en queries |
| Dependencias npm | `stripe`, `@stripe/stripe-js` | ✅ Instalados |

### ❌ Pendiente de implementar

| Nº | Componente | Prioridad | Complejidad |
|----|-----------|-----------|-------------|
| 1 | Migración SQL: campos Connect en `tenants` | 🔴 Crítica | ⚡ Baja |
| 2 | Migración SQL: tabla `payment_transactions` | 🔴 Crítica | ⚡ Baja |
| 3 | API: Crear cuenta Connect Express para cooperativa | 🔴 Crítica | 🔥 Media |
| 4 | API: Generar Account Link (onboarding URL) | 🔴 Crítica | ⚡ Baja |
| 5 | Webhook: `account.updated` (verificar KYC) | 🔴 Crítica | ⚡ Media |
| 6 | Refactorizar checkout para usar Direct Charges | 🔴 Crítica | 🔥 Media |
| 7 | Registrar transacciones en `payment_transactions` | 🟡 Alta | ⚡ Baja |
| 8 | Consolidar webhooks (eliminar duplicados) | 🟡 Alta | ⚡ Baja |
| 9 | UI SuperAdmin: Panel métricas MRR/churn | 🟡 Media | 🔥 Media |
| 10 | UI SuperAdmin: Gestión Connect cooperativas | 🟡 Media | 🔥 Media |
| 11 | UI Tenant Admin: Dashboard comisiones real | 🟡 Media | 🔥 Media |
| 12 | UI Agricultor: Vista suscripción y facturas | 🟡 Media | ⚡ Baja |
| 13 | Stripe Tax: configurar para España | 🟢 Baja | ⚡ Baja |
| 14 | Stripe Customer Portal: personalizar branding | 🟢 Baja | ⚡ Baja |
| 15 | Eliminar `/api/checkout/route.ts` (legacy) | 🟢 Baja | ⚡ Trivial |

---

## 6. Flujos Operativos

### 6.1 Alta de Cooperativa (Onboarding Connect)

```
FLUJO: Onboarding de Cooperativa en Stripe Connect

1. SuperAdmin → Crea cooperativa en /superadmin/tenants
2. InagroSolutions API → stripe.accounts.create({ type: 'express', country: 'ES', ... })
3. Stripe → Devuelve account.id = "acct_xxx"
4. InagroSolutions → Guarda stripe_account_id en tabla tenants
5. InagroSolutions API → stripe.accountLinks.create({ account: "acct_xxx" })
6. Stripe → Devuelve URL de onboarding
7. InagroSolutions → Envía email al Admin de la Cooperativa con la URL
8. Admin Cooperativa → Abre URL → Completa verificación (DNI, CIF, IBAN, firma)
9. Stripe → Envía Webhook: account.updated { charges_enabled: true }
10. InagroSolutions → Actualiza tenant: stripe_onboarding_status = 'completed'
11. ✅ Cooperativa lista para cobrar a agricultores
```

### 6.2 Agricultor contrata suscripción

```
FLUJO: Agricultor contrata plan

1. Agricultor → Ve planes en /cuaderno/planes, elige "Intermedio" (19€/mes)
2. Landing → Redirect /signup?plan=intermedio&tenant=coop-xyz
3. Agricultor → Crea cuenta (email + password)
4. Email → Confirma email → Login automático
5. Agricultor → POST /api/stripe/checkout { plan: 'intermedio', interval: 'monthly' }
6. API → Busca tenant → obtiene stripe_account_id
7. API → stripe.checkout.sessions.create({
     stripe_account: "acct_xxx",
     application_fee_percent: 50
   })
8. Stripe → Redirect a Checkout (con SCA/3DS)
9. Agricultor → Paga con tarjeta
10. Stripe → Webhook: checkout.session.completed
11. Webhook → Actualiza users: subscription_status='active', subscription_tier='intermedio'
12. Webhook → Inserta registro en payment_transactions
13. ✅ Agricultor tiene acceso completo al Cuaderno Digital
```

### 6.3 Renovación mensual automática

```
FLUJO: Renovación automática

Día de renovación:
├── Stripe intenta cobrar tarjeta
├── SI pago exitoso:
│   ├── Webhook: invoice.payment_succeeded
│   ├── DB: subscription_status = 'active'
│   └── DB: Inserta payment_transaction
└── SI pago fallido:
    ├── Webhook: invoice.payment_failed
    ├── DB: subscription_status = 'past_due'
    ├── Stripe: Reintento automático (día 3, 5, 7)
    └── SI todos los reintentos fallan:
        ├── Webhook: customer.subscription.deleted
        ├── DB: subscription_status = 'cancelled'
        └── Agricultor pierde acceso al Cuaderno
```

### 6.4 Cambio de plan (mensual ↔ anual)

```
FLUJO: Cambio de plan

1. Agricultor → Abre Stripe Customer Portal desde /admin/billing
2. Agricultor → Selecciona cambio a plan anual
3. Stripe → Calcula prorrateo automático
4. Stripe → Cobra diferencia
5. Webhook: customer.subscription.updated
6. DB → Actualiza billing_interval, subscription_tier
```

---

## 7. APIs y Endpoints

### Mapa de rutas finales

| Método | Ruta | Propósito | Auth |
|--------|------|-----------|------|
| POST | `/api/stripe/connect/create-account` | Crear cuenta Express para cooperativa | SuperAdmin |
| POST | `/api/stripe/connect/account-link` | Generar URL de onboarding | SuperAdmin |
| GET | `/api/stripe/connect/status/[tenantId]` | Consultar estado KYC | SuperAdmin |
| POST | `/api/stripe/checkout` | **Refactorizar:** Crear Checkout con Direct Charge | Agricultor auth |
| POST | `/api/stripe/portal` | Abrir Customer Portal (ya existe) | Agricultor auth |
| POST | `/api/stripe/webhook` | **Consolidar:** Único webhook entry point | Stripe (sin auth) |

### Detalle: POST /api/stripe/connect/create-account

```
Input: { tenantId: string }

1. Verificar que el usuario es SuperAdmin
2. Obtener datos del tenant de Supabase
3. stripe.accounts.create({
     type: 'express',
     country: 'ES',
     email: tenant.fiscal_email,
     business_type: 'company',
     company: {
       name: tenant.fiscal_name,
       tax_id: tenant.fiscal_cif
     },
     capabilities: {
       card_payments: { requested: true },
       transfers: { requested: true }
     },
     metadata: {
       tenant_id: tenantId,
       platform: 'inagrosolutions'
     }
   })
4. Guardar stripe_account_id en tenant
5. Generar Account Link para onboarding
6. Output: { accountId: string, onboardingUrl: string }
```

### Detalle: POST /api/stripe/checkout (refactorizado con Direct Charges)

```
Input: { priceId: string, tenantSlug?: string }

1. Obtener usuario autenticado
2. Obtener/crear Stripe Customer (ya implementado)
3. Si tenantSlug → buscar tenant → obtener stripe_account_id
4. stripe.checkout.sessions.create({
     customer: customerId,
     line_items: [{ price: priceId, quantity: 1 }],
     mode: 'subscription',
     // === CLAVE: Direct Charge hacia la cooperativa ===
     payment_intent_data: {
       application_fee_percent: 50
     },
     success_url: origin + '/cuaderno?payment=success',
     cancel_url: origin + '/cuaderno/planes',
     metadata: { userId, tenantId, plan },
     subscription_data: {
       metadata: { userId, tenantId }
     }
   },
   // Ejecutar en la cuenta Connect de la cooperativa
   { stripeAccount: stripeAccountId }
   )
5. Output: { url: string }
```

### Detalle: POST /api/stripe/webhook (consolidado)

```
Eventos a manejar:

1. checkout.session.completed
   → Activar suscripción en users
   → Registrar transacción en payment_transactions

2. invoice.payment_succeeded
   → Confirmar renovación
   → Registrar transacción

3. invoice.payment_failed
   → Marcar subscription_status = 'past_due'

4. customer.subscription.updated
   → Cambio plan/intervalo
   → Actualizar billing_interval, subscription_tier

5. customer.subscription.deleted
   → subscription_status = 'cancelled'

6. account.updated (NUEVO - Connect)
   → Actualizar stripe_onboarding_status en tenants
   → Actualizar stripe_charges_enabled, stripe_payouts_enabled

IMPORTANTE:
- Verificar tanto el webhook secret del platform como el de Connect
- Implementar idempotency check (verificar stripe_subscription_id antes de insertar)
```

---

## 8. Paneles de Usuario

### 8.1 Panel Agricultor — Suscripción

**Ruta:** `/cuaderno` (sidebar → sección "Mi Plan")

| Dato | Fuente | Implementado |
|------|--------|-------------|
| Plan contratado | `users.subscription_tier` | ⚠️ Parcial |
| Estado suscripción | `users.subscription_status` | ⚠️ Parcial |
| Próximo cobro | `users.subscription_current_period_end` | ❌ Nuevo |
| Intervalo (mes/año) | `users.billing_interval` | ❌ Nuevo |
| Autorenew activo | `users.subscription_cancel_at_period_end` | ❌ Nuevo |
| Descargar facturas | Stripe Customer Portal | ✅ Via `/api/stripe/portal` |
| Cambiar plan | Stripe Customer Portal | ✅ Via portal |
| Cancelar suscripción | Stripe Customer Portal | ✅ Via portal |
| Método de pago | Stripe Customer Portal | ✅ Via portal |

### 8.2 Panel Cooperativa — Comisiones

**Ruta:** `/admin/billing` (ya existe, necesita datos reales)

| Dato | Fuente | Implementado |
|------|--------|-------------|
| Nº agricultores activos | `COUNT users WHERE tenant_id AND subscription_status = 'active'` | ❌ Query |
| Ingresos mensuales | `SUM payment_transactions.amount_tenant WHERE month` | ❌ Query |
| Historial de cobros | `payment_transactions WHERE tenant_id` | ❌ Query |
| Facturas emitidas | Stripe Connect Dashboard (link externo) | ❌ Link |
| Estado KYC | `tenants.stripe_onboarding_status` | ❌ Nuevo |
| Datos fiscales | `tenants.fiscal_*` | ❌ Formulario |
| Comisión acumulada | `SUM amount_tenant` | ❌ Query |

### 8.3 Panel SuperAdmin — Métricas

**Ruta:** `/superadmin` (ampliar dashboard existente)

| Métrica | Cálculo | Implementado |
|---------|---------|-------------|
| MRR (Monthly Recurring Revenue) | `SUM amount_platform WHERE status = 'active' en mes actual` | ❌ Nuevo |
| ARR | `MRR × 12` | ❌ Nuevo |
| Churn rate | `Cancelled / Total active × 100` mensual | ❌ Nuevo |
| Total cooperativas activas | `COUNT tenants WHERE stripe_charges_enabled = true` | ❌ Nuevo |
| Total agricultores pagando | `COUNT users WHERE subscription_status = 'active'` | ❌ Nuevo |
| Comisiones generadas (total) | `SUM amount_platform` en `payment_transactions` | ❌ Nuevo |
| Incidencias de pago | `COUNT WHERE subscription_status = 'past_due'` | ❌ Nuevo |
| Exportación contable | CSV/XLSX de `payment_transactions` | ❌ Nuevo |

---

## 9. Seguridad y Compliance

### PSD2 / SCA (Strong Customer Authentication)

- ✅ **Stripe Checkout maneja SCA automáticamente.** 3D Secure se activa cuando el banco del agricultor lo exige.
- ✅ El flujo de redirect (no embedded) es el más seguro y compatible.

### PCI DSS

- ✅ **Level 1 Compliance.** InagroSolutions **nunca** toca datos de tarjeta. Todo vive en Stripe.
- ✅ No se almacena PAN, CVV ni fecha de expiración en Supabase.

### RGPD

| Requisito | Implementación |
|-----------|---------------|
| Consentimiento explícito | Checkbox en signup con link a política de privacidad |
| Derecho al olvido | Stripe permite borrar Customer; Supabase cascada en `users` |
| Portabilidad | Export CSV desde panel SuperAdmin |
| Minimización de datos | Solo se almacenan IDs de referencia Stripe, no datos sensibles |
| Registro de consentimiento | `users.created_at` + checkbox registrado en metadata |

### Marketplace Compliance España

- **No somos entidad de pago:** Al usar Stripe Connect, Stripe es la entidad regulada (licencia EMI europea).
- **Blanqueo de capitales (AML):** Stripe verifica KYC de cada cooperativa. No es nuestra responsabilidad legal.
- **SII (Suministro Inmediato de Información):** Las cooperativas con volumen >6M€/año deben reportar a AEAT. Stripe Tax puede generar los libros.

---

## 10. Estrategia de Conversión y Anti-Churn

### Maximizar conversión al plan anual

| Táctica | Implementación |
|---------|---------------|
| **Anclaje visual** | Mostrar precio mensual tachado "228€" junto a "190€" en la landing |
| **Badge "2 meses gratis"** | Ya implementado en el toggle de billing de `/cuaderno/planes` |
| **Default seleccionado** | El toggle anual/mensual arranca en "Anual" por defecto |
| **Ahorro en €** | Mostrar "Ahorras 38€" debajo del precio anual |
| **Urgencia** | "Oferta de lanzamiento. Los primeros 100 agricultores mantienen este precio de por vida" |
| **Social proof** | Testimonios reales (ya implementados en la landing) |

### Reducir churn

| Táctica | Implementación |
|---------|---------------|
| **Dunning automático** | Stripe reintenta 3 veces (día 1, 3, 7) antes de cancelar |
| **Email pre-renovación** | Stripe envía recordatorio 7 días antes del cobro |
| **Pausa en vez de cancelar** | Ofrecer "Pause Collection" de 3 meses en el portal |
| **Downgrade path** | Permitir cambiar a plan inferior antes de cancelar |
| **Win-back email** | 30 días después de cancelación: "Tu cuaderno SIEX te espera" |
| **Lock-in legal** | El SIEX es obligatorio. Sin el cuaderno digital, incumplen la ley |

---

## 11. Costes Stripe Estimados

### Por transacción (España, tarjeta europea)

| Concepto | Coste |
|----------|-------|
| Stripe Processing (tarjeta EU) | 1,5% + 0,25€ |
| Stripe Billing (suscripciones) | 0,5% |
| Stripe Tax (si se activa) | 0,5% |
| Connect Express (por cuenta activa) | 2€/mes por cuenta con actividad |
| Payout a cooperativa | 0,25€ por transferencia |

### Ejemplo real: agricultor paga 19€/mes

| Concepto | Importe |
|----------|---------|
| Cobro bruto | 19,00€ |
| Stripe Processing (1,5% + 0,25€) | -0,54€ |
| Stripe Billing (0,5%) | -0,10€ |
| **Neto después de fees** | **18,36€** |
| Application Fee InagroSolutions (50%) | 9,18€ |
| Payout cooperativa (50%) | 9,18€ |

### Ejemplo real: agricultor paga 190€/año

| Concepto | Importe |
|----------|---------|
| Cobro bruto | 190,00€ |
| Stripe Processing (1,5% + 0,25€) | -3,10€ |
| Stripe Billing (0,5%) | -0,95€ |
| **Neto después de fees** | **185,95€** |
| Application Fee InagroSolutions (50%) | 92,98€ |
| Payout cooperativa (50%) | 92,98€ |

> **TIP:** El plan anual genera **92,98€ netos para InagroSolutions** vs **110,16€** (9,18€ × 12) del mensual. Pero el anual tiene **0 riesgo de churn** durante 12 meses y ahorra en fees fijos (0,25€ × 11 = 2,75€). El valor ajustado por riesgo es superior.

---

## 12. Riesgos Críticos

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---|--------|-------------|---------|-----------|
| 1 | KYC bloqueado en cooperativa | 🟡 Media | 🔴 Alto | Documentación guiada + soporte manual de onboarding |
| 2 | Chargebacks del agricultor | 🟢 Baja | 🟡 Medio | Stripe Radar + descripción clara en extracto bancario |
| 3 | Stripe congela cuenta Connect | 🟢 Baja | 🔴 Alto | Mantener ratio disputas <0.75%. Monitorizar en SuperAdmin |
| 4 | Agricultor no confirma email | 🟡 Media | 🟡 Medio | Recordatorio 24h. Permitir re-envío desde login |
| 5 | Tipo IVA incorrecto | 🟢 Baja | 🟡 Medio | Stripe Tax valida automáticamente. Auditoría trimestral |
| 6 | Doble cobro por webhook duplicado | 🟡 Media | 🔴 Alto | Idempotency keys. Verificar subscription_id antes de insert |
| 7 | Cooperativa sin IBAN verificado | 🟡 Media | 🟡 Medio | Bloquear captación hasta charges_enabled = true |
| 8 | Cambio de legislación SIEX | 🟢 Baja | 🟡 Medio | Monitorización normativa. Actualización ágil del cuaderno |
| 9 | Competencia con precio inferior | 🟡 Media | 🟡 Medio | Lock-in por datos acumulados + comunidad cooperativa |
| 10 | Stripe sube comisiones | 🟢 Baja | 🟡 Medio | Evaluar alternativas (Adyen, Mangopay) si supera el 5% total |
| 11 | Fallo catastrófico BD Supabase | 🟢 Baja | 🔴 Alto | Backups diarios + Point-In-Time Recovery activado |
| 12 | Error en reparto 50/50 | 🟢 Baja | 🔴 Alto | Test exhaustivo en sandbox. Verificación manual primer mes |

---

## 13. Cronograma de Implementación

### Subfases y duración estimada

| Subfase | Descripción | Duración | Prioridad |
|---------|-------------|----------|-----------|
| **6.1** | Migraciones SQL: campos Connect + tabla transacciones | 2 días | 🔴 Crítica |
| **6.2** | APIs y webhooks de onboarding cooperativas (Connect Express) | 4 días | 🔴 Crítica |
| **6.3** | Refactorizar checkout para Direct Charges + consolidar webhooks | 4 días | 🔴 Crítica |
| **6.4** | Paneles de agricultor, cooperativa y superadmin con datos reales | 6 días | 🟡 Alta |
| **6.5** | Testing end-to-end, productos Stripe Live, deploy | 4 días | 🔴 Crítica |

**Total estimado: 20 días laborables (4 semanas)**

### Timeline detallado

```
SEMANA 1 (Días 1-5): Infraestructura
├── Día 1-2: Migraciones SQL (6.1)
├── Día 3: API crear cuenta Express (6.2.1)
├── Día 4: API Account Link + webhook account.updated (6.2.2-6.2.4)
└── Día 5: UI SuperAdmin botón onboarding (6.2.5)

SEMANA 2 (Días 6-10): Motor de cobros
├── Día 6-7: Refactorizar checkout con Direct Charges (6.3.1)
├── Día 8: Eliminar duplicados, consolidar webhooks (6.3.2-6.3.3)
├── Día 9: Registrar transacciones en webhook (6.3.4)
└── Día 10: Idempotency checks + crear productos Stripe test (6.3.5-6.3.6)

SEMANA 3 (Días 11-15): Frontend
├── Día 11-12: UI Agricultor: vista plan + botón pagar (6.4.1-6.4.2)
├── Día 13-14: UI Tenant Admin: dashboard comisiones real (6.4.3)
└── Día 15-16: UI SuperAdmin: métricas MRR/churn (6.4.4)

SEMANA 4 (Días 17-20): Testing y Launch
├── Día 17-18: Testing sandbox completo (todos los flujos)
├── Día 19: Crear productos Stripe Live + Stripe Tax España
└── Día 20: Deploy producción + smoke test
```

---

## 14. Checklist de Implementación

### Subfase 6.1 — Base de Datos
- [ ] **6.1.1** — Migración: campos `stripe_account_id`, `stripe_onboarding_status`, `fiscal_*` en `tenants`
- [ ] **6.1.2** — Migración: campos `billing_interval`, `subscription_current_period_end`, `subscription_cancel_at_period_end` en `users`
- [ ] **6.1.3** — Migración: crear tabla `payment_transactions` con RLS
- [ ] **6.1.4** — Verificar campos existentes (`stripe_customer_id`, `subscription_status`) están en tabla `users` real

### Subfase 6.2 — Stripe Connect
- [ ] **6.2.1** — Crear endpoint `POST /api/stripe/connect/create-account`
- [ ] **6.2.2** — Crear endpoint `POST /api/stripe/connect/account-link`
- [ ] **6.2.3** — Crear endpoint `GET /api/stripe/connect/status/[tenantId]`
- [ ] **6.2.4** — Añadir handler `account.updated` en webhook consolidado
- [ ] **6.2.5** — UI en `/superadmin/tenants`: botón "Activar Stripe Connect" + estado KYC
- [ ] **6.2.6** — UI en `/admin/billing`: mostrar estado onboarding + link Stripe dashboard

### Subfase 6.3 — Checkout Refactorizado
- [ ] **6.3.1** — Refactorizar `/api/stripe/checkout` para aceptar `tenantSlug` y usar Direct Charges
- [ ] **6.3.2** — Eliminar `/api/checkout/route.ts` (legacy duplicado)
- [ ] **6.3.3** — Consolidar `/api/webhook` y `/api/webhooks/stripe` en un único endpoint
- [ ] **6.3.4** — Añadir registro en `payment_transactions` en cada evento de pago exitoso
- [ ] **6.3.5** — Implementar idempotency check para evitar dobles cobros
- [ ] **6.3.6** — Crear productos y precios en Stripe Dashboard (test mode)

### Subfase 6.4 — Frontend Billing
- [ ] **6.4.1** — Componente "Mi Plan" en sidebar/dashboard del agricultor
- [ ] **6.4.2** — Botón "Suscribirse" en landing → redirect a Checkout
- [ ] **6.4.3** — Actualizar `/admin/billing` con datos reales de `payment_transactions`
- [ ] **6.4.4** — Dashboard SuperAdmin: cards MRR, churn, cooperativas activas
- [ ] **6.4.5** — Export CSV de transacciones para contabilidad

### Subfase 6.5 — Testing y Launch
- [ ] **6.5.1** — Test: crear cuenta Connect en sandbox
- [ ] **6.5.2** — Test: checkout con tarjeta `4242 4242 4242 4242`
- [ ] **6.5.3** — Test: webhook recibe y procesa correctamente
- [ ] **6.5.4** — Test: renovación mensual simulada
- [ ] **6.5.5** — Test: pago fallido → past_due → reintento
- [ ] **6.5.6** — Test: cancelación → subscription_deleted
- [ ] **6.5.7** — Test: Customer Portal funcional
- [ ] **6.5.8** — Configurar Stripe Tax para España (21% IVA)
- [ ] **6.5.9** — Crear productos en Stripe Live
- [ ] **6.5.10** — Configurar webhook endpoint en producción (Vercel)
- [ ] **6.5.11** — Variables de entorno producción: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- [ ] **6.5.12** — Deploy final y smoke test con tarjeta real

---

## Variables de Entorno Necesarias

```
# Ya existentes
STRIPE_SECRET_KEY=sk_test_xxx              # Secret key de la plataforma
STRIPE_WEBHOOK_SECRET=whsec_xxx            # Webhook signing secret

# Nuevas necesarias
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx  # Para el cliente JS
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_connect_xxx # Webhook secret para eventos Connect
```

---

> **PRECAUCIÓN:**
> **NUNCA** pasar a producción sin:
> 1. Verificar que el webhook valida firmas correctamente
> 2. Testar chargebacks y disputas en sandbox
> 3. Confirmar que `application_fee_percent` = 50 está bien calculado
> 4. Tener un plan B si Stripe congela una cuenta Connect (proceso manual de payout)

---

*Documento generado el 18/04/2026. Versión 1.0.*
*Arquitectura diseñada con perspectiva CTO + CFO + Legal + Growth para InagroSolutions.*
