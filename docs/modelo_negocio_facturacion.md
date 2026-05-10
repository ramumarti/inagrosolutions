# Modelo de Negocio y Flujo de Facturación — InagroSolutions
**Versión:** 1.0 · **Fecha:** Mayo 2026 · **Clasificación:** Interno / Operativo

---

## 1. PARTES INTERVINIENTES

| Parte | Rol Legal | Denominación en este documento |
|-------|-----------|-------------------------------|
| **InagroSolutions S.L.** | Titular de la plataforma SaaS · Licenciante | `INAGRO` |
| **Cooperativa / Entidad colaboradora** | Licenciataria · Facturadora de los agricultores | `ENTIDAD` |
| **Agricultor / Socio** | Usuario final · Suscriptor del servicio | `AGRICULTOR` |
| **Stripe, Inc.** | Pasarela de pagos · Subencargado del Tratamiento | `STRIPE` |

---

## 2. ESQUEMA GENERAL DEL PROCESO

```
┌─────────────────────────────────────────────────────────────┐
│                      INAGROSOLUTIONS                        │
│              (Plataforma SaaS · Infraestructura)            │
└────────────────────┬───────────────────────────────────────-┘
                     │ 1. Alta gratuita + Firma Contrato
                     │    de Colaboración
                     ▼
┌─────────────────────────────────────────────────────────────┐
│               ENTIDAD COLABORADORA                          │
│         (Cooperativa / Asesoría / Ingeniería)               │
│   • Configura branding (white-label)                        │
│   • Configura Stripe Connect (IBAN propio)                  │
│   • Invita a sus socios / agricultores                      │
└────────────────────┬────────────────────────────────────────┘
                     │ 2. Invitación personalizada por email
                     │    (con enlace a /c/[slug-entidad])
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    AGRICULTOR                               │
│   • Se registra en el portal de su entidad                  │
│   • Elige plan (Básico / Intermedio / Avanzado / Premium)   │
│   • Confirma email → Paga suscripción mensual               │
│   • Recibe factura mensual de la ENTIDAD                    │
│   • Accede a su Cuaderno Digital                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. FLUJO DETALLADO PASO A PASO

### FASE 1 — Alta y Vinculación de la Entidad Colaboradora

```
PASO 1.1  La ENTIDAD se registra en InagroSolutions (sin coste)
           → URL: https://inagrosolutions.com/signup?role=partner

PASO 1.2  Durante el registro, la ENTIDAD:
           a) Acepta electrónicamente el Contrato de Colaboración
              (Licencia SaaS + Acuerdo de Reparto de Ingresos)
              Base legal: Art. 23 Ley 34/2002 (LSSI-CE)
           b) Acepta el Acuerdo de Encargado del Tratamiento (DPA)
              Base legal: Art. 28 RGPD (UE) 2016/679
           c) Proporciona datos fiscales: CIF, Razón Social, IBAN

PASO 1.3  La ENTIDAD configura su Marca Blanca:
           → Logo, colores, slug de URL (/c/mi-cooperativa)
           → Descripción pública para sus agricultores

PASO 1.4  La ENTIDAD configura Stripe Connect Express:
           → KYC de Stripe (verificación fiscal + identidad)
           → Vincula su cuenta bancaria española (IBAN)
           → Estado: charges_enabled: true (cobros habilitados)

           ⚠️  HASTA que el KYC esté completo, el 100% de los pagos
               de los agricultores va a INAGRO. La ENTIDAD no
               cobrará su 50% hasta completar la verificación.
```

### FASE 2 — Captación e Incorporación del Agricultor

```
PASO 2.1  La ENTIDAD invita a sus socios desde el panel de administración
           → Genera un enlace personalizado o envía email de invitación
           → URL del portal del agricultor: /c/[slug-entidad]?plan=[plan]

PASO 2.2  El AGRICULTOR accede al portal de su entidad:
           → Ve el branding de la entidad (logo, colores)
           → Selecciona su plan de suscripción
           → Rellena el formulario de alta:
              · Nombre completo
              · DNI / NIF (obligatorio para facturación)
              · Dirección fiscal (para factura)
              · Datos de explotación (SIEX)
              · Método de pago (tarjeta / SEPA Direct Debit)

