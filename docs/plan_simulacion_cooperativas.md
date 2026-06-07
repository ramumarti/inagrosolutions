# 📝 Plan de Simulación: Cooperativas, Cuadernos Digitales y Auditoría

Este documento presenta la guía paso a paso para ejecutar la simulación de gestión agrícola multitenant en **InagroSolutions**, involucrando a las cooperativas **Pedraza** y **La Remediadora**, sus técnicos, agricultores en diferentes planes y la auditoría final del Superadmin.

---

## 👥 Estructura de la Simulación

### 🏢 Entidades (Tenants)
1. **Cooperativa Pedraza** (ID: `4030158a-0b17-438a-91af-55f8dfcb2abd`)
2. **Cooperativa La Remediadora** (ID: `ed14fa88-aa73-466f-a09e-ad777400faef`)

### 🩺 Supervisores Técnicos (Technicians)
1. **Técnico Pedraza**: `tecnico.pedraza@inagrosolutions.com`
2. **Técnico Remediadora**: `tecnico.remediadora@inagrosolutions.com`

### 🌾 Agricultores Ficticios (Farmers)
Para cada una de las dos cooperativas se registrarán 4 agricultores, uno por cada plan disponible:

| Correo del Agricultor | Cooperativa | Plan del Cuaderno | Módulos Activos en Simulación |
| :--- | :--- | :---: | :--- |
| `farmer.pedraza.basico@inagrosolutions.com` | Pedraza | Básico | Parcelas, Labores, Fitosanitarios, Fertilización, Inventario, SIEX |
| `farmer.pedraza.intermedio@inagrosolutions.com` | Pedraza | Intermedio | Básico + Costes, Cosechas, Alertas |
| `farmer.pedraza.avanzado@inagrosolutions.com` | Pedraza | Avanzado | Intermedio + Trazabilidad, Dashboards Pro |
| `farmer.pedraza.premium@inagrosolutions.com` | Pedraza | Premium | Avanzado + Telemetría de Sensores IoT |
| `farmer.remediadora.basico@inagrosolutions.com` | La Remediadora | Básico | Parcelas, Labores, Fitosanitarios, Fertilización, Inventario, SIEX |
| `farmer.remediadora.intermedio@inagrosolutions.com` | La Remediadora | Intermedio | Básico + Costes, Cosechas, Alertas |
| `farmer.remediadora.avanzado@inagrosolutions.com` | La Remediadora | Avanzado | Intermedio + Trazabilidad, Dashboards Pro |
| `farmer.remediadora.premium@inagrosolutions.com` | La Remediadora | Premium | Avanzado + Telemetría de Sensores IoT |

---

## 📅 Fases del Plan de Simulación

### 📌 Paso 1: Registro y Alta de Cuentas (Seeding SQL)
Se desarrollará y ejecutará un script SQL de inicialización en Supabase para:
1. Insertar las credenciales en `auth.users` y vincularlas a `public.users` con contraseñas temporales genéricas.
2. Definir los roles correctos (`platform_role = 'farmer'` o `'technician'`).
3. Registrar la asignación técnica en `public.technician_assignments` asociando cada técnico a sus 4 respectivos agricultores.

### 📌 Paso 2: Generación Completa de Datos del Cuaderno
El script de inicialización creará registros agrícolas completos e hiperrealistas para cada agricultor:
- **Explotaciones y Campañas:** Alta de explotaciones (ej. "Finca El Olivar de Pedraza", "Explotación La Remediadora") y campañas (2025/2026).
- **Parcelas:** Registro de parcelas de olivar (Arbequina, Picual) georreferenciadas con referencias catastrales y SIGPAC ficticias pero válidas.
- **Inventario inicial:** Stock de abonos orgánicos e inorgánicos, y fitosanitarios del vademécum.
- **Módulo Básico (Todos los agricultores):**
  - Labores de poda y picado de restos.
  - Fertilización (ej. aporte de abono NPK complejo).
  - Tratamientos Fitosanitarios (ej. aplicación autorizada de fungicida cúprico contra el Repilo, con datos de temperatura y viento simulados).
- **Módulo Intermedio (Planes Intermedio, Avanzado y Premium):**
  - Registro de costes operativos (mano de obra, maquinaria, insumos).
  - Registro de cosecha de aceitunas (cantidad en kg, rendimiento graso, almazara compradora).
  - Generación de alertas de cuaderno agronómicas.
- **Módulo Avanzado (Planes Avanzado y Premium):**
  - Trazabilidad y lotes de producción para entrega en cooperativa.
- **Módulo Premium (Planes Premium):**
  - Ingesta de datos de telemetría de sensores IoT (humedad de suelo a 30cm, 60cm y conductividad eléctrica).

### 📌 Paso 3: Gestión y Supervisión Cooperativa
Se simulará la interfaz y los flujos que tiene que hacer la entidad/cooperativa:
1. **Panel de Cooperativa (Admin):** Visualización del panel consolidado de hectáreas, alertas de la red, asignación de técnicos a socios en `/admin/assignments`.
2. **Panel del Asesor Técnico (Technician):**
  - Visualización de la cartera de clientes.
  - Emisión de validaciones formales (`cuaderno_validaciones`) firmando los cuadernos de campo (ej. dejando observaciones de dosis o marcándolos como "Validado").
  - Gestión de tareas y agenda de visitas en `/technician/tasks`.

### 📌 Paso 4: Exportación de Datos SIEX
Se simulará la exportación de cuadernos de campo de los agricultores de prueba en formato legal (esquema XML SIEX y Excel de acompañamiento) usando los endpoints de exportación de la plataforma para verificar que la información está estructurada según el RD 1054/2022.

### 📌 Paso 5: Control Financiero de Superadmin
Revisión global en `/superadmin`:
- Comprobación del cálculo de MRR en vivo sumando los planes asignados a los agricultores y a los tenants.
- Auditoría de los logs de la plataforma para rastrear el flujo de operaciones.

### 📌 Paso 6: Generación del Reporte PDF Oficial
Se creará y ejecutará un script en Node.js utilizando la librería `pdfkit` que leerá los registros insertados en la base de datos y compilará un documento PDF titulado `docs/informe_simulacion_cuadernos.pdf`. 

Este PDF contendrá:
1. Resumen ejecutivo de la simulación de InagroSolutions.
2. Fichas de los 8 agricultores y un desglose detallado de las actividades cargadas en sus cuadernos digitales.
3. El registro de supervisión técnica (observaciones de firma digital del técnico).
4. El análisis financiero consolidado del Superadmin.
5. El certificado técnico de que la información cumple con las especificaciones del SIEX.
