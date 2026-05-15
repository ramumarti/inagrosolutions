# Plan de Testing y Launch — Stripe Connect Express

> **Fase 6.5 del Plan Maestro de Pagos**
> Última actualización: 15 Mayo 2026
> Estado: 🟡 EN PROGRESO

---

## Resumen

Todo el código del sistema de pagos (backend, webhooks, checkout con Direct Charges, paneles de UI) está **100% implementado**. Este documento detalla los pasos restantes para configurar Stripe, realizar las pruebas end-to-end en sandbox y finalmente lanzar a producción.

---

## Prerequisitos confirmados ✅

| Componente | Estado |
|-----------|--------|
| Migraciones SQL (tenants, users, payment_transactions) | ✅ Aplicadas |
| API Stripe Connect (create-account, account-link, status) | ✅ Implementado |
| Webhook consolidado (6 eventos) | ✅ Implementado |
| Checkout con Direct Charges + application_fee 50% | ✅ Implementado |
| Panel SuperAdmin (KPIs: MRR, Churn, Ingresos Totales) | ✅ Implementado |
| Panel Tenant Admin (Stripe Connect + Comisiones reales) | ✅ Implementado |
| Panel Agricultor (Planes, Checkout, Portal Cliente) | ✅ Implementado |
| Facturación SaaS de licencias (invoices) | ✅ Implementado |
| `/api/checkout/route.ts` legacy eliminado | ✅ Eliminado |

---

## PASO 1 — Variables de Entorno Stripe (Local + Vercel)

> [!IMPORTANT]
> Actualmente **NO hay claves de Stripe** en `.env.local`. Sin ellas el sistema usa un placeholder y Stripe no funciona.

### 1.1 Obtener claves de Stripe Dashboard