PASO 2.3  El AGRICULTOR confirma su email:
           → Recibe un correo de verificación con branding de la ENTIDAD
           → Al confirmar, el sistema inicia automáticamente el checkout
              de Stripe en la cuenta Connect de la ENTIDAD

PASO 2.4  El AGRICULTOR completa el pago:
           → Stripe procesa el cobro en nombre de la ENTIDAD
           → El AGRICULTOR ve el nombre de la ENTIDAD en su extracto bancario
           → Se activa la suscripción: subscription_status = "active"
           → El AGRICULTOR recibe email de bienvenida + acceso al Cuaderno Digital
```

### FASE 3 — Facturación Mensual al Agricultor (ENTIDAD → AGRICULTOR)

```
PASO 3.1  Al inicio de cada mes, la ENTIDAD genera (o recibe
           automáticamente) la factura de cada agricultor activo.

PASO 3.2  Contenido de la factura ENTIDAD → AGRICULTOR:
           ┌──────────────────────────────────────────────┐
           │ FACTURA Nº: ENT-2026-001                      │
           │ Emisor: COOPERATIVA SAN ISIDRO SCV            │
           │ CIF: F-12345678                               │
           │ ──────────────────────────────────────────── │
           │ Receptor: Juan García Pérez                   │
           │ NIF: 12345678A                                │
           │ ──────────────────────────────────────────── │
           │ Concepto: Servicio de Gestión del Cuaderno    │
           │ Digital de Explotación y acceso al sistema    │
           │ SIEX — Plan Básico — Mes Mayo 2026            │
           │ ──────────────────────────────────────────── │
           │ Base imponible:     9,99 €                    │
           │ IVA (21%):          2,10 €                    │
           │ TOTAL:             12,09 €                    │
           └──────────────────────────────────────────────┘

PASO 3.3  La ENTIDAD gestiona el IVA:
           → Declara el IVA repercutido (21%) en el Modelo 303 (trimestral)
           → La base imponible tributa como ingreso de la ENTIDAD en IS / IRPF

PASO 3.4  Stripe genera automáticamente un recibo de pago al AGRICULTOR
           (conforme a PSD2). La ENTIDAD debe emitir adicionalmente la
           factura fiscal formal con su CIF.
           
           ℹ️  INAGRO puede automatizar la generación de estas facturas
               via la API de Stripe (Stripe Invoicing) o mediante
               el sistema interno de facturación de la plataforma.
```

### FASE 4 — Reparto Automático de Ingresos (STRIPE CONNECT)

```
PASO 4.1  En el momento del cobro al AGRICULTOR, Stripe reparte
           automáticamente los fondos mediante Direct Charges:

           ┌─────────────────────────────────────────────┐
           │  Pago AGRICULTOR:    9,99 € + 2,10 € IVA    │
           │  = 12,09 € cobrados                         │
           │                                             │
           │  Reparto AUTOMÁTICO de Stripe:              │
           │  ├─ 50% → Cuenta ENTIDAD:    6,045 €        │
           │  └─ 50% → Cuenta INAGRO:     6,045 €        │
           │     (via application_fee)                   │
           └─────────────────────────────────────────────┘

           ⚠️  El reparto incluye el IVA. INAGRO y la ENTIDAD deben
               gestionar individualmente su propia declaración de IVA
               sobre la parte que les corresponde.

PASO 4.2  La ENTIDAD recibe su payout semanal (cada lunes) en su
           cuenta bancaria española vinculada al KYC de Stripe.

PASO 4.3  INAGRO recibe su application_fee directamente en su
           cuenta principal de Stripe, que se liquida periódicamente.
```

### FASE 5 — Facturación de INAGRO a la ENTIDAD (Licencia SaaS)

```
PASO 5.1  Al cierre de cada mes, INAGRO genera y envía a la ENTIDAD
           una factura por la licencia de la plataforma.

