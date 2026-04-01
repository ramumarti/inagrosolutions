import * as XLSX from 'xlsx';

export interface ReporteTratamiento {
  "Referencia Parcela (SIGPAC)": string;
  "Nombre Finca": string;
  "Fecha Tratamiento": string;
  "Producto (Num Reg MAPA)": string;
  "Nombre Comercial": string;
  "Dosis (L/ha)": number;
  "Superficie (ha)": number;
  "Operario": string;
}

export interface ReporteFertilizacion {
  "SIGPAC": string;
  "Fecha": string;
  "Tipo": string;
  "Producto": string;
  "Cantidad (kg/ha)": number;
  "Metodo": string;
  "Justificacion": string;
}

export interface ReporteProduccion {
  "Finca": string;
  "Parcela (SIGPAC)": string;
  "Fecha Recoleccion": string;
  "Cantidad Cosechada (kg)": number;
  "Destino": string;
  "Lote": string;
}

/**
 * Genera un libro Excel multihidra compatible con SIEX y PAC.
 */
export function exportarCuadernoCompletoSIEX(
  fitos: ReporteTratamiento[],
  fertilizantes: ReporteFertilizacion[],
  cosechas: ReporteProduccion[],
  nombreArchivo: string = "Cuaderno_Explotacion_Digital"
) {
  const workbook = XLSX.utils.book_new();
  const anio = new Date().getFullYear();

  // 1. Hoja de Tratamientios
  const wsFitos = XLSX.utils.json_to_sheet(fitos);
  XLSX.utils.book_append_sheet(workbook, wsFitos, "Tratamientos Fitosanitarios");

  // 2. Hoja de Fertilización
  const wsFert = XLSX.utils.json_to_sheet(fertilizantes);
  XLSX.utils.book_append_sheet(workbook, wsFert, "Fertilizacion");

  // 3. Hoja de Producción/Recolección
  const wsProd = XLSX.utils.json_to_sheet(cosechas);
  XLSX.utils.book_append_sheet(workbook, wsProd, "Recoleccion y Ventas");

  // Descarga del archivo
  XLSX.writeFile(workbook, `${nombreArchivo}_CAMPAÑA_${anio}.xlsx`);
}