1. Ir a [https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
2. Copiar las claves del **modo Test**:

### 1.2 Añadir a `.env.local` (desarrollo local)

```env
# Stripe — Modo Test
STRIPE_SECRET_KEY=sk_test_SU_CLAVE_AQUI
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_SU_CLAVE_AQUI
STRIPE_WEBHOOK_SECRET=whsec_SU_CLAVE_AQUI
```

> [!NOTE]
> `STRIPE_WEBHOOK_SECRET` se genera al crear el endpoint de webhook en Stripe o al usar `stripe listen` del CLI.

### 1.3 Añadir a Vercel (producción)

```
Vercel → Settings → Environment Variables → Añadir:
  STRIPE_SECRET_KEY          = sk_live_xxx (cuando pases a Live)
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_xxx
  STRIPE_WEBHOOK_SECRET      = whsec_xxx (del endpoint de producción)
```

### Checklist Paso 1
- [x] **1.1** — Copiar `STRIPE_SECRET_KEY` (test) del dashboard de Stripe
- [x] **1.2** — Copiar `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (test)
- [x] **1.3** — Añadir ambas claves a `.env.local`
- [x] **1.4** — Verificar que la app arranca sin el warning `STRIPE_SECRET_KEY is missing`

---

## PASO 2 — Crear Productos y Precios en Stripe (Modo Test)

### 2.1 Configuración actual de precios en el código

El archivo `src/lib/modules.ts` define los siguientes precios por tier:

| Tier | Mensual | Anual | Hasta Ha |
|------|---------|-------|----------|
| **Básico** | 4,99 € | 49,90 € | 5 ha |
| **Intermedio** | 19,99 € | 199,90 € | 20 ha |
| **Avanzado** | 49,99 € | 499,90 € | 50 ha |
| **Premium** | 89,99 € | 899,90 € | 100 ha |

> [!NOTE]
> El plan maestro original proponía un precio único de 19€/190€, pero el código actual implementa **4 tiers diferenciados por hectáreas**. Usamos los precios del código actual.

### 2.2 Crear productos en Stripe Dashboard

Ir a [https://dashboard.stripe.com/test/products](https://dashboard.stripe.com/test/products) y crear:

**Producto: "Cuaderno Digital — Básico"**
- Precio 1: 4,99 € / mes (recurrente) → anotar `price_xxx`
- Precio 2: 49,90 € / año (recurrente) → anotar `price_xxx`

**Producto: "Cuaderno Digital — Intermedio"**
- Precio 1: 19,99 € / mes → anotar `price_xxx`
- Precio 2: 199,90 € / año → anotar `price_xxx`

**Producto: "Cuaderno Digital — Avanzado"**
- Precio 1: 49,99 € / mes → anotar `price_xxx`
- Precio 2: 499,90 € / año → anotar `price_xxx`

**Producto: "Cuaderno Digital — Premium"**
- Precio 1: 89,99 € / mes → anotar `price_xxx`
- Precio 2: 899,90 € / año → anotar `price_xxx`

> [!TIP]
> Nuestro Checkout usa `price_data` inline (genera el precio al vuelo) en lugar de referenciar un `price_id` fijo. Esto significa que **no necesitas mapear los IDs de precio en el código**, ya que el precio se calcula dinámicamente desde `TIER_CONFIG`. Sin embargo, es buena práctica tener los productos creados en Stripe para una referencia visual en el dashboard y para poder usarlos con el Customer Portal.

### Checklist Paso 2
- [x] **2.1** — Crear producto "Cuaderno Digital — Básico" con 2 precios (mensual/anual)
- [x] **2.2** — Crear producto "Cuaderno Digital — Intermedio" con 2 precios
- [x] **2.3** — Crear producto "Cuaderno Digital — Avanzado" con 2 precios
- [x] **2.4** — Crear producto "Cuaderno Digital — Premium" con 2 precios
- [x] **2.5** — Anotar todos los `price_id` en un documento por si necesitamos migrar a IDs fijos

---

## PASO 3 — Configurar Stripe Tax (IVA España)

### 3.1 Activar Stripe Tax

1. Ir a [https://dashboard.stripe.com/test/settings/tax](https://dashboard.stripe.com/test/settings/tax)
2. Activar Stripe Tax
3. Añadir registro fiscal:
   - País: **España**
   - Tipo: IVA
   - Número de IVA de InagroSolutions (CIF de la empresa)
4. Configurar tipo impositivo por defecto: **21% (tipo general)**
5. Confirmar que aplica a **servicios digitales / software**

### Checklist Paso 3
- [x] **3.1** — Activar Stripe Tax en el dashboard
- [x] **3.2** — Registrar España como jurisdicción fiscal
- [x] **3.3** — Verificar que el IVA se aplica al 21% (automático por Stripe según jurisdicción)

---

## PASO 4 — Configurar Customer Portal de Stripe

### 4.1 Personalizar el Portal

1. Ir a [https://dashboard.stripe.com/test/settings/billing/portal](https://dashboard.stripe.com/test/settings/billing/portal)
2. **Branding:**
   - Subir logo de InagroSolutions
   - Color primario: `#10B981` (emerald-500, el color de la app)
   - Nombre de la empresa: "InagroSolutions"
3. **Funcionalidades a habilitar:**
   - ✅ Clientes pueden actualizar su método de pago
   - ✅ Clientes pueden ver su historial de facturas
   - ✅ Clientes pueden cancelar su suscripción
   - ✅ Clientes pueden cambiar entre planes (upgrades/downgrades)
   - ✅ Clientes pueden pausar su suscripción (3 meses máximo)
4. **Productos y precios:**
   - Añadir los 8 precios creados en el Paso 2 para que se muestren en las opciones de cambio de plan

### Checklist Paso 4
- [ ] **4.1** — Configurar branding (logo + colores)
- [ ] **4.2** — Habilitar: cambio tarjeta, facturas, cancelación, cambio plan, pausa
- [ ] **4.3** — Vincular los productos/precios del Paso 2 al portal

---

## PASO 5 — Instalar Stripe CLI y Configurar Webhook Local

### 5.1 Instalar Stripe CLI

```powershell
# Opción 1: Con winget (Windows)
winget install Stripe.StripeCLI

# Opción 2: Con Scoop
scoop install stripe
```

### 5.2 Login en Stripe CLI

```powershell
stripe login
# Sigue las instrucciones del navegador para autorizar
```

### 5.3 Reenviar webhooks a localhost

En una terminal separada (mientras corres `npm run dev`):

```powershell
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```

Esto te dará un `whsec_xxx` temporal. **Cópialo como tu `STRIPE_WEBHOOK_SECRET` en `.env.local`**.

### Checklist Paso 5
- [ ] **5.1** — Instalar Stripe CLI
- [ ] **5.2** — Ejecutar `stripe login` y autenticarse
- [ ] **5.3** — Ejecutar `stripe listen --forward-to ...` y copiar el `whsec_xxx`
- [ ] **5.4** — Actualizar `STRIPE_WEBHOOK_SECRET` en `.env.local`

---

## PASO 6 — Testing End-to-End en Sandbox

### 6.1 Flujo 1: Onboarding de Cooperativa (Stripe Connect)

```
Pasos:
1. Arrancar la app: npm run dev
2. Login como SuperAdmin
3. Ir a /superadmin/tenants
4. Pulsar "Vincular Stripe" en una cooperativa existente
5. Verificar que redirige al formulario de onboarding de Stripe
6. Completar el onboarding con datos de prueba:
   - Tipo negocio: Empresa
   - Representante: datos ficticios
   - Cuenta bancaria: usar IBAN de prueba ES0000000000000000000000
7. Verificar que al volver, el estado cambia a "Connect OK"
8. Verificar en Supabase que tenant tiene:
   - stripe_account_id = "acct_xxx"
   - stripe_onboarding_status = "completed"
   - stripe_charges_enabled = true
```

**Resultado esperado:** La cooperativa aparece con badge verde "Connect OK" en la tabla.

### 6.2 Flujo 2: Agricultor contrata suscripción (Direct Charge)

```
Pasos:
1. Login como un agricultor asociado a la cooperativa del Flujo 1
2. Ir a /cuaderno/suscripcion
3. Seleccionar plan "Intermedio" (19,99€/mes)
4. Pulsar "Seleccionar Intermedio"
5. Verificar que redirige al Stripe Checkout
6. Pagar con tarjeta de prueba: 4242 4242 4242 4242
   - Fecha: cualquier fecha futura
   - CVC: cualquier 3 dígitos
   - Código postal: cualquiera
7. Verificar redirect a /cuaderno?payment=success
```

**Verificaciones post-pago:**

| Qué verificar | Dónde | Valor esperado |
|---------------|-------|----------------|
| `subscription_status` | Supabase → users | `active` |
| `subscription_tier` | Supabase → users | `intermedio` |
| `billing_interval` | Supabase → users | `monthly` |
| `stripe_customer_id` | Supabase → users | `cus_xxx` |
| `stripe_subscription_id` | Supabase → users | `sub_xxx` |
| Registro en `payment_transactions` | Supabase → payment_transactions | `amount_total = 1999`, `amount_platform = 1000`, `amount_tenant = 999` |
| Pago visible en Stripe Dashboard | Stripe → Connect account | Cobro con application_fee del 50% |

### 6.3 Flujo 3: Customer Portal

```
Pasos:
1. Como agricultor con suscripción activa
2. Ir a /cuaderno/suscripcion
3. Pulsar "Gestionar Suscripción"
4. Verificar que abre el Customer Portal de Stripe
5. Probar:
   - Ver facturas
   - Cambiar método de pago
   - (Opcional) Cancelar suscripción → verificar webhook
```

### 6.4 Flujo 4: Renovación fallida (simular impago)

```
Pasos:
1. En Stripe Dashboard (modo test):
   - Ir a la suscripción del agricultor
   - Pulsar "Edit" → Adelantar fecha de renovación
   - O usar la tarjeta de rechazo: 4000 0000 0000 0341
2. Verificar que el webhook recibe `invoice.payment_failed`
3. Verificar en Supabase: subscription_status = "past_due"
4. Verificar registro en payment_transactions con status = "failed"
```

### 6.5 Flujo 5: Cancelación

```
Pasos:
1. Desde el Customer Portal, cancelar la suscripción
2. Verificar webhook: customer.subscription.deleted
3. Verificar en Supabase: subscription_status = "cancelled"
4. Verificar que el agricultor pierde acceso a los módulos premium
```

### Checklist Paso 6
- [ ] **6.1** — Test: Onboarding Connect de cooperativa ✅
- [ ] **6.2** — Test: Checkout con Direct Charge (4242...) ✅
- [ ] **6.3** — Test: Customer Portal funcional ✅
- [ ] **6.4** — Test: Renovación fallida → `past_due` ✅
- [ ] **6.5** — Test: Cancelación → `cancelled` ✅
- [ ] **6.6** — Test: Verificar reparto 50/50 en `payment_transactions`
- [ ] **6.7** — Test: Verificar que el webhook es idempotente (no duplica registros)

---

## PASO 7 — Pasar a Producción (Stripe Live)

> [!CAUTION]
> NO pasar a producción sin haber completado TODOS los tests del Paso 6.

### 7.1 Activar cuenta Stripe Live

1. En Stripe Dashboard, salir del modo Test
2. Completar la verificación de la cuenta (si no está hecha):
   - Datos de la empresa (CIF, dirección fiscal)
   - Cuenta bancaria para payouts
   - Documento de identidad del representante
3. Esperar aprobación (normalmente < 24h)

### 7.2 Crear productos en modo Live

Repetir exactamente los mismos pasos del **Paso 2**, pero ahora en modo Live:
- Crear los 4 productos con sus 8 precios

### 7.3 Configurar webhook de producción

1. Ir a [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Crear nuevo endpoint:
   - **URL:** `https://inagrosolutions.com/api/stripe/webhook`
   - **Eventos a escuchar:**
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `account.updated`
3. Copiar el **Signing Secret** (`whsec_xxx`)

### 7.4 Actualizar variables en Vercel

```
Vercel → Settings → Environment Variables:
  STRIPE_SECRET_KEY              = sk_live_XXXXXXXX
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_XXXXXXXX
  STRIPE_WEBHOOK_SECRET          = whsec_XXXXXXXX (del endpoint Live)
```

### 7.5 Deploy y Smoke Test

```
1. git add . && git commit -m "feat: Stripe Connect production keys"
2. git push origin main (deploy automático en Vercel)
3. Smoke test con tarjeta REAL (cobro mínimo)
4. Verificar payout en la cuenta bancaria de Stripe
5. Verificar que payment_transactions se registra correctamente
```

### Checklist Paso 7
- [ ] **7.1** — Verificar cuenta Stripe Live (KYC aprobado)
- [ ] **7.2** — Crear 4 productos + 8 precios en modo Live
- [ ] **7.3** — Configurar Customer Portal en modo Live
- [ ] **7.4** — Configurar Stripe Tax en modo Live
- [ ] **7.5** — Crear webhook endpoint de producción
- [ ] **7.6** — Añadir variables Live a Vercel
- [ ] **7.7** — Deploy a producción
- [ ] **7.8** — Smoke test con tarjeta real
- [ ] **7.9** — Verificar primer pago en Stripe Dashboard Live

---

## PASO 8 — Monitorización Post-Launch

### Primera semana

- [ ] Revisar diariamente el panel SuperAdmin → métricas MRR
- [ ] Verificar que los webhooks no dan errores (Stripe Dashboard → Developers → Webhooks → Intentos)
- [ ] Comprobar que los payouts llegan a la cuenta bancaria
- [ ] Monitorizar el ratio de disputas/chargebacks (objetivo: < 0,75%)

### Primer mes

- [ ] Generar facturas de licencia SaaS para cooperativas (/superadmin/billing)
- [ ] Exportar CSV de transacciones para contabilidad
- [ ] Verificar con el asesor fiscal que las facturas cumplen RD 1619/2012
- [ ] Evaluar si activar precios diferenciados por tier en Stripe (migrar de `price_data` a `price_id` fijos)

---

## Tarjetas de Prueba Stripe (Referencia Rápida)

| Tarjeta | Resultado |
|---------|-----------|
| `4242 4242 4242 4242` | ✅ Pago exitoso |
| `4000 0025 0000 3155` | ⚠️ Requiere autenticación 3DS |
| `4000 0000 0000 9995` | ❌ Fondos insuficientes |
| `4000 0000 0000 0341` | ❌ Tarjeta rechazada |
| `4000 0000 0000 3220` | ⚠️ 3DS2 requerido siempre |

**IBAN de prueba (para Connect):** `ES0000000000000000000000`

---

> **RECUERDA:**
> 1. ✅ Verificar que el webhook valida firmas correctamente
> 2. ✅ Testar chargebacks y disputas en sandbox
> 3. ✅ Confirmar que `application_fee_percent` = 50 está bien calculado
> 4. ✅ Tener un plan B si Stripe congela una cuenta Connect

---

*Documento generado el 15/05/2026 — Fase 6.5 del Plan Maestro de Pagos InagroSolutions*