PASO 5.2  Contenido de la factura INAGRO → ENTIDAD:
           ┌──────────────────────────────────────────────┐
           │ FACTURA Nº: INV-2026-001                      │
           │ Emisor: INAGROSOLUTIONS S.L.                  │
           │ CIF: B-XXXXXXXX                               │
           │ ──────────────────────────────────────────── │
           │ Receptor: COOPERATIVA SAN ISIDRO SCV          │
           │ CIF: F-12345678                               │
           │ ──────────────────────────────────────────── │
           │ Concepto: Licencia de uso mensual de la        │
           │ plataforma tecnológica InagroSolutions —       │
           │ 50% s/ suscripciones activas (12 agricultores)│
           │ Período: 1 mayo 2026 — 31 mayo 2026           │
           │ ──────────────────────────────────────────── │
           │ Detalle:                                      │
           │  12 agricultores × 4,995 € =      59,94 €    │
           │ Base imponible:               59,94 €         │
           │ IVA (21%):                    12,59 €         │
           │ TOTAL FACTURA:                72,53 €         │
           │ ──────────────────────────────────────────── │
           │ Nota: Esta factura documenta la contrapres-   │
           │ tación económica por la licencia SaaS, conf.  │
           │ a la cláusula 3 del Contrato de Colaboración. │
           │ El pago ya fue ejecutado automáticamente por  │
           │ Stripe Connect (application_fee). Esta        │
           │ factura es el justificante fiscal del ingreso. │
           └──────────────────────────────────────────────┘

PASO 5.3  La ENTIDAD registra esta factura como:
           → GASTO DEDUCIBLE: 59,94 € (base imponible)
           → IVA SOPORTADO: 12,59 € (deducible en Mod. 303)

PASO 5.4  INAGRO registra esta factura como:
           → INGRESO DE EXPLOTACIÓN: 59,94 €
           → IVA REPERCUTIDO: 12,59 € (a ingresar en Mod. 303)
```

---

## 4. MAPA DE DOCUMENTOS LEGALES NECESARIOS

| Documento | Entre quién | Momento | Estado |
|-----------|-------------|---------|--------|
| **Contrato de Colaboración** (Licencia SaaS + Revenue Sharing) | INAGRO ↔ ENTIDAD | Alta de la ENTIDAD | ✅ En `/partner-policy` |
| **Acuerdo de Encargado del Tratamiento (DPA)** | INAGRO ↔ ENTIDAD | Alta de la ENTIDAD | ⚠️ Pendiente documento formal |
| **Términos y Condiciones para Agricultores** | ENTIDAD ↔ AGRICULTOR | Alta del AGRICULTOR | ⚠️ Pendiente en portal white-label |
| **Política de Privacidad para Agricultores** | ENTIDAD ↔ AGRICULTOR | Alta del AGRICULTOR | ⚠️ Pendiente en portal white-label |
| **Factura mensual servicio SIEX** | ENTIDAD → AGRICULTOR | Cada mes | ⚠️ Sistema pendiente implementar |
| **Factura mensual licencia SaaS** | INAGRO → ENTIDAD | Cada mes | ✅ Sistema implementado |
| **Recibo de pago automático** | STRIPE → AGRICULTOR | Cada cobro | ✅ Automático via Stripe |

---

## 5. OBLIGACIONES FISCALES POR PARTE

### 5.1 INAGRO — Obligaciones

| Obligación | Detalle | Periodicidad |
|------------|---------|-------------|
| Emitir factura a cada ENTIDAD | 50% de suscripciones + IVA 21% | Mensual |
| Declarar IVA repercutido | Modelo 303 | Trimestral |
| Declarar ingresos por licencias | IS (Modelo 200) | Anual |
| Gestionar Stripe Connect como plataforma | Application fee = ingreso | Continuo |
| Mantener registro de transacciones | `payment_transactions` en BD | Continuo |

### 5.2 ENTIDAD — Obligaciones

| Obligación | Detalle | Periodicidad |
|------------|---------|-------------|
| Emitir factura a cada AGRICULTOR | Precio plan + IVA 21% | Mensual |
| Declarar IVA repercutido | Modelo 303 | Trimestral |
| Deducir IVA soportado (factura INAGRO) | Modelo 303 | Trimestral |
| Declarar ingresos por servicios | IRPF (Mod. 130) o IS (Mod. 200) | Trimestral/Anual |
| Completar KYC Stripe Connect | Verificación fiscal + IBAN | Al alta |
| Conservar contrato de colaboración | Archivo documental | Obligatorio |

### 5.3 AGRICULTOR — Obligaciones

| Obligación | Detalle | Periodicidad |
|------------|---------|-------------|
| Pagar suscripción mensual | Via Stripe (tarjeta / SEPA) | Mensual |
| Conservar facturas recibidas | Justificante deducible (si aplica) | Obligatorio |
| Veracidad de datos SIEX | RD 1054/2022 | Continua |

---

## 6. FLUJO DE DATOS Y PRIVACIDAD (RGPD)

```
Datos Personales AGRICULTOR:
  ├─ Responsable del Tratamiento: ENTIDAD (recoge los datos en su portal)
  ├─ Encargado del Tratamiento: INAGRO (procesa datos en la plataforma)
  └─ Subencargado: STRIPE (procesa datos de pago)

