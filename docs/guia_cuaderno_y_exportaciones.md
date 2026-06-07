# 📖 Guía Detallada: Apartados del Cuaderno Digital y Datos Exportados al SIEX

Esta guía detalla visual y estructuralmente cómo se organizan los apartados del cuaderno digital en **InagroSolutions** y el formato exacto en el que los datos son exportados a los organismos oficiales (SIEX / MAPA) según la legislación española (Real Decreto 1054/2022).

---

## 🖥️ 1. Visualización de los Apartados en la Interfaz (UI)

El panel del Agricultor y del Técnico se ha diseñado bajo una estética **Glassmorphism Premium** con colores oscuros, paneles translúcidos y acentos verde esmeralda. A continuación se presenta el prototipo visual de la pantalla principal:

![Dashboard del Cuaderno Digital](file:///C:/Users/RAMON/.gemini/antigravity-ide/brain/a0ab691b-5d49-4bb7-a36b-8642dc00f300/farmer_digital_notebook_dashboard_1780851413065.png)

### Detalle de cada sección en la aplicación:

1. **Gestión de Parcelas (SIGPAC):**
   - **Visualización:** Un visor interactivo con mapas satelitales (Leaflet) donde las parcelas están dibujadas sobre sus polígonos catastrales reales.
   - **Formulario:** El agricultor visualiza la provincia, municipio, zona, polígono, parcela, recinto, superficie neta (ha), variedad (ej. Picual/Arbequina) y sistema de riego (goteo o secano).

2. **Registro de Tratamientos Fitosanitarios:**
   - **Visualización:** Un listado en tabla de las aplicaciones realizadas y un formulario con un selector inteligente conectado por API al vademécum oficial del MAPA.
   - **Validación:** Si el agricultor ingresa un producto no autorizado para el olivar o supera la dosis legal permitida (ej. Cobre WP), la interfaz muestra una advertencia en rojo y bloquea el registro.

3. **Fertilizaciones y Abonado:**
   - **Visualización:** Histórico de abonos aplicados con desglose de la riqueza de nutrientes (equilibrio N-P-K: Nitrógeno, Fósforo, Potasio). Se descuenta de forma automática el volumen del almacén.

4. **Labores Agrícolas (Poda, Riego, Suelo):**
   - **Visualización:** Bitácora diaria donde se anotan las tareas mecánicas de campo (poda tradicional, desbrozado de cubiertas, tilling, desvaretado) vinculando qué maquinaria de la cooperativa y qué operario realizaron la labor.

5. **Almacén de Insumos (Inventario):**
   - **Visualización:** Fichas de stock que detallan la cantidad inicial comprada, cantidad actual remanente (en kg o litros), precio de adquisición y el número de lote del producto (requerido para trazabilidad).

6. **Control de Costes (Plan Intermedio en adelante):**
   - **Visualización:** Gráficos circulares de costes de producción distribuidos por categorías: combustibles, mano de obra, insumos y amortización de maquinaria.

7. **Gestión de Cosechas (Plan Intermedio en adelante):**
   - **Visualización:** Registro de las entradas en almazara indicando el peso en bruto de aceituna, el rendimiento graso industrial (extraído en laboratorio) y el precio estimado por kilogramo de aceite.

8. **Trazabilidad y Lotes (Plan Avanzado en adelante):**
   - **Visualización:** Un mapa de flujo interactivo que vincula qué parcela originó las aceitunas, qué lote de cosecha se generó y a qué envasadora o distribuidora local se vendió.

9. **Sensores IoT (Plan Premium):**
   - **Visualización:** Gráficos lineales de evolución temporal que muestran la humedad volumétrica de suelo a 30 cm (zona radicular activa) y 60 cm (reserva de agua), temperatura del suelo y tensión matricial en kilopascales (kPa) para controlar el estrés hídrico.

---

## 📊 2. Estructura de Datos Exportados en Excel (XLSX)

Al pulsar el botón **"Exportar Excel legal"**, el servidor compila un archivo compatible con el SIEX estructurado en 4 pestañas obligatorias. A continuación se detallan las columnas y filas de ejemplo de la simulación realizada:

### Pestaña 1: `PARCELAS`
Esta hoja detalla la ubicación catastral exacta de las explotaciones registradas en Baeza y Úbeda.

| NIF_CIF | PROVINCIA | MUNICIPIO | POLIGONO | PARCELA | RECINTO | SUPERFICIE_HA | CULTIVO_PRINCIPAL | SISTEMA_EXPLOTACION |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- | :---: |
| 12345678A | Jaén (23) | Baeza (11) | 4 | 12 | 1 | 2.70 | Olivar (Picual) | Regadío (R) |
| 12345678A | Jaén (23) | Baeza (11) | 5 | 88 | 2 | 1.80 | Olivar (Arbequina) | Secano (S) |

### Pestaña 2: `TRATAMIENTOS`
Detalla el uso de fitosanitarios del vademécum oficial contra plagas como el repilo o la mosca del olivo.

| ID_EXPLOTACION | FECHA_TRATAMIENTO | PARCELA_NOMBRE | NUM_REGISTRO_MAPA | NOMBRE_PRODUCTO | DOSIS_CANTIDAD | DOSIS_UNIDAD | SUPERFICIE_TRATADA_HA | MAQUINARIA | OPERARIO |
| :--- | :---: | :--- | :--- | :--- | :---: | :--- | :---: | :--- | :--- |
| 12345678A | 20/05/2026 | El Cerro | 18452 | Cobre Coloidal 50 WP | 2.50 | kg/ha | 2.70 | Atomizador Hornet | Pedro Martínez |

### Pestaña 3: `LABORES`
Registro de las tareas físicas que modifican o mantienen el suelo y el arbolado.

| ID_EXPLOTACION | FECHA_LABOR | PARCELA_NOMBRE | TIPO_LABOR | DESCRIPCION | SUPERFICIE_AFECTADA_HA |
| :--- | :---: | :--- | :--- | :--- | :---: |
| 12345678A | 10/05/2026 | El Cerro | Poda tradicional | Aclareo de copas y triturado in situ | 2.70 |
| 12345678A | 18/05/2026 | El Cerro | Desbrozado | Desbroce mecánico de cubierta vegetal | 2.70 |

### Pestaña 4: `FERTILIZACION`
Control del aporte de nutrientes para evitar la contaminación de acuíferos por exceso de nitrógeno.

| ID_EXPLOTACION | FECHA_FERTILIZACION | PARCELA_NOMBRE | TIPO_ABONO | NPK | DOSIS_CANTIDAD | DOSIS_UNIDAD |
| :--- | :---: | :--- | :--- | :---: | :---: | :--- |
| 12345678A | 24/05/2026 | El Cerro | Fertiorgánico Nitrogenado | 15-0-0 | 150.00 | kg/ha |

---

## 🔌 3. Formato telemático de Exportación XML (SIEX)

Los organismos oficiales de las comunidades autónomas y del Ministerio de Agricultura (MAPA) no reciben archivos visuales, sino **mensajes de datos estructurados en formato XML** bajo un esquema XSD cerrado. 

A continuación se muestra el **bloque XML real** generado por el servidor de InagroSolutions para la explotación simulada de Juan Martínez:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<MensajeSIEX xmlns="http://www.mapa.gob.es/siex">
  <!-- Cabecera de autenticación del emisor de los datos -->
  <Cabecera>
    <Emisor>12345678A</Emisor>
    <FechaCreacion>2026-06-07T16:51:00Z</FechaCreacion>
    <VersionEsquema>1.4</VersionEsquema>
  </Cabecera>
  
  <!-- Identificación de la Explotación Agraria (REA) -->
  <Explotacion id="4030158a-0b17-438a-91af-55f8dfcb2abd">
    <Nombre>Olivar de Juan — Pedraza</Nombre>
    <REGEPA>REA23192</REGEPA>
    <ProvinciaExplotacion>23</ProvinciaExplotacion>
  </Explotacion>
  
  <!-- Declaración de la Base Territorial (Recintos SIGPAC) -->
  <Parcelas>
    <Parcela>
      <Provincia>23</Provincia> <!-- Jaén -->
      <Municipio>11</Municipio>  <!-- Baeza -->
      <Poligono>4</Poligono>
      <Parcela>12</Parcela>
      <Recinto>1</Recinto>
      <SuperficieDeclarada>2.70</SuperficieDeclarada>
      <Cultivo>1.2</Cultivo>     <!-- Código MAPA para Olivar tradicional -->
      <Variedad>Picual</Variedad>
      <Regadio>true</Regadio>
    </Parcela>
  </Parcelas>
  
  <!-- Cuaderno de tratamientos fitosanitarios aplicados -->
  <Tratamientos>
    <Tratamiento>
      <Fecha>2026-05-20T09:00:00Z</Fecha>
      <ParcelaNombre>El Cerro de Juan</ParcelaNombre>
      <Producto>Cobre Coloidal 50 WP</Producto>
      <RegistroMAPA>18452</RegistroMAPA>
      <Dosis>2.5</Dosis>
      <Unidad>kg/ha</Unidad>
      <SuperficieTratada>2.70</SuperficieTratada>
      <Maquinaria>Atomizador arrastrado Solano-Hornet 2000L</Maquinaria>
      <AplicadorNIF>12345678A</AplicadorNIF>
    </Tratamiento>
  </Tratamientos>
  
  <!-- Registro de aportes nutricionales y abonos -->
  <Fertilizaciones>
    <Fertilizacion>
      <Fecha>2026-05-24T07:30:00Z</Fecha>
      <ParcelaNombre>El Cerro de Juan</ParcelaNombre>
      <Abono>Fertiorgánico Nitrogenado N-15</Abono>
      <NPK>15-0-0</NPK>
      <Dosis>150.00</Dosis>
      <Unidad>kg/ha</Unidad>
    </Fertilizacion>
  </Fertilizaciones>
  
  <!-- Labores mecánicas y mantenimiento de cubiertas -->
  <Labores>
    <Labor>
      <Fecha>2026-05-18T08:00:00Z</Fecha>
      <ParcelaNombre>El Cerro de Juan</ParcelaNombre>
      <Tipo>Desbrozado mecánico</Tipo>
      <Descripcion>Desbrozado mecánico de cubierta vegetal espontánea en calles</Descripcion>
      <SuperficieAfectada>2.70</SuperficieAfectada>
    </Labor>
  </Labores>
</MensajeSIEX>
```

---

## 🏢 4. Flujo de Gestión de la Cooperativa (Admin y Técnico)

Cuando los agricultores registran esta información, la entidad cooperativa tiene acceso inmediato a las siguientes herramientas para gestionarlos:

1. **Dashboard Consolidado de Red:**
   - Suma total de hectáreas y número de socios.
   - Panel de control de alertas acumuladas de fitosanitarios no conformes de toda la cooperativa.
2. **Consola de Asignaciones Técnicas:**
   - Vinculación interactiva donde los administradores eligen qué técnicos supervisan el cuaderno de qué agricultores.
3. **Módulo de Firma Técnica y Observaciones:**
   - El agrónomo de la cooperativa entra a la ficha de cada socio y emite un certificado formal que valida la idoneidad del cuaderno para la PAC. Si detecta errores, inyecta observaciones que el agricultor recibe instantáneamente en su móvil.
