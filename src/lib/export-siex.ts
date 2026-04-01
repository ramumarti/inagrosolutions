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

/**
 * Recibe un array de objetos planos y los transforma a un Excel nativo 
 * compatible con los requerimientos del SIEX de la PAC.
 */
export function exportarCuadernoSIEX(datos: ReporteTratamiento[], nombreArchivo: string = "Cuaderno_Fitosanitario") {
  const anio = new Date().getFullYear();
  
  // Transformar JSON a formato libro Excel
  const worksheet = XLSX.utils.json_to_sheet(datos);
  const workbook = XLSX.utils.book_new();
  
  XLSX.utils.book_append_sheet(workbook, worksheet, `Campaña ${anio}`);

  // Ajuste automático del tamaño de columnas para legibilidad
  worksheet["!cols"] = [
    { wch: 20 }, // SIGPAC
    { wch: 15 }, // Nombre
    { wch: 18 }, // Fecha
    { wch: 25 }, // Reg MAPA
    { wch: 25 }, // Producto Comercial
    { wch: 15 }, // Dosis
    { wch: 20 }, // Sup
    { wch: 20 }, // Operario
  ];

  // Disparar descarga directa en el dispositivo (funciona Offline/PWA)
  XLSX.writeFile(workbook, `${nombreArchivo}_${anio}.xlsx`);
}