Base jurídica del tratamiento:
  ├─ Ejecución de contrato (Art. 6.1.b RGPD) — Para el servicio SIEX
  ├─ Cumplimiento de obligación legal (Art. 6.1.c RGPD) — Para facturación
  └─ Interés legítimo (Art. 6.1.f RGPD) — Para comunicaciones de servicio

Documentos requeridos por RGPD:
  ├─ DPA firmado entre INAGRO y cada ENTIDAD (Art. 28 RGPD)
  ├─ Política de Privacidad en el portal de cada ENTIDAD
  └─ Registro de Actividades de Tratamiento (RAT) — INAGRO
```

---

## 7. FLUJO TÉCNICO RESUMIDO (STRIPE CONNECT)

```
1. ENTIDAD configura Stripe Connect Express (KYC + IBAN)
        ↓
2. AGRICULTOR paga mensualidad en el checkout de Stripe
   (aparece el nombre de la ENTIDAD en el extracto bancario)
        ↓
3. Stripe aplica application_fee del 50% para INAGRO
        ↓
4. Stripe liquida:
   ├─ 50% → Payout semanal a cuenta bancaria de la ENTIDAD
   └─ 50% → Cuenta principal de INAGRO (application_fee)
        ↓
5. Webhook de Stripe notifica a la plataforma:
   → Activa subscription_status = "active" para el AGRICULTOR
   → Registra transacción en payment_transactions
        ↓
6. Sistema genera facturas:
   ├─ Recibo automático STRIPE → AGRICULTOR (PSD2)
   ├─ Factura mensual ENTIDAD → AGRICULTOR (pendiente automatizar)
   └─ Factura mensual INAGRO → ENTIDAD (sistema implementado)
```

---

## 8. GESTIÓN DE IMPAGOS Y CANCELACIONES

| Situación | Acción automática | Responsable |
|-----------|------------------|-------------|
| Pago fallido (tarjeta) | Stripe reintenta 3 veces en 7 días | STRIPE |
| Pago fallido persistente | subscription_status → "past_due" | INAGRO (webhook) |
| Sin pago en 30 días | subscription_status → "canceled" | INAGRO (webhook) |
| Acceso bloqueado | Cuaderno Digital muestra pantalla de activación | INAGRO |
| AGRICULTOR cancela | Acceso hasta fin del período pagado | STRIPE |
| ENTIDAD da de baja a un socio | Admin puede cancelar suscripción desde panel | ENTIDAD |

---

## 9. DIAGRAMA ECONÓMICO COMPLETO (EJEMPLO PRÁCTICO)

```
Hipótesis: 20 agricultores activos · Plan Básico (9,99 €/mes) · IVA 21%

──────────────────────────────────────────────────────────
COBROS de la ENTIDAD a sus AGRICULTORES (Factura mensual)
──────────────────────────────────────────────────────────
  20 agricultores × 9,99 €   = 199,80 €  (base imponible)
  IVA 21%                    =  41,96 €
  TOTAL COBRADO              = 241,76 €

