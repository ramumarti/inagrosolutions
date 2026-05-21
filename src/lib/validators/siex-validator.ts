export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateParcelas(parcelas: any[]): ValidationResult {
  const result: ValidationResult = { isValid: true, errors: [], warnings: [] };
  
  if (!parcelas || parcelas.length === 0) {
    result.isValid = false;
    result.errors.push("No hay parcelas registradas para la explotación.");
    return result;
  }

  parcelas.forEach((p, index) => {
    const pName = p.nombre || `Parcela ${index + 1}`;
    if (!p.provincia || !p.municipio || !p.poligono || !p.parcela) {
      result.isValid = false;
      result.errors.push(`[${pName}]: Faltan referencias SIGPAC (Provincia, Municipio, Polígono o Parcela).`);
    } else {
      // Validate length roughly
      if (String(p.provincia).length > 2) result.warnings.push(`[${pName}]: El código de provincia suele ser de 2 dígitos.`);
      if (String(p.municipio).length > 3) result.warnings.push(`[${pName}]: El código de municipio suele ser de 3 dígitos.`);
    }

    if (!p.cultivo) {
       result.errors.push(`[${pName}]: Cultivo principal no especificado.`);
       result.isValid = false;
    }
  });

  return result;
}

export function validateTratamientos(tratamientos: any[], productos_mapa: any[]): ValidationResult {
  const result: ValidationResult = { isValid: true, errors: [], warnings: [] };

  tratamientos.forEach((t, i) => {
     // Checking registry number format
     const hasRegistro = t.producto_mapa_id && t.producto_mapa_id.match(/\d{5}/);
     if (!hasRegistro) {
        result.isValid = false;
        result.errors.push(`Tratamiento ${t.fecha} (${t.nombre_producto || 'Sin producto'}): No contiene un número de registro MAPA válido.`);
     }

     if (!t.dosis) {
        result.warnings.push(`Tratamiento ${t.fecha}: Dosis no especificada, podría ser requerido por el SIEX.`);
     }

     // Removed plazo_seguridad check as it doesn't exist directly on the table
  });

  return result;
}

export function validateGlobalSiexPayload(data: any): ValidationResult {
  const parcelasValidation = validateParcelas(data.parcelas);
  const tratamientosValidation = validateTratamientos(data.tratamientos, data.productos_mapa);
  
  return {
    isValid: parcelasValidation.isValid && tratamientosValidation.isValid,
    errors: [...parcelasValidation.errors, ...tratamientosValidation.errors],
    warnings: [...parcelasValidation.warnings, ...tratamientosValidation.warnings]
  }
}