──────────────────────────────────────────────────────────
REPARTO vía Stripe Connect (sobre base imponible)
──────────────────────────────────────────────────────────
  → ENTIDAD recibe (50%):    =  99,90 €  brutos
  → INAGRO recibe (50%):     =  99,90 €  brutos (application_fee)

  (El IVA lo gestiona la ENTIDAD en su declaración trimestral)

──────────────────────────────────────────────────────────
FACTURA de INAGRO a la ENTIDAD (Licencia SaaS mensual)
──────────────────────────────────────────────────────────
  Base imponible (50%):      =  99,90 €
  IVA (21%):                 =  20,98 €
  TOTAL FACTURA INAGRO:      = 120,88 €

  La ENTIDAD registra:
    → Gasto deducible:         99,90 €
    → IVA soportado:           20,98 €  (recuperable en Mod. 303)

──────────────────────────────────────────────────────────
RESULTADO NETO MENSUAL (sin IVA)
──────────────────────────────────────────────────────────
  ENTIDAD: 99,90 € ingresos − 99,90 € licencia = 0 €  (*)
  INAGRO:  99,90 € ingresos licencia

  (*) El beneficio de la ENTIDAD es el MARGEN que puede aplicar
      al agricultor por encima del coste de la licencia.
      Ej: Si cobra 15 € en lugar de 9,99 €:
          Ingresos ENTIDAD: 15 € × 20 = 300 €
          Licencia INAGRO (50% s/ precio base): 99,90 €
          MARGEN ENTIDAD:  300 − 99,90 = 200,10 €/mes
```

> **Nota**: El porcentaje del 50% se calcula sobre el precio base acordado en el contrato, no sobre el precio que la ENTIDAD cobre al agricultor. Esto permite a la ENTIDAD establecer su propio margen comercial.

---

## 10. PENDIENTES DE IMPLEMENTACIÓN

| Item | Prioridad | Descripción |
|------|-----------|-------------|
| **Factura ENTIDAD → AGRICULTOR** | 🔴 Alta | Automatizar generación mensual desde el panel de la entidad |
| **DPA (Data Processing Agreement)** | 🔴 Alta | Documento formal que firme la ENTIDAD al registrarse |
| **T&C Agricultor en white-label** | 🔴 Alta | Términos adaptados al portal de cada entidad |
| **SEPA Direct Debit** | 🟡 Media | Añadir domiciliación bancaria como método de pago alternativo |
| **Email automático de factura** | 🟡 Media | Envío mensual automático de facturas al agricultor y entidad |
| **Portal de Stripe para agricultores** | 🟡 Media | Acceso del agricultor a su historial de pagos y facturas |
| **Precio variable por entidad** | 🟢 Baja | Permitir que cada entidad negocie un precio diferente |
| **Multi-moneda** | 🟢 Baja | Soporte para Portugal / Latinoamérica |

---

## 11. REFERENCIAS NORMATIVAS

| Norma | Aplicación |
|-------|-----------|
| **Ley 37/1992 (IVA)** | Tipo impositivo 21% en servicios SaaS |
| **Real Decreto 1619/2012** | Reglamento de facturación — obligatoriedad y contenido |
| **Ley 34/2002 (LSSI-CE)** | Validez del contrato electrónico — Art. 23 |
| **RGPD (UE) 2016/679** | Protección datos — DPA entre INAGRO y ENTIDAD |
| **Ley Orgánica 3/2018 (LOPDGDD)** | Adaptación nacional del RGPD |
| **Real Decreto 1054/2022 (SIEX)** | Obligatoriedad del Cuaderno Digital |
| **Directiva PSD2 (2015/2366)** | Autenticación fuerte en pagos (SCA) — Gestionado por Stripe |
| **Ley 27/2014 (IS)** | Impuesto de Sociedades — Ingresos y gastos de ambas partes |
| **Código Civil — Art. 1255** | Libertad de pacto en contratos mercantiles (revenue share) |
| **RDL 1/1996 (TRLPI)** | Licencias de software |

---

*Documento elaborado por InagroSolutions S.L. · Uso interno · Actualización recomendada: cada 6 meses o ante cambios normativos.*
